# Trivia App

## Acknowledgements
* Credit to [tgrassl](https://github.com/tgrassl/solid-vite-electron) for providing the boilerplate code
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
├── electron                                 Electron-related code
│   ├── main                                 Main-process source code
│   └── preload                              Preload-scripts source code
│
├── release                                  Generated after production build, contains executables
│   └── {version}
│       ├── {os}-{os_arch}                   Contains unpacked application executable
│       └── {app_name}_{version}.{ext}       Installer for the application
│
├── public                                   Static assets
└── src                                      Renderer source code, your SolidJS application
```
