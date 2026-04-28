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

// loops through every movie
movies.forEach(function(movie) {
    //when a movie is clicked, open the modal and set the image and title to match the clicked movie
    movie.addEventListener("click", function() {
        modal.classList.add("show"); // adds show class to modal to make it visible
        
        // takes image and put inside popup
        modalImage.src = movie.src;
        //take alt movie name and display in popup
        modalTitle.textContent = movie.alt;
        modalDescription.textContent = "This is a great movie!";
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

const modalDescription = document.getElementById("modalDescription");

modalDescription.textContent = "This is a great movie!";
