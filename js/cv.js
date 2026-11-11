// CV page: PDF export through the print dialog, and private contact details from the address.
import { lang } from "./i18n.js";

const FILE_NAME = "Remi-Pelloux-CV";
const PRIVATE_FIELDS = ["email", "tel"];

// The browser names the PDF after the page title.
function exportPdf() {
  const title = document.title;
  document.title = `${FILE_NAME}-${lang().toUpperCase()}`;
  window.print();
  document.title = title;
}

// Read from the query string, never stored, never sent anywhere.
export function mountCv() {
  const slot = document.querySelector("[data-private]");
  if (!slot) return;
  const params = new URLSearchParams(window.location.search);
  const values = PRIVATE_FIELDS.map((field) => params.get(field)).filter(Boolean);
  slot.textContent = values.map((value) => ` · ${value}`).join("");
}

document.addEventListener("click", (event) => {
  if (event.target.closest("[data-export]")) exportPdf();
});
