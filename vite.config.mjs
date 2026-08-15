import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const entry = (name) => fileURLToPath(new URL(`./${name}`, import.meta.url));

// The Express server (server.js) still owns auth + the TMDB proxy.
// In dev, Vite serves the React app on :5173 and forwards those routes to :3000.
const API_TARGET = "http://localhost:3000";

export default defineConfig({
    plugins: [react()],

    build: {
        outDir: "dist",
        emptyOutDir: true,
        rollupOptions: {
            // Multi-page build — same three pages the original app had,
            // so the server routes and URLs don't change.
            input: {
                main: entry("index.html"),
                player: entry("player.html"),
                login: entry("login.html")
            }
        }
    },

    server: {
        port: 5173,
        proxy: {
            "/api": API_TARGET,
            "/logout": API_TARGET,
            "/guest": API_TARGET,
            "/login": {
                target: API_TARGET,
                // POST /login must reach Express (it sets the session cookie),
                // but GET /login should render Vite's own login page in dev.
                bypass(req) {
                    if (req.method === "GET") return "/login.html";
                }
            }
        }
    }
});
