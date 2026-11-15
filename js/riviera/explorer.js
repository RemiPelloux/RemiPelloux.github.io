// Chapter 03: the top ten repositories, ranked, each opening on GitHub in a new tab, then a link to all
// the others. In Immersive, "Show in the world" flies the camera to the repository's tower.
import { DISTRICTS, GITHUB_REPOS, loadCatalog } from "./catalog.js";
import { lang, t } from "./lang.js";

let catalog = null;
let root = null;

const date = (iso) => new Intl.DateTimeFormat(t("en-GB", "fr-FR"), { dateStyle: "medium" }).format(new Date(iso));
const districtName = (key) => DISTRICTS.find((d) => d.key === key)?.[lang()] ?? key;
const NEW_TAB = 'target="_blank" rel="noopener"';

function escape(text) {
  return text.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
}

function meta(repo) {
  const parts = [districtName(repo.category), repo.language, t(`${repo.stars} ${repo.stars === 1 ? "star" : "stars"}`, `${repo.stars} ${repo.stars > 1 ? "étoiles" : "étoile"}`), t(`pushed ${date(repo.pushed)}`, `poussé le ${date(repo.pushed)}`)];
  if (repo.featured) parts.unshift(t("flagship", "projet phare"));
  if (repo.archived) parts.push(t("archived", "archivé"));
  return parts.filter(Boolean).map((part) => `<span>${escape(String(part))}</span>`).join("");
}

function card(repo) {
  const open = `<a class="open" href="${escape(repo.url)}" ${NEW_TAB}>${t("Open on GitHub", "Ouvrir sur GitHub")} <span aria-hidden="true">↗</span></a>`;
  const show = `<button type="button" class="show" data-show="${escape(repo.name)}">${t("Show in the world", "Voir dans le monde")}</button>`;
  return `<li><h3><a href="${escape(repo.url)}" ${NEW_TAB}>${escape(repo.name)}</a></h3>
    <p>${escape(repo.description || t("No description yet.", "Pas encore de description."))}</p>
    <p class="meta">${meta(repo)}</p><p class="actions">${open}${show}</p></li>`;
}

function render() {
  root.querySelector("[data-repos]").innerHTML = catalog.repos.map(card).join("");
  const more = root.querySelector("[data-more]");
  more.href = GITHUB_REPOS;
  more.innerHTML = `${t(`See all ${catalog.total} repositories on GitHub`, `Voir les ${catalog.total} dépôts sur GitHub`)} <span aria-hidden="true">↗</span>`;
}

export async function mountExplorer() {
  root = document.querySelector("[data-explorer]");
  if (!root) return;
  catalog = await loadCatalog();
  root.addEventListener("click", (event) => {
    const show = event.target.closest("[data-show]");
    if (show) document.dispatchEvent(new CustomEvent("riviera:focus", { detail: { name: show.dataset.show } }));
  });
  document.addEventListener("riviera:lang", render);
  render();
}

export { card as repoCard };
