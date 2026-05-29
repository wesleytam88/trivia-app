import { defineConfig } from 'vite';
import electron from 'vite-plugin-electron';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [
    solidPlugin(),
    electron([
      {
        // Main-Process entry file of the Electron App.
        entry: 'electron/main.ts',
      },
    ]),
  ],
})
