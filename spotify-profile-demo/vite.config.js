// vite.config.js
import { defineConfig } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
    build: {
        target: 'esnext' // or 'es2022' to support top-level await
    },
    // server:{
    //     watch:{
    //         usePolling: true
    //     },
    //     host: '0.0.0.0',
    //     port: 80
    // }

    // causing problem with the server
});