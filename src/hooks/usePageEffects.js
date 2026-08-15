import { useEffect, useState } from "react";

// Nav turns solid once the page is scrolled past the hero gradient.
export function useScrolled(threshold = 50) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > threshold);
        onScroll();
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, [threshold]);

    return scrolled;
}

// Trackpads fire horizontal wheel events that would drag the whole page
// sideways — rows are scrolled with the arrows instead.
export function useBlockHorizontalScroll() {
    useEffect(() => {
        const onWheel = (e) => {
            if (Math.abs(e.deltaX) >= Math.abs(e.deltaY)) e.preventDefault();
        };
        document.addEventListener("wheel", onWheel, { passive: false });
        return () => document.removeEventListener("wheel", onWheel);
    }, []);
}

// Closes dropdowns when anything outside them is clicked.
export function useClickOutside(onOutside) {
    useEffect(() => {
        window.addEventListener("click", onOutside);
        return () => window.removeEventListener("click", onOutside);
    }, [onOutside]);
}
