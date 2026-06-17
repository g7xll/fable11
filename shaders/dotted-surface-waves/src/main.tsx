import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import App from "./App.tsx";
import "./index.css";

// `next-themes` works fine outside Next.js — it just toggles a `class` on <html>
// and persists the choice. The verbatim `DottedSurface` component reads
// `useTheme()` to pick its particle colour, so the whole tree is wrapped here.
// `defaultTheme="dark"` matches the demo's dark canvas; `enableSystem` is off so
// the surface starts in a deterministic palette (important for the recorded demo).
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <App />
    </ThemeProvider>
  </StrictMode>
);
