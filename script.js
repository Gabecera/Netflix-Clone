// stores all imgs in list
const movies = document.querySelectorAll(".movie");
//targets popup modal elements
const modal = document.getElementById("movieModal");
//get movie name in popup modal
const modalTitle = document.getElementById("modalTitle");
//get close button in popup modal
const closeModal = document.getElementById("closeModal");
//modal description for movie
const modalDescription = document.getElementById("modalDescription");
// movie data with descriptions
const movieData = {
    "Avengers Infinity War": {
        description: "The Avengers and their allies must be willing to sacrifice all in an attempt to defeat the powerful Thanos before his blitz of devastation and ruin puts an end to the universe.",
        trailer: "6ZfuNTqbHE8",
        rating: 4,
        genres: ["Action", "Sci-Fi"]
    },
    "Doctor Strange in the Multiverse of Madness": {
        description: "Doctor Strange teams up with a mysterious teenager who can travel between multiverses to face a powerful enemy determined to harness the power of the Multiverse.",
        trailer: "aWzlQ2N6qqg",
        rating: 3,
        genres: ["Action", "Fantasy", "Horror"]
    },
    "Stranger Things 3": {
        description: "When the Mind Flayer returns to Hawkins, Eleven and her friends discover a secret Russian lab beneath the new Starcourt Mall that threatens their town and the world.",
        trailer: "e4XvO7DItmc",
        rating: 5,
        genres: ["Thriller", "Sci-Fi", "Drama"]
    },
    "Bullet Train": {
        description: "Five assassins aboard a fast-moving bullet train in Japan discover their missions are all connected in this action-comedy thriller.",
        trailer: "0IOsk2Vlc4o",
        rating: 4,
        genres: ["Action", "Comedy", "Thriller"]
    },
    "Alienoid": {
        description: "Guards of an alien prison send the imprisoned to the end of the Goryeo period in Korea. A swordsman chases a divine sword and meets a time-traveling girl in an era of chaos.",
        trailer: "JaRLlh8Pw5A",
        rating: 3,
        genres: ["Action", "Sci-Fi", "Fantasy"]
    },
    "The Super Mario Bros. Movie": {
        description: "A plumber named Mario travels through an underground labyrinth with his brother Luigi, trying to save a captured princess and defeat a villainous king.",
        trailer: "TnGl01FkMMo",
        rating: 4,
        genres: ["Animation", "Comedy", "Family"]
    },
    "Meg 2": {
        description: "A research team encounters multiple Megalodons and other threats while on a deep-sea expedition, and must outrun and outsmart these massive prehistoric sharks.",
        trailer: "dG91B3hHyY4",
        rating: 3,
        genres: ["Action", "Sci-Fi", "Horror"]
    },
    "The Avengers: Infinity War": {
        description: "The Avengers and their allies must be willing to sacrifice all in an attempt to defeat the powerful Thanos before his blitz of devastation and ruin puts an end to the universe.",
        trailer: "6ZfuNTqbHE8",
        rating: 4,
        genres: ["Action", "Sci-Fi"]
    },
    "Wonder Woman 1984": {
        description: "Diana Prince must contend with a Cold War-era villain and an old friend turned enemy in the 1980s as her powers are tested to their limits.",
        trailer: "sfM7_JLk-84",
        rating: 3,
        genres: ["Action", "Fantasy", "Adventure"]
    },
    "Elemental": {
        description: "In a city where fire, water, land and air residents live together, a fiery young woman and a go-with-the-flow guy discover something elemental — how much they have in common.",
        trailer: "hXzcyx9V0xw",
        rating: 4,
        genres: ["Animation", "Romance", "Family"]
    },
    "Dune Part 2": {
        description: "Paul Atreides unites with the Fremen people of Arrakis while on a warpath of revenge against the conspirators who destroyed his family, facing a difficult choice between love and the fate of the universe.",
        trailer: "Way9Dexny3w",
        rating: 5,
        genres: ["Sci-Fi", "Adventure", "Drama"]
    }
};
const featured = [
    {
        title: "Stranger Things 3",
        description: "When the Mind Flayer returns to Hawkins, Eleven and her friends discover a secret Russian lab beneath the new Starcourt Mall that threatens their town and the world.",
        trailer: "6Am4v0C_z8c"
    },
    {
        title: "Dune Part 2",
        description: "Paul Atreides unites with the Fremen people of Arrakis while on a warpath of revenge against the conspirators who destroyed his family.",
        trailer: "Way9Dexny3w"
    },
    {
        title: "Bullet Train",
        description: "Five assassins aboard a fast-moving bullet train in Japan discover their missions are all connected in this action-comedy thriller.",
        trailer: "0IOsk2Vlc4o"
    },
    {
        title: "Avengers Infinity War",
        description: "The Avengers and their allies must be willing to sacrifice all in an attempt to defeat the powerful Thanos before his blitz of devastation and ruin puts an end to the universe.",
        trailer: "6ZfuNTqbHE8"
    },
    {
        title: "Doctor Strange in the Multiverse of Madness",
        description: "Doctor Strange teams up with a mysterious teenager who can travel between multiverses to face a powerful enemy determined to harness the power of the Multiverse.",
        trailer: "aWzlQ2N6qqg"
    },
    {
        title: "The Super Mario Bros. Movie",
        description: "A plumber named Mario travels through an underground labyrinth with his brother Luigi, trying to save a captured princess and defeat a villainous king.",
        trailer: "TnGl01FkMMo"
    },
    {
        title: "Meg 2",
        description: "A research team encounters multiple Megalodons and other threats while on a deep-sea expedition, and must outrun and outsmart these massive prehistoric sharks.",
        trailer: "dG91B3hHyY4"
    },
    {
        title: "Wonder Woman 1984",
        description: "Diana Prince must contend with a Cold War-era villain and an old friend turned enemy in the 1980s as her powers are tested to their limits.",
        trailer: "sfM7_JLk-84"
    },
    {
        title: "Elemental",
        description: "In a city where fire, water, land and air residents live together, a fiery young woman and a go-with-the-flow guy discover something elemental — how much they have in common.",
        trailer: "hXzcyx9V0xw"
    }
];
let featuredIndex = 0;
const heroTitle = document.querySelector(".hero-content h1");
const heroDesc = document.querySelector(".hero-content p");

function updateHero() {
    const current = featured[featuredIndex];
    heroTitle.textContent = current.title;
    heroDesc.textContent = current.description;
    heroVideo.src = `https://www.youtube.com/embed/${current.trailer}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&controls=0&modestbranding=1&playlist=${current.trailer}`;
    featuredIndex = (featuredIndex + 1) % featured.length;
}

// rotate every 30 seconds
setInterval(updateHero, 30000);
let activeVideo = null;
const muteBtn = document.getElementById("muteBtn");
const heroVideo = document.getElementById("heroVideo");

let isMuted = true;
muteBtn.textContent = "🔇";

muteBtn.addEventListener("click", function() {
    isMuted = !isMuted;
    if (isMuted) {
        heroVideo.src = heroVideo.src.replace("mute=0", "mute=1");
        muteBtn.textContent = "🔇";
    } else {
        heroVideo.src = heroVideo.src.replace("mute=1", "mute=0");
        muteBtn.textContent = "🔊";
    }
});
const myList = JSON.parse(localStorage.getItem("myList")) || [];
const myListRow = document.getElementById("myListRow");

function renderMyList() {
    myListRow.innerHTML = "";

    if (myList.length === 0) {
        document.querySelector(".my-list-title").style.display = "none";
        return;
    }

    document.querySelector(".my-list-title").style.display = "block";

    myList.forEach(function(movieItem, index) {
        // create wrapper
        const wrapper = document.createElement("div");
        wrapper.classList.add("movie-wrapper");

        // create image
        const img = document.createElement("img");
        img.src = movieItem.src;
        img.alt = movieItem.alt;
        img.classList.add("movie");

        // create remove button
        const removeBtn = document.createElement("button");
        removeBtn.classList.add("add-btn");
        removeBtn.textContent = "✕";

        // remove from list when clicked
        removeBtn.addEventListener("click", function(e) {
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

document.querySelectorAll(".add-btn").forEach(function(btn) {
    btn.addEventListener("click", function(e) {
        e.stopPropagation(); // prevents modal from opening
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
const searchIcon = document.getElementById("searchIcon");
const searchInput = document.getElementById("searchInput");

searchIcon.addEventListener("click", function() {
    searchInput.classList.toggle("hidden");
    searchInput.classList.toggle("visible");
    if (searchInput.classList.contains("visible")) {
        searchInput.focus();
    }
});


searchInput.addEventListener("input", function() {
    const query = searchInput.value.toLowerCase();

    movies.forEach(function(movie) {
        if (movie.alt.toLowerCase().includes(query)) {
            movie.style.display = "block";
        } else {
            movie.style.display = "none";
        }
    });
});
// loops through every movie
const modalTrailer = document.getElementById("modalTrailer");

movies.forEach(function(movie) {
    movie.addEventListener("click", function() {
        // pause hero
        heroVideo.src = heroVideo.src.replace("autoplay=1", "autoplay=0");

        modal.classList.add("show");
        modalTitle.textContent = movie.alt;
        const data = movieData[movie.alt];
        modalDescription.textContent = data ? data.description : "No description available.";
        if (data && data.trailer) {
            modalTrailer.src = `https://www.youtube.com/embed/${data.trailer}?autoplay=1&mute=1`;
        } else {
            modalTrailer.src = "";
        }
    });
});

// when you click the close button, hide the modal
closeModal.addEventListener("click", function() {
    modal.classList.remove("show");
    modalTrailer.src = ""; // stops the video
});

window.addEventListener("click", function(event) {
    if (event.target === modal) {
        modal.classList.remove("show");
        modalTrailer.src = ""; // stops the video
    }
});
document.querySelectorAll(".movie-wrapper").forEach(function(wrapper) {
    const img = wrapper.querySelector(".movie");
    const data = movieData[img.alt];

    if (data && data.trailer) {
        const container = document.createElement("div");
        container.classList.add("video-container");
        container.style.display = "none";

        const video = document.createElement("iframe");
        video.src = "";
        video.style.border = "none";
        container.appendChild(video);
        wrapper.appendChild(container);

        wrapper.addEventListener("mouseenter", function() {
            heroVideo.src = heroVideo.src.replace("mute=0", "mute=1").replace("autoplay=1", "autoplay=0");
            video.src = `https://www.youtube.com/embed/${data.trailer}?autoplay=1&mute=1&controls=0&modestbranding=1`;
            container.style.display = "block";
            img.style.visibility = "hidden";
        });

        wrapper.addEventListener("mouseleave", function() {
            video.src = "";
            container.style.display = "none";
            img.style.visibility = "visible";
            heroVideo.src = `https://www.youtube.com/embed/6Am4v0C_z8c?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&controls=0&modestbranding=1&playlist=6Am4v0C_z8c`;
        });
    }
    function buildHoverCard(wrapper, img, data) {
    const card = document.createElement("div");
    card.classList.add("hover-card");

    // title
    const title = document.createElement("div");
    title.classList.add("hover-card-title");
    title.textContent = img.alt;

    // stars
    const stars = document.createElement("div");
    stars.classList.add("hover-card-stars");
    const rating = data.rating || 3;
    stars.textContent = "★".repeat(rating) + "☆".repeat(5 - rating);

    // genre tags
    const genreRow = document.createElement("div");
    genreRow.classList.add("hover-card-genres");
    (data.genres || []).forEach(g => {
        const tag = document.createElement("span");
        tag.classList.add("genre-tag");
        tag.textContent = g;
        genreRow.appendChild(tag);
    });

    // add/remove button
    const addBtn = document.createElement("button");
    addBtn.classList.add("hover-add-btn");
    const already = myList.find(m => m.alt === img.alt);
    addBtn.textContent = already ? "✓ In My List" : "+ My List";

    addBtn.addEventListener("click", function(e) {
        e.stopPropagation();
        const inList = myList.find(m => m.alt === img.alt);
        if (!inList) {
            myList.push({ src: img.src, alt: img.alt });
            localStorage.setItem("myList", JSON.stringify(myList));
            addBtn.textContent = "✓ In My List";
        } else {
            const idx = myList.findIndex(m => m.alt === img.alt);
            myList.splice(idx, 1);
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
        document.querySelectorAll(".movie-wrapper").forEach(function(wrapper) {
        const img = wrapper.querySelector(".movie");
        const data = movieData[img.alt];

        if (data) {
            buildHoverCard(wrapper, img, data);  // ← add this line
        }

        // ... rest of your existing hover video code
});
}
});
// dropdown menu functionality
const browseBtn = document.querySelector(".browse-dropdown");
const dropdownMenu = document.querySelector(".dropdown-menu");

browseBtn.addEventListener("click", function(e) {
    e.stopPropagation();
    dropdownMenu.classList.toggle("open");
});

window.addEventListener("click", function() {
    dropdownMenu.classList.remove("open");
});