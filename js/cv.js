// CV page: PDF export through the print dialog, and private contact details from the address.
import { lang, ready } from "./i18n.js";

const FILE_NAME = "Remi-Pelloux-CV";
const PRIVATE_FIELDS = ["email", "tel"];
const exportButton = document.querySelector("[data-export]");
const privateSlot = document.querySelector("[data-private]");

// The browser names the PDF after the page title.
function exportPdf() {
  const title = document.title;
  document.title = `${FILE_NAME}-${lang().toUpperCase()}`;
  window.print();
  document.title = title;
}

// Read from the query string, never stored, never sent anywhere.
function showPrivateDetails() {
  const params = new URLSearchParams(window.location.search);
  const values = PRIVATE_FIELDS.map((field) => params.get(field)).filter(Boolean);
  privateSlot.textContent = values.map((value) => ` · ${value}`).join("");
}

exportButton?.addEventListener("click", exportPdf);
if (privateSlot) ready.then(showPrivateDetails);
