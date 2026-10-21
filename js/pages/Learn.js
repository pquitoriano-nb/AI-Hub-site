import { html, useState } from "../../vendor/react-bundle.js";
import { SectionHead } from "../components/ui.js";
import { GLOSSARY } from "../data/glossary.js";

const COMPARE = [
  ["Automation", "Rules a computer follows exactly: \"when X happens, do Y.\" Fast and predictable, but it can't handle anything it wasn't told about.", "When a form is submitted, add a row to the sheet and send a Slack message.", false],
  ["AI", "Software that handles tasks needing judgement: reading, writing, classifying, deciding. It works from patterns, so it can deal with messy, new inputs.", "Read each support email and decide whether it's billing, technical or a complaint.", true],
  ["LLM", "A large language model: the kind of AI that understands and writes text (Claude, GPT, Gemini). It powers chat assistants and our Onyx agents.", "Summarise this 20-page SOP into five bullet points for new hires.", false],
];

export default function Learn() {
  const [q, setQ] = useState("");
  const rows = GLOSSARY.filter((g) => !q || g.join(" ").toLowerCase().includes(q.toLowerCase()));
  return html`
    <section className="view">
      <div>
        <${SectionHead} eyebrow="AI 101" title="AI, automation and LLMs, explained plainly."
          lead="Three words get mixed up a lot. Here's how they differ, and how they work together." />
        <div className="compare">
          ${COMPARE.map(([k, d, ex, mid]) => html`
            <div key=${k} className=${"cmp" + (mid ? " mid" : "")}>
              <span className="k">${k}</span><p>${d}</p><div className="ex">${ex}</div>
            </div>`)}
        </div>
        <p className="lead" style=${{ textAlign: "center", margin: "20px auto 0" }}>
          Together: an <b style=${{ color: "var(--ink)" }}>automation</b> catches the trigger, an${" "}
          <b style=${{ color: "var(--ink)" }}>LLM</b> does the thinking step, and the automation delivers the result.
        </p>
      </div>

      <div>
        <${SectionHead} eyebrow="Glossary" title="Words you'll hear from us." />
        <div className="gloss-tools">
          <input className="in-text" type="search" placeholder="Search terms…" aria-label="Search glossary" value=${q} onChange=${(e) => setQ(e.target.value)} />
        </div>
        <div className="gloss">
          ${rows.length
            ? rows.map(([t, d, e]) => html`
              <div className="term" key=${t}>
                <h3>${t}</h3><p>${d}</p>
                <div className="eg"><b>Example</b> · ${e}</div>
              </div>`)
            : html`<p className="muted" style=${{ textAlign: "center", gridColumn: "1/-1" }}>No terms match “${q}”.</p>`}
        </div>
      </div>
    </section>
  `;
}
