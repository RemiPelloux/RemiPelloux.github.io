// Splits the large statements into words so each one can rise from behind a mask.
// Words, not letters: the statements are full sentences, and one element per letter is too many.
import { calm } from "./juice.js";

const TARGETS = "[data-reveal] .statement, [data-reveal] .lede";
const MAX_STAGGERED = 30; // later words share the last delay, so a long sentence never drags

function wrapWord(word, index) {
  const mask = document.createElement("span");
  const inner = document.createElement("span");
  mask.className = "w";
  inner.textContent = word;
  inner.style.setProperty("--i", Math.min(index, MAX_STAGGERED));
  mask.append(inner);
  return mask;
}

function splitText(node, counter) {
  const fragment = document.createDocumentFragment();
  for (const part of node.textContent.split(/(\s+)/)) {
    if (!part) continue;
    if (/^\s+$/.test(part)) fragment.append(" ");
    else fragment.append(wrapWord(part, counter.next++));
  }
  node.replaceWith(fragment);
}

function split(element) {
  if (element.querySelector(".w")) return;
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  const counter = { next: 0 };
  nodes.forEach((node) => splitText(node, counter));
}

export function mountWords() {
  if (calm()) return;
  document.querySelectorAll(TARGETS).forEach(split);
}

document.addEventListener("langchange", mountWords);
