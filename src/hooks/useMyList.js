import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "myList";

// Validate localStorage data before using it — prevents malicious or
// malformed data from being rendered into the DOM.
function loadMyList() {
    try {
        const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (!Array.isArray(raw)) return [];

        return raw.filter(
            (item) =>
                item &&
                typeof item.src === "string" &&
                item.src.startsWith("https://image.tmdb.org/") && // only real TMDB image URLs
                typeof item.alt === "string" &&
                item.alt.length > 0 &&
                item.alt.length <= 200
        );
    } catch {
        return [];
    }
}

// Stored entries keep the original { src, alt } shape so existing saved lists
// still load, with the extra fields appended for richer cards.
function toEntry(item) {
    return {
        src: item.poster,
        alt: item.title,
        id: item.id,
        mediaType: item.mediaType,
        backdrop: item.backdrop,
        overview: item.overview,
        rating: item.rating,
        genres: item.genres
    };
}

export function entryToItem(entry) {
    return {
        id: entry.id,
        mediaType: entry.mediaType || "movie",
        title: entry.alt,
        poster: entry.src,
        backdrop: entry.backdrop || "",
        overview: entry.overview || "No description available.",
        rating: entry.rating || 3,
        genres: entry.genres || []
    };
}

export default function useMyList() {
    const [myList, setMyList] = useState(loadMyList);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(myList));
    }, [myList]);

    const isInList = useCallback(
        (title) => myList.some((entry) => entry.alt === title),
        [myList]
    );

    const toggleMyList = useCallback((item) => {
        setMyList((list) =>
            list.some((entry) => entry.alt === item.title)
                ? list.filter((entry) => entry.alt !== item.title)
                : [...list, toEntry(item)]
        );
    }, []);

    const removeFromList = useCallback((title) => {
        setMyList((list) => list.filter((entry) => entry.alt !== title));
    }, []);

    return { myList, isInList, toggleMyList, removeFromList };
}
