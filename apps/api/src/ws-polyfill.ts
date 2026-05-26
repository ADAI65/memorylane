// ws-polyfill.ts — Must be imported by supabase.ts BEFORE createClient
import ws from 'ws';
// Ensure global WebSocket is set before any Supabase code checks it
if (typeof globalThis.WebSocket === 'undefined') {
  Object.defineProperty(globalThis, 'WebSocket', {
    value: ws.WebSocket || ws,
    writable: true,
    configurable: true,
  });
}
