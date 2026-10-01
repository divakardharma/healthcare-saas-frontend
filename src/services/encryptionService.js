import CryptoJS from "crypto-js";

const AES_KEY = process.env.REACT_APP_AES_KEY;

export const encryptData = (data) => {
  if (!AES_KEY) {
    throw new Error("AES key is missing");
  }

  const key = CryptoJS.enc.Utf8.parse(AES_KEY.substring(0, 32));
  const iv = CryptoJS.lib.WordArray.random(16);

  const plainText = JSON.stringify(data);

  const encrypted = CryptoJS.AES.encrypt(
    plainText,
    key,
    {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  );

  const combined = iv.clone().concat(encrypted.ciphertext);

  return CryptoJS.enc.Base64.stringify(combined);
};


export const decryptData = (encryptedData) => {
  if (!AES_KEY) {
    throw new Error("AES key is missing");
  }

  const key = CryptoJS.enc.Utf8.parse(AES_KEY.substring(0, 32));

  // Base64 → IV + ciphertext
  const combined = CryptoJS.enc.Base64.parse(encryptedData);

  // First 16 bytes = IV
  const iv = CryptoJS.lib.WordArray.create(
    combined.words.slice(0, 4),
    16
  );

  // Remaining bytes = encrypted data
  const ciphertext = CryptoJS.lib.WordArray.create(
    combined.words.slice(4),
    combined.sigBytes - 16
  );

  const decrypted = CryptoJS.AES.decrypt(
    { ciphertext },
    key,
    {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  );

  const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);

  if (!decryptedText) {
    throw new Error("Failed to decrypt response");
  }

  return JSON.parse(decryptedText);
};