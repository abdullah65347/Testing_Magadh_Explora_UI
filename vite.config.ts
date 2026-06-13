import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    hmr: {
      overlay: false,
    },
    // Allow tunnel hostnames (cloudflared / ngrok / VS Code port forwarding)
    // to reach the dev server during shared testing.
    allowedHosts: true,
    // Same-origin API: the browser calls /api and /uploads on whatever host
    // it loaded from (incl. a tunnel), and Vite forwards them to the backend.
    proxy: {
      "/api": { target: "http://localhost:8080", changeOrigin: true },
      "/uploads": { target: "http://localhost:8080", changeOrigin: true },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
