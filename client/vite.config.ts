import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, existsSync } from 'fs';

// Custom plugin to copy _headers and firebase-config files
const copyFilesPlugin = () => ({
  name: 'copy-files',
  closeBundle() {
    const filesToCopy = ['_headers', 'firebase-config.js', 'health.json'];
    
    filesToCopy.forEach(fileName => {
      const sourcePath = resolve(__dirname, `./public/${fileName}`);
      const targetPath = resolve(__dirname, `../deploy/${fileName}`);
      
      if (existsSync(sourcePath)) {
        copyFileSync(sourcePath, targetPath);
        console.log(`✅ Copied ${fileName} file to deploy directory`);
      } else {
        console.warn(`⚠️  ${fileName} file not found in public directory`);
      }
    });
  }
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react()
    // copyFilesPlugin() // Temporarily disabled to fix build
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/components': resolve(__dirname, './src/components'),
      '@/pages': resolve(__dirname, './src/pages'),
      '@/hooks': resolve(__dirname, './src/hooks'),
      '@/services': resolve(__dirname, './src/services'),
      '@/types': resolve(__dirname, './src/types'),
      '@/utils': resolve(__dirname, './src/utils'),
      '@/theme': resolve(__dirname, './src/theme'),
      '@/context': resolve(__dirname, './src/context'),
      'react': 'react',
      'react-dom': 'react-dom'
    },
    dedupe: ['react', 'react-dom']
  },
  server: {
    port: 3002,
    proxy: {
      '/api': {
        target: 'http://localhost:3003',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: '../deploy',
    sourcemap: false,
    minify: false, // Disable minification to prevent React Error #301
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          mui: ['@mui/material', '@mui/icons-material', '@mui/system'],
          stripe: ['@stripe/stripe-js', '@stripe/react-stripe-js'],
        },
      },
    },
    // Ensure React is bundled correctly to prevent multiple instances
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    },
    // Additional options to prevent React conflicts
    target: 'es2015',
    chunkSizeWarningLimit: 1000
  },
  preview: {
    port: 3002,
    host: true,
  },
  define: {
    // Ensure environment variables are available at build time
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    // Provide fallback values for required environment variables
    'import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY': JSON.stringify(
      process.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_disabled'
    ),
    'import.meta.env.VITE_STRIPE_ENABLED': JSON.stringify(
      process.env.VITE_STRIPE_ENABLED || 'false'
    ),
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(
      process.env.VITE_API_BASE_URL || '/api'
    ),
  },
});
