import { useCallback, useEffect, useRef, useState } from "react";
import { useClickOutside, useScrolled } from "../hooks/usePageEffects";
import { lang, setLang, t } from "../i18n";

const NAV_ITEMS = [
    { view: "home", labelKey: "nav.home" },
    { view: "shows", labelKey: "nav.shows" },
    { view: "movies", labelKey: "nav.movies" },
    { view: "games", labelKey: "nav.games" },
    { view: "new-popular", labelKey: "nav.newPopular" },
    { view: "my-list", labelKey: "nav.myList" },
    { view: "languages", labelKey: "nav.languages" }
];

const LANG_OPTIONS = [
    { code: "en", label: "EN" },
    { code: "ko", label: "한국어" }
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
                    {t(item.labelKey)}
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
                    {t("nav.browse")} <span className="dropdown-arrow">▼</span>
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
                    placeholder={t("nav.searchPlaceholder")}
                    maxLength={100}
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                />
                <div className="lang-toggle" role="group" aria-label="Language">
                    {LANG_OPTIONS.map((option) => (
                        <button
                            type="button"
                            key={option.code}
                            className={lang === option.code ? "active" : undefined}
                            aria-pressed={lang === option.code}
                            onClick={(e) => {
                                e.stopPropagation();
                                setLang(option.code);
                            }}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
                <span className="nav-kids">{t("nav.kids")}</span>
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
                            <span>{t("profile.guest")}</span>
                        </div>
                        <hr className="profile-divider" />
                        <ul className="profile-options">
                            <li>{t("profile.manage")}</li>
                            <li>{t("profile.account")}</li>
                            <li>{t("profile.help")}</li>
                            <hr className="profile-divider" />
                            <li
                                className="sign-out"
                                onClick={() => {
                                    window.location.href = "/logout";
                                }}
                            >
                                {t("profile.signOut")}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </nav>
    );
}
