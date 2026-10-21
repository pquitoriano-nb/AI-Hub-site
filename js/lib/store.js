/*
 * Data layer.
 *
 * Out of the box this saves everything in the browser's localStorage, so the
 * app runs with zero setup. localStorage is per-browser: answers submitted on
 * one computer are NOT visible on another. To share responses across the team,
 * replace the four functions in `localBackend` with calls to a real database
 * (Firebase Firestore, Supabase, Airtable, Google Sheets via Apps Script, your
 * own API…). The rest of the app only uses `useCollection`, `addDoc`,
 * `updateDoc` and `deleteDoc`, so nothing else needs to change.
 * See README.md for a Firebase example.
 */
import { useEffect, useState } from "../../vendor/react-bundle.js";

const PREFIX = "aihub:";
const listeners = new Map(); // collection -> Set<fn>

function read(coll) {
  try {
    return JSON.parse(localStorage.getItem(PREFIX + coll) || "[]");
  } catch {
    return [];
  }
}
function write(coll, rows) {
  localStorage.setItem(PREFIX + coll, JSON.stringify(rows));
  (listeners.get(coll) || new Set()).forEach((fn) => fn(rows));
}
const newId = () =>
  (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));

const localBackend = {
  subscribe(coll, cb) {
    if (!listeners.has(coll)) listeners.set(coll, new Set());
    listeners.get(coll).add(cb);
    cb(read(coll));
    const onStorage = (e) => e.key === PREFIX + coll && cb(read(coll)); // other tabs
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.get(coll).delete(cb);
      window.removeEventListener("storage", onStorage);
    };
  },
  async add(coll, data) {
    const doc = { ...data, id: newId() };
    write(coll, [...read(coll), doc]);
    return doc;
  },
  async update(coll, id, patch) {
    write(coll, read(coll).map((r) => (r.id === id ? { ...r, ...patch } : r)));
  },
  async remove(coll, id) {
    write(coll, read(coll).filter((r) => r.id !== id));
  },
};

const backend = localBackend;

export const addDoc = (coll, data) => backend.add(coll, data);
export const updateDoc = (coll, id, patch) => backend.update(coll, id, patch);
export const deleteDoc = (coll, id) => backend.remove(coll, id);

/** Live list of a collection, optionally sorted newest-first by a numeric field. */
export function useCollection(coll, sortDescBy) {
  const [rows, setRows] = useState([]);
  useEffect(
    () =>
      backend.subscribe(coll, (list) => {
        const out = [...list];
        if (sortDescBy) out.sort((a, b) => (b[sortDescBy] || 0) - (a[sortDescBy] || 0));
        setRows(out);
      }),
    [coll, sortDescBy]
  );
  return rows;
}
