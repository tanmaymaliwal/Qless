import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { useThemeStore } from "./store/themeStore";
import "./index.css";
import App from "./App.jsx";

// Apply saved theme before first render
useThemeStore.getState().initTheme();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);