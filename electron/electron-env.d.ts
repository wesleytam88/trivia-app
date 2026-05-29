declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬ dist
     * │ ├─┬ electron
     * │ │ ├── main.js
     * │ │ └── preload.js
     * │ ├── index.html
     * │ ├── ...other-static-files-from-public
     * │
     * ```
     */

    /** Path to the Vite-built renderer output (`dist/`) */
    DIST: string
  }
}
