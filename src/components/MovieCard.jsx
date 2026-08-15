import { useRef, useState } from "react";
import { fetchTrailerKey, playerUrl } from "../api/tmdb";
import { useBrowse } from "../BrowseContext";

export default function MovieCard({ item, showRemove = false }) {
    const { isInList, toggleMyList, removeFromList, setCardHovered } = useBrowse();
    const wrapperRef = useRef(null);
    const trailerRef = useRef(undefined); // undefined = not looked up yet
    const [trailer, setTrailer] = useState(undefined);
    const [hovered, setHovered] = useState(false);

    const inList = isInList(item.title);

    async function loadTrailer() {
        if (trailerRef.current !== undefined) return trailerRef.current;
        const key = await fetchTrailerKey(item);
        trailerRef.current = key;
        setTrailer(key);
        return key;
    }

    function handleMouseEnter() {
        // Grow towards the middle of the screen so edge cards aren't clipped.
        const wrapper = wrapperRef.current;
        if (wrapper) {
            const rect = wrapper.getBoundingClientRect();
            const middle = rect.left + rect.width / 2;
            wrapper.style.transformOrigin =
                middle < window.innerWidth / 2 ? "left center" : "right center";
        }

        setHovered(true);
        setCardHovered(true);
        loadTrailer();
    }

    function handleMouseLeave() {
        setHovered(false);
        setCardHovered(false);
    }

    async function play(e) {
        e?.stopPropagation();
        const key = await loadTrailer();
        if (key) window.location.href = playerUrl(key, item.title);
    }

    const showTrailer = hovered && trailer;

    return (
        <div
            className="movie-wrapper"
            ref={wrapperRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={play}
        >
            <img
                className="movie"
                src={item.poster}
                alt={item.title}
                style={{ visibility: showTrailer ? "hidden" : "visible" }}
            />

            {showRemove && (
                <button
                    className="add-btn"
                    title="Remove from My List"
                    onClick={(e) => {
                        e.stopPropagation();
                        removeFromList(item.title);
                    }}
                >
                    ✕
                </button>
            )}

            {showTrailer && (
                <div className="video-container">
                    <iframe
                        title={`${item.title} trailer`}
                        src={`https://www.youtube.com/embed/${trailer}?autoplay=1&mute=1&controls=0&fs=0&modestbranding=1`}
                        style={{ border: "none" }}
                        sandbox="allow-scripts allow-same-origin allow-presentation"
                    />
                </div>
            )}

            <div className="hover-card">
                <div className="hover-card-title">{item.title}</div>
                <div className="hover-card-stars">
                    {"★".repeat(item.rating) + "☆".repeat(5 - item.rating)}
                </div>
                <div className="hover-card-genres">
                    {item.genres.map((genre) => (
                        <span className="genre-tag" key={genre}>
                            {genre}
                        </span>
                    ))}
                </div>
                <div className="hover-card-btns">
                    <button className="hover-play-btn" title="Play" onClick={play}>
                        ▶
                    </button>
                    <button
                        className="hover-add-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleMyList(item);
                        }}
                    >
                        {inList ? "✓ In My List" : "+ My List"}
                    </button>
                </div>
            </div>
        </div>
    );
}
