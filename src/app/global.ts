'use client';

import { init } from './init';

// Extend the Window interface to include our DApp properties
declare global {
  interface Window {
    init: typeof init;
    bundledInit: typeof init;
    DApp: {
      init: typeof init;
    };
    __NEXT_INIT_EXPORT: typeof init;
    __DAPP_INIT_READY: boolean;
  }
}

// Immediately execute when this module loads (client-side only)
if (typeof window !== 'undefined') {
  // Set up the DApp object structure FIRST
  if (!window.DApp) {
    window.DApp = {} as { init: typeof init };
  }

  // Expose the init function immediately
  window.DApp.init = init;
  window.init = init;
  window.bundledInit = init;
  window.__NEXT_INIT_EXPORT = init;
  window.__DAPP_INIT_READY = true;

  console.log('GLOBAL: DApp.init function exposed immediately');
  console.log('GLOBAL: typeof DApp.init =', typeof window.DApp.init);
  console.log('GLOBAL: DApp object keys =', Object.keys(window.DApp));

  // Also dispatch a custom event to signal readiness
  try {
    window.dispatchEvent(new CustomEvent('dapp-init-ready', {
      detail: { init: init }
    }));
  } catch (e) {
    console.log('Could not dispatch dapp-init-ready event');
  }
}

// Force module exports for any module system
if (typeof module !== 'undefined') {
  module.exports = { init };
  module.exports.init = init;
}

if (typeof exports !== 'undefined') {
  exports.init = init;
}

// Export for ES modules
const globalExports = { init };
export { init };
export default globalExports;