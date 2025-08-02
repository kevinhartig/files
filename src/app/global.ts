import { init } from './init';

// Expose the module globally for bundled DApp mode
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).DApp = { init };
}

const exports = { init };
export default exports;