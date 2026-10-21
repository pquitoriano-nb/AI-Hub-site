import { html, useEffect, useRef, useState } from "../../vendor/react-bundle.js";
import { useHub } from "../lib/hub.js";
import { SCHEMAS } from "../data/constants.js";
import { addDoc, updateDoc } from "../lib/store.js";

/** Add / edit dialog for team members, Onyx agents and automations. */
export default function EntitySheet({ kind, item, onClose }) {
  const { toast } = useHub();
  const sc = SCHEMAS[kind];
  const [vals, setVals] = useState(() =>
    Object.fromEntries(sc.fields.map((f) => [f.k, item?.[f.k] ?? (f.k === "status" ? "Live" : "")]))
  );
  const [err, setErr] = useState("");
  const first = useRef(null);

  useEffect(() => {
    first.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const set = (k) => (e) => setVals((v) => ({ ...v, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    const data = {};
    for (const f of sc.fields) {
      const v = String(vals[f.k] ?? "").trim();
      if (f.req && !v) return setErr(f.l + " is required.");
      data[f.k] = f.type === "number" ? (v === "" ? null : Number(v)) : v;
    }
    data.updatedAt = Date.now();
    try {
      if (item) await updateDoc(sc.coll, item.id, data);
      else await addDoc(sc.coll, { ...data, createdAt: Date.now() });
      toast(item ? "Saved" : "Added");
      onClose();
    } catch {
      setErr("Couldn't save. Try again.");
    }
  }

  const field = (f, i) => {
    const id = "sh_" + kind + "_" + f.k;
    const ref = i === 0 ? first : undefined;
    const value = vals[f.k] ?? "";
    let input;
    if (f.type === "select") {
      input = html`
        <select id=${id} className="in-text" ref=${ref} value=${value} onChange=${set(f.k)}>
          <option value="">Choose…</option>
          ${f.opts.map((o) => html`<option key=${o}>${o}</option>`)}
        </select>`;
    } else if (f.type === "textarea") {
      input = html`<textarea id=${id} className="in-text" ref=${ref} value=${value} onChange=${set(f.k)} maxLength=${1500}></textarea>`;
    } else if (f.type === "number") {
      input = html`<input id=${id} className="in-text" ref=${ref} type="number" min="0" step="0.5" value=${value} onChange=${set(f.k)} />`;
    } else {
      input = html`<input id=${id} className="in-text" ref=${ref} type="text" maxLength=${200} placeholder=${f.ph || ""} value=${value} onChange=${set(f.k)} />`;
    }
    return html`
      <div className="fld" key=${f.k}>
        <label htmlFor=${id}>${f.l}${f.req && html`<span style=${{ color: "var(--danger)" }}> *</span>`}</label>
        ${input}
      </div>`;
  };

  return html`
    <div className="overlay" onMouseDown=${(e) => e.target === e.currentTarget && onClose()}>
      <form className="sheet" role="dialog" aria-modal="true" aria-labelledby="sheetT" onSubmit=${submit}>
        <h3 id="sheetT">${item ? "Edit" : "Add"} ${sc.label}</h3>
        ${sc.fields.map(field)}
        <span className="err">${err}</span>
        <div className="acts">
          <button type="button" className="btn btn-ghost" onClick=${onClose}>Cancel</button>
          <button type="submit" className="btn btn-night">${item ? "Save changes" : "Add " + sc.label}</button>
        </div>
      </form>
    </div>
  `;
}
