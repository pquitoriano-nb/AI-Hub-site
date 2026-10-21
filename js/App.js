import { html, useCallback, useEffect, useRef, useState } from "../vendor/react-bundle.js";
import { useCollection } from "./lib/store.js";
import { HubContext } from "./lib/hub.js";
import { Toast } from "./components/ui.js";
import Header from "./components/Header.js";
import EntitySheet from "./components/EntitySheet.js";
import Home from "./pages/Home.js";
import Intake from "./pages/Intake.js";
import Dashboard from "./pages/Dashboard.js";
import Team from "./pages/Team.js";
import Agents from "./pages/Agents.js";
import Learn from "./pages/Learn.js";

const VIEWS = ["home", "intake", "responses", "dashboard", "team", "agents", "learn"];

function readHash() {
  const h = window.location.hash.slice(1);
  return VIEWS.includes(h) ? h : "home";
}

export default function App() {
  const intake = useCollection("intake", "createdAt");
  const team = useCollection("team");
  const agents = useCollection("agents");
  const automations = useCollection("automations");

  // Route: #home, #intake, #responses, #dashboard, #team, #agents, #learn
  const [route, setRoute] = useState(readHash);
  useEffect(() => {
    const on = () => setRoute(readHash());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  const go = useCallback((v) => {
    if (window.location.hash !== "#" + v) window.location.hash = v;
    else setRoute(v);
    window.scrollTo({ top: 0 });
  }, []);

  // Editor mode: shows add / edit / delete / status controls.
  // This is a simple local switch, NOT security. Replace with real sign-in (see README).
  const [canEdit, setCanEdit] = useState(() => {
    try { return localStorage.getItem("aihub:editor") === "1"; } catch { return false; }
  });
  const toggleEdit = () => setCanEdit((v) => {
    try { localStorage.setItem("aihub:editor", v ? "0" : "1"); } catch {}
    return !v;
  });

  const [toastMsg, setToastMsg] = useState("");
  const timer = useRef();
  const toast = useCallback((m) => {
    setToastMsg(m);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToastMsg(""), 2800);
  }, []);

  const [sheet, setSheet] = useState(null); // { kind, item? }
  const [draftTitle, setDraftTitle] = useState("");

  const ctx = {
    intake, team, agents, automations, canEdit, toast, go,
    openSheet: (kind, item) => setSheet({ kind, item }),
    draftTitle, setDraftTitle,
  };

  const page = route === "responses" ? "intake" : route;

  return html`
    <${HubContext.Provider} value=${ctx}>
      <${Header} current=${page} />
      <main className="wrap">
        ${page === "home" && html`<${Home} />`}
        ${page === "intake" && html`<${Intake} key=${route} initialTab=${route === "responses" ? "resp" : "form"} />`}
        ${page === "dashboard" && html`<${Dashboard} />`}
        ${page === "team" && html`<${Team} />`}
        ${page === "agents" && html`<${Agents} />`}
        ${page === "learn" && html`<${Learn} />`}
      </main>
      <footer>
        <div className="wrap">
          <span>AI Hub · built by the AI Team</span>
          <label className="admin-toggle">
            <input type="checkbox" checked=${canEdit} onChange=${toggleEdit} /> Editor mode
          </label>
        </div>
      </footer>
      ${sheet && html`<${EntitySheet} kind=${sheet.kind} item=${sheet.item} onClose=${() => setSheet(null)} />`}
      <${Toast} message=${toastMsg} />
    <//>
  `;
}
