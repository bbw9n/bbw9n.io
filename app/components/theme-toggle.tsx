"use client";

// Toggles between light and dark by flipping the `.dark`/`.light` class on
// <html> and persisting the choice. The initial theme is applied before paint
// by an inline script in the root layout, so there's no flash on load.
export function ThemeToggle() {
    const toggle = () => {
        const el = document.documentElement;
        const next = el.classList.contains("dark") ? "light" : "dark";
        el.classList.remove("light", "dark");
        el.classList.add(next);
        el.style.colorScheme = next;
        try {
            localStorage.setItem("theme", next);
        } catch {}
    };

    return (
        <button
            type="button"
            onClick={toggle}
            aria-label="Toggle color theme"
            title="Toggle color theme"
            className="ml-auto flex items-center rounded p-1 m-1 text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        >
            {/* Sun — shown in light mode */}
            <svg
                className="block h-5 w-5 dark:hidden"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
            </svg>
            {/* Moon — shown in dark mode */}
            <svg
                className="hidden h-5 w-5 dark:block"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
        </button>
    );
}
