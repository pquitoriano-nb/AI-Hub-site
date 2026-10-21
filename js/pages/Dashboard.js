import { html } from "../../vendor/react-bundle.js";
import { useHub } from "../lib/hub.js";
import { HBars, Pill, SectionHead } from "../components/ui.js";
import { ISTAT } from "../data/constants.js";
import { countBy, fmt, isOpen, plural } from "../lib/utils.js";

const STATUS_COLOR = {
  New: "var(--brand)", Reviewing: "var(--sky)", Building: "var(--warning)", Live: "var(--success)", Declined: "var(--ink-muted)",
};

function WeeklyColumns({ intake }) {
  const wk = 7 * 864e5, start = Date.now() - 8 * wk;
  const counts = Array(8).fill(0);
  intake.forEach((r) => {
    if (r.createdAt > start) counts[Math.min(7, Math.floor((r.createdAt - start) / wk))]++;
  });
  const W = 560, H = 200, pl = 28, pb = 26, pt = 16, cw = (W - pl) / 8;
  const step = Math.ceil(Math.max(4, ...counts) / 4), top = step * 4;
  const y = (v) => pt + (H - pt - pb) * (1 - v / top);
  return html`
    <svg viewBox=${`0 0 ${W} ${H}`} role="img" aria-label="Requests per week, last 8 weeks">
      ${[0, 1, 2, 3, 4].map((g) => html`
        <g key=${"g" + g}>
          <line className="grid-l" x1=${pl} x2=${W} y1=${y(g * step)} y2=${y(g * step)} />
          <text x=${pl - 6} y=${y(g * step) + 4} textAnchor="end">${g * step}</text>
        </g>`)}
      ${counts.map((c, i) => {
        const x = pl + i * cw + cw * 0.22, w = cw * 0.56;
        return html`
          <g key=${"b" + i}>
            <rect className=${"bar" + (i === 7 ? " last" : "")} x=${x} y=${y(c)} width=${w} height=${Math.max(0, y(0) - y(c))} rx="4" />
            ${c > 0 && html`<text className="vlab" x=${x + w / 2} y=${y(c) - 5} textAnchor="middle">${c}</text>`}
            <text x=${x + w / 2} y=${H - 8} textAnchor="middle">
              ${new Date(start + i * wk).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
            </text>
          </g>`;
      })}
    </svg>
  `;
}

const nothing = html`<p className="muted" style=${{ fontSize: 14, margin: 0 }}>Nothing to chart yet.</p>`;

export default function Dashboard() {
  const { intake, agents, automations } = useHub();
  const open = intake.filter(isOpen);
  const live = automations.filter((a) => a.status === "Live");
  const hrs = live.reduce((s, a) => s + (Number(a.hoursSaved) || 0), 0);
  const atStake = open.reduce((s, r) => s + (Number(r.hours) || 0), 0);
  const liveAgents = agents.filter((a) => a.status === "Live").length;
  const pipe = ISTAT.map((s) => [s, intake.filter((r) => (r.status || "New") === s).length]);
  const opps = open.filter((r) => Number(r.hours) > 0).sort((a, b) => b.hours - a.hours).slice(0, 5);

  const kpis = [
    ["Hours saved / week", fmt(hrs), plural(live.length, "live automation"), true],
    ["Requests received", intake.length, open.length + " still open"],
    ["Hours in open requests", fmt(atStake), "per week, as reported"],
    ["Onyx agents", agents.length, liveAgents + " live"],
    ["Automations", automations.length, live.length + " live"],
  ];

  return html`
    <section className="view">
      <div>
        <${SectionHead} eyebrow="Dashboard" title="Where our AI work stands."
          lead="Live from the intake form and the agent and automation catalogue." />
        <div style=${{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="kpis">
            ${kpis.map(([l, v, s, hl]) => html`
              <div key=${l} className=${"kpi" + (hl ? " hl" : "")}>
                <div className="lab">${l}</div><div className="val">${v}</div><div className="sub">${s}</div>
              </div>`)}
          </div>
          <div className="grid g2">
            <div className="card chart-card"><h3>Requests by department</h3><p className="cap">All intake responses</p>
              <${HBars} rows=${countBy(intake)} />
            </div>
            <div className="card chart-card"><h3>Request pipeline</h3><p className="cap">Current status of every request</p>
              ${intake.length ? html`
                <div className="pipe">
                  ${pipe.filter((p) => p[1]).map(([s, n]) => html`
                    <span key=${s} title=${s + ": " + n} style=${{ width: (n / intake.length) * 100 + "%", background: STATUS_COLOR[s] }}></span>`)}
                </div>
                <div className="legend">
                  ${pipe.map(([s, n]) => html`
                    <span key=${s}><i style=${{ background: STATUS_COLOR[s] }}></i>${s} <span className="mono">${n}</span></span>`)}
                </div>` : nothing}
            </div>
            <div className="card chart-card"><h3>Hours saved per week, by department</h3><p className="cap">Live automations only</p>
              <${HBars} rows=${countBy(live, "department", (a) => Number(a.hoursSaved) || 0).filter((r) => r[1] > 0)} unit=" h" alt=${true} />
            </div>
            <div className="card chart-card"><h3>Requests per week</h3><p className="cap">Last 8 weeks, by submission date</p>
              <div className="cols"><${WeeklyColumns} intake=${intake} /></div>
            </div>
          </div>
          <div className="card">
            <h3 style=${{ marginBottom: 12 }}>Biggest opportunities</h3>
            <p className="muted" style=${{ margin: "0 0 14px", fontSize: 13 }}>Open requests ranked by hours spent per week</p>
            ${opps.length ? html`
              <div className="hbars">
                ${opps.map((r) => html`
                  <div className="hbar" key=${r.id} style=${{ gridTemplateColumns: "minmax(0,1fr) auto auto" }}>
                    <span className="lb">${r.title} <span className="muted">· ${r.department}</span></span>
                    <${Pill} status=${r.status || "New"} />
                    <span className="v">${fmt(r.hours)} h</span>
                  </div>`)}
              </div>`
            : html`<p className="muted" style=${{ fontSize: 14, margin: 0 }}>Open requests that report weekly hours will be ranked here.</p>`}
          </div>
        </div>
      </div>
    </section>
  `;
}
