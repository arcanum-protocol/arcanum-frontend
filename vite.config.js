import path from "path"
import { defineConfig, PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import ViteYaml from '@modyfi/vite-plugin-yaml';
import topLevelAwait from 'vite-plugin-top-level-await';
import wasm from 'vite-plugin-wasm';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      ViteYaml(), 
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      wasm() as PluginOption,
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
