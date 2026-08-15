import { useEffect, useRef, useState } from "react";

// Loads the YouTube IFrame API once per page and resolves when it's ready.
function loadYouTubeApi() {
    if (window.YT?.Player) return Promise.resolve(window.YT);

    if (!window.__ytApiPromise) {
        window.__ytApiPromise = new Promise((resolve) => {
            const previous = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = () => {
                previous?.();
                resolve(window.YT);
            };
            const tag = document.createElement("script");
            tag.src = "https://www.youtube.com/iframe_api";
            document.head.appendChild(tag);
        });
    }

    return window.__ytApiPromise;
}

// Wraps the imperative YT.Player in something React can use: a ref to mount
// into, plus playback state that stays in sync with the player.
export default function useYouTubePlayer(videoId) {
    const hostRef = useRef(null);
    const playerRef = useRef(null);
    const [ready, setReady] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [muted, setMuted] = useState(true);
    const [volume, setVolume] = useState(0);
    const [progress, setProgress] = useState({ current: 0, duration: 0 });

    useEffect(() => {
        if (!videoId || !hostRef.current) return;

        let destroyed = false;
        // The API replaces this node with its iframe, so it's created outside
        // React's tree — React never tries to reconcile it.
        const mount = document.createElement("div");
        hostRef.current.appendChild(mount);

        loadYouTubeApi().then((YT) => {
            if (destroyed) return;

            playerRef.current = new YT.Player(mount, {
                videoId,
                playerVars: {
                    autoplay: 1,
                    mute: 1,
                    controls: 0,
                    disablekb: 1,
                    fs: 0,
                    modestbranding: 1,
                    rel: 0,
                    iv_load_policy: 3
                },
                events: {
                    onReady: (e) => {
                        if (destroyed) return;
                        e.target.playVideo();
                        setReady(true);
                    },
                    onStateChange: (e) => {
                        if (destroyed) return;
                        setPlaying(e.data === YT.PlayerState.PLAYING);
                    }
                }
            });
        });

        return () => {
            destroyed = true;
            try {
                playerRef.current?.destroy?.();
            } catch {
                /* player already gone */
            }
            playerRef.current = null;
            mount.remove();
        };
    }, [videoId]);

    // Keep the progress bar and time label current.
    useEffect(() => {
        if (!ready) return;
        const timer = setInterval(() => {
            const player = playerRef.current;
            if (!player?.getCurrentTime) return;
            setProgress({ current: player.getCurrentTime(), duration: player.getDuration() });
        }, 500);
        return () => clearInterval(timer);
    }, [ready]);

    const controls = {
        togglePlay() {
            const player = playerRef.current;
            if (!player) return;
            playing ? player.pauseVideo() : player.playVideo();
        },
        seekBy(seconds) {
            const player = playerRef.current;
            if (!player) return;
            player.seekTo(Math.max(0, player.getCurrentTime() + seconds), true);
        },
        seekToFraction(fraction) {
            const player = playerRef.current;
            if (!player) return;
            player.seekTo(fraction * player.getDuration(), true);
        },
        toggleMute() {
            const player = playerRef.current;
            if (!player) return;
            if (muted) {
                player.unMute();
                setMuted(false);
                setVolume(player.getVolume());
            } else {
                player.mute();
                setMuted(true);
                setVolume(0);
            }
        },
        setVolumeLevel(level) {
            const player = playerRef.current;
            if (!player) return;
            player.setVolume(level);
            setVolume(level);
            const nowMuted = level === 0;
            if (nowMuted !== muted) {
                nowMuted ? player.mute() : player.unMute();
                setMuted(nowMuted);
            }
        }
    };

    return { hostRef, ready, playing, muted, volume, progress, controls };
}
