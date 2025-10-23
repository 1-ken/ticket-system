const Honeybadger = require('@honeybadger-io/js');

// Use environment variable for local Node tests when possible. Falls back to
// the current API key for convenience (replace with a test key in real use).
const apiKey = process.env.HONEYBADGER_API_KEY || 'hbp_Sy48yI0xwMwFrOdxxFg2ZRc4Tsn8KK0vThd0';
Honeybadger.configure({
  apiKey,
  environment: 'development',
});

console.log('Honeybadger configured. Sending test notify...');

Honeybadger.notify(new Error('Test error from local script'), { context: { test: true } });

// Give the notifier a moment to flush network requests before exiting
setTimeout(() => {
  console.log('Test notify sent. Exiting.');
  process.exit(0);
}, 2000);
