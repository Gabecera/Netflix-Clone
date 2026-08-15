const LINKS = [
    "FAQ",
    "Help Centre",
    "Account",
    "Media Centre",
    "Investor Relations",
    "Jobs",
    "Ways to Watch",
    "Terms of Use",
    "Privacy",
    "Cookie Preferences",
    "Corporate Information",
    "Contact Us"
];

export default function Footer() {
    return (
        <footer>
            <div className="footer-logo">NETFLIX</div>
            <div className="footer-links">
                {LINKS.map((label) => (
                    <a href="#" key={label}>
                        {label}
                    </a>
                ))}
            </div>
            <p className="footer-copy">© 2024 Netflix Clone. All rights reserved.</p>
        </footer>
    );
}
