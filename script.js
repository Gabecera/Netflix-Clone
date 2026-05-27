// =====================
// OMDb API
// =====================
const TMDB_KEY = "d0b65271e62e6564bb47999d30242931";
const OMDB_KEY = "701853b4";

// Cache so each movie is only fetched once (protects the 1,000/day limit)
const omdbCache = {};
// check TMDB API 
async function fetchTMDBRow(endpoint) {
    const res = await fetch(`https://api.themoviedb.org/3${endpoint}&api_key=${TMDB_KEY}`);
    const data = await res.json();
    return data.results || [];
}
// check OMDB API for movie details (plot, rating, genres)
async function fetchMovieData(title) {
    if (omdbCache[title]) return omdbCache[title];

    try {
        const res = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${OMDB_KEY}`);
        const data = await res.json();

        if (data.Response === "False") {
            console.warn(`OMDb: "${title}" not found — ${data.Error}`);
            return null;
        }

        const parsed = {
            description: data.Plot || "No description available.",
            rating: Math.min(5, Math.max(1, Math.round(parseFloat(data.imdbRating) / 2))),
            genres: data.Genre ? data.Genre.split(", ") : [],
            trailer: movieTrailers[title] || null
        };

        omdbCache[title] = parsed;
        return parsed;
    } catch (err) {
        console.error(`OMDb fetch failed for "${title}":`, err);
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

async function updateHero() {
    const current = featured[featuredIndex];
    heroTitle.textContent = current.title;

    // Fetch real description from OMDb
    const data = await fetchMovieData(current.title);
    heroDesc.textContent = data ? data.description : "";

    heroVideo.src = `https://www.youtube.com/embed/${current.trailer}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&controls=0&fs=0&modestbranding=1&playlist=${current.trailer}`;
    featuredIndex = (featuredIndex + 1) % featured.length;
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
    const leftArrow = container.querySelector(".arrow-left");
    const rightArrow = container.querySelector(".arrow-right");

    rightArrow.addEventListener("click", () => scroller.scrollBy({ left: 500, behavior: "smooth" }));
    leftArrow.addEventListener("click", () => scroller.scrollBy({ left: -500, behavior: "smooth" }));

    scroller.addEventListener("scroll", function () {
        leftArrow.style.opacity = scroller.scrollLeft > 0 ? "1" : "0";
        rightArrow.style.opacity =
            scroller.scrollLeft < scroller.scrollWidth - scroller.clientWidth ? "1" : "0";
    });
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

    const data = await fetchMovieData(img.alt);
    if (data) buildHoverCard(wrapper, img, data);

    const trailer = movieTrailers[img.alt];
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
            heroVideo.src = heroVideo.src.replace("mute=0", "mute=1").replace("autoplay=1", "autoplay=0");
            video.src = `https://www.youtube.com/embed/${trailer}?autoplay=1&mute=1&controls=0&fs=0&modestbranding=1`;
            container.style.display = "block";
            img.style.visibility = "hidden";
        });

        wrapper.addEventListener("mouseleave", function () {
            video.src = "";
            container.style.display = "none";
            img.style.visibility = "visible";
            heroVideo.src = `https://www.youtube.com/embed/6Am4v0C_z8c?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&controls=0&fs=0&modestbranding=1&playlist=6Am4v0C_z8c`;
        });
    }
    img.addEventListener("click", async function () {
    heroVideo.src = heroVideo.src.replace("autoplay=1", "autoplay=0");
    modal.classList.add("show");
    modalTitle.textContent = img.alt;
    modalDescription.textContent = "Loading...";

    const data = await fetchMovieData(img.alt);
    modalDescription.textContent = data ? data.description : "No description available.";

    const trailer = movieTrailers[img.alt];
    if (trailer) {
        modalTrailer.src = `https://www.youtube.com/embed/${trailer}?autoplay=1&mute=1`;
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
    // at the bottom of buildRow, inside the forEach, after wrapper.appendChild(btn):
}

loadTMDBRows();
// for manual hardcoded wrappers
document.querySelectorAll(".movie-wrapper").forEach(setupMovieWrapper);