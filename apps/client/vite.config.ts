import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Note: We use backend CORS (configured in ASP.NET Core) instead of a proxy.
  // server: {
  //   proxy: {
  //     '/api': {
  //       target: 'http://localhost:5046',
  //       changeOrigin: true,
  //     },
  //     '/hubs': {
  //       target: 'http://localhost:5046',
  //       ws: true, // WebSocket support for SignalR
  //     },
  //   },
  // },
})
