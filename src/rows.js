// Which rows exist, where their data comes from, and which nav views show them.
// This replaces the hand-written <section data-views="..."> markup in the old
// index.html — adding a row is now one entry here.

export const MOVIE_ROWS = [
    {
        id: "trending",
        title: "Trending",
        endpoint: "/trending/movie/week?language=en-US",
        type: "movie",
        views: ["home", "movies", "new-popular"]
    },
    {
        id: "action",
        title: "Action",
        endpoint: "/discover/movie?with_genres=28&sort_by=popularity.desc",
        type: "movie",
        views: ["home", "movies"]
    },
    {
        id: "comedy",
        title: "Comedy",
        endpoint: "/discover/movie?with_genres=35&sort_by=popularity.desc",
        type: "movie",
        views: ["home", "movies"]
    },
    {
        id: "scifi",
        title: "Sci-Fi",
        endpoint: "/discover/movie?with_genres=878&sort_by=popularity.desc",
        type: "movie",
        views: ["home", "movies"]
    },
    {
        id: "popular",
        title: "Popular",
        endpoint: "/movie/popular?language=en-US",
        type: "movie",
        views: ["home", "movies", "new-popular"]
    },
    {
        id: "newReleases",
        title: "New Releases",
        endpoint: "/movie/now_playing?language=en-US",
        type: "movie",
        views: ["home", "movies", "new-popular"]
    }
];

export const SHOW_ROWS = [
    {
        id: "popularShows",
        title: "Popular Shows",
        endpoint: "/tv/popular?language=en-US",
        type: "tv",
        views: ["shows"]
    },
    {
        id: "drama",
        title: "Drama",
        endpoint: "/discover/tv?with_genres=18&sort_by=popularity.desc",
        type: "tv",
        views: ["shows"]
    },
    {
        id: "reality",
        title: "Reality",
        endpoint: "/discover/tv?with_genres=10764&sort_by=popularity.desc",
        type: "tv",
        views: ["shows"]
    }
];

// Views that keep the hero video at the top of the page.
export const HERO_VIEWS = ["home", "movies", "shows", "new-popular"];
