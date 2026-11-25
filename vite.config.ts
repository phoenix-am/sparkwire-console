import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves the app under /sparkwire-console/; set BASE there. Tests use '/'.
export default defineConfig({ base: process.env.BASE ?? '/', plugins: [react()] });
