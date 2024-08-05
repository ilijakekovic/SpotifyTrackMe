// vite.config.js
import { defineConfig } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
    build: {
        target: 'esnext' // or 'es2022' to support top-level await
    }
});