'use client';

import React from 'react';
import { createRoot } from 'react-dom/client';

// Define security interface type
interface SecurityInterface {
    getProfileDid: () => Promise<string>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

// App component for DApp mode
function App({ securityInterface }: { securityInterface: SecurityInterface | null }) {
    return (
        <div>
            <h1>React App</h1>
            <p>A simple Next.js React app bundled with Turbopack for Signet DApps</p>
            {securityInterface && (
                <div>
                    <h2>Signet Security Interface Connected</h2>
                    <button
                        style={{
                            backgroundColor: 'var(--foreground)',
                            color: 'var(--background)',
                            padding: '10px 16px',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            border: 'none',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                            transition: 'transform 0.1s, box-shadow 0.1s'
                        }}
                        onClick={async () => {
                            try {
                                const did = await securityInterface.getProfileDid();
                                alert(`Profile DID: ${did}`);
                            } catch (error) {
                                console.error('Error accessing profile DID:', error);
                                alert('Error accessing profile DID. See console for details.');
                            }
                        }}>
                        Get Profile DID
                    </button>
                </div>
            )}
        </div>
    );
}

// Export the init function that Signet will call
export function init(container: HTMLElement, securityInterface: SecurityInterface | null) {
    // Add a unique identifier to verify that changes to init.tsx are reflected in the bundle
    console.log("Init function from init.tsx is being called - UNIQUE_VERIFICATION_ID_20250804");

    // Render the React component into the provided container
    const root = document.createElement('div');
    // Add a custom class to the root element to further verify changes are reflected
    root.className = 'init-tsx-root-element-20250804';
    container.appendChild(root);

    // Use React to render the component with React 18+ API
    const reactRoot = createRoot(root);
    reactRoot.render(
        <React.StrictMode>
            <App securityInterface={securityInterface} />
        </React.StrictMode>
    );

    // Return a cleanup function
    return () => {
        reactRoot.unmount();
        container.removeChild(root);
    };
}