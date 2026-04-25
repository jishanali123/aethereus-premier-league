import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // For GitHub Pages: set base to '/<repo-name>/' when building.
  // Override via CLI: vite build --base=/cricket-league/
  // For Vercel/Netlify: leave as '/' (default).
  base: process.env.GITHUB_PAGES === 'true'
    ? '/cricket-league/'
    : '/',
}))
