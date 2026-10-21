import { html } from "../../vendor/react-bundle.js";
import { useHub } from "../lib/hub.js";
import { DeleteButton, Empty, SectionHead } from "../components/ui.js";
import { deleteDoc } from "../lib/store.js";
import { hue, initials } from "../lib/utils.js";

export default function Team() {
  const { team, canEdit, openSheet, toast } = useHub();
  const people = [...team].sort((a, b) => String(a.name).localeCompare(b.name));

  const cards = !people.length
    ? html`
      <${Empty} title="No team members yet"
        action=${canEdit && html`<button className="btn btn-night btn-sm" onClick=${() => openSheet("team")}>Add the first one +</button>`}>
        ${canEdit ? "Add each person on the AI Team with their role and focus areas." : "The AI Team will list its members here soon."}
      <//>`
    : people.map((p) => html`
      <div className="card person" key=${p.id}>
        <div className="top">
          <span className="avatar" style=${{ background: `hsl(${hue(p.name)} 55% 42%)` }}>${initials(p.name)}</span>
          <div style=${{ minWidth: 0 }}>
            <h3>${p.name}</h3>
            <div className="role">${p.role}${p.department && " · " + p.department}</div>
          </div>
        </div>
        ${p.focus && html`
          <div className="focus">
            ${String(p.focus).split(",").map((f) => f.trim()).filter(Boolean).map((f) => html`<span className="tag" key=${f}>${f}</span>`)}
          </div>`}
        ${p.contact && html`<div className="mono muted" style=${{ overflowWrap: "anywhere" }}>${p.contact}</div>`}
        ${canEdit && html`
          <div className="row-actions">
            <button className="icon-btn" onClick=${() => openSheet("team", p)}>Edit</button>
            <${DeleteButton} onConfirm=${() => deleteDoc("team", p.id).then(() => toast("Deleted"))} />
          </div>`}
      </div>`);

  return html`
    <section className="view">
      <div>
        <${SectionHead} eyebrow="Our team" title="The people behind the AI Team." lead="Who to ask, and what each of us focuses on.">
          ${canEdit && html`
            <button className="btn btn-night" onClick=${() => openSheet("team")}>Add team member <span className="arr" aria-hidden="true">+</span></button>`}
        <//>
        <div className="grid g3">${cards}</div>
      </div>
    </section>
  `;
}
