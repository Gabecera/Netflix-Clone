// =====================
// OMDb API
// =====================
const TMDB_KEY = "d0b65271e62e6564bb47999d30242931";
const tmdbCache = {};
const heroPoster = document.getElementById("heroPoster");
// Cache so each movie is only fetched once (protects the 1,000/day limit)
const omdbCache = {};
// check TMDB API 
async function fetchTMDBRow(endpoint) {
    const res = await fetch(`https://api.themoviedb.org/3${endpoint}&api_key=${TMDB_KEY}`);
    const data = await res.json();
    return data.results || [];
}
// check OMDB API for movie details (plot, rating, genres)
async function fetchMovieData(title, tmdbId = null) {
    const cacheKey = tmdbId || title;
    if (tmdbCache[cacheKey]) return tmdbCache[cacheKey];

    try {
        let id = tmdbId;

        // If no TMDB ID, search for it by title
        if (!id) {
            const searchRes = await fetch(`https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(title)}&api_key=${TMDB_KEY}`);
            const searchData = await searchRes.json();
            const result = searchData.results?.[0];
            if (!result) return null;
            id = result.id;
        }

        // Try movie first, then TV
        // Determine media type from search instead of guessing
        const typeRes = await fetch(`https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(title)}&api_key=${TMDB_KEY}`);
        const typeData = await typeRes.json();
        const mediaType2 = typeData.results?.[0]?.media_type || "movie";

        let detailsRes = await fetch(`https://api.themoviedb.org/3/${mediaType2}/${id}?api_key=${TMDB_KEY}`);
        let details = await detailsRes.json();

        // fallback just in case
        if (details.status_code === 34) {
            const fallback = mediaType2 === "movie" ? "tv" : "movie";
            detailsRes = await fetch(`https://api.themoviedb.org/3/${fallback}/${id}?api_key=${TMDB_KEY}`);
            details = await detailsRes.json();
        }

        // Fetch trailer
        // Try movie videos first, then TV videos
        let trailer = null;

// use the correct endpoint based on media type
        const mediaType = details.first_air_date ? "tv" : "movie";
        const videoRes = await fetch(`https://api.themoviedb.org/3/${mediaType}/${id}/videos?api_key=${TMDB_KEY}`);
        const videoData = await videoRes.json();
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
        const btn = document.createElement("button");
        btn.classList.add("add-btn");
        btn.textContent = "+";

        wrapper.appendChild(img);
        wrapper.appendChild(btn);
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
const featured = [
    { title: "Stranger Things 3", trailer: "6Am4v0C_z8c" },
    { title: "Dune Part 2", trailer: "Way9Dexny3w" },
    { title: "Bullet Train", trailer: "0IOsk2Vlc4o" },
    { title: "Avengers Infinity War", trailer: "6ZfuNTqbHE8" },
    { title: "Doctor Strange in the Multiverse of Madness", trailer: "aWzlQ2N6qqg" },
    { title: "The Super Mario Bros. Movie", trailer: "TnGl01FkMMo" },
    { title: "Meg 2", trailer: "dG91B3hHyY4" },
    { title: "Wonder Woman 1984", trailer: "sfM7_JLk-84" },
    { title: "Elemental", trailer: "hXzcyx9V0xw" }
];
let featuredIndex = 0;
let currentHeroBackdrop = "";
async function updateHero() {
    const current = featured[featuredIndex];
    heroTitle.textContent = current.title;

    const data = await fetchMovieData(current.title);
    heroDesc.textContent = data ? data.description : "";

    // store backdrop on the iframe for use when a card is hovered
    currentHeroBackdrop = data?.backdrop || "";
    console.log("Backdrop for", current.title, ":", currentHeroBackdrop);

    heroVideo.src = `https://www.youtube.com/embed/${current.trailer}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&controls=0&fs=0&modestbranding=1&playlist=${current.trailer}`;
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

// Load first hero description immediately
updateHero();
setInterval(updateHero, 30000);

// =====================
// Mute Button
// =====================
let isMuted = true;
muteBtn.textContent = "🔇";

muteBtn.addEventListener("click", function () {
    isMuted = !isMuted;
    heroVideo.src = isMuted
        ? heroVideo.src.replace("mute=0", "mute=1")
        : heroVideo.src.replace("mute=1", "mute=0");
    muteBtn.textContent = isMuted ? "🔇" : "🔊";
});

// =====================
// My List
// =====================
const myList = JSON.parse(localStorage.getItem("myList")) || [];

function renderMyList() {
    myListRow.innerHTML = "";
    const title = document.querySelector(".my-list-title");

    if (myList.length === 0) {
        title.style.display = "none";
        return;
    }

    title.style.display = "block";

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
    });
}

renderMyList();

document.querySelectorAll(".add-btn").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
        e.stopPropagation();
        const img = btn.previousElementSibling;
        const already = myList.find(m => m.alt === img.alt);
        if (!already) {
            myList.push({ src: img.src, alt: img.alt });
            localStorage.setItem("myList", JSON.stringify(myList));
            btn.textContent = "✓";
            renderMyList();
        }
    });
});

// =====================
// Search
// =====================
searchIcon.addEventListener("click", function () {
    searchInput.classList.toggle("hidden");
    searchInput.classList.toggle("visible");
    if (searchInput.classList.contains("visible")) searchInput.focus();
});

searchInput.addEventListener("input", function () {
    const query = searchInput.value.toLowerCase();
    movies.forEach(function (movie) {
        movie.closest(".movie-wrapper").style.display =
            movie.alt.toLowerCase().includes(query) ? "flex" : "none";
    });
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

    card.appendChild(title);
    card.appendChild(stars);
    card.appendChild(genreRow);
    card.appendChild(addBtn);
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

    const trailer = data?.trailer; // 👈 now comes from fetchMovieData, not the hardcoded map
    if (trailer) {
        const container = document.createElement("div");
        container.classList.add("video-container");
        container.style.display = "none";

        const video = document.createElement("iframe");
        video.src = "";
        video.style.border = "none";
        container.appendChild(video);
        wrapper.appendChild(container);

        wrapper.addEventListener("mouseenter", function () {
            const rect = wrapper.getBoundingClientRect();
            const middle = rect.left + rect.width / 2;
            const origin = middle < window.innerWidth / 2 ? "left center" : "right center";
            wrapper.style.transformOrigin = origin;

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

    img.addEventListener("click", async function () {
        heroVideo.src = heroVideo.src.replace("autoplay=1", "autoplay=0");
        modal.classList.add("show");
        modalTitle.textContent = img.alt;
        modalDescription.textContent = "Loading...";

        const clickData = await fetchMovieData(img.alt, tmdbId);
        modalDescription.textContent = clickData ? clickData.description : "No description available.";

        if (clickData?.trailer) {
            modalTrailer.src = `https://www.youtube.com/embed/${clickData.trailer}?autoplay=1&mute=1`;
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


closeModal.addEventListener("click", function () {
    modal.classList.remove("show");
    modalTrailer.src = "";
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

    buildRow(trending, document.querySelectorAll(".row-scroll .row")[0]);
    buildRow(action,   document.querySelectorAll(".row-scroll .row")[1]);
    buildRow(comedy,   document.querySelectorAll(".row-scroll .row")[2]);
    buildRow(scifi,    document.querySelectorAll(".row-scroll .row")[3]);
    buildRow(popular,  document.querySelectorAll(".row-scroll .row")[4]);
    buildRow(newReleases, document.querySelectorAll(".row-scroll .row")[5]);

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