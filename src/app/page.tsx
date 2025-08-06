'use client';

import React, { useEffect } from 'react';
import DAppExport from './components/DAppExport';
import { init } from './init'; // Direct import to force bundling

// Extend the Window interface to include bundledInit
declare global {
  interface Window {
    bundledInit: typeof init;
  }
}

// For Next.js rendering
export default function Home() {
    useEffect(() => {
        // Force the init function to be included in the bundle
        if (typeof window !== 'undefined') {
            window.bundledInit = init;
            console.log('Home component: Forced init function into bundle');
        }
    }, []);

    return (
        <div>
            <h1>React App</h1>
            <p>A simple Next.js React app built with Turbopack and bundled for Signet</p>
            <p>Note: Security Interface is only available when loaded as a Signet DApp</p>
            {/* Include DAppExport to ensure the init function is bundled */}
            <DAppExport />
        </div>
    );
}