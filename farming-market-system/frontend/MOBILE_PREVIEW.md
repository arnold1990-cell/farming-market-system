# Mobile Preview Guide

## Run frontend

```bash
npm install
npm run dev
```

Vite runs on the URL shown in your terminal output.

## Open in mobile mode (Chrome/Edge)

1. Open the Vite URL shown in your terminal
2. Press `F12`
3. Click **Toggle Device Toolbar** (`Ctrl+Shift+M`)
4. Select a device profile (iPhone/Pixel)
5. Test widths: `360`, `390`, `414`, `430`
6. Refresh page after switching device

## IntelliJ preview workflow

1. Run `npm run dev` from IntelliJ terminal in `frontend`
2. Open the Vite URL in browser from IntelliJ run output
3. Use browser device toolbar for mobile simulation
4. Keep devtools docked to emulate realistic viewport behavior
