'use client';

import { useEffect } from 'react';
import { init } from '../init';

// Extend the Window interface to include our init function
declare global {
  interface Window {
    init: typeof init;
    DApp: {
      init: typeof init;
    };
    bundledInit: typeof init;
    __NEXT_INIT_EXPORT: typeof init;
    __DAPP_INIT_READY: boolean;
  }
}

// This component ensures the init function is included in the client bundle
export default function DAppExport() {
    // Execute immediately when component is defined, not just when mounted
    if (typeof window !== 'undefined') {
        // Make the init function available globally for the bundling process
        window.init = init;

        // Also ensure DApp object exists and has init
        if (!window.DApp) {
            window.DApp = {} as { init: typeof init };
        }
        window.DApp.init = init;

        // Additional global assignments to ensure visibility
        window.bundledInit = init;
        window.__NEXT_INIT_EXPORT = init;
        window.__DAPP_INIT_READY = true;

        console.log('DAppExport: Made init function available globally (immediate)');
        console.log('DAppExport: init function type:', typeof init);
        console.log('DAppExport: window.DApp.init === init:', window.DApp.init === init);

        // Force dispatch an event to notify that the real init is ready
        try {
            window.dispatchEvent(new CustomEvent('dapp-init-ready', {
                detail: { init: init }
            }));
        } catch (e) {
            console.log('Could not dispatch dapp-init-ready event');
        }
    }

    useEffect(() => {
        // Also ensure it's available after mount and override any wrappers
        if (typeof window !== 'undefined') {
            window.init = init;

            if (!window.DApp) {
                window.DApp = {} as { init: typeof init };
            }
            window.DApp.init = init;
            window.bundledInit = init;
            window.__NEXT_INIT_EXPORT = init;

            console.log('DAppExport: Made init function available globally (useEffect)');
            console.log('DAppExport: init function type:', typeof init);
            console.log('DAppExport: Final window.DApp.init === original init:', window.DApp.init === init);

            // Verify the function source contains our unique ID
            const functionSource = init.toString();
            console.log('DAppExport: Init function contains unique ID:', functionSource.includes('UNIQUE_VERIFICATION_ID_20250804'));
        }
    }, []);

    return null; // This component doesn't render anything
}

// Export the init function for direct imports and bundling
export { init };