export function formatVolume(v) {
  if (v == null) return "";

  if (v >= 100) {
    return `${v.toLocaleString(undefined, {
      maximumFractionDigits: 0
    })} billion m³`;
  }

  if (v >= 10) {
    return `${v.toLocaleString(undefined, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    })} billion m³`;
  }

  if (v >= 1) {
    return `${v.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })} billion m³`;
  }

  return `${v.toLocaleString(undefined, {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  })} billion m³`;
}
