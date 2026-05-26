// preload.cjs — CommonJS entrypoint that polyfills WebSocket before loading the ESM app
// Railway start command: node preload.cjs

const ws = require('ws');
if (typeof globalThis.WebSocket === 'undefined') {
  globalThis.WebSocket = ws.WebSocket || ws;
  console.log('[Setup] WebSocket polyfill applied (Node.js < 22)');
}

// Now dynamically import the ESM entrypoint
import('./dist/index.js').catch((err) => {
  console.error('[Setup] Failed to load app:', err);
  process.exit(1);
});
