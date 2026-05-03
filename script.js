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
        trailer: "6ZfuNTqbHE8"  // this is the YouTube video ID
    },
    "Doctor Strange in the Multiverse of Madness": {
        description: "Doctor Strange teams up with a mysterious teenager who can travel between multiverses to face a powerful enemy determined to harness the power of the Multiverse.",
        trailer: "aWzlQ2N6qqg"  // this is the YouTube video ID
    },
    "Stranger Things 3": {
        description: "When the Mind Flayer returns to Hawkins, Eleven and her friends discover a secret Russian lab beneath the new Starcourt Mall that threatens their town and the world.",
        trailer: "e4XvO7DItmc"  // this is the YouTube video ID
    },
    "Bullet Train": {
        description: "Five assassins aboard a fast-moving bullet train in Japan discover their missions are all connected in this action-comedy thriller.",
        trailer: "0IOsk2Vlc4o"  // this is the YouTube video ID
    },
    "Alienoid": {
        description: "Guards of an alien prison send the imprisoned to the end of the Goryeo period in Korea. A swordsman chases a divine sword and meets a time-traveling girl in an era of chaos.",
        trailer: "JaRLlh8Pw5A"  // this is the YouTube video ID
    },
    "The Super Mario Bros. Movie": {
        description: "A plumber named Mario travels through an underground labyrinth with his brother Luigi, trying to save a captured princess and defeat a villainous king.",
        trailer: "TnGl01FkMMo"  // this is the YouTube video ID
    },
    "Meg 2": {
        description: "A research team encounters multiple Megalodons and other threats while on a deep-sea expedition, and must outrun and outsmart these massive prehistoric sharks.",
        trailer: "dG91B3hHyY4"  // this is the YouTube video ID
    },
    "The Avengers: Infinity War": {
        description: "The Avengers and their allies must be willing to sacrifice all in an attempt to defeat the powerful Thanos before his blitz of devastation and ruin puts an end to the universe.",
        trailer: "6ZfuNTqbHE8"  // this is the YouTube video ID
    },
    "Wonder Woman 1984": {
        description: "Diana Prince must contend with a Cold War-era villain and an old friend turned enemy in the 1980s as her powers are tested to their limits.",
        trailer: "sfM7_JLk-84"  // this is the YouTube video ID
    },
    "Elemental": {
        description: "In a city where fire, water, land and air residents live together, a fiery young woman and a go-with-the-flow guy discover something elemental — how much they have in common.",
        trailer: "hXzcyx9V0xw" // this is the YouTube video ID
    },
    "Dune Part 2": {
        description: "Paul Atreides unites with the Fremen people of Arrakis while on a warpath of revenge against the conspirators who destroyed his family, facing a difficult choice between love and the fate of the universe.",
        trailer: "Way9Dexny3w" // this is the YouTube video ID
    }
};
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
        modal.classList.add("show");
        modalTitle.textContent = movie.alt;

        const data = movieData[movie.alt];
        modalDescription.textContent = data ? data.description : "No description available.";

        // load the trailer if one exists
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
            video.src = `https://www.youtube.com/embed/${data.trailer}?autoplay=1&mute=1&controls=0&modestbranding=1`;
            container.style.display = "block";
            img.style.visibility = "hidden";
        });

        wrapper.addEventListener("mouseleave", function() {
            video.src = "";
            container.style.display = "none";
            img.style.visibility = "visible";
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