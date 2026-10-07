import { encryptData, decryptData } from "../services/encryptionService";

const DB_NAME = "HealthcareOfflineDB";
const DB_VERSION = 3;
const STORE_NAME = "offlineQueue";

let dbPromise = null;

export function getOfflineScope({ user, tenant }) {
  const userId = user?.id ?? user?.user_id ?? user?.email;
  const tenantId = tenant?.id ?? tenant?.tenant_id ?? tenant?.subdomain ?? tenant?.name;

  if (userId == null || tenantId == null) {
    return null;
  }

  const userKey = String(userId).trim();
  const tenantKey = String(tenantId).trim();

  if (!userKey || !tenantKey) {
    return null;
  }

  return { userKey, tenantKey, scopeKey: `${tenantKey}::${userKey}` };
}

function openDB() {
  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      dbPromise = null;
      reject(request.error);
    };

    request.onblocked = () => {
      console.error("IndexedDB upgrade is blocked by another open tab.");
    };

    request.onsuccess = () => {
      const db = request.result;

      db.onversionchange = () => {
        db.close();
        dbPromise = null;
      };

      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      const transaction = event.target.transaction;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
        return;
      }

      const oldStore = transaction.objectStore(STORE_NAME);

      /*
       * Version 2 used a manually generated id and stored metadata
       * beside encryptedData.
       *
       * Version 3 deliberately restores the reference format:
       *
       * {
       *   id: autoIncrement,
       *   data: encryptedString
       * }
       */
      if (!oldStore.autoIncrement) {
        const readRequest = oldStore.getAll();

        readRequest.onsuccess = () => {
          const oldRecords = readRequest.result || [];

          db.deleteObjectStore(STORE_NAME);

          const newStore = db.createObjectStore(STORE_NAME, {
            keyPath: "id",
            autoIncrement: true,
          });

          /*
           * Only migrate records that already have a trusted
           * authenticated scope.
           *
           * Older unscoped records are intentionally not migrated.
           */
          oldRecords.forEach((record) => {
            if (
              !record?.encryptedData ||
              !record?.scopeKey ||
              !record?.userKey ||
              !record?.tenantKey
            ) {
              return;
            }

            try {
              const payload = decryptData(record.encryptedData);

              newStore.add({
                data: encryptData({
                  type: record.type,
                  payload,
                  meta: record.meta || {},
                  createdAt: record.createdAt || Date.now(),
                  scopeKey: record.scopeKey,
                  userKey: record.userKey,
                  tenantKey: record.tenantKey,
                }),
              });
            } catch (error) {
              console.error("Failed to migrate an offline queue record:", error);
            }
          });
        };

        readRequest.onerror = () => {
          console.error(
            "Failed to read old offline queue records during migration:",
            readRequest.error
          );
        };
      }
    };
  });

  return dbPromise;
}

/**
 * Save a mutation.
 *
 * ONLY `id` and `data` are stored in IndexedDB.
 */
export async function saveOfflineRecord({ type, payload, meta = {}, scope }) {
  if (!scope?.scopeKey) {
    throw new Error(
      "Cannot queue offline mutation without an authenticated user and tenant scope"
    );
  }

  const db = await openDB();
  const createdAt = Date.now();

  /*
   * Everything sensitive goes inside
   * the encrypted string.
   */
  const encryptedData = encryptData({
    type,
    payload,
    meta,
    createdAt,
    scopeKey: scope.scopeKey,
    userKey: scope.userKey,
    tenantKey: scope.tenantKey,
  });

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);


    const request = store.add({ data: encryptedData });

    let generatedId;

    request.onsuccess = () => {
      generatedId = request.result;
    };

    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => {
      resolve({
        id: generatedId,
        type,
        meta,
        createdAt,
        scopeKey: scope.scopeKey,
        userKey: scope.userKey,
        tenantKey: scope.tenantKey,
        encryptedData,
      });
    };

    transaction.onerror = () => reject(transaction.error || request.error);

    transaction.onabort = () =>
      reject(transaction.error || new Error("Offline queue transaction aborted"));
  });
}

/**
 * Read queue records and decrypt them only
 * in application memory.
 *
 * DevTools still sees only:
 *
 * {
 *   id,
 *   data
 * }
 */
export async function getAllOfflineRecords(scope) {
  if (!scope?.scopeKey) {
    return [];
  }

  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      try {
        const records = (request.result || [])
          .map((row) => {
            if (!row?.data) {
              return null;
            }

            const envelope = decryptData(row.data);

            return {
              id: row.id,
              type: envelope.type,
              payload: envelope.payload,
              meta: envelope.meta || {},
              createdAt: envelope.createdAt,
              scopeKey: envelope.scopeKey,
              userKey: envelope.userKey,
              tenantKey: envelope.tenantKey,
              encryptedData: row.data,
            };
          })
          .filter((record) => record && record.scopeKey === scope.scopeKey)
          .sort((a, b) => a.createdAt - b.createdAt);

        resolve(records);
      } catch (error) {
        reject(error);
      }
    };

    request.onerror = () => reject(request.error);
  });
}

export function decryptOfflineRecord(record) {
  if (record?.payload !== undefined) {
    return record.payload;
  }

  if (record?.encryptedData) {
    return decryptData(record.encryptedData).payload;
  }

  throw new Error("Record has no encrypted payload");
}

/**
 * Delete ONLY after successful API synchronization.
 */
export async function deleteOfflineRecord(id) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => resolve();

    transaction.onerror = () => reject(transaction.error || request.error);

    transaction.onabort = () =>
      reject(transaction.error || new Error("Offline queue delete transaction aborted"));
  });
}

/**
 * Remove only the current user's/tenant's queue.
 */
export async function clearOfflineQueue(scope) {
  if (!scope?.scopeKey) {
    return;
  }

  const records = await getAllOfflineRecords(scope);

  if (!records.length) {
    return;
  }

  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    records.forEach((record) => {
      store.delete(record.id);
    });

    transaction.oncomplete = () => resolve();

    transaction.onerror = () => reject(transaction.error);

    transaction.onabort = () =>
      reject(transaction.error || new Error("Offline queue clear transaction aborted"));
  });
}