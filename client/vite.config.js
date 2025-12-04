import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  
  build: {
    // Tối ưu chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - tách các thư viện lớn
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-charts': ['recharts'],
          'vendor-photo-sphere': ['@photo-sphere-viewer/core'],
          'vendor-utils': ['axios', 'date-fns'],
        },
      },
    },
    // Tối ưu kích thước
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    // Chunk size warning threshold
    chunkSizeWarningLimit: 500,
  },
  
  // Tối ưu dev server
  server: {
    hmr: {
      overlay: true,
    },
  },
  
  // Tối ưu dependency pre-bundling
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'recharts',
      '@photo-sphere-viewer/core',
    ],
  },
});
