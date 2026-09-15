/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paper-like warm off-white — the dominant base tone.
        beige: {
          DEFAULT: "#ECE4D4",
          light: "#F6F1E6",
          dark: "#D8CBAE",
        },
        // High-contrast text/borders/blades.
        ink: {
          DEFAULT: "#141311",
          light: "#2A2823",
          soft: "#3F3C35",
        },
        // Minimal secondary accent — used sparingly for active/selection states only.
        accent: {
          DEFAULT: "#C23B2E",
        },
      },
      fontFamily: {
        // Persona 3/4 use Fontworks' FOT-Chiaro Std B (display) and
        // FOT-Skip Std B (dialogue/UI). Each stack names the real face first,
        // then the Adobe Fonts web name, then a free OFL stand-in:
        //   - locally installed real font  -> authentic, no licensing issue
        //   - Adobe Fonts kit activated    -> authentic for every visitor
        //   - neither                      -> close free match
        // Never commit the Fontworks files themselves; they're licensed.
        display: [
          "'FOT-Chiaro Std B'",
          "'FOT-Chiaro Std'",
          "fot-chiaro-std",
          "'Arsenal'",
          "Georgia",
          "serif",
        ],
        ui: [
          "'FOT-Skip Std B'",
          "'FOT-Skip Std'",
          "'Zen Kaku Gothic New'",
          "'Hiragino Kaku Gothic ProN'",
          "sans-serif",
        ],
      },
      skew: {
        12: "12deg",
        "-12": "-12deg",
      },
      transitionTimingFunction: {
        snap: "cubic-bezier(0.22, 1, 0.36, 1)",
        blade: "cubic-bezier(0.65, 0, 0.35, 1)",
      },
      boxShadow: {
        blade: "6px 6px 0 0 rgba(20,19,17,1)",
      },
      keyframes: {
        "stripe-drift": {
          "0%": { backgroundPosition: "0% 0%" },
          "100%": { backgroundPosition: "-200% 0%" },
        },
      },
      animation: {
        "stripe-drift": "stripe-drift 40s linear infinite",
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const NOTCH =
        "polygon(0 0, calc(100% - 1.25rem) 0, 100% 1.25rem, 100% 100%, 0 100%)";
      const BLADE = "polygon(0 0, 100% 0, 100% 85%, 94% 100%, 0 100%)";

      // A plain `border` next to a `clip-path` breaks: the clip erases the
      // border along the diagonal and leaves the straight edges hanging. So an
      // outlined cut-corner surface is built from two layers instead — the
      // element paints the edge color, and a ::before inset by --edge-w paints
      // the fill, both clipped to the same shape. Negative z-index keeps the
      // fill above the edge but below the content.
      const outlined = (shape) => ({
        position: "relative",
        isolation: "isolate",
        clipPath: shape,
        backgroundColor: "var(--edge, #141311)",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: "var(--edge-w, 1px)",
          zIndex: "-1",
          clipPath: shape,
          backgroundColor: "var(--fill, #F6F1E6)",
          transition: "background-color 150ms",
        },
      });

      addUtilities({
        ".clip-slice-r": {
          clipPath: "polygon(0 0, 100% 0, 88% 100%, 0% 100%)",
        },
        ".clip-slice-l": {
          clipPath: "polygon(12% 0, 100% 0, 100% 100%, 0% 100%)",
        },
        ".clip-blade": { clipPath: BLADE },
        ".clip-notch": { clipPath: NOTCH },
        ".notched": outlined(NOTCH),
        ".bladed": outlined(BLADE),
      });
    },
  ],
};
