// Runs before first paint: picks the saved or preferred theme and language.
(function () {
  var root = document.documentElement;
  function read(key) {
    try { return localStorage.getItem(key); } catch (error) { return null; }
  }
  var dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  var french = (navigator.language || "").toLowerCase().indexOf("fr") === 0;
  root.dataset.theme = read("theme") || (dark ? "dark" : "light");
  root.dataset.lang = read("lang") || (french ? "fr" : "en");
})();
