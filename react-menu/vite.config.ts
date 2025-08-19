import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  
  build: {
    outDir: '../assets/react-build',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/main.tsx')
      },
      output: {
        entryFileNames: 'js/[name].js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const extType = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return `img/[name][extname]`;
          } else if (/css/i.test(extType)) {
            return `css/[name][extname]`;
          }
          return `assets/[name][extname]`;
        },
        // Use IIFE format to avoid conflicts
        format: 'iife',
        name: 'StickyMLM'
      }
    },
    // Generate manifest for WordPress enqueuing
    manifest: true,
    // Don't minify for development debugging
    minify: false,
  },
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@domain': resolve(__dirname, 'src/Domain'),
      '@application': resolve(__dirname, 'src/Application'),
      '@infrastructure': resolve(__dirname, 'src/Infrastructure'),
      '@presentation': resolve(__dirname, 'src/Presentation'),
    },
  },
  
  server: {
    port: 3000,
    host: true,
  },
  
  define: {
    // WordPress globals
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
});
