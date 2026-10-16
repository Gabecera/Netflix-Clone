import { t } from "../i18n";

const LINKS = [
    "footer.faq",
    "footer.help",
    "footer.account",
    "footer.media",
    "footer.investors",
    "footer.jobs",
    "footer.waysToWatch",
    "footer.terms",
    "footer.privacy",
    "footer.cookies",
    "footer.corporate",
    "footer.contact"
];

export default function Footer() {
    return (
        <footer>
            <div className="footer-logo">NETFLIX</div>
            <div className="footer-links">
                {LINKS.map((key) => (
                    <a href="#" key={key}>
                        {t(key)}
                    </a>
                ))}
            </div>
            <p className="footer-copy">© 2024 Netflix Clone. All rights reserved.</p>
        </footer>
    );
}
