import { useCallback, useEffect, useRef, useState } from "react";
import { useClickOutside, useScrolled } from "../hooks/usePageEffects";

const NAV_ITEMS = [
    { view: "home", label: "Home" },
    { view: "shows", label: "Shows" },
    { view: "movies", label: "Movies" },
    { view: "games", label: "Games" },
    { view: "new-popular", label: "New & Popular" },
    { view: "my-list", label: "My List" },
    { view: "languages", label: "Browse by Languages" }
];

export default function Navbar({ view, onViewChange, query, onQueryChange }) {
    const scrolled = useScrolled();
    const [searchOpen, setSearchOpen] = useState(false);
    const [browseOpen, setBrowseOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const searchRef = useRef(null);

    const closeMenus = useCallback(() => {
        setBrowseOpen(false);
        setProfileOpen(false);
    }, []);
    useClickOutside(closeMenus);

    useEffect(() => {
        if (searchOpen) searchRef.current?.focus();
    }, [searchOpen]);

    function toggleSearch() {
        setSearchOpen((open) => {
            if (open) onQueryChange("");
            return !open;
        });
    }

    function selectView(nextView) {
        setSearchOpen(false);
        setBrowseOpen(false);
        onViewChange(nextView);
    }

    const navList = (className) => (
        <ul className={className}>
            {NAV_ITEMS.map((item) => (
                <li
                    key={item.view}
                    className={view === item.view ? "active" : undefined}
                    onClick={(e) => {
                        e.stopPropagation();
                        selectView(item.view);
                    }}
                >
                    {item.label}
                </li>
            ))}
        </ul>
    );

    return (
        <nav className={scrolled ? "scrolled" : undefined}>
            <a
                href="#"
                className="logo-link"
                onClick={(e) => {
                    e.preventDefault();
                    selectView("home");
                }}
            >
                <h1 className="logo">NETFLIX</h1>
            </a>

            {navList("nav-links desktop-links")}

            <div
                className="browse-dropdown"
                onClick={(e) => {
                    e.stopPropagation();
                    setBrowseOpen((open) => !open);
                }}
            >
                <span>
                    Browse <span className="dropdown-arrow">▼</span>
                </span>
                {navList(`dropdown-menu${browseOpen ? " open" : ""}`)}
            </div>

            <div className="nav-right">
                <span id="searchIcon" onClick={toggleSearch}>
                    🔍
                </span>
                <input
                    type="text"
                    id="searchInput"
                    ref={searchRef}
                    className={searchOpen ? "visible" : "hidden"}
                    placeholder="Search movies..."
                    maxLength={100}
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                />
                <span className="nav-kids">Kids</span>
                <span className="nav-bell">🔔</span>

                <div className="profile-menu">
                    <div
                        className="profile-avatar-wrapper"
                        onClick={(e) => {
                            e.stopPropagation();
                            setProfileOpen((open) => !open);
                        }}
                    >
                        <div className="profile-avatar">G</div>
                        <span className="profile-caret">▾</span>
                    </div>

                    <div className={`profile-dropdown${profileOpen ? " open" : ""}`}>
                        <div className="profile-dropdown-header">
                            <div className="profile-avatar-sm">G</div>
                            <span>Guest</span>
                        </div>
                        <hr className="profile-divider" />
                        <ul className="profile-options">
                            <li>Manage Profiles</li>
                            <li>Account</li>
                            <li>Help Centre</li>
                            <hr className="profile-divider" />
                            <li
                                className="sign-out"
                                onClick={() => {
                                    window.location.href = "/logout";
                                }}
                            >
                                Sign out of Netflix
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </nav>
    );
}
