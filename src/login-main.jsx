import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Login from "./pages/Login";
import "./login.css";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <Login />
    </StrictMode>
);
