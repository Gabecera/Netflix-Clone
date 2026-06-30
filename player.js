const params    = new URLSearchParams(window.location.search);
const trailerKey = params.get("trailer");
const title      = params.get("title") || "Now Playing";

document.getElementById("videoTitle").textContent = title;
document.title = title + " — Netflix Clone";

// ── YouTube IFrame API ──
let player, isPlaying = true, isMuted = true;

const tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);

function onYouTubeIframeAPIReady() {
    player = new YT.Player("yt-frame", {
        videoId: trailerKey,
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
            onReady: e => {
                e.target.playVideo();
                document.getElementById("volIcon").style.display  = "none";
                document.getElementById("muteIcon").style.display = "";
                document.getElementById("volSlider").value = 0;
                startProgress();
            },
            onStateChange: onStateChange
        }
    });
}

function onStateChange(e) {
    const pause = document.getElementById("pauseIcon");
    const play  = document.getElementById("playIcon");
    if (e.data === YT.PlayerState.PLAYING) {
        pause.style.display = ""; play.style.display = "none"; isPlaying = true;
    } else {
        pause.style.display = "none"; play.style.display = ""; isPlaying = false;
    }
}

document.getElementById("playPauseBtn").onclick = () => {
    if (!player) return;
    isPlaying ? player.pauseVideo() : player.playVideo();
};

document.getElementById("skipBackBtn").onclick = () => {
    if (!player) return;
    player.seekTo(Math.max(0, player.getCurrentTime() - 10), true);
};

document.getElementById("skipFwdBtn").onclick = () => {
    if (!player) return;
    player.seekTo(player.getCurrentTime() + 10, true);
};

document.getElementById("volBtn").onclick = () => {
    if (!player) return;
    if (isMuted) {
        player.unMute(); isMuted = false;
        document.getElementById("volIcon").style.display = "";
        document.getElementById("muteIcon").style.display = "none";
        document.getElementById("volSlider").value = player.getVolume();
    } else {
        player.mute(); isMuted = true;
        document.getElementById("volIcon").style.display = "none";
        document.getElementById("muteIcon").style.display = "";
        document.getElementById("volSlider").value = 0;
    }
};

document.getElementById("volSlider").oninput = function () {
    if (!player) return;
    player.setVolume(+this.value);
    const muted = +this.value === 0;
    if (muted !== isMuted) {
        isMuted = muted;
        muted ? player.mute() : player.unMute();
        document.getElementById("volIcon").style.display  = muted ? "none" : "";
        document.getElementById("muteIcon").style.display = muted ? "" : "none";
    }
};

// Progress bar
const progressWrap = document.getElementById("progressWrap");
const progressFill = document.getElementById("progressFill");
const timeLabel    = document.getElementById("timeLabel");

function fmt(s) {
    s = Math.floor(s);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0
        ? `${h}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`
        : `${m}:${String(sec).padStart(2,"0")}`;
}

function startProgress() {
    setInterval(() => {
        if (!player || !player.getCurrentTime) return;
        const cur = player.getCurrentTime();
        const dur = player.getDuration();
        if (dur > 0) {
            progressFill.style.width = (cur / dur * 100) + "%";
            timeLabel.textContent = fmt(cur) + " / " + fmt(dur);
        }
    }, 500);
}

progressWrap.addEventListener("click", function (e) {
    if (!player) return;
    const pct = (e.clientX - this.getBoundingClientRect().left) / this.offsetWidth;
    player.seekTo(pct * player.getDuration(), true);
});

// Fullscreen
const fsEnter = document.getElementById("fsEnterIcon");
const fsExit  = document.getElementById("fsExitIcon");
document.getElementById("fullscreenBtn").onclick = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        fsEnter.style.display = "none"; fsExit.style.display = "";
    } else {
        document.exitFullscreen();
        fsEnter.style.display = ""; fsExit.style.display = "none";
    }
};

document.getElementById("backBtn").onclick = () => window.history.back();

const overlay   = document.getElementById("controls-overlay");
const container = document.getElementById("player-container");
let hideTimer;

function showControls() {
    overlay.classList.add("visible");
    container.classList.add("controls-visible");
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
        overlay.classList.remove("visible");
        container.classList.remove("controls-visible");
    }, 3000);
}

container.addEventListener("mousemove", showControls);

container.addEventListener("click", function (e) {
    if (e.target.closest("#controls-overlay")) return;
    if (!player) return;
    isPlaying ? player.pauseVideo() : player.playVideo();
});

showControls();
