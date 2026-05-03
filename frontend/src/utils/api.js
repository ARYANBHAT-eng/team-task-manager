export function getApiErrorMessage(error, fallbackMessage = "Request failed") {
  const detail = error?.response?.data?.detail;
  if (typeof detail === "string") {
    return detail;
  }
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg || item.message).filter(Boolean).join(", ") || fallbackMessage;
  }
  return fallbackMessage;
}
