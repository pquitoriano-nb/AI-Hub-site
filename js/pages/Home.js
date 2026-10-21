import { html, useState } from "../../vendor/react-bundle.js";
import { useHub } from "../lib/hub.js";
import { ICONS, SectionHead } from "../components/ui.js";
import { GLOSSARY } from "../data/glossary.js";
import { fmt, isOpen, plural } from "../lib/utils.js";

const SUGGESTIONS = [
  ["Weekly reports", "Draft weekly client reports from our tracker"],
  ["Customer FAQs", "Answer common customer questions using our SOPs"],
  ["CV screening", "Screen applicant CVs against the job requirements"],
  ["Lead routing", "Copy new leads from forms into our CRM and notify sales"],
];

const STEPS = [
  ["Submit the intake form", "Describe the task, how often it happens and how long it takes."],
  ["We review and scope", "The AI Team checks fit, picks the tool and agrees the outcome with you."],
  ["Build and test", "We build the Onyx agent or automation and test it with your team."],
  ["Launch and measure", "It goes live, appears in the catalogue, and its hours saved land on the dashboard."],
];

export default function Home() {
  const { intake, team, agents, automations, go, setDraftTitle } = useHub();
  const [ask, setAsk] = useState("");
  const live = automations.filter((a) => a.status === "Live");
  const hrs = live.reduce((s, a) => s + (Number(a.hoursSaved) || 0), 0);
  const open = intake.filter(isOpen).length;

  const start = (text) => {
    setDraftTitle((text || "").slice(0, 140));
    go("intake");
  };
  const link = (v) => (e) => { e.preventDefault(); go(v); };

  const cards = [
    ["intake", "form", "Intake form", "Request an automation or agent, or ask for help. Takes about 3 minutes.", plural(open, "open request")],
    ["dashboard", "chart", "Dashboard", "Requests by department, the build pipeline and hours saved.", fmt(hrs) + " hrs / week saved"],
    ["team", "users", "Our team", "Who's on the AI Team and what each person focuses on.", plural(team.length, "member")],
    ["agents", "bot", "Onyx agents", "Assistants grounded in our own documents, per department.", plural(agents.length, "agent")],
    ["agents", "bolt", "Automations", "Workflows that move data between our tools automatically.", plural(automations.length, "automation")],
    ["learn", "book", "AI 101", "What AI, automation and LLMs mean, plus a glossary of terms.", GLOSSARY.length + " terms"],
  ];

  return html`
    <section className="view">
      <div className="hero">
        <div className="hero-in">
          <span className="eyebrow">✦ The AI Team's home base</span>
          <h1>Build <span className="orb" aria-hidden="true"></span>smarter with AI, together.</h1>
          <p>Tell us what slows your team down. We turn it into Onyx agents and automations, and track the hours they give back.</p>
          <form className="ask" onSubmit=${(e) => { e.preventDefault(); start(ask.trim()); }}>
            <textarea rows="2" aria-label="Describe a task" value=${ask}
              onChange=${(e) => setAsk(e.target.value)}
              onKeyDown=${(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); start(ask.trim()); } }}
              placeholder="Describe a task you'd like AI to take off your plate…"></textarea>
            <button type="submit" aria-label="Start a request with this">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </button>
          </form>
          <div className="chips-row">
            ${SUGGESTIONS.map(([label, text]) => html`
              <button key=${label} type="button" className="hchip" onClick=${() => start(text)}>${label}</button>
            `)}
          </div>
          <div className="hero-stats">
            <span><b>${intake.length}</b>requests</span>
            <span><b>${agents.length}</b>Onyx agents</span>
            <span><b>${automations.length}</b>automations</span>
            <span><b>${fmt(hrs)}</b>hrs saved / week</span>
          </div>
        </div>
      </div>

      <div>
        <${SectionHead} eyebrow="What's here" title="Everything our AI work runs on, in one place."
          lead="Request help, see what's live in your department, and learn the basics." />
        <div className="grid g3">
          ${cards.map(([v, ic, t, d, f]) => html`
            <a key=${t} className="card link-card" href=${"#" + v} onClick=${link(v)}>
              <span className="itile">${ICONS[ic]}</span>
              <h3>${t}</h3>
              <p>${d}</p>
              <span className="foot"><span className="mono" style=${{ color: "var(--ink-muted)" }}>${f}</span><span aria-hidden="true">→</span></span>
            </a>
          `)}
        </div>
      </div>

      <div>
        <${SectionHead} eyebrow="How it works" title="From a request to hours saved." />
        <div className="steps">
          ${STEPS.map(([t, d], i) => html`
            <div className="step" key=${t}><span className="n">Step ${i + 1}</span><h3>${t}</h3><p>${d}</p></div>
          `)}
        </div>
      </div>

      <div className="cta">
        <h2>Ready to hand off the busywork?</h2>
        <a className="btn btn-night" href="#intake" onClick=${link("intake")}>
          Open the intake form <span className="arr" aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  `;
}
