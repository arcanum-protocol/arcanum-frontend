import path from "path"
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import ViteYaml from '@modyfi/vite-plugin-yaml';
import topLevelAwait from 'vite-plugin-top-level-await';
import wasm from 'vite-plugin-wasm';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      ViteYaml(), 
      wasm(),
      topLevelAwait(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      __APP_ENV__: process.env.VITE_ENVIRONMENT,
    },
  }
})
