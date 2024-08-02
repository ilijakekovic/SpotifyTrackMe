// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
	target: 'esnext' // or 'es2022' to support top-level await
  }
});