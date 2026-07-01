export function toLocalDateTimeString(d) {
  const D = new Date(d);
  const p = (n) => String(n).padStart(2, "0");
  return `${D.getFullYear()}-${p(D.getMonth() + 1)}-${p(D.getDate())}T${p(
    D.getHours()
  )}:${p(D.getMinutes())}:${p(D.getSeconds())}`;
}

export function formatDisplayReserved(d) {
  const D = new Date(d);
  const p = (n) => String(n).padStart(2, "0");
  return `${D.getFullYear()}-${p(D.getMonth() + 1)}-${p(D.getDate())} ${p(
    D.getHours()
  )}:${p(D.getMinutes())}`;
}