import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "@/app/globals.css";

// The whole app starts here, in the browser. The server only ever sent an empty <div id="root">.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
