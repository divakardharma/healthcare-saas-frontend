/**
 * Errors that are safe to defer to the offline queue.
 *
 * Validation/auth/permission errors must be shown to the user
 * instead of being retried forever.
 */
export function isRetryableOfflineError(
  error
) {
  const status =
    error?.response?.status;

  return (
    status == null ||
    status === 408 ||
    status === 429 ||
    status >= 500
  );
}

export function queueItemView(
  record
) {
  return {
    id: record.id,

    type: record.type,

    meta:
      record.meta || {},

    createdAt:
      record.createdAt,
  };
}