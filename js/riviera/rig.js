// Scroll drives the camera along a path through real places. The visitor's scroll is never taken over:
// each section of the page is a stop, and the camera eases toward wherever the scroll position says it should be.
import * as THREE from "/vendor/three/three.module.min.js";

// [camera x, height, camera z, target x, target height, target z] in metres; z = -north.
const STOPS = {
  approach: [7400, 5200, 8200, 200, 0, -300],
  arrival: [3300, 1250, 2900, -1600, 0, 1200], // aimed west of the Cap: land on the right, open sea behind the name
  garoupe: [2350, 360, 950, 912, 110, 486],
  oldtown: [1450, 210, -1100, 430, 30, -1400],
  port: [1250, 190, -1650, 280, 0, -1960],
  fort: [780, 115, -2240, 382, 40, -2420],
  inland: [-300, 1500, -300, -900, 0, -2000],
};

const EASE_PER_SECOND = 2.4;
const DRIFT_METRES = 14;

function curves(names) {
  const stops = names.map((name) => STOPS[name]);
  const make = (offset) => new THREE.CatmullRomCurve3(stops.map((s) => new THREE.Vector3(s[offset], s[offset + 1], s[offset + 2])), false, "centripetal");
  return { position: make(0), target: make(3), last: stops.length - 1 };
}

export class Rig {
  constructor(camera, sections) {
    Object.assign(this, { camera, sections, shown: 0, wanted: 1, calm: false });
    this.path = curves(["approach", ...sections.map((section) => section.dataset.stop)]);
    this.target = new THREE.Vector3();
  }

  // Stop i is reached when section i's top meets the top of the viewport.
  readScroll() {
    const y = window.scrollY;
    const tops = this.sections.map((section) => section.offsetTop);
    let index = 0;
    while (index + 1 < tops.length && y >= tops[index + 1]) index += 1;
    const span = (tops[index + 1] ?? tops[index] + 1) - tops[index];
    this.wanted = 1 + index + Math.min(1, Math.max(0, (y - tops[index]) / span));
    this.wanted = Math.min(this.path.last, this.wanted);
  }

  update(seconds, delta) {
    this.readScroll();
    const step = this.calm ? 1 : Math.min(1, delta * EASE_PER_SECOND);
    this.shown += (this.wanted - this.shown) * step;
    const u = this.shown / this.path.last;
    this.camera.position.copy(this.path.position.getPoint(Math.min(1, u)));
    this.path.target.getPoint(Math.min(1, u), this.target);
    if (!this.calm) this.camera.position.x += Math.sin(seconds * 0.11) * DRIFT_METRES;
    this.camera.lookAt(this.target);
  }

  jump() {
    this.readScroll();
    this.shown = this.wanted;
  }
}
