// The card that opens when a tower is clicked or a repository is shown in the world.
import { loadCatalog } from "./catalog.js";
import { repoCard } from "./explorer.js";
import { t } from "./lang.js";

export async function mountPanel() {
  const panel = document.querySelector("[data-panel]");
  if (!panel) return;
  const { repos } = await loadCatalog();
  const body = panel.querySelector("[data-panel-body]");
  const open = (event) => {
    const repo = repos.find((r) => r.name === event.detail.name);
    if (!repo) return;
    body.innerHTML = `<ol class="repos">${repoCard(repo)}</ol>`;
    body.querySelector(".show")?.remove();
    panel.querySelector("[data-panel-close]").setAttribute("aria-label", t("Close", "Fermer"));
    panel.hidden = false;
  };
  document.addEventListener("riviera:pick", open);
  document.addEventListener("riviera:focus", open);
  panel.querySelector("[data-panel-close]").addEventListener("click", () => (panel.hidden = true));
  window.addEventListener("keydown", (event) => event.key === "Escape" && (panel.hidden = true));
}
