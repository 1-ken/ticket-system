Honeybadger Production: End-to-end Example

This document shows a concise end-to-end example for configuring Honeybadger in production for a Create React App frontend and a Node server, uploading source maps in CI, and verifying notices.

1) Environment variables (secrets)

- Client (Create React App):
  - REACT_APP_HONEYBADGER_API_KEY — Honeybadger API key for the browser notifier
  - REACT_APP_HONEYBADGER_ENV — (optional) environment name, e.g. "production" or "staging"
  - REACT_APP_RELEASE — (optional) release/revision (commit SHA or tag) used to match source maps

- Server:
  - HONEYBADGER_API_KEY — Honeybadger API key for server-side notifications
  - RELEASE or REVISION — server release identifier (same value as REACT_APP_RELEASE if possible)

Important: Do not commit keys. Store them in your CI/CD secrets or a secrets manager (GitHub Actions secrets, AWS Secrets Manager, HashiCorp Vault, etc.).


2) Frontend (client) configuration

Your app should configure the Honeybadger client at startup and wrap the React tree with the error boundary.
You already have `src/index.js`; the important bits are shown below (adjust to match your app):

```javascript
import { Honeybadger, HoneybadgerErrorBoundary } from '@honeybadger-io/react';

const apiKey = process.env.REACT_APP_HONEYBADGER_API_KEY;
const environment = process.env.REACT_APP_HONEYBADGER_ENV || process.env.NODE_ENV || 'production';
const revision = process.env.REACT_APP_RELEASE || undefined;

if (environment === 'production' && !apiKey) {
  throw new Error('Missing REACT_APP_HONEYBADGER_API_KEY in production');
}

Honeybadger.configure({ apiKey, environment, revision });

// Wrap the app
<HoneybadgerErrorBoundary honeybadger={Honeybadger}>
  <App />
</HoneybadgerErrorBoundary>
```

Notes:
- `revision` (commit SHA) is important to map source maps to the correct release.
- Keep the client configuration minimal and driven by env vars.


3) Server (Node) configuration example

Install: `npm install @honeybadger-io/js`

Add initialization early in your server bootstrap (before other modules):

```javascript
// server.js (or app bootstrap)
const Honeybadger = require('@honeybadger-io/js');

Honeybadger.configure({
  apiKey: process.env.HONEYBADGER_API_KEY,
  environment: process.env.NODE_ENV || 'production',
  revision: process.env.RELEASE || undefined,
});

// Optional: Express middleware
const express = require('express');
const app = express();

// You can notify manually when catching errors, but the SDK will also pick up
// uncaught exceptions and unhandled rejections in many setups.

process.on('uncaughtException', (err) => {
  Honeybadger.notify(err);
  // Depending on your needs, consider exiting or letting a process manager restart
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  Honeybadger.notify(reason instanceof Error ? reason : new Error(String(reason)));
});

app.use((err, req, res, next) => {
  Honeybadger.notify(err, { context: { url: req.originalUrl, user: req.user && req.user.id } });
  res.status(500).send('Internal error');
});

module.exports = app;
```


4) Source maps & release/versioning (CI)

Why: Without source maps, Honeybadger shows minified stack traces. With source maps uploaded and tagged to a revision, Honeybadger will show original file/line numbers.

What to do in CI (high level):
- Build your frontend in production mode (CRA: `npm run build`).
- Capture the `REACT_APP_RELEASE` value; typically use the Git commit SHA or tag (e.g., `GITHUB_SHA`).
- Upload all generated `.map` files with the same revision value.

Example GitHub Actions skeleton (replace placeholders):

```yaml
name: Build and upload source maps
on:
  push:
    branches: [main]

jobs:
  build-and-upload:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Build
        env:
          REACT_APP_HONEYBADGER_API_KEY: ${{ secrets.REACT_APP_HONEYBADGER_API_KEY }}
          REACT_APP_RELEASE: ${{ github.sha }}
        run: |
          npm run build

      # Upload source maps step
      # Option A: Use Honeybadger's CLI (recommended by Honeybadger). Install & run the sourcemap upload tool.
      # Option B: Use API to upload source maps. See Honeybadger docs for exact CLI/API usage.

      - name: Upload source maps (placeholder)
        run: |
          echo "Upload source maps here. Use your preferred method (Honeybadger CLI or API).";
        env:
          HONEYBADGER_API_KEY: ${{ secrets.HONEYBADGER_API_KEY }}
          RELEASE: ${{ github.sha }}
```

Notes:
- Honeybadger maintains CLI and API docs for uploading source maps. Use whichever matches your workflow.
- Ensure you upload source maps for the exact revision you configured in your client (REACT_APP_RELEASE).


5) Verification & testing

- After a production deploy with source maps uploaded:
  - Trigger a controlled error in staging or a canary deployment and confirm the error appears in Honeybadger with readable backtrace (original file/line).
  - Verify integrations (Slack/Email) receive alerts as configured.

- Network verification:
  - Open browser DevTools → Network, trigger an error, and confirm a POST request to the Honeybadger API.


6) Alerting & noise control

- Configure rules in Honeybadger to notify on:
  - New errors
  - Regressions
  - High-frequency spikes
- Configure rate-limiting and filters for known harmless exceptions.


7) Security & key rotation

- Use CI/CD secrets or a secrets manager for keys.
- Rotate keys periodically and test your deploy pipeline to ensure rotation works.
- Validate incoming requests (e.g., source-map webhook) using Honeybadger-Token if you accept callbacks from Honeybadger.


8) Rollout strategy

- Staging -> Canary -> Production.
- Use feature flags or percentage rollouts when possible.
- Monitor error volume and severity after rollouts and tune alerting thresholds.


9) Troubleshooting

- If backtraces are minified:
  - Confirm you uploaded the `.map` files for the correct revision.
  - Confirm the client `revision` value matches the uploaded release.
- If no notices appear:
  - Check network requests and any ad-blockers/firewalls.
  - Confirm API keys and environment settings.


Further help
- If you want, I can:
  - Add a GitHub Actions workflow that installs a Honeybadger CLI (if available) and uploads source maps.
  - Add server-side Honeybadger bootstrapping in your server repo.
  - Add a small deploy checklist or update `README.md` with environment variable instructions.

Pick one and I'll implement it next.
