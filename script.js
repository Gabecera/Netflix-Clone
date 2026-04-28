const movies = document.querySelectorAll('.movie');

movies.forEach(function(movie) {
    movie.addEventListener("click", function() {
        console.log(movie.alt);
    });
});