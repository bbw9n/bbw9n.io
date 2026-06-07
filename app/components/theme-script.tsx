// Applies the saved theme (or the OS preference on first visit) to <html>
// before the page paints, so there's no flash of the wrong theme on load.
// This must run inline/synchronously in <head>/<body>, so it's serialized
// into a <script>; keeping it in its own component keeps the layout clean.
function themeInit() {
    try {
        const stored = localStorage.getItem("theme");
        const theme =
            stored === "light" || stored === "dark"
                ? stored
                : window.matchMedia("(prefers-color-scheme: dark)").matches
                  ? "dark"
                  : "light";
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
