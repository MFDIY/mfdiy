import { reactRouter } from '@react-router/dev/vite';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import { defineConfig } from 'vite';
import babel from 'vite-plugin-babel';

/** Port the bridge listens on during development (`npm run dev` in the repository root). */
const BRIDGE_DEV_PORT = 8420;

export default defineConfig({
  server: {
    host: true,
    port: 4000,
    proxy: {
      '/ws': { target: `ws://localhost:${BRIDGE_DEV_PORT}`, ws: true }
    }
  },
  plugins: [
    reactRouter(),
    vanillaExtractPlugin(),
    babel({
      // Only our own source (workspace packages resolve outside node_modules).
      include: /\.[jt]sx?$/,
      exclude: /node_modules/,
      babelConfig: {
        presets: ['@babel/preset-typescript'],
        plugins: ['babel-plugin-react-compiler']
      }
    })
  ]
});
