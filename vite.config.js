// vite.config.js
import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  plugins: [glsl()],

  build: {
    lib: {
      entry: '/content/index.js', // Entry point of your library
      name: 'ElocLibrary', // Global variable name (optional for ES modules)
      fileName: 'eloc', // Output filename without extension
      formats: ['es'], // Only ES Module format
    },
    target: 'esnext', // Target modern JavaScript
    minify: false, // Disable minification
    sourcemap: false, // Disable source maps for production (set to true if needed)

    rollupOptions: {
      // Specify external dependencies to exclude them from the bundle
      external: [], // e.g., ['react', 'lodash']
      output: {
        entryFileNames: 'eloc.js', // Final output: eloc.js
        // No additional formats, only 'es' is specified above
      },
    },

    // Prevent Vite from injecting polyfills or legacy code
    polyfillDynamicImport: false, // Disable dynamic import polyfills
  },

  // Optimize dependencies to target ESNext without transpiling
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
  },

  // Ensure esbuild targets modern JavaScript
  esbuild: {
    target: 'esnext',
  },

  // Define global variables to prevent polyfill injections
  define: {
    'process.env.NODE_ENV': '"production"',
    global: 'globalThis',
  },
});
