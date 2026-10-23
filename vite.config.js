import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import {
    defineConfig
} from 'vite';
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.jsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    // Di Docker, Vite berjalan di container tetapi browser mengaksesnya lewat localhost.
    server: process.env.VITE_ORIGIN
        ? { host: '0.0.0.0', origin: process.env.VITE_ORIGIN, hmr: { host: 'localhost' } }
        : undefined,
    esbuild: {
        jsx: 'automatic',
    },
});