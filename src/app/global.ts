'use client';

import { init } from './init';

// Extend the Window interface to include our DApp properties
declare global {
  interface Window {
    init: typeof init;
    DApp: {
      init: typeof init;
    };
  }
}

// Make the init function available for bundling
if (typeof window !== 'undefined') {
  window.init = init;

  // Also set up the DApp object structure
  if (!window.DApp) {
    window.DApp = {} as { init: typeof init };
  }
  window.DApp.init = init;
}

// Export for module systems
const globalExports = { init };
export { init };
export default globalExports;