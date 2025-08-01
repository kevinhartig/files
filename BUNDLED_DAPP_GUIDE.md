# Files App - Bundled DApp Guide

This document explains how to build, configure, and use the Files App as a bundled DApp in Signet.

## Overview

The Files App has been configured to work as a bundled DApp in Signet. This means it can be loaded remotely by Signet and will have access to the Signet security interface.

## Key Components

1. **Init Function**: The app has an `init` function that takes a container and a securityInterface object.
2. **Turbopack Integration**: The app uses Next.js with Turbopack for building and bundling.
3. **Manifest File**: A manifest.json file has been created to describe the DApp to Signet.

## How to Build the Bundled DApp

### 1. Install Dependencies

First, install all the required dependencies:

```bash
npm install
```

### 2. Build the Bundle

To create a production bundle:

```bash
npm run bundle
```

For a development bundle with debug information:

```bash
npm run bundle:dev
```

This will create the following files in the `dist` directory:
- `index.bundle.js` - The main JavaScript bundle
- `index.css` - The extracted CSS

## Transpilation Process

The transpilation process uses Next.js with Turbopack:

1. **Next.js Build**: First, Next.js builds the application with Turbopack.
2. **Custom Script**: A custom script extracts the relevant JavaScript and CSS from the Next.js build output.
3. **Global Export**: The script ensures the app is exposed as a global variable named `FilesApp`.

The build process handles:
- Transpiling TypeScript to JavaScript
- Converting JSX to JavaScript
- Bundling all dependencies
- Extracting CSS into a separate file
- Exposing the app via a global variable

## Manifest.json Configuration

The `manifest.json` file is configured with the following key properties:

```json
{
  "dappId": "files-app",
  "version": "1.0.0",
  "entryPoint": "dist/index.bundle.js",
  "bundled": true,
  "globalExport": "FilesApp",
  "dependencies": {
    "css": ["dist/index.css"],
    "scripts": []
  },
  "permissions": ["profile:read"]
}
```

Important fields:
- `bundled: true` - Indicates this is a bundled DApp
- `globalExport: "FilesApp"` - The name of the global variable that exposes the DApp
- `entryPoint` - Path to the main JavaScript bundle
- `dependencies.css` - CSS files to load
- `permissions` - Required permissions for the DApp

## Project Structure

The project is structured to support both Next.js development and bundled DApp mode:

1. **src/app/page.tsx**: The main Next.js page component
2. **src/app/init.tsx**: Contains the DApp initialization logic
3. **src/app/components/DAppExport.tsx**: Client component that ensures the init function is included in the bundle
4. **scripts/prepare-bundle.js**: Custom script that prepares the bundled DApp from Next.js output

## Deployment

To deploy the bundled DApp:

1. Build the bundle using `npm run bundle`
2. Upload the following files to your web server:
   - `dist/index.bundle.js`
   - `dist/index.css`
   - `manifest.json`
   - Any other assets referenced in the manifest (like icons)

3. Make sure the `manifestUrl` in the manifest.json points to the correct location where the manifest will be hosted.

## How Signet Loads the DApp

When Signet loads the DApp, it:

1. Fetches and parses the manifest.json
2. Loads the CSS dependencies
3. Loads the main JavaScript bundle
4. Accesses the global variable specified by `globalExport`
5. Calls the `init` function with a container element and the security interface

## Security Interface Usage

The app uses the security interface to access profile information:

```javascript
// Example of using the security interface
const did = await securityInterface.getProfileDid();
```

The security interface provides methods for:
- Accessing profile data
- Requesting permissions
- Communicating with other DApps

## Troubleshooting

If the DApp fails to load in Signet:

1. Check that the manifest.json is correctly configured
2. Verify that the bundle correctly exposes the global variable
3. Ensure all paths in the manifest are correct
4. Check browser console for any loading errors

If you encounter issues with the build process:

1. Make sure Next.js is building correctly with `next build`
2. Check that the DAppExport component is properly included in the page
3. Verify that the prepare-bundle.js script can find the component in the build output

## Further Resources

For more information, refer to:
- [Bundled DApp Support](./docs/Bundled%20DApp%20Support.md)
- [Signet DApp Security Interface](./docs/Signet%20DApp%20Security%20Interface.md)