// Chapter 03's repository explorer: search, districts, sort and forks, and a card per repository.
// Works the same in Lite. In Immersive, "Show in the world" flies the camera to the repository's tower.
import { DISTRICTS, countBy, loadCatalog, select } from "./catalog.js";
import { lang, t } from "./lang.js";

const view = { query: "", district: "all", sort: "pushed", forks: false };
let repos = [];
let root = null;

const date = (iso) => new Intl.DateTimeFormat(t("en-GB", "fr-FR"), { dateStyle: "medium" }).format(new Date(iso));
const districtName = (key) => DISTRICTS.find((d) => d.key === key)?.[lang()] ?? key;

function escape(text) {
  return text.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
}

function meta(repo) {
  const parts = [districtName(repo.category), repo.language, t(`${repo.stars} ${repo.stars === 1 ? "star" : "stars"}`, `${repo.stars} ${repo.stars > 1 ? "étoiles" : "étoile"}`), t(`pushed ${date(repo.pushed)}`, `poussé le ${date(repo.pushed)}`)];
  if (repo.fork) parts.push(t("fork", "fork"));
  if (repo.archived) parts.push(t("archived", "archivé"));
  return parts.filter(Boolean).map((part) => `<span>${escape(String(part))}</span>`).join("");
}

function card(repo) {
  const show = repo.fork ? "" : `<button type="button" class="show" data-show="${escape(repo.name)}">${t("Show in the world", "Voir dans le monde")}</button>`;
  return `<li><h3><a href="${escape(repo.url)}">${escape(repo.name)}</a></h3>
    <p>${escape(repo.description || t("No description yet.", "Pas encore de description."))}</p>
    <p class="meta">${meta(repo)}</p>${show}</li>`;
}

function chips() {
  const counts = countBy(repos.filter((r) => view.forks || !r.fork), "category");
  const all = [{ key: "all", en: "All", fr: "Tout" }, ...DISTRICTS];
  root.querySelector("[data-districts]").innerHTML = all.map((d) => {
    const n = d.key === "all" ? [...counts.values()].reduce((a, b) => a + b, 0) : counts.get(d.key) || 0;
    return `<button type="button" data-district="${d.key}" aria-pressed="${view.district === d.key}">${d[lang()]} <span>${n}</span></button>`;
  }).join("");
}

function render() {
  const shown = select(repos, view);
  chips();
  root.querySelector("[data-repos]").innerHTML = shown.map(card).join("");
  root.querySelector("[data-count]").textContent = t(`${shown.length} repositories`, `${shown.length} dépôts`);
}

function listen() {
  root.querySelector("[data-query]").addEventListener("input", (event) => ((view.query = event.target.value), render()));
  root.querySelector("[data-sort]").addEventListener("change", (event) => ((view.sort = event.target.value), render()));
  root.querySelector("[data-forks]").addEventListener("change", (event) => ((view.forks = event.target.checked), render()));
  root.addEventListener("click", (event) => {
    const district = event.target.closest("[data-district]");
    if (district) (view.district = district.dataset.district), render();
    const show = event.target.closest("[data-show]");
    if (show) document.dispatchEvent(new CustomEvent("riviera:focus", { detail: { name: show.dataset.show } }));
  });
  document.addEventListener("riviera:lang", render);
}

export async function mountExplorer() {
  root = document.querySelector("[data-explorer]");
  if (!root) return;
  ({ repos } = await loadCatalog());
  listen();
  render();
}

export { card as repoCard };
