import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

// 🐞 Import Honeybadger
import { Honeybadger, HoneybadgerErrorBoundary } from "@honeybadger-io/react";

// 🧠 Configure Honeybadger for production
// Read configuration from environment variables. In Create React App,
// client-side env vars must be prefixed with REACT_APP_.
const apiKey = process.env.REACT_APP_HONEYBADGER_API_KEY;
const environment = process.env.REACT_APP_HONEYBADGER_ENV || process.env.NODE_ENV || 'production';

// Fail-fast in production: require an API key so we don't silently run without
// proper configuration.
if (environment === 'production' && !apiKey) {
  // Throwing here will prevent the app from starting in production and
  // force the deploy to set the correct secret.
  throw new Error('Missing REACT_APP_HONEYBADGER_API_KEY environment variable. Set this for production builds.');
}

const config = {
  apiKey: apiKey || undefined,
  environment,
};

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
