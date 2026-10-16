import { lang } from "../i18n";

// TMDB's genre ids are stable, so mapping them locally lets a card show its
// genres immediately instead of waiting on a details request per poster.
const MOVIE_GENRES = {
    28: "Action",
    12: "Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    14: "Fantasy",
    36: "History",
    27: "Horror",
    10402: "Music",
    9648: "Mystery",
    10749: "Romance",
    878: "Science Fiction",
    10770: "TV Movie",
    53: "Thriller",
    10752: "War",
    37: "Western"
};

const TV_GENRES = {
    10759: "Action & Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    10762: "Kids",
    9648: "Mystery",
    10763: "News",
    10764: "Reality",
    10765: "Sci-Fi & Fantasy",
    10766: "Soap",
    10767: "Talk",
    10768: "War & Politics",
    37: "Western"
};

// TMDB's own Korean genre names.
const MOVIE_GENRES_KO = {
    28: "액션",
    12: "모험",
    16: "애니메이션",
    35: "코미디",
    80: "범죄",
    99: "다큐멘터리",
    18: "드라마",
    10751: "가족",
    14: "판타지",
    36: "역사",
    27: "공포",
    10402: "음악",
    9648: "미스터리",
    10749: "로맨스",
    878: "SF",
    10770: "TV 영화",
    53: "스릴러",
    10752: "전쟁",
    37: "서부"
};

const TV_GENRES_KO = {
    10759: "액션 & 어드벤처",
    16: "애니메이션",
    35: "코미디",
    80: "범죄",
    99: "다큐멘터리",
    18: "드라마",
    10751: "가족",
    10762: "키즈",
    9648: "미스터리",
    10763: "뉴스",
    10764: "리얼리티",
    10765: "SF & 판타지",
    10766: "연속극",
    10767: "토크",
    10768: "전쟁 & 정치",
    37: "서부"
};

export function mapGenres(ids = [], mediaType = "movie") {
    const table =
        lang === "ko"
            ? mediaType === "tv" ? TV_GENRES_KO : MOVIE_GENRES_KO
            : mediaType === "tv" ? TV_GENRES : MOVIE_GENRES;
    return ids.map((id) => table[id]).filter(Boolean);
}
