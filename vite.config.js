<<<<<<< HEAD
import path from "path"
=======
>>>>>>> 5fcb4e7 (add config fetcher (#11))
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import ViteYaml from '@modyfi/vite-plugin-yaml';

export default defineConfig({
<<<<<<< HEAD
  plugins: [ViteYaml(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
=======
    plugins: [ViteYaml(), react()],
>>>>>>> 5fcb4e7 (add config fetcher (#11))
})
