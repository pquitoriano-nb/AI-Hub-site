import { html } from "../../vendor/react-bundle.js";
import { useHub } from "../lib/hub.js";

const TABS = [
  ["home", "Home"],
  ["intake", "Intake form"],
  ["dashboard", "Dashboard"],
  ["team", "Our team"],
  ["agents", "Agents & automations"],
  ["learn", "AI 101"],
];

export default function Header({ current }) {
  const { go } = useHub();
  const click = (v) => (e) => { e.preventDefault(); go(v); };
  return html`
    <header className="top">
      <div className="wrap nav">
        <a className="brandmark" href="#home" onClick=${click("home")}>
          <span className="orb-s" aria-hidden="true"></span>AI Hub
        </a>
        <nav className="tabs" aria-label="Sections">
          ${TABS.map(([v, label]) => html`
            <a key=${v} className="tab" href=${"#" + v} aria-current=${current === v ? "page" : undefined} onClick=${click(v)}>${label}</a>
          `)}
        </nav>
        <a className="btn btn-night cta-top" href="#intake" onClick=${click("intake")}>
          Submit a request <span className="arr" aria-hidden="true">↗</span>
        </a>
      </div>
    </header>
  `;
}
