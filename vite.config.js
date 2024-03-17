import path from "path"
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import ViteYaml from '@modyfi/vite-plugin-yaml';

export default defineConfig({
  plugins: [ViteYaml(), react(), myPlugin({
    ENVIRONMENT: process.env.ENVIRONMENT,
  })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  }
})
