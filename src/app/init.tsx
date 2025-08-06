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
function App({ securityInterface, onClose }: { securityInterface: SecurityInterface | null, onClose?: () => void }) {
    return (
        <div style={{ 
            backgroundColor: '#4a4a4a', 
            color: 'white', 
            padding: '20px', 
            borderRadius: '8px',
            minHeight: '100%'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h1 style={{ margin: 0 }}>React App</h1>
                {onClose && (
                    <button
                        style={{
                            backgroundColor: '#dc3545',
                            color: 'white',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            border: 'none',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                            transition: 'transform 0.1s, box-shadow 0.1s',
                            fontSize: '12px'
                        }}
                        onClick={onClose}>
                        Close
                    </button>
                )}
            </div>
            <p>A simple Next.js React app bundled with Turbopack for Signet DApps</p>
            {securityInterface && (
                <div>
                    <h2 style={{ marginBottom: '20px' }}>Signet Security Interface Connected</h2>
                    <button
                        style={{
                            backgroundColor: '#007bff',
                            color: 'white',
                            padding: '10px 16px',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            border: 'none',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                            transition: 'transform 0.1s, box-shadow 0.1s',
                            marginTop: '24px'
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
    console.log("=== INIT FUNCTION CALLED ===");
    console.log("UNIQUE_VERIFICATION_ID_20250804");
    console.log("Container ID:", container.id);
    console.log("Container classes:", container.className);
    console.log("Container parent:", container.parentElement?.className || 'no parent');
    console.log("Security interface provided:", !!securityInterface);
    console.log("Call stack:", new Error().stack?.split('\n').slice(1, 4).join('\n') || 'no stack');

    // Check if this is the test container (usually has no parent or different structure)
    const isTestContainer = !container.parentElement || 
                           container.id === 'test-container' ||
                           !container.className.includes('dapp-container');

    console.log("Is test container:", isTestContainer);

    // If this is NOT a test container, it should be the real Signet container
    if (!isTestContainer) {
        console.log("*** REAL SIGNET CONTAINER DETECTED ***");
        console.log("Container innerHTML before processing:", container.innerHTML.substring(0, 200));
    }

    // FORCE SEARCH FOR REAL SIGNET CONTAINER if this is a test call
    if (isTestContainer) {
        console.log("Test container detected - searching for real Signet container...");

        // Set up a monitor to find the real Signet container
        setTimeout(() => {
            const signetContainers = document.querySelectorAll('.dapp-container');
            console.log("Found potential Signet containers:", signetContainers.length);

            signetContainers.forEach((signetContainer, index) => {
                console.log(`Signet container ${index + 1}:`, {
                    classes: signetContainer.className,
                    id: signetContainer.id,
                    children: signetContainer.children.length,
                    innerHTML: signetContainer.innerHTML.substring(0, 100)
                });

                // If this container looks like a real Signet container and has styles setup
                if (signetContainer.classList.contains('dapp-container') && 
                    signetContainer.querySelector('.dapp-styles')) {

                    console.log("*** FOUND REAL SIGNET CONTAINER - FORCE RENDERING ***");

                    // Force render to this container
                    const forceRenderToSignetContainer = () => {
                        console.log('Force rendering to real Signet container...');

                        // Create React root element for Signet container
                        const signetReactRoot = document.createElement('div');
                        signetReactRoot.className = 'init-tsx-signet-root-20250804';
                        signetReactRoot.style.cssText = 'width: 100%; height: 100%; min-height: 100%; position: relative; z-index: 100;';

                        // Append to the real Signet container
                        signetContainer.appendChild(signetReactRoot);

                        console.log('Signet container children after adding React root:', signetContainer.children.length);

                        // Create React root for rendering to Signet container
                        const signetRoot = createRoot(signetReactRoot);

                        console.log('Created React root for Signet container, about to render...');

                        // Create close handler for Signet container
                        const handleSignetClose = () => {
                            console.log('Cleaning up React app from Signet container');
                            signetRoot.unmount();
                            if (signetReactRoot.parentNode) {
                                signetReactRoot.parentNode.removeChild(signetReactRoot);
                            }

                            // Notify parent window
                            if (window.parent) {
                                try {
                                    window.parent.postMessage({ type: 'dapp-close' }, '*');
                                } catch {
                                    console.log('Could not notify parent of app close');
                                }
                            }
                        };

                        // Render to Signet container
                        signetRoot.render(
                            <React.StrictMode>
                                <App securityInterface={securityInterface} onClose={handleSignetClose} />
                            </React.StrictMode>
                        );

                        console.log('React render called for Signet container!');

                        // Check rendering after a short delay
                        setTimeout(() => {
                            console.log('After 100ms - Signet React root children count:', signetReactRoot?.children.length || 0);
                            console.log('After 100ms - Signet React root innerHTML:', signetReactRoot?.innerHTML.substring(0, 300) || 'no content');
                        }, 100);
                    };

                    forceRenderToSignetContainer();
                }
            });
        }, 300); // Give Signet more time to set up the container
    }

    let root: ReturnType<typeof createRoot> | null = null;
    let reactRoot: HTMLElement | null = null;

    // Create cleanup function
    const cleanup = () => {
        console.log('Cleaning up React app');
        if (root) {
            root.unmount();
        }
        if (reactRoot && reactRoot.parentNode) {
            reactRoot.parentNode.removeChild(reactRoot);
        }
    };

    // Create close handler that calls cleanup
    const handleClose = () => {
        cleanup();
        // Optionally notify Signet that the app was closed
        if (typeof window !== 'undefined' && window.parent) {
            try {
                window.parent.postMessage({ type: 'dapp-close' }, '*');
            } catch {
                console.log('Could not notify parent of app close');
            }
        }
    };

    // Function to render React content
    const renderReactContent = () => {
        console.log('Rendering React content...');

        // Create React root element
        reactRoot = document.createElement('div');
        // Add a custom class to the root element to further verify changes are reflected
        reactRoot.className = 'init-tsx-root-element-20250804';
        // Add styling to ensure proper display and positioning
        reactRoot.style.cssText = 'width: 100%; height: 100%; min-height: 100%; position: relative; z-index: 10;';

        // Append to container
        container.appendChild(reactRoot);

        console.log('Container children after adding React root:', container.children.length);
        console.log('Container HTML after adding:', container.innerHTML.substring(0, 400));

        // Create React root for rendering
        root = createRoot(reactRoot);

        console.log('Created React root, about to render...');

        // Use React to render the component with React 18+ API
        root.render(
            <React.StrictMode>
                <App securityInterface={securityInterface} onClose={handleClose} />
            </React.StrictMode>
        );

        console.log('React render called, container structure:', container.innerHTML.substring(0, 400));

        // Check rendering after a short delay
        setTimeout(() => {
            console.log('After 100ms - React root children count:', reactRoot?.children.length || 0);
            console.log('After 100ms - React root innerHTML:', reactRoot?.innerHTML.substring(0, 300) || 'no content');
        }, 100);
    };

    if (isTestContainer) {
        // For test container, render immediately
        console.log('Test container detected - rendering immediately');
        renderReactContent();
    } else {
        // For real Signet container, wait for style setup to complete
        console.log('Real Signet container detected - using delayed rendering');
        setTimeout(() => {
            console.log('Delayed rendering - Signet container setup should be complete');
            renderReactContent();
        }, 200);
    }

    // Return the cleanup function immediately
    return cleanup;
}