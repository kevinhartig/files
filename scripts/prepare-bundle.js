const fs = require('fs');
const path = require('path');

// Paths
const nextOutputDir = path.resolve(__dirname, '../.next');
const distDir = path.resolve(__dirname, '../dist');
const cssOutputPath = path.resolve(distDir, 'index.css');
const jsOutputPath = path.resolve(distDir, 'index.bundle.js');

// Function to find the client-side bundle that contains our code
function findClientSideBundle() {
    console.log('Searching for client-side bundle with our code...');

    const staticDir = path.join(nextOutputDir, 'static');
    if (!fs.existsSync(staticDir)) {
        console.log('Static directory not found, searching in main output...');
        return findInDirectory(nextOutputDir);
    }

    return findInDirectory(staticDir);
}

function findInDirectory(dir) {
    const potentialFiles = [];

    function searchRecursively(currentDir) {
        if (!fs.existsSync(currentDir)) return;

        const files = fs.readdirSync(currentDir, { withFileTypes: true });

        for (const file of files) {
            const fullPath = path.join(currentDir, file.name);

            if (file.isDirectory()) {
                searchRecursively(fullPath);
            } else if (file.name.endsWith('.js')) {
                // Check if this file contains our code
                try {
                    const content = fs.readFileSync(fullPath, 'utf8');

                    // Look for our unique identifiers
                    if (content.includes('UNIQUE_VERIFICATION_ID_20250804') || 
                        content.includes('init-tsx-root-element') ||
                        content.includes('init') ||
                        content.includes('DApp')) {
                        potentialFiles.push({
                            path: fullPath,
                            score: calculateRelevanceScore(content)
                        });
                    }
                } catch (error) {
                    // Skip files that can't be read
                }
            }
        }
    }

    searchRecursively(dir);

    // Sort by relevance score and return the best match
    potentialFiles.sort((a, b) => b.score - a.score);

    console.log('=== CLIENT BUNDLE SEARCH RESULTS ===');
    console.log(`Found ${potentialFiles.length} potential files:`);
    potentialFiles.slice(0, 5).forEach((file, i) => {
        console.log(`  ${i + 1}: ${file.path} (score: ${file.score})`);
    });
    console.log('=== END CLIENT BUNDLE SEARCH RESULTS ===');

    return potentialFiles.length > 0 ? potentialFiles[0].path : null;
}

function calculateRelevanceScore(content) {
    let score = 0;

    // Higher score for files that contain our specific identifiers
    if (content.includes('UNIQUE_VERIFICATION_ID_20250804')) score += 10;
    if (content.includes('init-tsx-root-element-20250804')) score += 10;
    if (content.includes('function init')) score += 5;
    if (content.includes('export function init')) score += 8;
    if (content.includes('securityInterface')) score += 3;
    if (content.includes('createRoot')) score += 3;
    if (content.includes('React.createElement')) score += 2;
    if (content.includes('DAppExport')) score += 4;
    if (content.includes('window.DApp')) score += 6;

    // Lower score for server-side or framework files
    if (content.includes('CHUNK_PUBLIC_PATH')) score -= 5;
    if (content.includes('__webpack_require__')) score -= 3;
    if (content.includes('server')) score -= 2;

    console.log(`File score calculation: ${score} (length: ${content.length})`);

    return score;
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
        if (!fs.existsSync(dir)) return;

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

// Function to prepare the JavaScript bundle using transpiled code
function prepareJSBundle() {
    console.log('Preparing JS bundle from transpiled Next.js code...');

    // Find the client-side bundle
    const clientBundlePath = findClientSideBundle();

    if (!clientBundlePath) {
        console.error('Could not find client-side bundle containing our code');
        process.exit(1);
    }

    console.log(`Found client-side bundle at: ${clientBundlePath}`);

    // Read the transpiled code
    const transpiledCode = fs.readFileSync(clientBundlePath, 'utf8');

    // Debug: Check if the transpiled code contains our init function
    console.log('=== TRANSPILED CODE ANALYSIS ===');
    console.log('Transpiled code length:', transpiledCode.length);
    console.log('Contains UNIQUE_VERIFICATION_ID_20250804:', transpiledCode.includes('UNIQUE_VERIFICATION_ID_20250804'));
    console.log('Contains "function init":', transpiledCode.includes('function init'));
    console.log('Contains "export function init":', transpiledCode.includes('export function init'));
    console.log('Contains "init-tsx-root-element":', transpiledCode.includes('init-tsx-root-element'));
    console.log('Contains "DAppExport":', transpiledCode.includes('DAppExport'));
    console.log('Contains "window.DApp":', transpiledCode.includes('window.DApp'));
    console.log('Contains "global.ts":', transpiledCode.includes('global'));

    // Show a snippet of the transpiled code for debugging
    const codeSnippet = transpiledCode.substring(0, 1000);
    console.log('First 1000 chars of transpiled code:', codeSnippet);

    // Also show any part that contains "init"
    const initMatches = transpiledCode.match(/.{0,100}init.{0,100}/gi);
    if (initMatches) {
        console.log('All "init" occurrences in transpiled code:');
        initMatches.slice(0, 5).forEach((match, i) => {
            console.log(`  ${i + 1}: ${match}`);
        });
    }
    console.log('=== END TRANSPILED CODE ANALYSIS ===');

    // Create browser-compatible wrapper
    const browserWrapper = `
// DApp Bundle - Clean execution of transpiled code
(function() {
    'use strict';

    // Set up basic browser globals
    if (typeof window !== 'undefined') {
        window.DApp = window.DApp || {};
        console.log("DApp global variable defined");
    }

    // Basic polyfills only
    if (typeof require === 'undefined') {
        window.require = function(module) {
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

    // Set up JSX runtime globals for React 19 compatibility
    if (typeof window.React !== 'undefined') {
        // Create JSX runtime functions
        window.jsx = function(type, props, key) {
            if (props && props.children !== undefined) {
                const { children, ...otherProps } = props;
                return window.React.createElement(type, { ...otherProps, key }, children);
            }
            return window.React.createElement(type, { ...props, key });
        };
        window.jsxs = window.jsx;
        console.log("Set up global JSX runtime functions");
    }

    // Execute transpiled code cleanly
    try {
        console.log("Executing transpiled Next.js code...");

        ${transpiledCode}

        console.log("Transpiled code executed successfully");
    } catch (error) {
        console.error("Error executing transpiled code:", error);
    }

    // Execute Turbopack modules explicitly to expose init function  
    if (typeof globalThis.TURBOPACK !== 'undefined' && Array.isArray(globalThis.TURBOPACK)) {
        console.log("Found TURBOPACK array, executing modules...");

        globalThis.TURBOPACK.forEach((entry, index) => {
            if (Array.isArray(entry) && entry.length >= 2 && typeof entry[1] === 'object') {
                const modules = entry[1];
                console.log("Executing TURBOPACK entry " + index + " modules:", Object.keys(modules));

                // Create a simple module execution context
                function createModuleContext() {
                    return {
                        s: function(exports) {
                            // Module is setting exports - capture them
                            console.log("Module exports:", Object.keys(exports));

                            // If this module exports init, make sure it gets to window.DApp
                            if (exports.init && typeof exports.init === 'function') {
                                console.log("Found init function in module exports, setting on window.DApp");

                                // Convert function to string to see if it contains our unique identifier
                                const initFunctionString = exports.init.toString();
                                const containsUniqueId = initFunctionString.includes('UNIQUE_VERIFICATION_ID_20250804');
                                console.log("Init function contains UNIQUE_VERIFICATION_ID_20250804:", containsUniqueId);

                                window.DApp = window.DApp || {};

                                // Check if this is a wrapper function that returns the real function
                                try {
                                    // Try calling it to see if it returns another function
                                    const potentialRealInit = exports.init();
                                    if (typeof potentialRealInit === 'function') {
                                        console.log("Init function was a wrapper, using the returned function");
                                        // Check if the returned function has our unique ID
                                        const realInitString = potentialRealInit.toString();
                                        const realContainsUniqueId = realInitString.includes('UNIQUE_VERIFICATION_ID_20250804');
                                        console.log("Returned function contains UNIQUE_VERIFICATION_ID_20250804:", realContainsUniqueId);

                                        // Only use the wrapper result if it contains our unique ID or if the original doesn't
                                        if (realContainsUniqueId || !containsUniqueId) {
                                            window.DApp.init = potentialRealInit;
                                        } else {
                                            window.DApp.init = exports.init;
                                        }
                                    } else {
                                        console.log("Init function is not a wrapper, using directly");
                                        window.DApp.init = exports.init;
                                    }
                                } catch (e) {
                                    console.log("Init function is not a wrapper (error when called), using directly");
                                    window.DApp.init = exports.init;
                                }

                                console.log("Set window.DApp.init to:", typeof window.DApp.init);

                                // Test the final function to see if it has our unique identifier
                                if (window.DApp.init) {
                                    const finalFunctionString = window.DApp.init.toString();
                                    const finalContainsUniqueId = finalFunctionString.includes('UNIQUE_VERIFICATION_ID_20250804');
                                    console.log("Final DApp.init contains UNIQUE_VERIFICATION_ID_20250804:", finalContainsUniqueId);
                                }
                            }
                        },
                        i: function(id) {
                            // Mock React dependencies with better availability check
                            if (id == 31636 || id == 38653) {
                                if (window.React) {
                                    console.log("Providing React for module ID " + id);
                                    return window.React;
                                } else {
                                    console.warn("React not available for module ID " + id);
                                    return {};
                                }
                            }
                            if (id == 26382) {
                                if (window.ReactDOM) {
                                    console.log("Providing ReactDOM for module ID " + id);
                                    return window.ReactDOM;
                                } else {
                                    console.warn("ReactDOM not available for module ID " + id);
                                    return {};
                                }
                            }
                            return {};
                        }
                    };
                }

                // Execute each module and store their exports
                const moduleExports = {};

                for (const moduleId in modules) {
                    try {
                        const moduleFunction = modules[moduleId];
                        if (typeof moduleFunction === 'function') {
                            console.log("Executing module " + moduleId);

                            // Create context that can access other module exports
                            const context = {
                                s: function(exports) {
                                    console.log("Module " + moduleId + " exports:", Object.keys(exports));
                                    moduleExports[moduleId] = exports;

                                    // If this module exports init and has the unique ID, preserve it properly
                                    if (exports.init) {
                                        const initString = exports.init.toString();
                                        if (initString.includes('UNIQUE_VERIFICATION_ID_20250804')) {
                                            console.log("Found THE REAL init function in module " + moduleId + "!");
                                            window.DApp = window.DApp || {};
                                            window.DApp.init = exports.init;
                                        }
                                    }
                                },
                                i: function(id) {
                                    // First try to return already loaded module exports
                                    if (moduleExports[id]) {
                                        console.log("Providing module " + id + " exports to module " + moduleId);
                                        return moduleExports[id];
                                    }

                                    // Mock React dependencies with proper structure
                                    if (id == 31636 || id == 38653) {
                                        if (window.React) {
                                            console.log("Providing React for module ID " + id);
                                            // Create JSX runtime functions for React 19 compatibility
                                            const jsx = function(type, props, key) {
                                                if (props && props.children !== undefined) {
                                                    const { children, ...otherProps } = props;
                                                    return window.React.createElement(type, { ...otherProps, key }, children);
                                                }
                                                return window.React.createElement(type, { ...props, key });
                                            };

                                            const jsxs = jsx; // jsxs is the same as jsx in our implementation

                                            // Ensure React has all the properties the transpiled code expects
                                            return {
                                                createElement: window.React.createElement,
                                                StrictMode: window.React.StrictMode,
                                                Component: window.React.Component,
                                                PureComponent: window.React.PureComponent,
                                                Fragment: window.React.Fragment,
                                                useState: window.React.useState,
                                                useEffect: window.React.useEffect,
                                                useRef: window.React.useRef,
                                                jsx: jsx,
                                                jsxs: jsxs,
                                                default: window.React,
                                                ...window.React
                                            };
                                        } else {
                                            console.warn("React not available for module ID " + id);
                                            return {
                                                createElement: () => null,
                                                StrictMode: ({ children }) => children,
                                                Component: class {},
                                                Fragment: ({ children }) => children
                                            };
                                        }
                                    }
                                    if (id == 26382) {
                                        if (window.ReactDOM) {
                                            console.log("Providing ReactDOM for module ID " + id);
                                            // Ensure ReactDOM has all the properties the transpiled code expects
                                            return {
                                                createRoot: window.ReactDOM.createRoot,
                                                render: window.ReactDOM.render,
                                                unmountComponentAtNode: window.ReactDOM.unmountComponentAtNode,
                                                default: window.ReactDOM,
                                                ...window.ReactDOM
                                            };
                                        } else {
                                            console.warn("ReactDOM not available for module ID " + id);
                                            return {
                                                createRoot: () => ({ render: () => {}, unmount: () => {} }),
                                                render: () => {}
                                            };
                                        }
                                    }

                                    console.log("Module " + moduleId + " requested unknown dependency " + id);
                                    return {};
                                }
                            };

                            moduleFunction.call({}, context);
                        }
                    } catch (error) {
                        console.log("Module " + moduleId + " execution error (continuing):", error.message);
                        // Continue with other modules even if one fails
                    }
                }

                console.log("All modules executed. Available exports:", Object.keys(moduleExports));
            }
        });
    }

    // Check for init function after module execution and test it
    setTimeout(function() {
        if (window.DApp && window.DApp.init && typeof window.DApp.init === 'function') {
            console.log("SUCCESS: Init function found after module execution!");

            // Check React availability for debugging
            console.log("React availability check:");
            console.log("- window.React:", !!window.React, typeof window.React);
            console.log("- window.ReactDOM:", !!window.ReactDOM, typeof window.ReactDOM);

            if (window.React) {
                console.log("- React.createElement:", !!window.React.createElement);
                console.log("- React.StrictMode:", !!window.React.StrictMode);
            }

            if (window.ReactDOM) {
                console.log("- ReactDOM.createRoot:", !!window.ReactDOM.createRoot);
                console.log("- ReactDOM.render:", !!window.ReactDOM.render);
            }

            // Create a test container to see if the init function works
            console.log("Testing init function with mock container...");
            const testContainer = document.createElement('div');
            testContainer.id = 'test-container';
            testContainer.style.cssText = 'position: absolute; top: -1000px; left: -1000px; width: 100px; height: 100px;';
            document.body.appendChild(testContainer);

            try {
                const mockSecurityInterface = {
                    getProfileDid: () => Promise.resolve('did:test:12345')
                };

                console.log("Calling init function with test container...");

                // Log the function source to see what we're actually calling
                let functionToCall = window.DApp.init;
                let functionSource = functionToCall.toString();
                console.log("Init function source (first 1000 chars):", functionSource.substring(0, 1000));
                console.log("Function source includes unique ID:", functionSource.includes('UNIQUE_VERIFICATION_ID_20250804'));

                // If this is a wrapper function that doesn't contain the unique ID, try calling it to get the real function
                if (!functionSource.includes('UNIQUE_VERIFICATION_ID_20250804')) {
                    console.log("Function appears to be a wrapper, trying to get the real function...");
                    try {
                        const potentialRealFunction = functionToCall();
                        if (typeof potentialRealFunction === 'function') {
                            console.log("Got real function from wrapper!");
                            functionToCall = potentialRealFunction;
                            functionSource = functionToCall.toString();
                            console.log("Real function source contains unique ID:", functionSource.includes('UNIQUE_VERIFICATION_ID_20250804'));
                        }
                    } catch (e) {
                        console.log("Could not unwrap function:", e.message);
                    }
                }

                // Update window.DApp.init with the real function if we unwrapped it
                if (functionToCall !== window.DApp.init) {
                    console.log("Updating window.DApp.init with the real unwrapped function");
                    window.DApp.init = functionToCall;
                }

                const initResult = functionToCall(testContainer, mockSecurityInterface);
                console.log("Init function completed. Result:", initResult);
                console.log("Test container after init. Children count:", testContainer.children.length);
                console.log("Test container innerHTML:", testContainer.innerHTML.substring(0, 500));

                // Look deeper into the React root element
                const reactRoot = testContainer.querySelector('.init-tsx-root-element-20250804');
                if (reactRoot) {
                    console.log("Found React root element!");
                    console.log("React root children count:", reactRoot.children.length);
                    console.log("React root innerHTML:", reactRoot.innerHTML.substring(0, 1000));

                    // Wait a bit for React to finish rendering
                    setTimeout(() => {
                        console.log("After 100ms delay:");
                        console.log("React root children count:", reactRoot.children.length);
                        console.log("React root innerHTML:", reactRoot.innerHTML.substring(0, 1000));

                        // Look for specific elements that should be rendered
                        const h1 = reactRoot.querySelector('h1');
                        const paragraph = reactRoot.querySelector('p');
                        const securityDiv = reactRoot.querySelector('div h2');

                        console.log("Found h1:", !!h1, h1 ? h1.textContent : 'none');
                        console.log("Found paragraph:", !!paragraph, paragraph ? paragraph.textContent : 'none');
                        console.log("Found security interface section:", !!securityDiv);
                    }, 100);
                } else {
                    console.log("React root element not found!");
                }

                // Clean up test
                document.body.removeChild(testContainer);

            } catch (initError) {
                console.error("Error testing init function:", initError);
                document.body.removeChild(testContainer);
            }

        } else if (window.init && typeof window.init === 'function') {
            window.DApp = window.DApp || {};
            window.DApp.init = window.init;
            console.log("SUCCESS: Init function found on window, copied to DApp");
        } else {
            console.error("FAILED: Init function not found after module execution");
            console.log("DApp object:", window.DApp);
            console.log("Available globals:", Object.keys(window).filter(k => k.includes('init') || k.includes('DApp')));
        }
    }, 100);

    console.log("DApp bundle loaded");

})();
`;

    fs.writeFileSync(jsOutputPath, browserWrapper);
    console.log(`JS bundle prepared at ${jsOutputPath}`);
}

// Main function
async function main() {
    try {
        console.log('Preparing DApp bundle from Next.js transpiled output...');

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