// Pointing at a tower names its repository; clicking it opens the repository's card.
import * as THREE from "/vendor/three/three.module.min.js";

export function watchTowers(canvas, universe, camera) {
  const ray = new THREE.Raycaster();
  const point = new THREE.Vector2();
  const tip = document.querySelector("[data-tip]");
  let hovered = null;
  const pick = (event) => {
    if (!universe.group.visible || event.target.closest(".card, .explorer, .companion, .panel, .bar")) return null;
    point.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
    ray.setFromCamera(point, camera);
    const [hit] = ray.intersectObject(universe.towers);
    return hit ? universe.entries[hit.instanceId] : null;
  };
  window.addEventListener("pointermove", (event) => {
    hovered = pick(event);
    tip.hidden = !hovered;
    document.documentElement.classList.toggle("over-tower", Boolean(hovered));
    if (!hovered) return;
    tip.textContent = hovered.repo.description ? `${hovered.repo.name}: ${hovered.repo.description}` : hovered.repo.name;
    tip.style.transform = `translate(${event.clientX + 14}px, ${event.clientY + 14}px)`;
  });
  window.addEventListener("click", (event) => {
    const tower = pick(event);
    if (tower) document.dispatchEvent(new CustomEvent("riviera:pick", { detail: { name: tower.repo.name } }));
  });
}
