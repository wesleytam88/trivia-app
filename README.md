# Trivia App

## Acknowledgements
* Thanks to [tgrassl](https://github.com/tgrassl) for providing the [boilerplate code](https://github.com/tgrassl/solid-vite-electron)
* Credit to spykian@gmail.com for the original [python program](https://github.com/wesleytam88/Trivia-Program) this app is based on

## Installation

```bash
# clone repository
git clone https://github.com/wesleytam88/trivia-app

# open the project directory
cd trivia-app

# install dependencies
npm install

# start the application
npm run dev

# make a production build
npm run build
```

## Directory structure

```tree
├── build/                                  App icons for packaged builds
├── electron/                               Main-process code (Node.js)
│   └── main.ts                             Window creation, app lifecycle, IPC handlers
|   └── preload.ts                          IPC bridge between main and renderer (contextBridge)
├── public/                                 Static assets
├── release/                                Generated after prod. build, contains executables
│   └── {version}
│       ├── {os}-{os_arch}                  Contains unpacked application executable
│       └── {app_name}_{version}.{ext}      Installer for the application
├── sample_questions/                       Sample question boards and media for testing
├── shared/                                 Types shared between main and renderer
├── src/                                    Renderer source code (SolidJS)
|   └── App.tsx                             Root component: screen routing, player/board store
|   └── main.tsx                            Entry point, mounts App to DOM
├── electron-builder.json5                  Electron packaging configuration
├── index.html                              HTML entry point, loads renderer
├── package-lock.json
├── package.json
├── tsconfig.json                           TypeScript compiler configuration
└── vite.config.js                          Vite build config (SolidJS + Electron plugins)
```
