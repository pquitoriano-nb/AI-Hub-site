import { html, createRoot } from "../vendor/react-bundle.js";
import App from "./App.js";

createRoot(document.getElementById("root")).render(html`<${App} />`);
