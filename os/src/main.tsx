import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App, initialMode } from "./App";
import { useOs } from "./state/store";
import "./os/os.css";
// The Easter eggs register their commands and the page-wide Konami listener from the start,
// not only once the terminal has been opened.
import "./terminal/eggs";

useOs.setState({ mode: initialMode() });
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
