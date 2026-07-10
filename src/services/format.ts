export function formatTime(timestamp: number | null) {
  if (!timestamp) {
    return '--';
  }

  return new Intl.DateTimeFormat('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(timestamp));
}

export function formatDateLabel(timestamp: number) {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(new Date(timestamp));
}

export function formatMinutes(ms: number) {
  return Math.max(0, Math.floor(ms / 60_000));
}

export function formatCoordinate(value: number | undefined) {
  if (typeof value !== 'number') {
    return '--';
  }
  return value.toFixed(6);
}
