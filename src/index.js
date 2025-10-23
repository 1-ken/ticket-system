import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

// 🐞 Import Honeybadger
import { Honeybadger, HoneybadgerErrorBoundary } from "@honeybadger-io/react";

// 🧠 Configure Honeybadger
// Use env var in production/development. Create-React-App exposes env vars
// prefixed with REACT_APP_. This falls back to the existing key if not set.
const config = {
  apiKey: process.env.REACT_APP_HONEYBADGER_API_KEY || "hbp_Sy48yI0xwMwFrOdxxFg2ZRc4Tsn8KK0vThd0",
  environment: "production",
};

// Configure Honeybadger in-place. `configure` mutates the Honeybadger module;
// call it and then use the Honeybadger module itself for the ErrorBoundary
Honeybadger.configure(config);
const honeybadger = Honeybadger;

// ✅ Render the app with Honeybadger’s error boundary
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <HoneybadgerErrorBoundary honeybadger={honeybadger}>
      <App />
    </HoneybadgerErrorBoundary>
  </React.StrictMode>
);

// Optional: continue measuring performance
reportWebVitals();
