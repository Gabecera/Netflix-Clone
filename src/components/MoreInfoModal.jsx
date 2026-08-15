export default function MoreInfoModal({ item, onClose }) {
    const open = Boolean(item);

    return (
        <div className={`modal${open ? " show" : ""}`}>
            <div className="modal-content">
                <span id="closeModal" className="close" onClick={onClose}>
                    ×
                </span>

                <div className="modal-video-container">
                    {open && item.trailer && (
                        <iframe
                            id="modalTrailer"
                            title={`${item.title} trailer`}
                            src={`https://www.youtube.com/embed/${item.trailer}?autoplay=1&mute=1&enablejsapi=1`}
                            frameBorder="0"
                            allowFullScreen
                            sandbox="allow-scripts allow-same-origin allow-presentation"
                        />
                    )}
                </div>

                <h2 id="modalTitle">{item?.title || ""}</h2>
                <p id="modalDescription">{item?.overview || ""}</p>
                <button
                    className="btn"
                    onClick={() => {
                        if (item?.trailer) {
                            window.open(`https://www.youtube.com/watch?v=${item.trailer}`, "_blank");
                        }
                    }}
                >
                    Play
                </button>
            </div>
        </div>
    );
}
