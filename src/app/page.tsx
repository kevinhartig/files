'use client';

import React from 'react';
import DAppExport from './components/DAppExport';

// For Next.js rendering
export default function Home() {
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