// stores all imgs in list
const movies = document.querySelectorAll(".movie");
//targets popup modal elements
const modal = document.getElementById("movieModal");
//get image in popup modal
const modalImage = document.getElementById("modalImage");
//get movie name in popup modal
const modalTitle = document.getElementById("modalTitle");
//get close button in popup modal
const closeModal = document.getElementById("closeModal");
//modal description for movie
const modalDescription = document.getElementById("modalDescription");
// movie data with descriptions
const movieData = {
    "Avengers Infinity War": {
        description: "The Avengers and their allies must be willing to sacrifice all in an attempt to defeat the powerful Thanos before his blitz of devastation and ruin puts an end to the universe."
    },
    "Doctor Strange in the Multiverse of Madness": {
        description: "Doctor Strange teams up with a mysterious teenager who can travel between multiverses to face a powerful enemy determined to harness the power of the Multiverse."
    },
    "Stranger Things 3": {
        description: "When the Mind Flayer returns to Hawkins, Eleven and her friends discover a secret Russian lab beneath the new Starcourt Mall that threatens their town and the world."
    },
    "Bullet Train": {
        description: "Five assassins aboard a fast-moving bullet train in Japan discover their missions are all connected in this action-comedy thriller."
    },
    "Alienoid": {
        description: "Guards of an alien prison send the imprisoned to the end of the Goryeo period in Korea. A swordsman chases a divine sword and meets a time-traveling girl in an era of chaos."
    },
    "The Super Mario Bros. Movie": {
        description: "A plumber named Mario travels through an underground labyrinth with his brother Luigi, trying to save a captured princess and defeat a villainous king."
    },
    "Meg 2": {
        description: "A research team encounters multiple Megalodons and other threats while on a deep-sea expedition, and must outrun and outsmart these massive prehistoric sharks."
    },
    "The Avengers: Infinity War": {
        description: "The Avengers and their allies must be willing to sacrifice all in an attempt to defeat the powerful Thanos before his blitz of devastation and ruin puts an end to the universe."
    },
    "Wonder Woman 1984": {
        description: "Diana Prince must contend with a Cold War-era villain and an old friend turned enemy in the 1980s as her powers are tested to their limits."
    },
    "Elemental": {
        description: "In a city where fire, water, land and air residents live together, a fiery young woman and a go-with-the-flow guy discover something elemental — how much they have in common."
    },
    "Dune Part 2": {
        description: "Paul Atreides unites with the Fremen people of Arrakis while on a warpath of revenge against the conspirators who destroyed his family, facing a difficult choice between love and the fate of the universe."
    }
};
const searchInput = document.getElementById("searchInput");

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
movies.forEach(function(movie) {
    movie.addEventListener("click", function() {
        modal.classList.add("show");
        modalImage.src = movie.src;
        modalTitle.textContent = movie.alt;

        // look up description or fall back to a default
        const data = movieData[movie.alt];
        modalDescription.textContent = data ? data.description : "No description available.";
    });
});

// when you click the close button, hide the modal
closeModal.addEventListener("click", function() {
    modal.classList.remove("show"); // removes show class to hide modal
});

// when you click outside the modal content, hide the modal
window.addEventListener("click", function(event) {
    if (event.target === modal) {
        modal.classList.remove("show"); // removes show class to hide modal
    }
});

