import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

const STEP = 500;

// Replaces the four near-identical copies of the arrow logic that lived in
// script.js. One hook, used by every row.
export default function useRowArrows(itemCount) {
    const scrollerRef = useRef(null);
    const rowRef = useRef(null);
    const [offset, setOffset] = useState(0);
    const [maxScroll, setMaxScroll] = useState(0);

    const measure = useCallback(() => {
        const scroller = scrollerRef.current;
        const row = rowRef.current;
        if (!scroller || !row) return;
        setMaxScroll(Math.max(0, row.scrollWidth - scroller.offsetWidth));
    }, []);

    useLayoutEffect(() => {
        measure();
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
    }, [measure, itemCount]);

    // Keep the row from being scrolled past its new end after a resize.
    useEffect(() => {
        setOffset((current) => Math.min(current, maxScroll));
    }, [maxScroll]);

    const scrollRight = () => setOffset((current) => Math.min(current + STEP, maxScroll));
    const scrollLeft = () => setOffset((current) => Math.max(current - STEP, 0));

    return {
        scrollerRef,
        rowRef,
        offset,
        scrollLeft,
        scrollRight,
        canScrollLeft: offset > 0,
        canScrollRight: offset < maxScroll
    };
}
