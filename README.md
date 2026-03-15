# Risk Assessment Dashboard

Next.js dashboard for tracking assets, risks, and GRC settings.

## Security Flow

- Landing route `/` checks auth state from localStorage.
- Unauthenticated users are redirected to `/login`.
- Authenticated users are redirected to `/dashboard`.
- Login state is stored in localStorage key `grc_auth`.

Default demo credentials:

- Username: `admin`
- Password: `riskguard123`

## Multi-OS Setup (Windows + Arch)

Use the task that matches your environment:

- Windows or regular Linux VS Code: `Dev (Cross-Platform)`, `Lint (Cross-Platform)`, `Build (Cross-Platform)`
- Arch Linux with VS Code Flatpak: `Dev (Flatpak Host)`, `Lint (Flatpak Host)`, `Build (Flatpak Host)`

Run from Command Palette: `Tasks: Run Task`.

## Arch Linux + VS Code Flatpak Setup

If VS Code is installed as Flatpak (`com.visualstudio.code`), `npm` is often not available inside the sandbox terminal.

### 1. Ensure host Node.js is installed

```bash
sudo pacman -S nodejs npm
```

### 2. Grant Flatpak access to your home and network

```bash
flatpak override --user --filesystem=home --share=network com.visualstudio.code
```

Restart VS Code after applying overrides.

### 3. Run npm from host using flatpak-spawn

From the integrated terminal:

```bash
flatpak-spawn --host npm install
flatpak-spawn --host npm run dev
```

This repository includes VS Code tasks in `.vscode/tasks.json` that already use `flatpak-spawn --host`:

- `Dev (Flatpak Host)`
- `Lint (Flatpak Host)`
- `Build (Flatpak Host)`

Run them from Command Palette: `Tasks: Run Task`.

## Windows Setup

Install Node.js LTS from:

- https://nodejs.org/

Then run in terminal:

```powershell
npm install
npm run dev
```

Or use task `Dev (Cross-Platform)`.

## Local Run (Non-Flatpak VS Code)

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Useful Scripts

- `npm run dev` - start local dev server
- `npm run lint` - run ESLint
- `npm run build` - production build
- `npm run start` - run production server
