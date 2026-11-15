// Scroll drives the camera from place to place. The visitor's scroll is never taken over: each section of
// the page is a stop. While a section's card is being read the camera holds still on its place; as the next
// section comes up it makes one eased hop, rising over whatever lies between, and settles on the next place.
// The camera never goes below the ground plus a margin for the rooftops.
// A repository picked in the explorer can pull the camera aside; scrolling on hands it back to the path.
import * as THREE from "/vendor/three/three.module.min.js";

// [camera x, height, camera z, target x, target height, target z] in metres; z = -north.
export const STOPS = {
  approach: [7400, 5200, 8200, 200, 0, -300],
  arrival: [3300, 1250, 2900, -1600, 0, 1200], // aimed west of the Cap: land on the right, open sea behind the name
  garoupe: [2350, 360, 950, 912, 110, 486],
  oldtown: [1450, 260, -1100, 430, 30, -1400],
  port: [1250, 230, -1650, 280, 0, -1960],
  fort: [780, 170, -2240, 382, 40, -2420],
  beyond: [-1530, 70, 1080, -1790, 8, 820],
  horizon: [1300, 60, 3300, 5200, 90, 8200],
};

const EASE_PER_SECOND = 2.2; // how fast the camera catches up with the scroll: smooth, never jumpy
const HOLD = 0.6; // share of each section spent holding still on its place before the hop to the next
const HOP_LIFT = 0.06; // a hop rises by this share of its length at its midpoint, so it passes over the town
const MAX_LIFT = 180;
const CLEARANCE = 70; // metres above land: clears the tallest rooftops in Antibes
const SEA_CLEARANCE = 25; // over open water the camera may skim lower
const RELEASE_SCROLL_PX = 90;

const smooth = (x) => x * x * (3 - 2 * x);

export class Rig {
  constructor(camera, sections, stops, heightAt = () => 0) {
    Object.assign(this, { camera, sections, heightAt, shown: 0, wanted: 1, calm: false, focus: null, pull: 0 });
    this.names = ["approach", ...sections.map((section) => section.dataset.stop)];
    this.stops = this.names.map((name) => {
      const stop = stops[name];
      if (!stop) throw new Error(`No camera stop for "${name}"`);
      return { position: new THREE.Vector3(stop[0], stop[1], stop[2]), target: new THREE.Vector3(stop[3], stop[4], stop[5]) };
    });
    this.last = this.stops.length - 1;
    this.target = new THREE.Vector3();
    this.place = new THREE.Vector3();
    this.aside = { position: new THREE.Vector3(), target: new THREE.Vector3() };
  }

  indexOf(name) {
    return this.names.indexOf(name);
  }

  // The name of the stop the camera is at or nearest to.
  current() {
    return this.names[Math.round(this.shown)];
  }

  // Stop i + 1 holds while section i's top is near the top of the viewport; the hop to the next stop
  // happens over the second half of the section, so it lands as the next section arrives.
  readScroll() {
    const y = window.scrollY + window.innerHeight * 0.35;
    const tops = this.sections.map((section) => section.offsetTop);
    let index = 0;
    while (index + 1 < tops.length && y >= tops[index + 1]) index += 1;
    const span = Math.max(1, (tops[index + 1] ?? document.documentElement.scrollHeight) - tops[index]);
    const progress = Math.min(1, Math.max(0, (y - tops[index]) / span));
    const hop = progress < HOLD ? 0 : smooth((progress - HOLD) / (1 - HOLD));
    this.wanted = Math.min(this.last, 1 + index + hop);
    if (window.scrollY < 4) this.wanted = Math.max(1, this.wanted); // the page opens on the arrival stop
    if (this.focus && Math.abs(window.scrollY - this.focus.scroll) > RELEASE_SCROLL_PX) this.focus = null;
  }

  // Pulls the camera to look at a point from a given position, until the visitor scrolls on.
  look(position, target) {
    this.aside.position.copy(position);
    this.aside.target.copy(target);
    this.focus = { scroll: window.scrollY };
  }

  // Where the camera is at a fractional stop: eased between two stops, lifted in the middle of the hop.
  at(shown, position, target) {
    const i = Math.min(this.last - 1, Math.floor(shown));
    const f = smooth(Math.min(1, Math.max(0, shown - i)));
    const [a, b] = [this.stops[i], this.stops[i + 1]];
    position.lerpVectors(a.position, b.position, f);
    target.lerpVectors(a.target, b.target, f);
    position.y += Math.min(MAX_LIFT, a.position.distanceTo(b.position) * HOP_LIFT) * Math.sin(Math.PI * f);
  }

  // Keeps the camera above the ground and the rooftops.
  clear(position) {
    const ground = this.heightAt(position.x, -position.z);
    const floor = ground > 0.5 ? ground + CLEARANCE : SEA_CLEARANCE;
    if (position.y < floor) position.y = floor;
  }

  update(delta) {
    this.readScroll();
    const step = this.calm ? 1 : 1 - Math.exp(-delta * EASE_PER_SECOND); // frame-rate independent
    this.shown += (this.wanted - this.shown) * step;
    if (Math.abs(this.wanted - this.shown) < 1e-4) this.shown = this.wanted;
    this.pull += ((this.focus ? 1 : 0) - this.pull) * step;
    this.at(this.shown, this.place, this.target);
    this.place.lerp(this.aside.position, this.pull);
    this.target.lerp(this.aside.target, this.pull);
    this.clear(this.place);
    this.camera.position.copy(this.place);
    this.camera.lookAt(this.target);
  }

  jump() {
    this.readScroll();
    this.shown = this.wanted;
  }
}
