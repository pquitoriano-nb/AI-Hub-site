import { html, useState } from "../../vendor/react-bundle.js";
import { useHub } from "../lib/hub.js";
import { DeleteButton, Empty, FilterChips, ICONS, Pill, SectionHead } from "../components/ui.js";
import { DEPTS } from "../data/constants.js";
import { deleteDoc } from "../lib/store.js";
import { fmt } from "../lib/utils.js";

export default function Agents() {
  const { agents, automations, canEdit, openSheet, toast } = useHub();
  const [dept, setDept] = useState("All");
  const inDept = (x) => dept === "All" || x.department === dept;
  const ag = agents.filter(inDept);
  const au = automations.filter(inDept);
  const depts = DEPTS.filter((d) => agents.some((a) => a.department === d) || automations.some((a) => a.department === d));
  const addFirst = (kind) => canEdit && html`<button className="btn btn-night btn-sm" onClick=${() => openSheet(kind)}>Add the first one +</button>`;
  const remove = (coll, id) => deleteDoc(coll, id).then(() => toast("Deleted"));

  const agentCards = !ag.length
    ? html`<${Empty} title=${agents.length ? "No agents in this department" : "No Onyx agents listed yet"} action=${addFirst("agents")}>
        Each agent shows what it does, which documents it knows and who owns it.
      <//>`
    : ag.map((a) => html`
      <div className="card agent" key=${a.id}>
        <div className="hd">
          <div style=${{ display: "flex", gap: 12, alignItems: "center", minWidth: 0 }}>
            <span className="itile">${ICONS.bot}</span>
            <h3 style=${{ overflowWrap: "anywhere" }}>${a.name}</h3>
          </div>
          <${Pill} status=${a.status || "Planned"} />
        </div>
        ${a.description && html`<p>${a.description}</p>`}
        <div className="meta">
          <span className="tag">${a.department}</span>
          ${a.knowledge && html`<span>Knows: ${a.knowledge}</span>`}
        </div>
        <div className="meta">
          ${a.owner && html`<span>Owner: ${a.owner}</span>`}
          ${/^https?:\/\//i.test(a.link || "") && html`
            <a href=${a.link} target="_blank" rel="noopener noreferrer" style=${{ fontWeight: 600 }}>Open in Onyx ↗</a>`}
        </div>
        ${canEdit && html`
          <div className="row-actions">
            <button className="icon-btn" onClick=${() => openSheet("agents", a)}>Edit</button>
            <${DeleteButton} onConfirm=${() => remove("agents", a.id)} />
          </div>`}
      </div>`);

  const autoTable = !au.length
    ? html`<${Empty} title=${automations.length ? "No automations in this department" : "No automations listed yet"} action=${addFirst("automations")}>
        Each automation shows its trigger, the tool it runs on and the hours it saves.
      <//>`
    : html`
      <div className="tbl-wrap">
        <table>
          <thead>
            <tr>
              <th>Automation</th><th>Department</th><th>Built with</th><th>Trigger</th><th>Status</th>
              <th style=${{ textAlign: "right" }}>Hrs saved / wk</th>${canEdit && html`<th></th>`}
            </tr>
          </thead>
          <tbody>
            ${au.map((a) => html`
              <tr key=${a.id}>
                <td>
                  <strong>${a.name}</strong>
                  ${a.description && html`<div className="desc">${a.description}</div>`}
                  ${a.owner && html`<div className="desc">Owner: ${a.owner}</div>`}
                </td>
                <td>${a.department}</td>
                <td>${a.tool || "—"}</td>
                <td>${a.trigger || "—"}</td>
                <td><${Pill} status=${a.status || "Planned"} /></td>
                <td className="num">${a.hoursSaved != null && a.hoursSaved !== "" ? fmt(Number(a.hoursSaved)) : "—"}</td>
                ${canEdit && html`
                  <td style=${{ whiteSpace: "nowrap" }}>
                    <button className="icon-btn" onClick=${() => openSheet("automations", a)}>Edit</button>${" "}
                    <${DeleteButton} onConfirm=${() => remove("automations", a.id)} />
                  </td>`}
              </tr>`)}
          </tbody>
        </table>
      </div>`;

  return html`
    <section className="view">
      <div>
        <${SectionHead} eyebrow="Agents & automations" title="What we've built, per department."
          lead="Onyx agents answer questions and do knowledge work. Automations move data between tools on a trigger." />
        <${FilterChips} value=${dept} onChange=${setDept} options=${depts} />
        <div style=${{ display: "flex", flexDirection: "column", gap: 48 }}>
          <div>
            <div className="sub-head">
              <h3>Onyx agents</h3>
              ${canEdit && html`<button className="btn btn-ghost btn-sm" onClick=${() => openSheet("agents")}>Add agent +</button>`}
            </div>
            <div className="grid g3">${agentCards}</div>
          </div>
          <div>
            <div className="sub-head">
              <h3>Automations</h3>
              ${canEdit && html`<button className="btn btn-ghost btn-sm" onClick=${() => openSheet("automations")}>Add automation +</button>`}
            </div>
            ${autoTable}
          </div>
        </div>
      </div>
    </section>
  `;
}
