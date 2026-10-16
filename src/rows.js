// Which rows exist, where their data comes from, and which nav views show them.
// This replaces the hand-written <section data-views="..."> markup in the old
// index.html — adding a row is now one entry here.

export const MOVIE_ROWS = [
    {
        id: "trending",
        titleKey: "row.trending",
        endpoint: "/trending/movie/week",
        type: "movie",
        views: ["home", "movies", "new-popular"]
    },
    {
        id: "action",
        titleKey: "row.action",
        endpoint: "/discover/movie?with_genres=28&sort_by=popularity.desc",
        type: "movie",
        views: ["home", "movies"]
    },
    {
        id: "comedy",
        titleKey: "row.comedy",
        endpoint: "/discover/movie?with_genres=35&sort_by=popularity.desc",
        type: "movie",
        views: ["home", "movies"]
    },
    {
        id: "scifi",
        titleKey: "row.scifi",
        endpoint: "/discover/movie?with_genres=878&sort_by=popularity.desc",
        type: "movie",
        views: ["home", "movies"]
    },
    {
        id: "popular",
        titleKey: "row.popular",
        endpoint: "/movie/popular",
        type: "movie",
        views: ["home", "movies", "new-popular"]
    },
    {
        id: "newReleases",
        titleKey: "row.newReleases",
        endpoint: "/movie/now_playing",
        type: "movie",
        views: ["home", "movies", "new-popular"]
    }
];

export const SHOW_ROWS = [
    {
        id: "popularShows",
        titleKey: "row.popularShows",
        endpoint: "/tv/popular",
        type: "tv",
        views: ["shows"]
    },
    {
        id: "drama",
        titleKey: "row.drama",
        endpoint: "/discover/tv?with_genres=18&sort_by=popularity.desc",
        type: "tv",
        views: ["shows"]
    },
    {
        id: "reality",
        titleKey: "row.reality",
        endpoint: "/discover/tv?with_genres=10764&sort_by=popularity.desc",
        type: "tv",
        views: ["shows"]
    }
];

// Views that keep the hero video at the top of the page.
export const HERO_VIEWS = ["home", "movies", "shows", "new-popular"];
