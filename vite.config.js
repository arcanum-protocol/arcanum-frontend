import path from "path"
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import ViteYaml from '@modyfi/vite-plugin-yaml';

export default defineConfig(() => {
  return {
    plugins: [ViteYaml(), react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      ENVIRONMENT: process.env.ENVIRONMENT || "localhost",
    },
  }
})
