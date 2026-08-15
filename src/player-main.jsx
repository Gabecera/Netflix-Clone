import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Player from "./pages/Player";
import "./player.css";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <Player />
    </StrictMode>
);
