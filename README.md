# AI Hub

The AI Team's internal hub: an intake form (like Google Forms) with shared responses, a dashboard, the team directory, Onyx agents and automations per department, and an AI 101 glossary.

**No build step.** This is plain JavaScript (ES modules) that runs directly in the browser. React is included in `vendor/react-bundle.js`, so nothing needs to be installed and nothing is loaded from other sites except Google Fonts.

## Put it on GitHub Pages

1. Upload **all** files in this folder to the top level of your repo (`index.html` must be at the top, next to the `js` folder).
2. **Settings → Pages → Build and deployment → Source: "Deploy from a branch"**, branch **main**, folder **/ (root)**, then **Save**.
3. Wait about a minute, then open `https://<your-username>.github.io/<repo-name>/` and press Ctrl+Shift+R.

Don't use a GitHub Actions workflow for this version. If your repo still has `.github/workflows/deploy.yml`, `package.json`, `vite.config.js` or a `src` folder from the earlier React build, delete them.

## Try it on your computer

Browsers block ES modules opened straight from a file (`file://`), so double-clicking `index.html` shows a blank page. Run any small local server from this folder instead, for example:

```bash
python -m http.server 8000      # then open http://localhost:8000
# or
npx serve .
```

In VS Code, the "Live Server" extension also works.

## Files

```
index.html                  page shell; loads styles.css and js/main.js
styles.css                  all styles; colour tokens at the top (light + dark)
favicon.svg
.nojekyll                   tells GitHub Pages to serve the files as they are
vendor/react-bundle.js      React 18.3.1 + ReactDOM + htm (do not edit)
js/main.js                  starts the app
js/App.js                   routing (#home, #intake, #responses, #dashboard, #team, #agents, #learn), editor mode
js/lib/store.js             data layer (browser localStorage by default)        ← swap for a real database
js/lib/hub.js               shared state hook (useHub)
js/lib/utils.js             helpers
js/data/constants.js        departments, request types, tools, statuses, form fields   ← edit these
js/data/glossary.js         AI 101 glossary terms                                      ← edit these
js/components/              Header, EntitySheet (add/edit dialog), shared UI
js/pages/                   Home, Intake (form + responses), Dashboard, Team, Agents, Learn
```

## How the components are written

Instead of JSX, components use `html` tagged templates (the `htm` library), which browsers understand natively:

```js
import { html, useState } from "../../vendor/react-bundle.js";

export default function Hello({ name }) {
  const [n, setN] = useState(0);
  return html`<button className="btn" onClick=${() => setN(n + 1)}>Hi ${name}, clicked ${n}</button>`;
}
```

- Values go in `${…}`; components are written `<${Component} prop=${value} />`.
- A component with children closes with `<//>`.
- Everything else (hooks, props, `className`, `style=${{ … }}`) works exactly like React.

## Important: where the data is saved

Data is saved in **each visitor's own browser** (localStorage). A form submitted on one laptop won't appear on another. To share responses across the team, replace `localBackend` in `js/lib/store.js` with a real database (Firebase Firestore, Supabase, or a Google Sheet behind Apps Script). The rest of the app only uses `useCollection`, `addDoc`, `updateDoc` and `deleteDoc`, so nothing else changes.

Firebase can be imported straight from its CDN in this no-build setup:

```js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const db = getFirestore(initializeApp({ apiKey: "…", authDomain: "…", projectId: "…" }));

const firebaseBackend = {
  subscribe: (coll, cb) => onSnapshot(collection(db, coll), (s) => cb(s.docs.map((d) => ({ ...d.data(), id: d.id })))),
  add: (coll, data) => addDoc(collection(db, coll), data),
  update: (coll, id, patch) => updateDoc(doc(db, coll, id), patch),
  remove: (coll, id) => deleteDoc(doc(db, coll, id)),
};
const backend = firebaseBackend; // instead of localBackend
```

## Editor mode

The **Editor mode** switch in the footer shows the add, edit, delete and status controls. Anyone can turn it on, so it is not security. Before sharing widely, replace it with real sign-in and enforce the same rule in your database.
