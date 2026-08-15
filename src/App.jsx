import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchRow, normalise, tmdbFetch } from "./api/tmdb";
import { BrowseContext } from "./BrowseContext";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import LanguagesView from "./components/LanguagesView";
import MoreInfoModal from "./components/MoreInfoModal";
import Navbar from "./components/Navbar";
import Row from "./components/Row";
import useMyList, { entryToItem } from "./hooks/useMyList";
import { useBlockHorizontalScroll } from "./hooks/usePageEffects";
import { HERO_VIEWS, MOVIE_ROWS, SHOW_ROWS } from "./rows";

const SEARCH_DEBOUNCE_MS = 400;

export default function App() {
    const [view, setView] = useState("home");
    const [rows, setRows] = useState({});
    const [showsLoaded, setShowsLoaded] = useState(false);
    const [cardHovered, setCardHovered] = useState(false);
    const [modalItem, setModalItem] = useState(null);

    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const searchTimer = useRef(null);

    const { myList, isInList, toggleMyList, removeFromList } = useMyList();

    useBlockHorizontalScroll();

    // =====================
    // Row data
    // =====================
    const loadRows = useCallback(async (configs) => {
        const loaded = await Promise.all(
            configs.map(async (config) => {
                try {
                    return [config.id, await fetchRow(config.endpoint, config.type)];
                } catch (err) {
                    console.error(`Row "${config.id}" failed to load:`, err);
                    return [config.id, []];
                }
            })
        );
        setRows((current) => ({ ...current, ...Object.fromEntries(loaded) }));
    }, []);

    useEffect(() => {
        loadRows(MOVIE_ROWS);
    }, [loadRows]);

    // Shows are only fetched the first time that tab is opened.
    useEffect(() => {
        if (view !== "shows" || showsLoaded) return;
        setShowsLoaded(true);
        loadRows(SHOW_ROWS);
    }, [view, showsLoaded, loadRows]);

    // The hero rotates through the trending titles.
    const featured = useMemo(() => (rows.trending || []).slice(0, 10), [rows.trending]);

    // =====================
    // Search
    // =====================
    useEffect(() => {
        // Strip non-printable characters and enforce the same length cap the
        // server applies.
        const cleaned = query.replace(/[^\x20-\x7E]/g, "").trim();

        clearTimeout(searchTimer.current);
        if (!cleaned || cleaned.length > 100) {
            setResults([]);
            return;
        }

        searchTimer.current = setTimeout(async () => {
            try {
                const data = await tmdbFetch(
                    `/search/multi?query=${encodeURIComponent(cleaned)}`
                );
                setResults(
                    (data.results || [])
                        .filter((r) => r.poster_path && r.media_type !== "person")
                        .map((r) => normalise(r))
                );
            } catch (err) {
                console.error("Search failed:", err);
                setResults([]);
            }
        }, SEARCH_DEBOUNCE_MS);

        return () => clearTimeout(searchTimer.current);
    }, [query]);

    // =====================
    // View switching
    // =====================
    function changeView(nextView) {
        setQuery("");
        setResults([]);
        setView(nextView);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    const browseValue = useMemo(
        () => ({ isInList, toggleMyList, removeFromList, setCardHovered }),
        [isInList, toggleMyList, removeFromList]
    );

    const myListItems = useMemo(() => myList.map(entryToItem), [myList]);
    const visibleRows = [...MOVIE_ROWS, ...SHOW_ROWS].filter((r) => r.views.includes(view));
    const showMyList = view === "home" || view === "my-list";

    return (
        <BrowseContext.Provider value={browseValue}>
            <Navbar
                view={view}
                onViewChange={changeView}
                query={query}
                onQueryChange={setQuery}
            />

            {results.length > 0 && (
                <div id="searchResultsSection">
                    <Row title="Search Results" items={results} />
                </div>
            )}

            <Hero
                featured={featured}
                cardHovered={cardHovered}
                visible={HERO_VIEWS.includes(view)}
                paused={Boolean(modalItem)}
                onMoreInfo={setModalItem}
            />

            {showMyList && (
                <section className="content-section">
                    {myListItems.length > 0 ? (
                        <Row title="My List" items={myListItems} showRemove />
                    ) : (
                        <div style={{ padding: "40px 60px", color: "#aaa", fontSize: 16 }}>
                            You haven't added anything yet. Hover over a title and click{" "}
                            <strong>+ My List</strong> to save it here.
                        </div>
                    )}
                </section>
            )}

            {visibleRows.map((config) => (
                <section className="content-section" key={config.id}>
                    <Row
                        title={config.title}
                        items={rows[config.id] || []}
                        loading={!rows[config.id]}
                    />
                </section>
            ))}

            {view === "games" && (
                <section className="content-section">
                    <div className="placeholder-view">
                        <h2>Games</h2>
                        <p>
                            Netflix Games is available on mobile. Download the Netflix app to
                            play.
                        </p>
                    </div>
                </section>
            )}

            <LanguagesView visible={view === "languages"} />

            <MoreInfoModal item={modalItem} onClose={() => setModalItem(null)} />

            <Footer />
        </BrowseContext.Provider>
    );
}
