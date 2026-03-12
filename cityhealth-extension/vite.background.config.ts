import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: 'src/background.ts',
      name: 'background',
      formats: ['iife'],
      fileName: () => 'background.js',
    },
    rollupOptions: {
      output: {
        entryFileNames: 'background.js',
      },
    },
  },
});
