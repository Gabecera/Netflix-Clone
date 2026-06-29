require("dotenv").config();
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const APP_USERNAME = process.env.APP_USERNAME;
const PASSWORD_HASH = process.env.PASSWORD_HASH;
const SESSION_SECRET = process.env.SESSION_SECRET;

// Fail fast if required env vars are missing
if (!TMDB_API_KEY) {
    console.error("ERROR: TMDB_API_KEY is not set.");
    process.exit(1);
}
if (!APP_USERNAME || !PASSWORD_HASH) {
    console.error("ERROR: APP_USERNAME and PASSWORD_HASH must be set in .env.");
    console.error("Run: node scripts/hash-password.js  to generate a hash.");
    process.exit(1);
}
if (!SESSION_SECRET) {
    console.error("ERROR: SESSION_SECRET is not set in .env.");
    process.exit(1);
}

// =====================
// Middleware
// =====================
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,      // not accessible via JS
        sameSite: "strict",  // CSRF protection
        maxAge: 8 * 60 * 60 * 1000  // 8 hours
    }
}));

// =====================
// Rate Limiters
// =====================
// Strict limiter for login attempts — prevents brute force
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many login attempts. Try again in 15 minutes."
});

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests. Please slow down." }
});

const searchLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Search rate limit exceeded." }
});

// =====================
// Auth guard middleware
// =====================

// Allows both full users and guests — used for browsing
function requireAuth(req, res, next) {
    if (req.session && req.session.authenticated) return next();
    if (req.path.startsWith("/api/")) return res.status(401).json({ error: "Unauthorized" });
    res.redirect("/login");
}

// Blocks guests — use this on any admin or privileged route
function requireFullAuth(req, res, next) {
    if (req.session && req.session.authenticated && !req.session.isGuest) return next();
    if (req.path.startsWith("/api/")) return res.status(403).json({ error: "Forbidden" });
    res.redirect("/login");
}

// =====================
// Public routes (no auth needed)
// =====================
app.get("/login", (req, res) => {
    if (req.session && req.session.authenticated) return res.redirect("/");
    res.sendFile(path.join(__dirname, "login.html"));
});

app.post("/login", loginLimiter, async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) return res.redirect("/login?error=1");

    const usernameMatch = username === APP_USERNAME;
    // Always run bcrypt even on username mismatch — prevents timing attacks
    const passwordMatch = await bcrypt.compare(password, PASSWORD_HASH);

    if (!usernameMatch || !passwordMatch) {
        return res.redirect("/login?error=1");
    }

    req.session.regenerate((err) => {
        if (err) return res.redirect("/login?error=1");
        req.session.authenticated = true;
        res.redirect("/");
    });
});

app.get("/logout", (req, res) => {
    req.session.destroy(() => res.redirect("/login"));
});

app.get("/guest", (req, res) => {
    req.session.regenerate((err) => {
        if (err) return res.redirect("/login");
        req.session.authenticated = true;
        req.session.isGuest = true;
        res.redirect("/");
    });
});

// =====================
// Protected static files
// =====================
app.use(requireAuth, express.static(__dirname, {
    index: "index.html"
}));

// =====================
// Server-side response cache (prevents repeat TMDB hits)
// =====================
const tmdbCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCached(key) {
    const entry = tmdbCache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.ts > CACHE_TTL_MS) {
        tmdbCache.delete(key);
        return null;
    }
    return entry.data;
}

function setCache(key, data) {
    // Cap size to prevent unbounded memory growth
    if (tmdbCache.size >= 500) {
        const oldest = tmdbCache.keys().next().value;
        tmdbCache.delete(oldest);
    }
    tmdbCache.set(key, { data, ts: Date.now() });
}

// =====================
// TMDB proxy (protected)
// =====================
const ALLOWED_ENDPOINTS = [
    "/trending/",
    "/discover/",
    "/search/",
    "/movie/",
    "/tv/"
];

// Only allow safe URL characters — blocks traversal and injection attempts
const SAFE_ENDPOINT = /^[a-zA-Z0-9/_\-?=&.%+]+$/;

function isAllowedEndpoint(endpoint) {
    return ALLOWED_ENDPOINTS.some(prefix => endpoint.startsWith(prefix));
}

app.get("/api/tmdb", requireAuth, limiter, async function (req, res) {
    const endpoint = req.query.endpoint;

    if (!endpoint || typeof endpoint !== "string") {
        return res.status(400).json({ error: "Missing endpoint parameter" });
    }

    // Length cap — no legitimate TMDB endpoint exceeds 200 chars
    if (endpoint.length > 200) {
        return res.status(400).json({ error: "Endpoint too long" });
    }

    // Character allowlist — blocks traversal, injections, etc.
    if (!SAFE_ENDPOINT.test(endpoint)) {
        return res.status(400).json({ error: "Invalid endpoint format" });
    }

    if (endpoint.includes("..")) {
        return res.status(400).json({ error: "Invalid endpoint" });
    }

    if (!isAllowedEndpoint(endpoint)) {
        return res.status(403).json({ error: "Endpoint not allowed" });
    }

    // Serve from cache if available — avoids burning TMDB quota on repeat calls
    const cached = getCached(endpoint);
    if (cached) return res.json(cached);

    if (endpoint.startsWith("/search/")) {
        // Validate search query length server-side
        const url = new URL(`https://x.com${endpoint}`);
        const query = url.searchParams.get("query") || "";
        if (query.length > 100) {
            return res.status(400).json({ error: "Search query too long" });
        }
        return searchLimiter(req, res, () => proxyToTMDB(endpoint, req, res));
    }

    proxyToTMDB(endpoint, req, res);
});

async function proxyToTMDB(endpoint, req, res) {
    try {
        const separator = endpoint.includes("?") ? "&" : "?";
        const url = `https://api.themoviedb.org/3${endpoint}${separator}api_key=${TMDB_API_KEY}`;

        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 401) {
                console.error("TMDB API key is invalid or missing. Check your .env file.");
            }
            return res.status(response.status).json({ error: `TMDB request failed (${response.status})` });
        }

        const data = await response.json();
        setCache(endpoint, data);
        res.json(data);
    } catch (err) {
        console.error("Proxy error:", err.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
