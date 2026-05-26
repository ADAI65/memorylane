// preload.cjs — CommonJS entrypoint that polyfills WebSocket before loading the ESM app
// Railway start command: node preload.cjs

const ws = require('ws');
if (typeof globalThis.WebSocket === 'undefined') {
  globalThis.WebSocket = ws.WebSocket || ws;
}
console.log('[preload] WebSocket polyfill applied, globalThis.WebSocket =', typeof globalThis.WebSocket);

// Set a flag so we can verify in health endpoint
process.env.__PRELOAD_RAN = 'true';

// Now dynamically import the ESM entrypoint
import('./dist/index.js').catch((err) => {
  console.error('[preload] Failed to load app:', err);
  process.exit(1);
});
