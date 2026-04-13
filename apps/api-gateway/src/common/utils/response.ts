export const ok = (data: unknown, requestId: string) => ({
  success: true,
  data,
  meta: {
    requestId,
    timestamp: new Date().toISOString()
  }
});
