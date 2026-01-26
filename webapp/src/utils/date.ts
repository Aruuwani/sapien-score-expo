export function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export function formatDate(input?: string | number | Date | null): string {
  try {
    if (!input) return '';
    const d = new Date(input);
    if (isNaN(d.getTime())) return '';
    const day = pad2(d.getDate());
    const month = pad2(d.getMonth() + 1);
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return '';
  }
}

export function formatTime(input?: string | number | Date | null): string {
  try {
    if (!input) return '';
    const d = new Date(input);
    if (isNaN(d.getTime())) return '';
    const hours = pad2(d.getHours());
    const minutes = pad2(d.getMinutes());
    return `${hours}:${minutes}`;
  } catch {
    return '';
  }
}

