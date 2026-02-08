import { defineConfig } from 'vite';
import { hydrogen } from '@shopify/hydrogen/vite';
import { oxygen } from '@shopify/mini-oxygen/vite';
import { reactRouter } from '@react-router/dev/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
  plugins: [hydrogen(), oxygen(), reactRouter(), tsconfigPaths()],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './app'),
      '@': path.resolve(__dirname, './src'),
    },
  },
  ssr: {
    optimizeDeps: {
      include: ['set-cookie-parser', 'cookie'],
    },
  },
  build: {
    // Use esbuild for minification (built into Vite, no extra deps needed)
    minify: 'esbuild',
    // CSS optimization
    cssMinify: true,
    // Target modern browsers for smaller bundles
    target: 'esnext',
    // Report compressed size
    reportCompressedSize: true,
  },
});
