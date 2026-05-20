import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Mock server-only in the Module cache to bypass Next.js RSC constraints in standalone processes
require.cache[require.resolve('server-only')] = {
  id: require.resolve('server-only'),
  exports: {},
  loaded: true
};

// Dynamically import and execute the security penetration test suite
await import('./penetration_test.mjs');
