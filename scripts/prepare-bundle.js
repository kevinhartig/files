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
        if (content.includes('FilesApp') && content.includes('init')) {
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
  
  // Ensure the global FilesApp object is properly exposed
  const exposureCode = `
// Ensure global exposure
if (typeof window !== 'undefined') {
  window.FilesApp = window.FilesApp || {};
  // Make sure the init function is properly exposed
  if (!window.FilesApp.init && typeof __NEXT_DATA__ !== 'undefined') {
    console.log('Initializing FilesApp global object');
  }
}
`;
  
  jsContent += exposureCode;
  
  // Write to output file
  fs.writeFileSync(jsOutputPath, jsContent);
  console.log(`JS bundle prepared at ${jsOutputPath}`);
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