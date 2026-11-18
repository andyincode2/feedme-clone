// Fixed to Korean time so the server render matches what readers expect.
const TIME_ZONE = "Asia/Seoul";

function parts(iso: string, withTime: boolean) {
  const formatter = new Intl.DateTimeFormat("ko-KR", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit", hour12: true } : {}),
  });
  return Object.fromEntries(
    formatter.formatToParts(new Date(iso)).map((part) => [part.type, part.value])
  );
}

export function formatSavedDate(iso: string): string {
  const p = parts(iso, false);
  return `${p.year}년 ${p.month}월 ${p.day}일`;
}

export function formatSavedAt(iso: string): string {
  const p = parts(iso, true);
  return `${p.year}년 ${p.month}월 ${p.day}일 ${p.dayPeriod} ${p.hour}:${p.minute}`;
}
