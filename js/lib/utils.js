export const slug = (s) => String(s || "").toLowerCase().replace(/[^a-z]/g, "");
export const fmt = (n) => (Math.round(n * 10) / 10).toLocaleString();
export const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

export const initials = (n) =>
  String(n || "?").trim().split(/\s+/).slice(0, 2).map((w) => w[0] || "").join("").toUpperCase() || "?";

export function hue(n) {
  let h = 0;
  for (const c of String(n)) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
}

/** [[department, total], …] sorted by total, descending. */
export function countBy(arr, key = "department", weight = () => 1) {
  const m = {};
  arr.forEach((x) => {
    const d = x[key] || "Other";
    m[d] = (m[d] || 0) + weight(x);
  });
  return Object.entries(m).sort((a, b) => b[1] - a[1]);
}

export const isOpen = (r) => !["Live", "Declined"].includes(r.status || "New");
