# AudioQ Documentation

## Quick Links

- **Live Documentation**: [Docs](https://tonycarpenter21.github.io/audio-queue-docs/)
- **Live Demo**: [Demo](https://tonycarpenter21.github.io/audio-queue-demo/queue-management)
- **NPM Package**: [NPM Package](https://www.npmjs.com/package/audioq)

## Installation

```bash
yarn
```

## Local Development

```bash
yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Build

```bash
yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Deployment

### Option 1: Using SSH

**Linux/Mac:**
```bash
USE_SSH=true yarn deploy
```

**Windows PowerShell:**
```powershell
$env:USE_SSH="true"; yarn deploy
```

### Option 2: Using GitHub Username

**Linux/Mac:**
```bash
GIT_USER=<Your GitHub username> yarn deploy
```

**Windows PowerShell:**
```powershell
$env:GIT_USER="<Your GitHub username>"; yarn deploy
```

**Windows CMD:**
```cmd
set GIT_USER=<Your GitHub username> && yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.
