// Show error message from query string (?error=1) without exposing details
const params = new URLSearchParams(window.location.search);
if (params.get("error")) {
    const msg = document.getElementById("errorMsg");
    msg.textContent = "Incorrect username or password.";
    msg.classList.add("visible");
}
