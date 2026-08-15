import { useEffect, useState } from "react";
import { fetchTrailerKey, playerUrl } from "../api/tmdb";

const ROTATE_MS = 30000;
const COLLAPSE_MS = 6000;

export default function Hero({ featured, cardHovered, visible, paused, onMoreInfo }) {
    const [index, setIndex] = useState(0);
    const [muted, setMuted] = useState(true);
    const [trailer, setTrailer] = useState(null);
    const [collapsed, setCollapsed] = useState(false);

    const current = featured[index % (featured.length || 1)];

    // Rotate through the trending titles.
    useEffect(() => {
        if (featured.length < 2) return;
        const timer = setInterval(() => setIndex((i) => (i + 1) % featured.length), ROTATE_MS);
        return () => clearInterval(timer);
    }, [featured.length]);

    // Load the trailer for whichever title is showing, then shrink the copy
    // out of the way so the video is visible.
    useEffect(() => {
        if (!current) return;
        let cancelled = false;

        setTrailer(null);
        setCollapsed(false);
        fetchTrailerKey(current).then((key) => {
            if (!cancelled) setTrailer(key);
        });

        const timer = setTimeout(() => setCollapsed(true), COLLAPSE_MS);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [current?.id]);

    function play() {
        if (trailer) window.location.href = playerUrl(trailer, current.title);
    }

    // autoplay=0 while the More Info modal is open, so two trailers never
    // play over each other.
    const videoSrc = trailer
        ? `https://www.youtube.com/embed/${trailer}?autoplay=${paused ? 0 : 1}&mute=${muted ? 1 : 0}` +
          `&loop=1&controls=0&fs=0&modestbranding=1&cc_load_policy=0&playlist=${trailer}`
        : null;

    return (
        <>
            <div className="hero-video-wrapper" style={{ display: visible ? "" : "none" }}>
                {videoSrc && (
                    <iframe
                        id="heroVideo"
                        title="Featured trailer"
                        src={videoSrc}
                        frameBorder="0"
                        allow="autoplay; fullscreen"
                        allowFullScreen
                        sandbox="allow-scripts allow-same-origin allow-presentation"
                        style={{ display: cardHovered ? "none" : "block" }}
                    />
                )}
                <div
                    id="heroPoster"
                    style={{
                        display: cardHovered && current?.backdrop ? "block" : "none",
                        backgroundImage: current?.backdrop
                            ? `url(https://image.tmdb.org/t/p/original${current.backdrop})`
                            : undefined
                    }}
                />
            </div>

            <header className="hero" style={{ display: visible ? "" : "none" }}>
                <div className="hero-content">
                    <h1 className={`hero-title${collapsed ? " shrunk" : ""}`}>
                        {current?.title || ""}
                    </h1>
                    <p className={`hero-desc${collapsed ? " hidden" : ""}`}>
                        {current?.overview || ""}
                    </p>
                </div>

                <div className="hero-buttons">
                    <button className="btn" onClick={play}>
                        ▶ Play
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => current && onMoreInfo({ ...current, trailer })}
                    >
                        More Info
                    </button>
                </div>

                <button id="muteBtn" title="Mute/Unmute" onClick={() => setMuted((m) => !m)}>
                    <svg
                        id="heroVolIcon"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        style={{ display: muted ? "none" : "" }}
                    >
                        <path d="M3 9v6h4l5 5V4L7 9H3z" />
                        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                        <path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06C18.01 19.86 21 16.28 21 12c0-4.28-2.99-7.86-7-8.77z" />
                    </svg>
                    <svg
                        id="heroMuteIcon"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        style={{ display: muted ? "" : "none" }}
                    >
                        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                    </svg>
                </button>
            </header>
        </>
    );
}
