'use client';

import { init } from '../init';

// This component is used to ensure the init function is included in the client bundle
export default function DAppExport() {
  // This is a dummy component that doesn't render anything
  // Its purpose is to ensure the init function is included in the client bundle
  return null;
}

// Expose the module globally for bundled DApp mode
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).FilesApp = { init };
}

// Export the init function for direct imports
export { init };