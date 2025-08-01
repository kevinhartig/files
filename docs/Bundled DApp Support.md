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

Use a bundler like Webpack, Rollup, or Parcel to create a bundle of your React application. Configure your bundler to:

- Create a single main bundle file (e.g., `index.bundle.js`)
- Expose your DApp via a global variable

Example Webpack configuration:

```javascript
// webpack.config.js
module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'index.bundle.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'MyBundledDApp',
    libraryTarget: 'window'
  },
  // ... other configuration
};
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

## Loading Order

When loading a bundled DApp, Signet follows this sequence:

1. Load all CSS dependencies in parallel
2. Load script dependencies sequentially (in the order specified)
3. Load the main entry point script
4. Access the global variable to get the DApp module
5. Call the `init` function with the container element and secure interface

## Cleanup

When a bundled DApp is closed, Signet:

1. Calls any cleanup function returned by the `init` function
2. Removes all loaded scripts and stylesheets from the DOM
3. Destroys the security context

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