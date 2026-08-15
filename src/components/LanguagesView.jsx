import { useState } from "react";
import { fetchRow } from "../api/tmdb";
import Row from "./Row";

const LANGUAGES = {
    English: "en",
    Spanish: "es",
    French: "fr",
    Korean: "ko",
    Japanese: "ja",
    Hindi: "hi",
    Portuguese: "pt",
    German: "de",
    Italian: "it",
    Mandarin: "zh",
    Arabic: "ar",
    Turkish: "tr"
};

export default function LanguagesView({ visible }) {
    const [active, setActive] = useState(null);
    const [movies, setMovies] = useState([]);
    const [shows, setShows] = useState([]);
    const [loading, setLoading] = useState(false);

    async function selectLanguage(name) {
        const code = LANGUAGES[name];
        setActive(name);
        setLoading(true);
        setMovies([]);
        setShows([]);

        try {
            const [nextMovies, nextShows] = await Promise.all([
                fetchRow(
                    `/discover/movie?with_original_language=${code}&sort_by=popularity.desc`,
                    "movie"
                ),
                fetchRow(
                    `/discover/tv?with_original_language=${code}&sort_by=popularity.desc`,
                    "tv"
                )
            ]);
            setMovies(nextMovies);
            setShows(nextShows);
        } catch (err) {
            console.error("Language rows failed to load:", err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="content-section" style={{ display: visible ? "block" : "none" }}>
            <div className="placeholder-view">
                <h2>Browse by Language</h2>
                <div className="language-grid">
                    {Object.keys(LANGUAGES).map((name) => (
                        <div
                            key={name}
                            className={`language-tag${active === name ? " active" : ""}`}
                            onClick={() => selectLanguage(name)}
                        >
                            {name}
                        </div>
                    ))}
                </div>
            </div>

            {active && (
                <div id="languageResults">
                    <section className="content-section-inner">
                        <Row title={`${active} Movies`} items={movies} loading={loading} />
                    </section>
                    <section className="content-section-inner">
                        <Row title={`${active} Shows`} items={shows} loading={loading} />
                    </section>
                </div>
            )}
        </section>
    );
}
