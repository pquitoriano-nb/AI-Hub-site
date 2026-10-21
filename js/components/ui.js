import { html, useEffect, useState } from "../../vendor/react-bundle.js";
import { slug, fmt } from "../lib/utils.js";

export const ICONS = {
  form: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 8h6M9 12h6M9 16h3" /></svg>`,
  chart: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>`,
  users: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5" /><circle cx="17" cy="9" r="2.5" /><path d="M17 14c2.3 0 4 1.5 4.6 4" /></svg>`,
  bot: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="7" width="16" height="12" rx="3" /><path d="M12 3v4M9 12h.01M15 12h.01M9 16h6" /></svg>`,
  bolt: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" /></svg>`,
  book: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z" /><path d="M4 19a2 2 0 0 1 2-2h13" /></svg>`,
};

export function Pill({ status }) {
  return html`<span className=${"pill s-" + slug(status)}>${status || "—"}</span>`;
}

export function SectionHead({ eyebrow, title, lead, children }) {
  return html`
    <div className="sec-head">
      <span className="eyebrow">${eyebrow}</span>
      <h2>${title}</h2>
      ${lead && html`<p className="lead">${lead}</p>`}
      ${children}
    </div>
  `;
}

export function FilterChips({ value, options, onChange, style }) {
  return html`
    <div className="filters" style=${style}>
      ${["All", ...options].map((o) => html`
        <button key=${o} type="button" className="fchip" aria-pressed=${o === value} onClick=${() => onChange(o)}>${o}</button>
      `)}
    </div>
  `;
}

export function Empty({ title, children, action }) {
  return html`
    <div className="empty" style=${{ gridColumn: "1/-1" }}>
      <strong>${title}</strong>
      <p>${children}</p>
      ${action}
    </div>
  `;
}

export function HBars({ rows, unit = "", alt = false }) {
  if (!rows.length) return html`<p className="muted" style=${{ fontSize: 14, margin: 0 }}>Nothing to chart yet.</p>`;
  const max = Math.max(...rows.map((r) => r[1]), 1);
  return html`
    <div className="hbars">
      ${rows.map(([k, v]) => html`
        <div className="hbar" key=${k}>
          <span className="lb" title=${k}>${k}</span>
          <span className="tr"><span className=${"fl" + (alt ? " alt" : "")} style=${{ width: ((v / max) * 100).toFixed(1) + "%" }}></span></span>
          <span className="v">${fmt(v)}${unit}</span>
        </div>
      `)}
    </div>
  `;
}

/** A delete button that asks for a second click instead of a confirm() dialog. */
export function DeleteButton({ onConfirm }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 3500);
    return () => clearTimeout(t);
  }, [armed]);
  return html`
    <button type="button" className="icon-btn danger" onClick=${() => (armed ? onConfirm() : setArmed(true))}>
      ${armed ? "Click again to delete" : "Delete"}
    </button>
  `;
}

export function Toast({ message }) {
  if (!message) return null;
  return html`<div className="toast" role="status">${message}</div>`;
}
