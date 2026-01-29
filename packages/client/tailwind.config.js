/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                "game-bg": "#0f0f23",
                "game-primary": "#6366f1",
                "game-secondary": "#22d3ee",
                "game-accent": "#f43f5e",
                "game-success": "#10b981",
                "game-warning": "#f59e0b",
            },
            animation: {
                "pulse-fast":
                    "pulse 0.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                glow: "glow 2s ease-in-out infinite alternate",
            },
            keyframes: {
                glow: {
                    "0%": {
                        boxShadow:
                            "0 0 5px currentColor, 0 0 10px currentColor",
                    },
                    "100%": {
                        boxShadow:
                            "0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor",
                    },
                },
            },
        },
    },
    plugins: [],
};
