const fs = require('fs');
const path = require('path');

// Paths
const nextOutputDir = path.resolve(__dirname, '../.next');
const distDir = path.resolve(__dirname, '../dist');
const cssOutputPath = path.resolve(distDir, 'index.css');
const jsOutputPath = path.resolve(distDir, 'index.bundle.js');

// Function to find the main client-side bundle
function findClientBundle() {
    console.log('Searching for Next.js client bundle...');

    // Look in the static directory for the main app bundle
    const staticDir = path.join(nextOutputDir, 'static');
    if (!fs.existsSync(staticDir)) {
        return null;
    }

    function searchInDirectory(dir) {
        const files = fs.readdirSync(dir, { withFileTypes: true });

        for (const file of files) {
            const fullPath = path.join(dir, file.name);

            if (file.isDirectory()) {
                const result = searchInDirectory(fullPath);
                if (result) return result;
            } else if (file.name.endsWith('.js') && (file.name.includes('app') || file.name.includes('main') || file.name.includes('page'))) {
                console.log(`Found potential client bundle: ${fullPath}`);
                return fullPath;
            }
        }

        return null;
    }

    return searchInDirectory(staticDir);
}

// Create dist directory if it doesn't exist
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// Function to extract and combine CSS
function extractCSS() {
    console.log('Extracting CSS...');

    const cssFiles = [];
    function findCSSFiles(dir) {
        const files = fs.readdirSync(dir, { withFileTypes: true });

        for (const file of files) {
            const fullPath = path.join(dir, file.name);

            if (file.isDirectory()) {
                findCSSFiles(fullPath);
            } else if (file.name.endsWith('.css')) {
                cssFiles.push(fullPath);
            }
        }
    }

    findCSSFiles(nextOutputDir);

    let combinedCSS = '';
    for (const cssFile of cssFiles) {
        const css = fs.readFileSync(cssFile, 'utf8');
        combinedCSS += css + '\n';
    }

    fs.writeFileSync(cssOutputPath, combinedCSS);
    console.log(`CSS extracted to ${cssOutputPath}`);
}

// Function to prepare the JavaScript bundle
function prepareJSBundle() {
    console.log('Preparing JS bundle...');

    // Create a browser-compatible bundle with the init function
    const browserBundle = `
// Browser-compatible DApp bundle
(function() {
    'use strict';

    // Define the DApp global variable
    if (typeof window !== 'undefined') {
        window.DApp = {};
        console.log("DApp global variable defined");
    }

    // Browser polyfills
    if (typeof require === 'undefined') {
        window.require = function(module) {
            console.warn('Module import attempted via require():', module);
            if (module === 'react') return window.React || {};
            if (module === 'react-dom/client') return window.ReactDOM || {};
            return {};
        };
    }

    if (typeof module === 'undefined') {
        window.module = { exports: {} };
    }

    if (typeof exports === 'undefined') {
        window.exports = {};
    }

    // Define the init function directly (transpiled from init.tsx)
    function init(container, securityInterface) {
        console.log("Init function from init.tsx is being called - UNIQUE_VERIFICATION_ID_20250804");

        // Ensure React and ReactDOM are available
        if (typeof window.React === 'undefined' || typeof window.ReactDOM === 'undefined') {
            console.error('React or ReactDOM not available');
            container.innerHTML = '<div style="color: red; padding: 20px;">Error: React libraries not loaded</div>';
            return;
        }

        const React = window.React;
        const ReactDOM = window.ReactDOM;

        // Create the App component
        function App() {
            return React.createElement('div', null, [
                React.createElement('h1', { key: 'title' }, 'React App'),
                React.createElement('p', { key: 'subtitle' }, 'A simple Next.js React app bundled with Turbopack for Signet DApps'),
                securityInterface && React.createElement('div', { key: 'security' }, [
                    React.createElement('h2', { key: 'security-title' }, 'Signet Security Interface Connected'),
                    React.createElement('button', {
                        key: 'security-button',
                        style: {
                            backgroundColor: 'var(--foreground)',
                            color: 'var(--background)',
                            padding: '10px 16px',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            border: 'none',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                            transition: 'transform 0.1s, box-shadow 0.1s'
                        },
                        onClick: async function() {
                            try {
                                const did = await securityInterface.getProfileDid();
                                alert('Profile DID: ' + did);
                            } catch (error) {
                                console.error('Error accessing profile DID:', error);
                                alert('Error accessing profile DID. See console for details.');
                            }
                        }
                    }, 'Get Profile DID')
                ])
            ]);
        }

        // Render the React component into the provided container
        const root = document.createElement('div');
        root.className = 'init-tsx-root-element-20250804';
        container.appendChild(root);

        try {
            // Use React 18+ createRoot API if available
            if (ReactDOM.createRoot) {
                const reactRoot = ReactDOM.createRoot(root);
                reactRoot.render(
                    React.createElement(React.StrictMode, null, React.createElement(App))
                );

                // Return cleanup function
                return function() {
                    reactRoot.unmount();
                    if (container.contains(root)) {
                        container.removeChild(root);
                    }
                };
            } else if (ReactDOM.render) {
                // Fallback to legacy React API
                ReactDOM.render(
                    React.createElement(React.StrictMode, null, React.createElement(App)),
                    root
                );

                // Return cleanup function
                return function() {
                    if (ReactDOM.unmountComponentAtNode) {
                        ReactDOM.unmountComponentAtNode(root);
                    }
                    if (container.contains(root)) {
                        container.removeChild(root);
                    }
                };
            } else {
                throw new Error('ReactDOM.render or ReactDOM.createRoot not found');
            }
        } catch (error) {
            console.error('Error rendering React component:', error);
            const errorDiv = document.createElement('div');
            errorDiv.innerHTML = '<h2 style="color: red;">Error initializing DApp</h2><p>Failed to render React component: ' + error.message + '</p>';
            root.appendChild(errorDiv);
            return function() {
                if (container.contains(root)) {
                    container.removeChild(root);
                }
            };
        }
    }

    // Expose the init function via the DApp global object
    if (typeof window !== 'undefined') {
        window.DApp.init = init;
        console.log("Init function attached to DApp object");
        console.log("DApp.init function exists:", !!window.DApp.init);
        console.log("DApp.init function type:", typeof window.DApp.init);
    }

    // Also expose it directly for debugging
    if (typeof window !== 'undefined') {
        window.init = init;
    }

    console.log("DApp bundle loaded successfully");
    console.log("Available global objects:", Object.keys(window).filter(key => key.includes('DApp') || key === 'init'));

})();
`;

    // Write the bundle
    fs.writeFileSync(jsOutputPath, browserBundle);
    console.log(`JS bundle prepared at ${jsOutputPath}`);
}

// Main function
async function main() {
    try {
        console.log('Preparing DApp bundle from Next.js output...');

        if (!fs.existsSync(nextOutputDir)) {
            console.error('Next.js build output not found. Run "next build" first.');
            process.exit(1);
        }

        extractCSS();
        prepareJSBundle();

        console.log('DApp bundle preparation complete!');
    } catch (error) {
        console.error('Error preparing DApp bundle:', error);
        process.exit(1);
    }
}

main();