# Bundled DApp Support

## Overview

Signet now supports loading bundled DApps with multiple files, including React applications. This document explains how to create and configure bundled DApps for use with Signet.

## How It Works

The Signet DApp loader has been enhanced to support two modes of operation:

1. **Single-file DApps** (original mode): A single JavaScript file is loaded using dynamic imports.
2. **Bundled DApps** (new mode): A main JavaScript file and its dependencies are loaded using script tags, with the DApp exposing itself via a global variable.

## Manifest Configuration

To use a bundled DApp, you need to configure your DApp manifest with the following properties:

```json
{
  "dappId": "my-bundled-dapp",
  "version": "1.0.0",
  "manifestUrl": "https://example.com/dapps/my-bundled-dapp/manifest.json",
  "entryPoint": "index.bundle.js",
  "bundled": true,
  "globalExport": "MyBundledDApp",
  "dependencies": {
    "css": [
      "styles/main.css",
      "styles/components.css"
    ],
    "scripts": [
      "lib/react.js",
      "lib/react-dom.js"
    ]
  },
  "permissions": ["profile:read", "wallet:access"],
  "category": "utilities",
  "publisher": {
    "name": "Example Publisher",
    "verified": true,
    "website": "https://example.com"
  },
  "name": "My Bundled DApp",
  "description": "A bundled DApp example",
  "icon": "images/icon.png"
}
```

### New Properties

- **`bundled`** (boolean): Set to `true` to indicate this is a bundled DApp.
- **`globalExport`** (string): The name of the global variable that the bundled app exports. If not specified, it defaults to the dappId with hyphens replaced by underscores, or "SignetDApp".
- **`dependencies`** (object): Contains arrays of CSS and script dependencies to load before the main entry point.
  - **`css`** (array): CSS files to load.
  - **`scripts`** (array): Additional script files to load in sequence.

## Creating a Bundled React DApp

### 1. Bundle Your React Application

Use a bundler like Turbopack (recommended), Webpack, Rollup, or Parcel to create a bundle of your React application. Configure your bundler to:

- Create a single main bundle file (e.g., `index.bundle.js`)
- Expose your DApp via a global variable

Example Turbopack configuration with Next.js:

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  turbopack: {
    // Enable Turbopack for all builds
    resolveAlias: {
      // Ensure the app is exposed globally for DApp integration
      'app-global': './src/app/global.ts',
    },
  },
};

export default nextConfig;
```

You can then use a custom script to extract the bundled output from Next.js build:

```javascript
// prepare-bundle.js
function prepareJSBundle() {
  // Find the DAppExport module in the build output
  const dappExportPath = findDAppExportModule();
  
  // Read the DAppExport module
  let jsContent = fs.readFileSync(dappExportPath, 'utf8');
  
  // Ensure the global object is properly exposed
  const exposureCode = `
    if (typeof window !== 'undefined') {
      window.MyBundledDApp = { init };
    }
  `;
  
  jsContent += exposureCode;
  
  // Write to output file
  fs.writeFileSync(outputPath, jsContent);
}
```

### 2. Implement the Required Interface

Your bundled DApp must export an `init` function that Signet will call:

```javascript
// src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

// Export the init function that Signet will call
export function init(container, secureInterface) {
  ReactDOM.render(
    <React.StrictMode>
      <App secureInterface={secureInterface} />
    </React.StrictMode>,
    container
  );
  
  // Optionally return a cleanup function
  return () => {
    ReactDOM.unmountComponentAtNode(container);
  };
}

// If using the bundled approach, expose the module globally
if (typeof window !== 'undefined') {
  window.MyBundledDApp = { init };
}
```

### 3. Create Your Manifest

Create a manifest.json file as shown in the example above, making sure to set `bundled: true` and specify the correct `globalExport` name.

### 4. Deploy Your DApp

Deploy your bundled DApp to a web server, ensuring all files are accessible at the paths specified in your manifest.

## CSS Styling and Shadow DOM

When running in Signet, CSS styling for bundled DApps is contained within a Shadow DOM to ensure style isolation. This prevents CSS from one DApp affecting other DApps or the Signet UI itself.

### How Shadow DOM Works in Signet

1. When a DApp is loaded, Signet creates a Shadow DOM for the DApp container
2. All CSS dependencies are loaded within this Shadow DOM
3. The DApp's components are rendered inside the Shadow DOM
4. Styles defined in the DApp's CSS files only apply within the Shadow DOM boundary

### Benefits of Shadow DOM

- **Style Isolation**: CSS from one DApp cannot affect other DApps
- **Encapsulation**: DApp styles are encapsulated and protected from external styles
- **Conflict Prevention**: Prevents class name collisions between DApps
- **Consistent Styling**: Ensures DApps look the same regardless of where they're loaded

### CSS Considerations

When developing a bundled DApp for Signet, keep these considerations in mind:

- CSS selectors only work within the Shadow DOM boundary
- External stylesheets are loaded within the Shadow DOM
- Global styles from the main Signet application do not affect the DApp
- Use relative units (em, rem, %) for better adaptability

## Loading Order

When loading a bundled DApp, Signet follows this sequence:

1. Create a Shadow DOM for the DApp container
2. Load all CSS dependencies in parallel within the Shadow DOM
3. Load script dependencies sequentially (in the order specified)
4. Load the main entry point script
5. Access the global variable to get the DApp module
6. Call the `init` function with the container element and secure interface

## Enhanced Bundling Capabilities

Signet now supports improved bundling capabilities for DApps:

1. **Turbopack Integration**: Faster builds and more efficient bundling compared to Webpack
2. **Automatic CSS Extraction**: CSS is automatically extracted and loaded separately
3. **Dependency Management**: External dependencies can be loaded from CDNs or bundled
4. **Tree Shaking**: Unused code is eliminated for smaller bundle sizes
5. **Code Splitting**: Large applications can be split into smaller chunks
6. **TypeScript Support**: Native support for TypeScript without additional configuration

## Cleanup

When a bundled DApp is closed, Signet:

1. Calls any cleanup function returned by the `init` function
2. Removes all loaded scripts and stylesheets from the DOM
3. Destroys the Shadow DOM container
4. Destroys the security context

## Example: Minimal React DApp

Here's a minimal example of a React DApp that works with Signet's bundled mode:

```jsx
// App.jsx
import React, { useState, useEffect } from 'react';

function App({ secureInterface }) {
  const [did, setDid] = useState(null);
  
  useEffect(() => {
    async function loadProfile() {
      const profileDid = await secureInterface.getProfileDid();
      setDid(profileDid);
    }
    loadProfile();
  }, [secureInterface]);
  
  return (
    <div className="react-dapp">
      <h1>React DApp Example</h1>
      {did ? (
        <p>Connected to profile: {did}</p>
      ) : (
        <p>Loading profile...</p>
      )}
    </div>
  );
}

export default App;
```

```javascript
// index.js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

export function init(container, secureInterface) {
  ReactDOM.render(
    <React.StrictMode>
      <App secureInterface={secureInterface} />
    </React.StrictMode>,
    container
  );
  
  return () => {
    ReactDOM.unmountComponentAtNode(container);
  };
}

// Expose the module globally
window.MyReactDApp = { init };
```

## Troubleshooting

### Common Issues

**DApp not loading:**
- Check that the `bundled` flag is set to `true` in your manifest
- Verify that your main script correctly exposes the module via the global variable specified in `globalExport`

**Dependencies not loading:**
- Ensure all paths in the `dependencies` section are correct
- Check browser console for loading errors

**React components not rendering:**
- Make sure React and ReactDOM are properly loaded
- Verify that the container element is being passed correctly to ReactDOM.render()

**Cleanup errors:**
- Implement a proper cleanup function that unmounts React components
- Check for any remaining event listeners or timers that need to be cleared