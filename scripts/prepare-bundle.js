const fs = require('fs');
const path = require('path');

// Paths
const nextOutputDir = path.resolve(__dirname, '../.next');
const distDir = path.resolve(__dirname, '../dist');
const cssOutputPath = path.resolve(distDir, 'index.css');
const jsOutputPath = path.resolve(distDir, 'index.bundle.js');

// Function to find the DAppExport component in the build output
function findDAppExportModule() {
  console.log('Searching for DAppExport module...');
  
  // Look for files that might contain the DAppExport component
  let dappExportPath = null;
  
  function searchInDirectory(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        const result = searchInDirectory(fullPath);
        if (result) return result;
      } else if (file.name.endsWith('.js')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes('DApp') && content.includes('init')) {
          console.log(`Found potential DAppExport module at ${fullPath}`);
          return fullPath;
        }
      }
    }
    
    return null;
  }
  
  return searchInDirectory(nextOutputDir);
}

// Create dist directory if it doesn't exist
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Function to extract and combine CSS
function extractCSS() {
  console.log('Extracting CSS...');
  
  // Find all CSS files in the Next.js output
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
  
  // Combine all CSS files
  let combinedCSS = '';
  for (const cssFile of cssFiles) {
    const css = fs.readFileSync(cssFile, 'utf8');
    combinedCSS += css + '\n';
  }
  
  // Write combined CSS to output file
  fs.writeFileSync(cssOutputPath, combinedCSS);
  console.log(`CSS extracted to ${cssOutputPath}`);
}

// Function to prepare the JavaScript bundle
function prepareJSBundle() {
  console.log('Preparing JS bundle...');
  
  // Find the DAppExport module
  const dappExportPath = findDAppExportModule();
  
  if (!dappExportPath) {
    console.error('DAppExport module not found in the build output');
    process.exit(1);
  }
  
  console.log(`Using DAppExport module at ${dappExportPath}`);
  
  // Read the DAppExport module
  let jsContent = fs.readFileSync(dappExportPath, 'utf8');
  
  // Create the bundle in the correct order to ensure the DApp.init function is available
  // even if there are errors later in the script
  
  // 1. Start with the pre-definition script that defines the global DApp variable and polyfills
  const preDefinitionScript = `
// IMPORTANT: Define the DApp global variable at the very beginning of the bundle
// This must be at the global scope, not inside any function or conditional
window.DApp = {};
console.log("Initializing DApp module - global variable defined:", !!window.DApp);

// Add browser-compatible polyfills for require and module
// This prevents "require is not defined" and "module is not defined" errors
if (typeof require === 'undefined') {
  window.require = function(module) {
    console.warn('Module import attempted via require(): ' + module);
    
    // Special handling for webpack runtime
    if (module.includes('webpack-runtime')) {
      // Mock webpack runtime functions
      return {
        // Mock the C function that's causing the error
        C: function() {
          console.log('Mock webpack runtime C function called');
          return function() {}; // Return a no-op function
        },
        // Add other webpack runtime functions as needed
        v: function() { return {}; },
        m: function() { return {}; },
        p: function() { return {}; },
        R: function() { return {}; },
        F: function() { return {}; },
        I: function() { return {}; },
        E: function() { return {}; }
      };
    }
    
    // For other modules, return an empty object
    return {};
  };
  console.log("Added require polyfill for browser compatibility");
}

// Define the module object to prevent "module is not defined" errors
// This must be defined before any module.exports statements
if (typeof module === 'undefined') {
  window.module = { exports: {} };
  console.log("Added module polyfill to prevent 'module is not defined' errors");
}

// EARLY VERIFICATION: Verify that the DApp global variable exists
console.log("DApp global variable exists (pre-init):", !!window.DApp);
`;

  // 2. Define the init function and immediately attach it to the global DApp object
  // This ensures it's available even if there are errors later in the script
  const initFunctionCode = `
// IMPORTANT: Define and attach the init function to the global DApp object
// This is done early to ensure it's available even if there are errors later in the script

// Define the init function
function init(container, securityInterface) {
      // Create a root element
      const root = document.createElement('div');
      container.appendChild(root);
      
      // Use global React and ReactDOM objects
      // Check if React and ReactDOM are available in the global scope
      if (!window.React || !window.ReactDOM) {
        console.error('React and/or ReactDOM not found in global scope');
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = '<h2 style="color: red;">Error initializing DApp</h2><p>React and/or ReactDOM not found. Make sure they are loaded before the DApp.</p>';
        container.appendChild(errorDiv);
        return;
      }
      
      const React = window.React;
      const ReactDOM = window.ReactDOM;
      
      // Create a simple app component
      function App() {
        return React.createElement('div', null, [
          React.createElement('h1', null, 'React App'),
          React.createElement('p', null, 'A simple Next.js React app with Turbopack'),
          securityInterface && React.createElement('div', null, [
            React.createElement('h2', null, 'Security Interface Connected'),
            React.createElement('button', {
              onClick: async () => {
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
      
      // Render the app - handle both React 18+ (createRoot) and older versions
      let cleanup;
      
      try {
        // Check if we're using React 18+ with createRoot API
        if (typeof ReactDOM.createRoot === 'function') {
          // React 18+ approach
          const reactRoot = ReactDOM.createRoot(root);
          reactRoot.render(React.createElement(React.StrictMode, null, React.createElement(App)));
          
          cleanup = () => {
            reactRoot.unmount();
            container.removeChild(root);
          };
        } else if (typeof ReactDOM.render === 'function') {
          // Legacy React approach (React 17 and earlier)
          ReactDOM.render(
            React.createElement(React.StrictMode, null, React.createElement(App)),
            root
          );
          
          cleanup = () => {
            if (typeof ReactDOM.unmountComponentAtNode === 'function') {
              ReactDOM.unmountComponentAtNode(root);
            }
            container.removeChild(root);
          };
        } else {
          throw new Error('ReactDOM.render or ReactDOM.createRoot not found');
        }
      } catch (error) {
        console.error('Error rendering React component:', error);
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = '<h2 style="color: red;">Error initializing DApp</h2><p>Failed to render React component: ' + error.message + '</p>';
        container.appendChild(errorDiv);
        return () => {
          container.removeChild(root);
        };
      }
      
      // Return cleanup function
      return cleanup;
}

// DIRECT ASSIGNMENT: Immediately attach the init function to the global DApp object
// This is done before any potentially failing code to ensure it's always available
window.DApp.init = init;

// VERIFICATION: Add extensive debugging to help diagnose issues
console.log("DApp global variable exists (post-init):", !!window.DApp);
console.log("DApp.init function exists:", !!window.DApp.init);
console.log("DApp.init function type:", typeof window.DApp.init);
console.log("DApp properties:", Object.keys(window.DApp));
console.log("DApp.init is enumerable:", Object.getOwnPropertyDescriptor(window.DApp, 'init')?.enumerable);
`;

  // 3. Add a final verification script that will run after all other code
  const finalVerificationCode = `

// FINAL VERIFICATION: Verify that the DApp global variable and init function still exist
// This will run after all other code, including any potentially failing code
console.log("FINAL CHECK: DApp global variable exists:", !!window.DApp);
console.log("FINAL CHECK: DApp.init function exists:", !!window.DApp.init);
console.log("FINAL CHECK: DApp.init function type:", typeof window.DApp.init);
console.log("FINAL CHECK: DApp properties:", Object.keys(window.DApp));
`;
  
  // Combine all parts of the bundle in the correct order:
  // 1. Pre-definition script (DApp global variable, polyfills)
  // 2. Init function definition and immediate attachment to DApp
  // 3. Original Next.js build output (which might contain errors)
  // 4. Final verification
  const finalBundle = preDefinitionScript + initFunctionCode + jsContent + finalVerificationCode;
  
  // Write to output file
  fs.writeFileSync(jsOutputPath, finalBundle);
  console.log(`JS bundle prepared at ${jsOutputPath} with enhanced error handling`);
}

// Main function
async function main() {
  try {
    console.log('Preparing DApp bundle from Next.js output...');
    
    // Check if Next.js build exists
    if (!fs.existsSync(nextOutputDir)) {
      console.error('Next.js build output not found. Run "next build" first.');
      process.exit(1);
    }
    
    // Extract CSS
    extractCSS();
    
    // Prepare JS bundle
    prepareJSBundle();
    
    console.log('DApp bundle preparation complete!');
  } catch (error) {
    console.error('Error preparing DApp bundle:', error);
    process.exit(1);
  }
}

main();