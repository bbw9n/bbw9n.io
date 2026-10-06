// Applies the saved theme (dark on first visit) to <html> before the page
// paints, so there's no flash of the wrong theme on load.
// This must run inline/synchronously in <head>/<body>, so it's serialized
// into a <script>; keeping it in its own component keeps the layout clean.
function themeInit() {
    try {
        const theme = localStorage.getItem("theme") === "light" ? "light" : "dark";
        const el = document.documentElement;
        el.classList.remove("light", "dark");
        el.classList.add(theme);
        el.style.colorScheme = theme;
    } catch {}
}

export function ThemeScript() {
    return (
        <script
            dangerouslySetInnerHTML={{ __html: `(${themeInit.toString()})()` }}
        />
    );
}
