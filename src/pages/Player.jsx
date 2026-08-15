import { useEffect, useRef, useState } from "react";
import useYouTubePlayer from "../hooks/useYouTubePlayer";

function formatTime(seconds) {
    const total = Math.floor(seconds || 0);
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const secs = total % 60;

    return hours > 0
        ? `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
        : `${minutes}:${String(secs).padStart(2, "0")}`;
}

export default function Player() {
    const params = new URLSearchParams(window.location.search);
    const trailerKey = params.get("trailer");
    const title = params.get("title") || "Now Playing";

    const { hostRef, playing, muted, volume, progress, controls } = useYouTubePlayer(trailerKey);

    const [controlsVisible, setControlsVisible] = useState(true);
    const [fullscreen, setFullscreen] = useState(false);
    const hideTimer = useRef(null);

    useEffect(() => {
        document.title = `${title} — Netflix Clone`;
    }, [title]);

    // Controls fade out three seconds after the mouse stops moving.
    useEffect(() => {
        const show = () => {
            setControlsVisible(true);
            clearTimeout(hideTimer.current);
            hideTimer.current = setTimeout(() => setControlsVisible(false), 3000);
        };
        show();
        return () => clearTimeout(hideTimer.current);
    }, []);

    function showControls() {
        setControlsVisible(true);
        clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(() => setControlsVisible(false), 3000);
    }

    useEffect(() => {
        const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
        document.addEventListener("fullscreenchange", onChange);
        return () => document.removeEventListener("fullscreenchange", onChange);
    }, []);

    function toggleFullscreen() {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen();
        else document.exitFullscreen();
    }

    const percent = progress.duration > 0 ? (progress.current / progress.duration) * 100 : 0;

    return (
        <div
            id="player-container"
            className={controlsVisible ? "controls-visible" : undefined}
            onMouseMove={showControls}
            onClick={(e) => {
                if (e.target.closest("#controls-overlay")) return;
                controls.togglePlay();
            }}
        >
            <div id="yt-frame" ref={hostRef} />

            <div className="gradient-top" />
            <div className="gradient-bottom" />

            <div id="controls-overlay" className={controlsVisible ? "visible" : undefined}>
                {/* Top */}
                <div className="player-top">
                    <button
                        className="back-btn"
                        title="Back"
                        onClick={() => window.history.back()}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            width="28"
                            height="28"
                        >
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>

                    <div className="top-right">
                        <button title="Audio & Subtitles">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                width="24"
                                height="24"
                            >
                                <rect x="2" y="4" width="20" height="16" rx="2" />
                                <path d="M7 15h2m4 0h4M7 11h10" />
                            </svg>
                        </button>
                        <button
                            title="Speed"
                            style={{
                                fontSize: 13,
                                fontWeight: 700,
                                opacity: 0.85,
                                letterSpacing: "-0.5px"
                            }}
                        >
                            1×
                        </button>
                    </div>
                </div>

                {/* Bottom */}
                <div className="player-bottom">
                    <div
                        className="progress-wrap"
                        onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            controls.seekToFraction((e.clientX - rect.left) / rect.width);
                        }}
                    >
                        <div className="progress-fill" style={{ width: `${percent}%` }}>
                            <div className="progress-dot" />
                        </div>
                    </div>

                    <div className="controls-row">
                        <div className="ctrl-left">
                            <button
                                className="ctrl-btn play-btn"
                                title="Play/Pause"
                                onClick={controls.togglePlay}
                            >
                                {playing ? (
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <rect x="6" y="4" width="4" height="16" rx="1" />
                                        <rect x="14" y="4" width="4" height="16" rx="1" />
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <polygon points="5,3 19,12 5,21" />
                                    </svg>
                                )}
                            </button>

                            <button
                                className="ctrl-btn skip-btn"
                                title="Skip back 10 seconds"
                                onClick={() => controls.seekBy(-10)}
                            >
                                <svg viewBox="0 0 36 36" fill="currentColor">
                                    <path d="M18 6C11.373 6 6 11.373 6 18s5.373 12 12 12 12-5.373 12-12H28c0 5.523-4.477 10-10 10S8 23.523 8 18 12.477 8 18 8V6z" />
                                    <path d="M16 6l-4-4-4 4h8z" />
                                </svg>
                                <span className="skip-num">10</span>
                            </button>

                            <button
                                className="ctrl-btn skip-btn"
                                title="Skip forward 10 seconds"
                                onClick={() => controls.seekBy(10)}
                            >
                                <svg viewBox="0 0 36 36" fill="currentColor">
                                    <path d="M18 6c6.627 0 12 5.373 12 12s-5.373 12-12 12S6 23.523 6 18H8c0 5.523 4.477 10 10 10s10-4.477 10-10S23.523 8 18 8V6z" />
                                    <path d="M20 6l4-4 4 4h-8z" />
                                </svg>
                                <span className="skip-num">10</span>
                            </button>

                            <div className="vol-group">
                                <button
                                    className="ctrl-btn vol-btn"
                                    title="Mute/Unmute"
                                    onClick={controls.toggleMute}
                                >
                                    {muted ? (
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                                        </svg>
                                    ) : (
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M3 9v6h4l5 5V4L7 9H3z" />
                                            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                                            <path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06C18.01 19.86 21 16.28 21 12c0-4.28-2.99-7.86-7-8.77z" />
                                        </svg>
                                    )}
                                </button>
                                <input
                                    type="range"
                                    className="vol-slider"
                                    min="0"
                                    max="100"
                                    value={volume}
                                    onChange={(e) => controls.setVolumeLevel(Number(e.target.value))}
                                />
                            </div>

                            <span className="time-label">
                                {formatTime(progress.current)} / {formatTime(progress.duration)}
                            </span>
                        </div>

                        <div className="ctrl-center">{title}</div>

                        <div className="ctrl-right">
                            <button
                                className="ctrl-btn"
                                title="Fullscreen"
                                onClick={toggleFullscreen}
                            >
                                {fullscreen ? (
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                                    </svg>
                                ) : (
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
