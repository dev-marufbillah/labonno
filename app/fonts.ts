import localFont from "next/font/local";

/**
 * Self-hosted brand fonts (latin subset).
 * Self-hosting removes a third-party request from the critical path and keeps the
 * typography identical between local development, previews and production.
 */
export const serif = localFont({
  src: [
    { path: "./fonts/cormorant.woff2", weight: "300 600", style: "normal" },
    { path: "./fonts/cormorant-400-italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-serif",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
  preload: true,
});

export const sans = localFont({
  src: [{ path: "./fonts/jost.woff2", weight: "300 500", style: "normal" }],
  variable: "--font-sans",
  display: "swap",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
  preload: true,
});
