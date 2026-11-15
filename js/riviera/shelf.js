// The "My repositories" panel beside the name: the most starred public repositories with their real
// star counts, how many more there are, and a way to all of them on GitHub. Each opens in a new tab.
import { GITHUB_REPOS, loadCatalog } from "./catalog.js";
import { t } from "./lang.js";

const SHOWN = 7;
const NEW_TAB = 'target="_blank" rel="noopener"';
const FOLDER = '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.3" d="M1.5 3.5h4l1.5 1.5h7.5v8h-13z"/></svg>';
const GITHUB = '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>';

const escape = (text) => text.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

function render(shelf, catalog) {
  const own = catalog.all.filter((repo) => !repo.fork);
  const top = [...own].sort((a, b) => b.stars - a.stars || b.pushed.localeCompare(a.pushed)).slice(0, SHOWN);
  const rows = top.map((repo) => `<li><a href="${escape(repo.url)}" ${NEW_TAB}>${FOLDER}<span>${escape(repo.name)}</span><small>★ ${repo.stars}</small></a></li>`).join("");
  shelf.innerHTML = `<header>${GITHUB}<div><h2>${t("My repositories", "Mes dépôts")}</h2><p>${t(`${own.length} public repositories`, `${own.length} dépôts publics`)}</p></div></header>
    <ol>${rows}</ol>
    <p class="others">+ ${t(`${own.length - top.length} others`, `${own.length - top.length} autres`)}</p>
    <a class="explore" href="${GITHUB_REPOS}" ${NEW_TAB}>${t("Explore on GitHub", "Explorer sur GitHub")} <span aria-hidden="true">↗</span></a>`;
}

export async function mountShelf() {
  const shelf = document.querySelector("[data-shelf]");
  if (!shelf) return;
  const catalog = await loadCatalog();
  render(shelf, catalog);
  shelf.hidden = false;
  document.addEventListener("riviera:lang", () => render(shelf, catalog));
}
