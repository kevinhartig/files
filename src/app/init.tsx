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
      <h1>Files App</h1>
      <p>A simple Next.js React app with Turbopack</p>
      {securityInterface && (
        <div>
          <h2>Security Interface Connected</h2>
          <button onClick={async () => {
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
  // Render the React component into the provided container
  const root = document.createElement('div');
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