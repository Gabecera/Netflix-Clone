// =====================
// Language (EN / KO)
// =====================
// The saved choice wins; on a first visit fall back to the browser's language.
// Switching reloads the page, so the language is fixed for the page's
// lifetime and can be read as a plain constant instead of React state.

const STORAGE_KEY = "lang";
export const LANGUAGES = ["en", "ko"];

function detectLang() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (LANGUAGES.includes(saved)) return saved;
    } catch {
        // storage blocked — fall through to the browser language
    }
    return (navigator.language || "").toLowerCase().startsWith("ko") ? "ko" : "en";
}

export const lang = detectLang();

// The value TMDB expects in its `language=` parameter.
export const tmdbLang = lang === "ko" ? "ko-KR" : "en-US";

document.documentElement.lang = lang;

// Reload so every row, hover card and the hero refetch in the new language.
export function setLang(next) {
    if (!LANGUAGES.includes(next) || next === lang) return;
    try {
        localStorage.setItem(STORAGE_KEY, next);
    } catch {
        return;
    }
    window.location.reload();
}

const STRINGS = {
    en: {
        "nav.home": "Home",
        "nav.shows": "Shows",
        "nav.movies": "Movies",
        "nav.games": "Games",
        "nav.newPopular": "New & Popular",
        "nav.myList": "My List",
        "nav.languages": "Browse by Languages",
        "nav.browse": "Browse",
        "nav.kids": "Kids",
        "nav.searchPlaceholder": "Search movies...",
        "profile.guest": "Guest",
        "profile.manage": "Manage Profiles",
        "profile.account": "Account",
        "profile.help": "Help Centre",
        "profile.signOut": "Sign out of Netflix",
        "row.searchResults": "Search Results",
        "row.myList": "My List",
        "row.trending": "Trending",
        "row.action": "Action",
        "row.comedy": "Comedy",
        "row.scifi": "Sci-Fi",
        "row.popular": "Popular",
        "row.newReleases": "New Releases",
        "row.popularShows": "Popular Shows",
        "row.drama": "Drama",
        "row.reality": "Reality",
        "myList.emptyBefore": "You haven't added anything yet. Hover over a title and click ",
        "myList.emptyAfter": " to save it here.",
        "myList.add": "+ My List",
        "myList.added": "✓ In My List",
        "myList.remove": "Remove from My List",
        "hero.play": "▶ Play",
        "hero.moreInfo": "More Info",
        "hero.mute": "Mute/Unmute",
        "card.play": "Play",
        "modal.play": "Play",
        "games.title": "Games",
        "games.desc": "Netflix Games is available on mobile. Download the Netflix app to play.",
        "languages.title": "Browse by Language",
        "languages.movies": "{lang} Movies",
        "languages.shows": "{lang} Shows",
        "common.loading": "Loading…",
        "common.noDescription": "No description available.",
        "lang.English": "English",
        "lang.Spanish": "Spanish",
        "lang.French": "French",
        "lang.Korean": "Korean",
        "lang.Japanese": "Japanese",
        "lang.Hindi": "Hindi",
        "lang.Portuguese": "Portuguese",
        "lang.German": "German",
        "lang.Italian": "Italian",
        "lang.Mandarin": "Mandarin",
        "lang.Arabic": "Arabic",
        "lang.Turkish": "Turkish",
        "footer.faq": "FAQ",
        "footer.help": "Help Centre",
        "footer.account": "Account",
        "footer.media": "Media Centre",
        "footer.investors": "Investor Relations",
        "footer.jobs": "Jobs",
        "footer.waysToWatch": "Ways to Watch",
        "footer.terms": "Terms of Use",
        "footer.privacy": "Privacy",
        "footer.cookies": "Cookie Preferences",
        "footer.corporate": "Corporate Information",
        "footer.contact": "Contact Us"
    },
    ko: {
        "nav.home": "홈",
        "nav.shows": "시리즈",
        "nav.movies": "영화",
        "nav.games": "게임",
        "nav.newPopular": "NEW! 요즘 대세 콘텐츠",
        "nav.myList": "내가 찜한 리스트",
        "nav.languages": "언어별로 찾아보기",
        "nav.browse": "메뉴",
        "nav.kids": "키즈",
        "nav.searchPlaceholder": "영화 검색...",
        "profile.guest": "게스트",
        "profile.manage": "프로필 관리",
        "profile.account": "계정",
        "profile.help": "고객 센터",
        "profile.signOut": "넷플릭스에서 로그아웃",
        "row.searchResults": "검색 결과",
        "row.myList": "내가 찜한 리스트",
        "row.trending": "지금 뜨는 콘텐츠",
        "row.action": "액션",
        "row.comedy": "코미디",
        "row.scifi": "SF",
        "row.popular": "인기 콘텐츠",
        "row.newReleases": "신작",
        "row.popularShows": "인기 시리즈",
        "row.drama": "드라마",
        "row.reality": "리얼리티",
        "myList.emptyBefore": "아직 찜한 콘텐츠가 없습니다. 콘텐츠에 마우스를 올리고 ",
        "myList.emptyAfter": "를 눌러 저장하세요.",
        "myList.add": "+ 찜하기",
        "myList.added": "✓ 찜 완료",
        "myList.remove": "찜 목록에서 삭제",
        "hero.play": "▶ 재생",
        "hero.moreInfo": "상세 정보",
        "hero.mute": "음소거/음소거 해제",
        "card.play": "재생",
        "modal.play": "재생",
        "games.title": "게임",
        "games.desc": "넷플릭스 게임은 모바일에서 이용할 수 있습니다. 넷플릭스 앱을 다운로드해 플레이하세요.",
        "languages.title": "언어별로 찾아보기",
        "languages.movies": "{lang} 영화",
        "languages.shows": "{lang} 시리즈",
        "common.loading": "불러오는 중…",
        "common.noDescription": "줄거리 정보가 없습니다.",
        "lang.English": "영어",
        "lang.Spanish": "스페인어",
        "lang.French": "프랑스어",
        "lang.Korean": "한국어",
        "lang.Japanese": "일본어",
        "lang.Hindi": "힌디어",
        "lang.Portuguese": "포르투갈어",
        "lang.German": "독일어",
        "lang.Italian": "이탈리아어",
        "lang.Mandarin": "중국어",
        "lang.Arabic": "아랍어",
        "lang.Turkish": "터키어",
        "footer.faq": "자주 묻는 질문",
        "footer.help": "고객 센터",
        "footer.account": "계정",
        "footer.media": "미디어 센터",
        "footer.investors": "투자 정보(IR)",
        "footer.jobs": "입사 정보",
        "footer.waysToWatch": "시청 방법",
        "footer.terms": "이용 약관",
        "footer.privacy": "개인정보",
        "footer.cookies": "쿠키 설정",
        "footer.corporate": "회사 정보",
        "footer.contact": "문의하기"
    }
};

// Look up a UI string (falling back to English) with {placeholder} substitution.
export function t(key, vars = {}) {
    const str = STRINGS[lang][key] ?? STRINGS.en[key] ?? key;
    return str.replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? "");
}
