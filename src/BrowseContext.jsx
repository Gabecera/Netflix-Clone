import { createContext, useContext } from "react";

// Shared by every poster on the page: My List membership, and the flag the
// hero watches so it can swap its video for a still while a card is hovered.
export const BrowseContext = createContext({
    isInList: () => false,
    toggleMyList: () => {},
    removeFromList: () => {},
    setCardHovered: () => {}
});

export const useBrowse = () => useContext(BrowseContext);
