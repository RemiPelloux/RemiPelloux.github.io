// Entry point for every page. Features mount on load and again after each route change.
import { ready } from "./i18n.js";
import { mountChrome } from "./chrome.js";
import { mountName } from "./name.js";
import { mountLedger } from "./ledger.js";
import { mountModel } from "./model-ui.js";
import { mountCv } from "./cv.js";
import { startRouter } from "./router.js";
import { playIntro } from "./intro.js";
import { mountReveal } from "./reveal.js";
import { mountMarquee } from "./marquee.js";
import "./cursor.js";
import "./shiba.js";

function mountAll() {
  mountChrome();
  mountName();
  mountLedger();
  mountModel();
  mountCv();
  mountReveal();
  mountMarquee();
}

ready.then(() => {
  mountAll();
  startRouter(mountAll);
  playIntro();
});
