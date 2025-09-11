import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
    // This is the crucial change for Electron
    base: './',
    plugins: [react()],
});
