import { html, useState } from "../../vendor/react-bundle.js";
import { useHub } from "../lib/hub.js";
import { DeleteButton, Empty, FilterChips, Pill, SectionHead } from "../components/ui.js";
import { DEPTS, FREQ, ISTAT, PRIO, TOOLS, TYPES } from "../data/constants.js";
import { addDoc, deleteDoc, updateDoc } from "../lib/store.js";
import { fmt } from "../lib/utils.js";

export default function Intake({ initialTab = "form" }) {
  const { intake } = useHub();
  const [tab, setTab] = useState(initialTab);
  return html`
    <section className="view">
      <div>
        <${SectionHead} eyebrow="Intake" title="Tell us what to automate."
          lead="Every answer is saved for the AI Team and appears under Responses.">
          <div className="seg" role="group" aria-label="Intake view">
            <button type="button" aria-pressed=${tab === "form"} onClick=${() => setTab("form")}>Answer the form</button>
            <button type="button" aria-pressed=${tab === "resp"} onClick=${() => setTab("resp")}>
              Responses ${intake.length > 0 && html`<span className="mono">(${intake.length})</span>`}
            </button>
          </div>
        <//>
        ${tab === "form" ? html`<${IntakeForm} onDone=${() => setTab("resp")} />` : html`<${Responses} />`}
      </div>
    </section>
  `;
}

const EMPTY = { title: "", name: "", department: "", type: "", today: "", frequency: "", hours: "", tools: [], priority: "", notes: "" };

function Options({ name, options, value, onChange, multi }) {
  return html`
    <div className="opts">
      ${options.map((o, i) => {
        const checked = multi ? value.includes(o) : value === o;
        return html`
          <label className="opt" key=${o}>
            <input type=${multi ? "checkbox" : "radio"} name=${name} id=${name + "_" + i} value=${o} checked=${checked}
              onChange=${() => onChange(multi ? (checked ? value.filter((x) => x !== o) : [...value, o]) : o)} />
            <span>${o}</span>
          </label>`;
      })}
    </div>
  `;
}

const Req = () => html`<span className="req">*</span>`;

function IntakeForm({ onDone }) {
  const { toast, draftTitle, setDraftTitle } = useHub();
  const [f, setF] = useState(() => ({ ...EMPTY, title: draftTitle || "" }));
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (v) => setF((s) => ({ ...s, [k]: v && v.target ? v.target.value : v }));

  async function submit(e) {
    e.preventDefault();
    const missing = [];
    if (!f.title.trim()) missing.push("what we should help with");
    if (!f.name.trim()) missing.push("your name");
    if (!f.department) missing.push("your department");
    if (!f.type) missing.push("the type of request");
    if (!f.today.trim()) missing.push("how it's done today");
    if (missing.length) return setErr("Please add " + missing.join(", ") + ".");
    setErr("");
    setBusy(true);
    try {
      await addDoc("intake", {
        ...f,
        title: f.title.trim(), name: f.name.trim(), today: f.today.trim(), notes: f.notes.trim(),
        hours: f.hours === "" ? null : Math.max(0, Number(f.hours)),
        status: "New", createdAt: Date.now(),
      });
      setF(EMPTY);
      setDraftTitle("");
      toast("Request submitted. Thank you!");
      onDone();
    } catch {
      setErr("Couldn't submit just now. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return html`
    <form className="form-shell" onSubmit=${submit} noValidate>
      <div className="form-top"><div className="band"></div><div className="in">
        <h3>AI & automation request</h3>
        <p>Takes about 3 minutes. <span style=${{ color: "var(--danger)" }}>*</span> marks a required question.</p>
      </div></div>

      <div className="q"><label className="ql" htmlFor="f_title">What should we help with?<${Req} /></label>
        <div className="help">One line, like a ticket title.</div>
        <input className="in-text" id="f_title" maxLength=${140} value=${f.title} onChange=${set("title")} placeholder="e.g. Auto-generate weekly client reports" />
      </div>

      <div className="q"><label className="ql" htmlFor="f_name">Your name<${Req} /></label>
        <input className="in-text" id="f_name" maxLength=${80} value=${f.name} onChange=${set("name")} />
      </div>

      <div className="q"><label className="ql" htmlFor="f_dept">Your department<${Req} /></label>
        <select className="in-text" id="f_dept" value=${f.department} onChange=${set("department")}>
          <option value="">Choose…</option>
          ${DEPTS.map((d) => html`<option key=${d}>${d}</option>`)}
        </select>
      </div>

      <fieldset className="q"><legend>Type of request<${Req} /></legend>
        <${Options} name="type" options=${TYPES} value=${f.type} onChange=${set("type")} />
      </fieldset>

      <div className="q"><label className="ql" htmlFor="f_today">How is it done today?<${Req} /></label>
        <div className="help">Walk us through the steps, who does them and where the data lives.</div>
        <textarea className="in-text" id="f_today" maxLength=${3000} value=${f.today} onChange=${set("today")}></textarea>
      </div>

      <fieldset className="q"><legend>How often does it happen?</legend>
        <${Options} name="freq" options=${FREQ} value=${f.frequency} onChange=${set("frequency")} />
      </fieldset>

      <div className="q"><label className="ql" htmlFor="f_hours">Hours spent on it per week (whole team)</label>
        <input className="in-text" id="f_hours" type="number" min="0" max="400" step="0.5" placeholder="e.g. 6"
          style=${{ maxWidth: 180 }} value=${f.hours} onChange=${set("hours")} />
      </div>

      <fieldset className="q"><legend>Tools involved</legend>
        <div className="help">Pick all that apply.</div>
        <${Options} name="tools" options=${TOOLS} value=${f.tools} onChange=${set("tools")} multi=${true} />
      </fieldset>

      <fieldset className="q"><legend>Priority</legend>
        <${Options} name="prio" options=${PRIO} value=${f.priority} onChange=${set("priority")} />
      </fieldset>

      <div className="q"><label className="ql" htmlFor="f_notes">Anything else we should know?</label>
        <textarea className="in-text" id="f_notes" maxLength=${2000} placeholder="Deadlines, examples, links to files…" value=${f.notes} onChange=${set("notes")}></textarea>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick=${() => { setF(EMPTY); setErr(""); }}>Clear form</button>
        <span className="err" role="alert">${err}</span>
        <button type="submit" className="btn btn-night" disabled=${busy}>Submit request <span className="arr" aria-hidden="true">↗</span></button>
      </div>
    </form>
  `;
}

function Responses() {
  const { intake, canEdit, toast } = useHub();
  const [dept, setDept] = useState("All");
  const [stat, setStat] = useState("All");
  const rows = intake.filter((r) => (dept === "All" || r.department === dept) && (stat === "All" || (r.status || "New") === stat));

  let list;
  if (!intake.length) list = html`<${Empty} title="No responses yet">Answers to the intake form show up here as soon as someone submits.<//>`;
  else if (!rows.length) list = html`<${Empty} title="No matches">No requests match these filters.<//>`;
  else list = rows.map((r) => {
    const st = r.status || "New";
    const when = r.createdAt ? new Date(r.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "";
    const controls = canEdit
      ? html`
          <select className="status-sel" aria-label="Status" value=${st}
            onChange=${(e) => updateDoc("intake", r.id, { status: e.target.value }).then(() => toast("Status set to " + e.target.value))}>
            ${ISTAT.map((s) => html`<option key=${s}>${s}</option>`)}
          </select>
          <${DeleteButton} onConfirm=${() => deleteDoc("intake", r.id).then(() => toast("Deleted"))} />`
      : html`<${Pill} status=${st} />`;
    return html`
      <article className="resp" key=${r.id}>
        <div style=${{ minWidth: 0 }}>
          <h3>${r.title}</h3>
          <div className="meta">
            <span className="tag">${r.department}</span><span>${r.type}</span>
            ${r.priority && html`<span>· ${r.priority}</span>`}
            <span>· ${r.name || "Someone"}, ${when}</span>
          </div>
        </div>
        <div className="side">
          ${controls}
          ${r.hours != null && html`<span className="mono muted">${fmt(r.hours)} h/wk</span>`}
        </div>
        <p className="body">${r.today}</p>
        <details>
          <summary>All answers</summary>
          <dl className="kv">
            <dt>Frequency</dt><dd>${r.frequency || "—"}</dd>
            <dt>Hours / week</dt><dd>${r.hours != null ? fmt(r.hours) : "—"}</dd>
            <dt>Tools</dt><dd>${(r.tools || []).join(", ") || "—"}</dd>
            <dt>Priority</dt><dd>${r.priority || "—"}</dd>
            <dt>Notes</dt><dd>${r.notes || "—"}</dd>
          </dl>
        </details>
      </article>`;
  });

  return html`
    <div>
      <${FilterChips} value=${dept} onChange=${setDept} options=${DEPTS.filter((d) => intake.some((r) => r.department === d))} />
      <${FilterChips} value=${stat} onChange=${setStat} options=${ISTAT} style=${{ marginTop: -12 }} />
      <div className="resp-list">${list}</div>
    </div>
  `;
}
