import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        nexus: {
          gold: "#C9A227",
          "bold-gold": "#FFD700",
          emerald: "#00E676",
          "tropical-emerald": "#00BFA5",
          "deep-emerald": "#004D40",
          cyan: "#00E5FF",
          purple: "#7C4DFF",
          dark: "#0A0E17",
          "dark-secondary": "#111827",
          "dark-card": "#131A2B",
          "dark-border": "#1E293B",
          glow: "#00E676",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Orbitron", "monospace"],
        mono: ["JetBrains Mono", "monospace"],
      },
      backgroundImage: {
        "nexus-gradient": "linear-gradient(135deg, #00E676 0%, #00BFA5 50%, #004D40 100%)",
        "nexus-gold-gradient": "linear-gradient(135deg, #FFD700 0%, #C9A227 50%, #8B6914 100%)",
        "nexus-radial": "radial-gradient(ellipse at center, rgba(0,230,118,0.15) 0%, transparent 70%)",
        "card-gradient": "linear-gradient(135deg, rgba(0,230,118,0.05) 0%, rgba(0,191,165,0.05) 100%)",
      },
      boxShadow: {
        "nexus-glow": "0 0 20px rgba(0, 230, 118, 0.3), 0 0 60px rgba(0, 230, 118, 0.1)",
        "nexus-gold-glow": "0 0 20px rgba(255, 215, 0, 0.3), 0 0 60px rgba(255, 215, 0, 0.1)",
        "card-glow": "0 4px 30px rgba(0, 230, 118, 0.1)",
        "inner-glow": "inset 0 0 30px rgba(0, 230, 118, 0.05)",
      },
      animation: {
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "spin-slow": "spin 20s linear infinite",
        "shimmer": "shimmer 2s linear infinite",
        "glow-line": "glowLine 3s ease-in-out infinite",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(0, 230, 118, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(0, 230, 118, 0.6)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        glowLine: {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
