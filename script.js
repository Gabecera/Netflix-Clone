// =====================
// TMDB Proxy
// =====================
const tmdbCache = {};
const heroPoster = document.getElementById("heroPoster");
const omdbCache = {};

// All TMDB requests go through the server-side proxy — key never touches the client
async function tmdbFetch(endpoint) {
    const res = await fetch(`/api/tmdb?endpoint=${encodeURIComponent(endpoint)}`);
    if (!res.ok) throw new Error(`Proxy error ${res.status}`);
    return res.json();
}

async function fetchTMDBRow(endpoint) {
    const data = await tmdbFetch(endpoint);
    return data.results || [];
}
// check OMDB API for movie details (plot, rating, genres)
async function fetchMovieData(title, tmdbId = null) {
    const cacheKey = tmdbId || title;
    if (tmdbCache[cacheKey]) return tmdbCache[cacheKey];

    try {
        let id = tmdbId;

        let mediaType2 = "movie"; // default

        if (!id) {
            // No ID — search to get both the ID and media type in one call
            const searchData = await tmdbFetch(`/search/multi?query=${encodeURIComponent(title)}`);
            const result = searchData.results?.[0];
            if (!result) return null;
            id = result.id;
            mediaType2 = result.media_type || "movie";
        }
        // When tmdbId is already known, skip the search entirely —
        // try movie first, fall back to TV if TMDB returns "not found"

        let details = await tmdbFetch(`/${mediaType2}/${id}`);

        // fallback just in case
        if (details.status_code === 34) {
            const fallback = mediaType2 === "movie" ? "tv" : "movie";
            details = await tmdbFetch(`/${fallback}/${id}`);
            mediaType2 = fallback;
        }

        // Fetch trailer
        let trailer = null;

        // use the correct endpoint based on media type
        const mediaType = details.first_air_date ? "tv" : "movie";
        const videoData = await tmdbFetch(`/${mediaType}/${id}/videos`);
        trailer = videoData.results?.find(v => v.type === "Trailer" && v.site === "YouTube");

        const parsed = {
            description: details.overview || "No description available.",
            rating: Math.min(5, Math.max(1, Math.round(details.vote_average / 2))),
            genres: details.genres?.map(g => g.name) || [],
            trailer: trailer?.key || movieTrailers[title] || null,
            backdrop: details.backdrop_path || details.poster_path || null
        };

        tmdbCache[cacheKey] = parsed;
        return parsed;

    } catch (err) {
        console.error(`TMDB fetch failed for "${title}":`, err);
        return null;
    }
}
// Build a row of movies from TMDB data
function buildRow(movies, rowElement) {
    rowElement.innerHTML = "";
    movies.forEach(movie => {
        if (!movie.poster_path) return;

        const wrapper = document.createElement("div");
        wrapper.classList.add("movie-wrapper");

        const img = document.createElement("img");
        img.src = `https://image.tmdb.org/t/p/w300${movie.poster_path}`;
        img.alt = movie.title || movie.name;
        img.classList.add("movie");
        img.dataset.tmdbId = movie.id; // 👈 store the TMDB ID on the element
        img.dataset.tmdbId = movie.id;
        img.dataset.backdrop = movie.backdrop_path || movie.poster_path || "";
        wrapper.appendChild(img);
        rowElement.appendChild(wrapper);

        setupMovieWrapper(wrapper);
    });
}

// =====================
// Trailers (YouTube IDs — OMDb doesn't provide these)
// =====================
const movieTrailers = {
    "Avengers Infinity War": "6ZfuNTqbHE8",
    "Doctor Strange in the Multiverse of Madness": "aWzlQ2N6qqg",
    "Stranger Things 3": "e4XvO7DItmc",
    "Bullet Train": "0IOsk2Vlc4o",
    "Alienoid": "JaRLlh8Pw5A",
    "The Super Mario Bros. Movie": "TnGl01FkMMo",
    "Meg 2": "dG91B3hHyY4",
    "The Avengers: Infinity War": "6ZfuNTqbHE8",
    "Wonder Woman 1984": "sfM7_JLk-84",
    "Elemental": "hXzcyx9V0xw",
    "Dune Part 2": "Way9Dexny3w"
};

// =====================
// DOM References
// =====================
const movies = document.querySelectorAll(".movie");
const modal = document.getElementById("movieModal");
const modalTitle = document.getElementById("modalTitle");
const closeModal = document.getElementById("closeModal");
const modalDescription = document.getElementById("modalDescription");
const modalTrailer = document.getElementById("modalTrailer");
const muteBtn = document.getElementById("muteBtn");
const heroVideo = document.getElementById("heroVideo");
const myListRow = document.getElementById("myListRow");
const searchIcon = document.getElementById("searchIcon");
const searchInput = document.getElementById("searchInput");
const browseBtn = document.querySelector(".browse-dropdown");
const dropdownMenu = document.querySelector(".dropdown-menu");
const heroTitle = document.querySelector(".hero-content h1");
const heroDesc = document.querySelector(".hero-content p");

// =====================
// Hero Rotation
// =====================
// Featured list is populated dynamically from TMDB trending — no hardcoded titles
const featured = [];
let featuredIndex = 0;
let heroInterval = null;
let currentHeroBackdrop = "";
let currentHeroEntry = null; // tracks the currently displayed hero item + its data
async function updateHero() {
    if (featured.length === 0) return; // wait until trending loads
    const current = featured[featuredIndex];
    heroTitle.textContent = current.title;

    const data = await fetchMovieData(current.title, current.tmdbId || null);
    heroDesc.textContent = data ? data.description : "";

    // store backdrop for use when a card is hovered
    currentHeroBackdrop = data?.backdrop || "";

    // track current hero so buttons can reference it
    currentHeroEntry = { ...current, data };

    const trailerKey = data?.trailer;
    if (trailerKey) {
        heroVideo.src = `https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&controls=0&fs=0&modestbranding=1&cc_load_policy=0&playlist=${trailerKey}`;
    }

    featuredIndex = (featuredIndex + 1) % featured.length;
    // reset first in case it was hidden from last rotation
    heroDesc.classList.remove("hidden");
    heroTitle.classList.remove("shrunk");

    // hide description and shrink title after 6 seconds
    setTimeout(() => {
        heroDesc.classList.add("hidden");
        heroTitle.classList.add("shrunk");
    }, 6000);
}
let isMuted = true;
// Hero rotation starts after trending loads (see loadTMDBRows)

// =====================
// Mute Button
// =====================
function updateMuteIcon() {
    document.getElementById("heroVolIcon").style.display  = isMuted ? "none" : "";
    document.getElementById("heroMuteIcon").style.display = isMuted ? "" : "none";
}
updateMuteIcon();

muteBtn.addEventListener("click", function () {
    isMuted = !isMuted;
    heroVideo.src = isMuted
        ? heroVideo.src.replace("mute=0", "mute=1")
        : heroVideo.src.replace("mute=1", "mute=0");
    updateMuteIcon();
});

// =====================
// My List
// =====================
const myList = JSON.parse(localStorage.getItem("myList")) || [];

function renderMyList() {
    myListRow.innerHTML = "";
    const title = document.querySelector(".my-list-title");
    const emptyState = document.getElementById("myListEmpty");

    if (myList.length === 0) {
        title.style.display = "none";
        if (emptyState) emptyState.style.display = "block";
        return;
    }

    title.style.display = "block";
    if (emptyState) emptyState.style.display = "none";

    myList.forEach(function (movieItem, index) {
        const wrapper = document.createElement("div");
        wrapper.classList.add("movie-wrapper");

        const img = document.createElement("img");
        img.src = movieItem.src;
        img.alt = movieItem.alt;
        img.classList.add("movie");

        const removeBtn = document.createElement("button");
        removeBtn.classList.add("add-btn");
        removeBtn.textContent = "✕";

        removeBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            myList.splice(index, 1);
            localStorage.setItem("myList", JSON.stringify(myList));
            renderMyList();
        });

        wrapper.appendChild(img);
        wrapper.appendChild(removeBtn);
        myListRow.appendChild(wrapper);
        setupMovieWrapper(wrapper);
    });

    // Re-init arrows after items are rendered
    const myListContainer = myListRow.closest(".row-container");
    if (myListContainer) initRowArrows(myListContainer);
}

renderMyList();

// =====================
// Block horizontal scroll on entire page
// =====================
document.addEventListener("wheel", function (e) {
    if (Math.abs(e.deltaX) >= Math.abs(e.deltaY)) {
        e.preventDefault();
    }
}, { passive: false });
// =====================
// Search
// =====================
searchIcon.addEventListener("click", function () {
    searchInput.classList.toggle("hidden");
    searchInput.classList.toggle("visible");

    if (searchInput.classList.contains("visible")) {
        searchInput.focus();
    } else {
        // Closing the search box: clear the query and hide any leftover results
        searchInput.value = "";
        searchResultsSection.style.display = "none";
        clearTimeout(searchTimeout);
    }
});

const searchResultsSection = document.getElementById("searchResultsSection");
const searchResultsRow = document.getElementById("searchResultsRow");
let searchTimeout = null;

searchInput.addEventListener("input", function () {
    const query = searchInput.value.trim();

    // Hide results and show normal rows if search is cleared
    if (!query) {
        clearTimeout(searchTimeout);
        searchResultsSection.style.display = "none";
        return;
    }

    // Debounce — wait 400ms after user stops typing before hitting the API
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => runSearch(query), 400);
});
async function runSearch(query) {
    // Client-side guard: strip non-printable chars and enforce length
    query = query.replace(/[^\x20-\x7E]/g, "").trim();
    if (!query || query.length > 100) return;

    const data = await tmdbFetch(`/search/multi?query=${encodeURIComponent(query)}`);

    // Filter to only results that have a poster
    const results = (data.results || []).filter(r => r.poster_path);

    if (results.length === 0) {
        searchResultsSection.style.display = "none";
        return;
    }

    // Show the section and populate the row
    searchResultsSection.style.display = "block";
    buildRow(results, searchResultsRow);

    // Re-init arrows for the search row
    document.querySelectorAll(".row-container").forEach(function (container) {
        const scroller = container.querySelector(".row-scroll");
        const row = scroller.querySelector(".row");
        const leftArrow = container.querySelector(".arrow-left");
        const rightArrow = container.querySelector(".arrow-right");
        let offset = 0;

        rightArrow.onclick = () => {
            const max = row.scrollWidth - scroller.offsetWidth;
            offset = Math.min(offset + 500, max);
            row.style.transform = `translateX(-${offset}px)`;
            leftArrow.style.opacity = "1";
            rightArrow.style.opacity = offset >= max ? "0" : "1";
        };
        leftArrow.onclick = () => {
            offset = Math.max(offset - 500, 0);
            row.style.transform = `translateX(-${offset}px)`;
            leftArrow.style.opacity = offset <= 0 ? "0" : "1";
            rightArrow.style.opacity = "1";
        };

        leftArrow.style.opacity = "0";
        rightArrow.style.opacity = row.scrollWidth > scroller.offsetWidth ? "1" : "0";
    });
}
// =====================
// Profile menu
// =====================
const profileMenu = document.querySelector(".profile-menu");
const profileDropdown = document.querySelector(".profile-dropdown");
const profileAvatarWrapper = document.querySelector(".profile-avatar-wrapper");

profileAvatarWrapper.addEventListener("click", function (e) {
    e.stopPropagation();
    profileDropdown.classList.toggle("open");
});

window.addEventListener("click", function () {
    profileDropdown.classList.remove("open");
});

// =====================
// Scroll — Nav background
// =====================
window.addEventListener("scroll", function () {
    document.querySelector("nav").classList.toggle("scrolled", window.scrollY > 50);
});

// =====================
// Row Arrows
// =====================

document.querySelectorAll(".row-container").forEach(function (container) {
    const scroller = container.querySelector(".row-scroll");
    const row = scroller.querySelector(".row");
    const leftArrow = container.querySelector(".arrow-left");
    const rightArrow = container.querySelector(".arrow-right");
    let offset = 0;

    function updateArrows() {
        const maxScroll = row.scrollWidth - scroller.offsetWidth;
        leftArrow.style.opacity = offset > 0 ? "1" : "0";
        rightArrow.style.opacity = offset < maxScroll ? "1" : "0";
    }

    rightArrow.addEventListener("click", () => {
        const maxScroll = row.scrollWidth - scroller.offsetWidth;
        offset = Math.min(offset + 500, maxScroll);
        row.style.transform = `translateX(-${offset}px)`;
        updateArrows();
    });

    leftArrow.addEventListener("click", () => {
        offset = Math.max(offset - 500, 0);
        row.style.transform = `translateX(-${offset}px)`;
        updateArrows();
    });

    updateArrows();
});

// =====================
// Hover Cards (built with live OMDb data)
// =====================
function buildHoverCard(wrapper, img, data) {
    // Remove existing hover card if any
    const existing = wrapper.querySelector(".hover-card");
    if (existing) existing.remove();

    const card = document.createElement("div");
    card.classList.add("hover-card");

    const title = document.createElement("div");
    title.classList.add("hover-card-title");
    title.textContent = img.alt;

    const stars = document.createElement("div");
    stars.classList.add("hover-card-stars");
    const rating = data.rating || 3;
    stars.textContent = "★".repeat(rating) + "☆".repeat(5 - rating);

    const genreRow = document.createElement("div");
    genreRow.classList.add("hover-card-genres");
    (data.genres || []).forEach(g => {
        const tag = document.createElement("span");
        tag.classList.add("genre-tag");
        tag.textContent = g;
        genreRow.appendChild(tag);
    });

    const addBtn = document.createElement("button");
    addBtn.classList.add("hover-add-btn");
    addBtn.textContent = myList.find(m => m.alt === img.alt) ? "✓ In My List" : "+ My List";

    addBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        const inList = myList.find(m => m.alt === img.alt);
        if (!inList) {
            myList.push({ src: img.src, alt: img.alt });
            localStorage.setItem("myList", JSON.stringify(myList));
            addBtn.textContent = "✓ In My List";
        } else {
            myList.splice(myList.findIndex(m => m.alt === img.alt), 1);
            localStorage.setItem("myList", JSON.stringify(myList));
            addBtn.textContent = "+ My List";
        }
        renderMyList();
    });

    // Play button — navigates to the video player
    const btnRow = document.createElement("div");
    btnRow.classList.add("hover-card-btns");

    const playBtn = document.createElement("button");
    playBtn.classList.add("hover-play-btn");
    playBtn.innerHTML = "&#9654;";
    playBtn.title = "Play";
    playBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        const trailerKey = data?.trailer;
        if (trailerKey) {
            window.location.href = `player.html?trailer=${trailerKey}&title=${encodeURIComponent(img.alt)}`;
        }
    });

    btnRow.appendChild(playBtn);
    btnRow.appendChild(addBtn);

    card.appendChild(title);
    card.appendChild(stars);
    card.appendChild(genreRow);
    card.appendChild(btnRow);
    wrapper.appendChild(card);
}

// =====================
// Movie Wrappers — hover video + hover card (OMDb)
// =====================
async function setupMovieWrapper(wrapper) {
    const img = wrapper.querySelector(".movie");
    if (!img) return;

    const tmdbId = img.dataset.tmdbId || null; // 👈 read the ID if present
    const data = await fetchMovieData(img.alt, tmdbId); // 👈 pass it in
    if (data) buildHoverCard(wrapper, img, data);

    // Always set expand direction regardless of whether a trailer exists
    wrapper.addEventListener("mouseenter", function () {
        const rect = wrapper.getBoundingClientRect();
        const middle = rect.left + rect.width / 2;
        wrapper.style.transformOrigin = middle < window.innerWidth / 2 ? "left center" : "right center";
    });

    const trailer = data?.trailer; // 👈 now comes from fetchMovieData, not the hardcoded map
    if (trailer) {
        const container = document.createElement("div");
        container.classList.add("video-container");
        container.style.display = "none";

        const video = document.createElement("iframe");
        video.src = "";
        video.style.border = "none";
        video.setAttribute("sandbox", "allow-scripts allow-same-origin allow-presentation");
        container.appendChild(video);
        wrapper.appendChild(container);

        wrapper.addEventListener("mouseenter", function () {
            heroVideo.style.display = "none";

            if (currentHeroBackdrop) {
                heroPoster.style.backgroundImage = `url(https://image.tmdb.org/t/p/original${currentHeroBackdrop})`;
                heroPoster.style.display = "block";
            }

            video.src = `https://www.youtube.com/embed/${trailer}?autoplay=1&mute=1&controls=0&fs=0&modestbranding=1`;
            container.style.display = "block";
            img.style.visibility = "hidden";
        });

        wrapper.addEventListener("mouseleave", function () {
            // restore hero video
            heroVideo.style.display = "block";
            heroPoster.style.display = "none";

            // stop card trailer
            video.src = "";
            container.style.display = "none";
            img.style.visibility = "visible";
        });
    }

    wrapper.addEventListener("click", async function () {
        const clickData = await fetchMovieData(img.alt, tmdbId);
        const trailerKey = clickData?.trailer;
        if (trailerKey) {
            window.location.href = `player.html?trailer=${trailerKey}&title=${encodeURIComponent(img.alt)}`;
        }
    });
}

// =====================
// Dropdown Menu
// =====================
browseBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    dropdownMenu.classList.toggle("open");
});

window.addEventListener("click", () => dropdownMenu.classList.remove("open"));

// =====================
// Modal (click a movie — loads OMDb description)
// =====================


let currentModalTrailerKey = null;

// =====================
// Hero Buttons
// =====================
const heroPlayBtn = document.querySelector(".hero-buttons .btn:first-child");
const heroMoreInfoBtn = document.querySelector(".hero-buttons .btn-secondary");

heroPlayBtn.addEventListener("click", function () {
    const trailerKey = currentHeroEntry?.data?.trailer;
    const title      = currentHeroEntry?.title || "";
    if (trailerKey) {
        window.location.href = `player.html?trailer=${trailerKey}&title=${encodeURIComponent(title)}`;
    }
});

heroMoreInfoBtn.addEventListener("click", async function () {
    if (!currentHeroEntry) return;
    const { title, tmdbId, data } = currentHeroEntry;

    // Pause the hero video while modal is open
    heroVideo.src = heroVideo.src.replace("autoplay=1", "autoplay=0");

    modal.classList.add("show");
    modalTitle.textContent = title;
    modalDescription.textContent = data?.description || "Loading...";

    if (data?.trailer) {
        currentModalTrailerKey = data.trailer;
        modalTrailer.src = `https://www.youtube.com/embed/${data.trailer}?autoplay=1&mute=1&enablejsapi=1`;
    }
});

closeModal.addEventListener("click", function () {
    modal.classList.remove("show");
    modalTrailer.src = "";
    currentModalTrailerKey = null;
    // Resume hero video
    heroVideo.src = heroVideo.src.replace("autoplay=0", "autoplay=1");
});

document.querySelector("#movieModal .btn").addEventListener("click", function () {
    if (!currentModalTrailerKey) return;
    window.open(`https://www.youtube.com/watch?v=${currentModalTrailerKey}`, "_blank");
});
// call for each row
async function loadTMDBRows() {
    const [trending, action, comedy, scifi, popular, newReleases] = await Promise.all([
        fetchTMDBRow("/trending/movie/week?language=en-US"),
        fetchTMDBRow("/discover/movie?with_genres=28&sort_by=popularity.desc"),
        fetchTMDBRow("/discover/movie?with_genres=35&sort_by=popularity.desc"),
        fetchTMDBRow("/discover/movie?with_genres=878&sort_by=popularity.desc"),
        fetchTMDBRow("/movie/popular?language=en-US"),
        fetchTMDBRow("/movie/now_playing?language=en-US")
    ]);

    buildRow(trending,    document.getElementById("trendingRow"));
    buildRow(action,      document.getElementById("actionRow"));
    buildRow(comedy,      document.getElementById("comedyRow"));
    buildRow(scifi,       document.getElementById("scifiRow"));
    buildRow(popular,     document.getElementById("popularRow"));
    buildRow(newReleases, document.getElementById("newReleasesRow"));

    // Populate hero rotation from trending (movies + TV both included)
    featured.length = 0;
    featuredIndex = 0;
    trending
        .filter(item => item.poster_path) // only items with artwork
        .slice(0, 10)
        .forEach(item => {
            featured.push({
                title: item.title || item.name,
                tmdbId: item.id
            });
        });
    // Start/restart the rotation now that trending data is ready
    if (heroInterval) clearInterval(heroInterval);
    updateHero();
    heroInterval = setInterval(updateHero, 30000);

    // Re-run arrow visibility now that rows are populated
    document.querySelectorAll(".row-container").forEach(function (container) {
        const scroller = container.querySelector(".row-scroll");
        const row = scroller.querySelector(".row");
        const rightArrow = container.querySelector(".arrow-right");
        if (row.scrollWidth > scroller.offsetWidth) {
            rightArrow.style.opacity = "1";
        }
    });
}

loadTMDBRows();
// for manual hardcoded wrappers
document.querySelectorAll(".movie-wrapper").forEach(setupMovieWrapper);

// =====================
// Nav — view switching
// =====================
let showsLoaded = false;
const allNavItems = document.querySelectorAll(".nav-links li, .dropdown-menu li");
const contentSections = document.querySelectorAll(".content-section");

const heroEl = document.querySelector("header.hero");
const heroVideoWrapperEl = document.querySelector(".hero-video-wrapper");
const heroViews = ["home", "movies", "shows", "new-popular"];

function setView(view) {
    searchInput.value = "";
    searchInput.classList.add("hidden");
    searchInput.classList.remove("visible");
    searchResultsSection.style.display = "none";

    // Show/hide sections
    contentSections.forEach(section => {
        const views = section.dataset.views.split(" ");
        section.style.display = views.includes(view) ? "block" : "none";
    });

    // Show/hide hero based on view
    const showHero = heroViews.includes(view);
    heroEl.style.display = showHero ? "" : "none";
    heroVideoWrapperEl.style.display = showHero ? "" : "none";

    // Update active class on all nav items
    allNavItems.forEach(item => {
        item.classList.toggle("active", item.dataset.view === view);
    });

    // Lazy-load shows rows on first click
    if (view === "shows" && !showsLoaded) {
        loadTMDBShowsRows();
        showsLoaded = true;
    }

    // Populate language grid on first visit
    if (view === "languages") {
        populateLanguageGrid();
    }

    // Show empty state if navigating directly to My List
    if (view === "my-list" && myList.length === 0) {
        document.getElementById("myListEmpty").style.display = "block";
    }

    // Scroll to top of content on view change
    window.scrollTo({ top: 0, behavior: "smooth" });
}

allNavItems.forEach(item => {
    item.addEventListener("click", function (e) {
        e.stopPropagation();
        const view = item.dataset.view || "home";
        setView(view);
        // Close dropdown if open
        dropdownMenu.classList.remove("open");
    });
});

// Logo click resets to Home
document.querySelector(".logo-link").addEventListener("click", function () {
    setView("home");
});

// =====================
// Shows — TMDB TV rows
// =====================
async function loadTMDBShowsRows() {
    const [popular, drama, reality] = await Promise.all([
        fetchTMDBRow("/tv/popular?language=en-US"),
        fetchTMDBRow("/discover/tv?with_genres=18&sort_by=popularity.desc"),
        fetchTMDBRow("/discover/tv?with_genres=10764&sort_by=popularity.desc")
    ]);

    buildRow(popular, document.getElementById("popularShowsRow"));
    buildRow(drama,   document.getElementById("dramaRow"));
    buildRow(reality, document.getElementById("realityRow"));

    // Re-run arrow visibility for newly populated rows
    document.querySelectorAll(".content-section[data-views='shows'] .row-container").forEach(function (container) {
        const scroller = container.querySelector(".row-scroll");
        const row = scroller.querySelector(".row");
        const rightArrow = container.querySelector(".arrow-right");
        const leftArrow = container.querySelector(".arrow-left");
        let offset = 0;

        rightArrow.addEventListener("click", () => {
            const maxScroll = row.scrollWidth - scroller.offsetWidth;
            offset = Math.min(offset + 500, maxScroll);
            row.style.transform = `translateX(-${offset}px)`;
            leftArrow.style.opacity = offset > 0 ? "1" : "0";
            rightArrow.style.opacity = offset < maxScroll ? "1" : "0";
        });
        leftArrow.addEventListener("click", () => {
            offset = Math.max(offset - 500, 0);
            row.style.transform = `translateX(-${offset}px)`;
            leftArrow.style.opacity = offset > 0 ? "1" : "0";
            rightArrow.style.opacity = "1";
        });

        leftArrow.style.opacity = "0";
        rightArrow.style.opacity = row.scrollWidth > scroller.offsetWidth ? "1" : "0";
    });
}

// =====================
// Languages grid + filtering
// =====================
const languageMap = {
    "English":    "en",
    "Spanish":    "es",
    "French":     "fr",
    "Korean":     "ko",
    "Japanese":   "ja",
    "Hindi":      "hi",
    "Portuguese": "pt",
    "German":     "de",
    "Italian":    "it",
    "Mandarin":   "zh",
    "Arabic":     "ar",
    "Turkish":    "tr"
};
let languagesLoaded = false;

function initRowArrows(container) {
    const scroller = container.querySelector(".row-scroll");
    const row = scroller.querySelector(".row");
    const leftArrow = container.querySelector(".arrow-left");
    const rightArrow = container.querySelector(".arrow-right");
    let offset = 0;
    rightArrow.onclick = () => {
        const max = row.scrollWidth - scroller.offsetWidth;
        offset = Math.min(offset + 500, max);
        row.style.transform = `translateX(-${offset}px)`;
        leftArrow.style.opacity = offset > 0 ? "1" : "0";
        rightArrow.style.opacity = offset < max ? "1" : "0";
    };
    leftArrow.onclick = () => {
        offset = Math.max(offset - 500, 0);
        row.style.transform = `translateX(-${offset}px)`;
        leftArrow.style.opacity = offset > 0 ? "1" : "0";
        rightArrow.style.opacity = "1";
    };
    leftArrow.style.opacity = "0";
    rightArrow.style.opacity = row.scrollWidth > scroller.offsetWidth ? "1" : "0";
}

async function loadLanguageContent(langCode, langName) {
    const moviesRow = document.getElementById("langMoviesRow");
    const showsRow  = document.getElementById("langShowsRow");
    const results   = document.getElementById("languageResults");

    moviesRow.innerHTML = "<p style='padding:20px;color:#aaa'>Loading…</p>";
    showsRow.innerHTML  = "<p style='padding:20px;color:#aaa'>Loading…</p>";
    results.style.display = "block";

    document.getElementById("langMoviesTitle").textContent = `${langName} Movies`;
    document.getElementById("langShowsTitle").textContent  = `${langName} Shows`;

    const [movies, shows] = await Promise.all([
        fetchTMDBRow(`/discover/movie?with_original_language=${langCode}&sort_by=popularity.desc`),
        fetchTMDBRow(`/discover/tv?with_original_language=${langCode}&sort_by=popularity.desc`)
    ]);

    buildRow(movies, moviesRow);
    buildRow(shows,  showsRow);

    // init arrows after rows are populated
    document.querySelectorAll("#languageResults .row-container").forEach(initRowArrows);
}

function populateLanguageGrid() {
    if (languagesLoaded) return;
    const grid = document.getElementById("languageGrid");
    if (!grid) return;
    Object.keys(languageMap).forEach(lang => {
        const tag = document.createElement("div");
        tag.classList.add("language-tag");
        tag.textContent = lang;
        tag.addEventListener("click", function () {
            // highlight active tag
            document.querySelectorAll(".language-tag").forEach(t => t.classList.remove("active"));
            tag.classList.add("active");
            loadLanguageContent(languageMap[lang], lang);
        });
        grid.appendChild(tag);
    });
    languagesLoaded = true;
}