/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "var(--ink)",
        pine: "var(--pine)",
        slate: "var(--slate)",
        "moss-surface": "var(--moss-surface)",
        border: "var(--border)",
        ivory: "var(--ivory)",
        sage: "var(--sage)",
        muted: "var(--muted)",
        primary: "var(--primary)",
        "primary-hover": "var(--primary-hover)",
        "primary-soft": "var(--primary-soft)",
        info: "var(--info)",
        ai: "var(--ai)",
        warning: "var(--warning)",
        high: "var(--high)",
        critical: "var(--critical)",
      },
      fontFamily: {
        sans: ["Inter", "Geist", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
}
