// Runs before first paint: picks the saved or preferred theme and language,
// and decides whether the opening sequence plays (once per browser session).
(function () {
  var root = document.documentElement;
  var INTRO_SAFETY_MS = 4000;
  function read(store, key) {
    try { return store.getItem(key); } catch (error) { return null; }
  }
  var dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  var french = (navigator.language || "").toLowerCase().indexOf("fr") === 0;
  root.dataset.theme = read(localStorage, "theme") || (dark ? "dark" : "light");
  root.dataset.lang = read(localStorage, "lang") || (french ? "fr" : "en");

  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var home = /^\/(index\.html)?$/.test(window.location.pathname);
  if (still || !home || read(sessionStorage, "intro")) return;
  try { sessionStorage.setItem("intro", "seen"); } catch (error) { return; }
  root.classList.add("intro-running");
  // If the scripts never arrive, show the page anyway.
  setTimeout(function () { root.classList.remove("intro-running", "intro-covered"); }, INTRO_SAFETY_MS);
})();
