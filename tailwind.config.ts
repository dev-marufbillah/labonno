import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1.25rem", md: "2rem", lg: "2.5rem" },
      screens: { "2xl": "1440px" },
    },
    extend: {
      colors: {
        cream: { DEFAULT: "#FAF6F0", 50: "#FDFBF7", 100: "#F7F1E8", 200: "#F1E8DB", 300: "#E8DCCC" },
        ink: { DEFAULT: "#1C1B18", soft: "#3A362F", muted: "#6E675C" },
        gold: { DEFAULT: "#A9906B", light: "#C4AE8B", dark: "#8B7350" },
        line: "#E4DACB",
        footer: "#1E1D1A",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Cormorant Garamond", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Jost", "Helvetica Neue", "sans-serif"],
      },
      letterSpacing: { label: "0.22em", wide2: "0.14em" },
      maxWidth: { shell: "1400px", prose2: "68ch" },
      boxShadow: {
        luxe: "0 18px 60px -24px rgba(28,27,24,0.28)",
        card: "0 10px 40px -24px rgba(28,27,24,0.25)",
      },
      transitionTimingFunction: { luxe: "cubic-bezier(0.22, 1, 0.36, 1)" },
      keyframes: {
        "fade-up": { "0%": { opacity: "0", transform: "translateY(14px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        shimmer: { "100%": { transform: "translateX(100%)" } },
        marquee: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
      },
      animation: {
        "fade-up": "fade-up 0.8s cubic-bezier(0.22,1,0.36,1) both",
        "fade-in": "fade-in 0.6s ease-out both",
        shimmer: "shimmer 1.8s infinite",
        marquee: "marquee 26s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
