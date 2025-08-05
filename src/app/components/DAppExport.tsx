'use client';

import { useEffect } from 'react';
import { init } from '../init';

// Extend the Window interface to include our init function
declare global {
  interface Window {
    init: typeof init;
  }
}

// This component ensures the init function is included in the client bundle
export default function DAppExport() {
    useEffect(() => {
        // Ensure the init function is available on the client side
        if (typeof window !== 'undefined') {
            // Make the init function available globally for the bundling process
            window.init = init;

            console.log('DAppExport: Made init function available globally');
            console.log('DAppExport: init function type:', typeof init);
        }
    }, []);

    return null; // This component doesn't render anything
}

// Export the init function for direct imports and bundling
export { init };