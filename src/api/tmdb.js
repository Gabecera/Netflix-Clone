import { mapGenres } from "./genres";

// =====================
// TMDB access
// =====================
// Every request still goes through the server-side proxy in server.js —
// the API key never reaches the browser.

const cache = new Map();
const inflight = new Map();

// In production Express serves the HTML and redirects signed-out visitors to
// /login before they ever reach the app. The Vite dev server has no such
// guard, so the page can load without a session and every request comes back
// 401 — send them to sign in instead of silently rendering empty rows.
let redirecting = false;

function goToLogin() {
    if (redirecting) return;
    redirecting = true;
    window.location.href = "/login";
}

export async function tmdbFetch(endpoint) {
    if (cache.has(endpoint)) return cache.get(endpoint);
    if (inflight.has(endpoint)) return inflight.get(endpoint);

    const request = fetch(`/api/tmdb?endpoint=${encodeURIComponent(endpoint)}`)
        .then((res) => {
            if (res.status === 401) {
                goToLogin();
                throw new Error("Not signed in");
            }
            if (!res.ok) throw new Error(`Proxy error ${res.status}`);
            return res.json();
        })
        .then((data) => {
            cache.set(endpoint, data);
            inflight.delete(endpoint);
            return data;
        })
        .catch((err) => {
            inflight.delete(endpoint);
            throw err;
        });

    inflight.set(endpoint, request);
    return request;
}

// =====================
// Normalising TMDB results
// =====================
// List endpoints already return everything a poster + hover card needs
// (title, artwork, overview, score, genre ids), so only the trailer key
// requires a second request — and that is fetched lazily on hover.

function resolveMediaType(result, fallback) {
    if (result.media_type === "tv" || result.media_type === "movie") return result.media_type;
    if (result.first_air_date) return "tv";
    return fallback;
}

export function normalise(result, fallbackType = "movie") {
    const mediaType = resolveMediaType(result, fallbackType);

    return {
        id: result.id,
        mediaType,
        title: result.title || result.name || "Untitled",
        poster: `https://image.tmdb.org/t/p/w300${result.poster_path}`,
        backdrop: result.backdrop_path || result.poster_path || "",
        overview: result.overview || "No description available.",
        rating: Math.min(5, Math.max(1, Math.round((result.vote_average || 0) / 2))),
        genres: mapGenres(result.genre_ids, mediaType)
    };
}

export async function fetchRow(endpoint, fallbackType = "movie") {
    const data = await tmdbFetch(endpoint);
    return (data.results || [])
        .filter((r) => r.poster_path && r.media_type !== "person")
        .map((r) => normalise(r, fallbackType));
}

// =====================
// Trailers
// =====================
// Fallback YouTube ids for the handful of titles TMDB has no trailer for.
const FALLBACK_TRAILERS = {
    "Avengers Infinity War": "6ZfuNTqbHE8",
    "Doctor Strange in the Multiverse of Madness": "aWzlQ2N6qqg",
    "Stranger Things 3": "e4XvO7DItmc",
    "Bullet Train": "0IOsk2Vlc4o",
    Alienoid: "JaRLlh8Pw5A",
    "The Super Mario Bros. Movie": "TnGl01FkMMo",
    "Meg 2": "dG91B3hHyY4",
    "The Avengers: Infinity War": "6ZfuNTqbHE8",
    "Wonder Woman 1984": "sfM7_JLk-84",
    Elemental: "hXzcyx9V0xw",
    "Dune Part 2": "Way9Dexny3w"
};

async function findTrailerKey(mediaType, id) {
    const data = await tmdbFetch(`/${mediaType}/${id}/videos`);
    const trailer = data.results?.find((v) => v.type === "Trailer" && v.site === "YouTube");
    return trailer?.key || null;
}

export async function fetchTrailerKey(item) {
    if (!item) return null;

    try {
        let { id, mediaType, title } = item;

        // Older "My List" entries were saved before ids were stored —
        // fall back to a title search so they still play.
        if (!id) {
            const search = await tmdbFetch(`/search/multi?query=${encodeURIComponent(title)}`);
            const first = search.results?.find((r) => r.media_type !== "person");
            if (!first) return FALLBACK_TRAILERS[title] || null;
            id = first.id;
            mediaType = first.media_type === "tv" ? "tv" : "movie";
        }

        let key = await findTrailerKey(mediaType, id);

        // Wrong guess at the media type — try the other one before giving up.
        if (!key) {
            const other = mediaType === "movie" ? "tv" : "movie";
            key = await findTrailerKey(other, id).catch(() => null);
        }

        return key || FALLBACK_TRAILERS[title] || null;
    } catch (err) {
        console.error(`Trailer lookup failed for "${item.title}":`, err);
        return FALLBACK_TRAILERS[item.title] || null;
    }
}

export function playerUrl(trailerKey, title) {
    return `/player.html?trailer=${encodeURIComponent(trailerKey)}&title=${encodeURIComponent(title)}`;
}
