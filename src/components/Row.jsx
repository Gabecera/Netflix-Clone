import useRowArrows from "../hooks/useRowArrows";
import MovieCard from "./MovieCard";

export default function Row({ title, items = [], loading = false, showRemove = false }) {
    const {
        scrollerRef,
        rowRef,
        offset,
        scrollLeft,
        scrollRight,
        canScrollLeft,
        canScrollRight
    } = useRowArrows(items.length);

    return (
        <>
            {title && <h2 className="row-title">{title}</h2>}
            <div className="row-outer">
                <div className="row-container">
                    <button
                        className="arrow arrow-left"
                        style={{ opacity: canScrollLeft ? 1 : 0 }}
                        onClick={scrollLeft}
                    >
                        ‹
                    </button>

                    <div className="row-clip">
                        <div className="row-scroll" ref={scrollerRef}>
                            <div
                                className="row"
                                ref={rowRef}
                                style={{ transform: `translateX(-${offset}px)` }}
                            >
                                {loading && items.length === 0 ? (
                                    <p style={{ padding: 20, color: "#aaa" }}>Loading…</p>
                                ) : (
                                    items.map((item) => (
                                        <MovieCard
                                            key={`${item.mediaType}-${item.id ?? item.title}`}
                                            item={item}
                                            showRemove={showRemove}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        className="arrow arrow-right"
                        style={{ opacity: canScrollRight ? 1 : 0 }}
                        onClick={scrollRight}
                    >
                        ›
                    </button>
                </div>
            </div>
        </>
    );
}
