/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#141414",
          secondary: "#1C1C1C",
          surface: "#181818",
          linen: "#ECEAE5",
          obsidian: "#0E0F0E",
        },
        fg: {
          DEFAULT: "#BAC4B8",
          dim: "#6E756C",
          bright: "#F0F4EE",
          ochre: "#C59A3F",
          charcoal: "#1C1B18",
          muted: "#827E74",
        },
        border: "rgba(255,255,255,0.08)",
      },
      fontFamily: {
        display: ["'Antonio'", "'Bebas Neue'", "sans-serif"],
        serif: ["var(--font-newsreader)", "Georgia", "serif"],
        mono: ["var(--font-geist-mono)", "'Space Mono'", "monospace"],
        sans: ["var(--font-geist-sans)", "sans-serif"],
      },
      transitionTimingFunction: {
        expo: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      transitionDuration: {
        600: "600ms",
        800: "800ms",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "fadeIn 0.6s ease forwards",
      },
    },
  },
  plugins: [],
};

export default config;
