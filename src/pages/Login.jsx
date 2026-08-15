import { useState } from "react";

export default function Login() {
    // The server redirects back to /login?error=1 on a failed attempt —
    // it never says which field was wrong.
    const [failed] = useState(() => Boolean(new URLSearchParams(window.location.search).get("error")));

    return (
        <>
            <div className="bg" />
            <div className="bg-overlay" />

            <nav>
                <div className="logo">NETFLIX</div>
            </nav>

            <div className="card-wrap">
                <div className="card">
                    <h1>Sign In</h1>

                    <div className={`error-msg${failed ? " visible" : ""}`}>
                        Incorrect username or password.
                    </div>

                    {/* A plain form post — Express sets the session cookie and redirects. */}
                    <form method="POST" action="/login">
                        <div className="field">
                            <input
                                type="text"
                                id="username"
                                name="username"
                                placeholder=" "
                                maxLength={64}
                                autoComplete="username"
                                required
                            />
                            <label htmlFor="username">Username</label>
                        </div>
                        <div className="field">
                            <input
                                type="password"
                                id="password"
                                name="password"
                                placeholder=" "
                                maxLength={128}
                                autoComplete="current-password"
                                required
                            />
                            <label htmlFor="password">Password</label>
                        </div>
                        <button type="submit" className="submit-btn">
                            Sign In
                        </button>
                    </form>

                    <div className="or-divider">or</div>

                    <a href="/guest" className="guest-btn">
                        Continue as Guest
                    </a>
                </div>
            </div>
        </>
    );
}
