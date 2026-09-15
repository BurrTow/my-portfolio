/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Persona 3 Reload menu palette. Contrast-checked against #0E0E10:
        // white 17.6:1, white/70 8.9:1, white/50 5.0:1 (floor for body text).
        // blue and red both fail AA as small text on black, so they are used
        // for fills, rules, and blocks only — never for body copy.
        "p3-black": {
          DEFAULT: "#0E0E10",
          panel: "#16161A",
          raised: "#1D1D22",
        },
        "p3-blue": {
          // Non-text blocks, rules, and borders.
          DEFAULT: "#2B6FFF",
          // Fills that carry white text — 4.64:1, clears AA where the
          // brighter #2B6FFF would not (3.98:1).
          deep: "#1E5FFF",
          // Tinted surface for subdued panels against the black ground.
          dark: "#0F2A6B",
        },
        "p3-white": {
          DEFAULT: "#F5F5F0",
          dim: "#B0B0AD",
        },
        // Emphasis only: selection underline, one slash per section. Never
        // a base or a text colour.
        "p3-red": {
          DEFAULT: "#D91E36",
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
        blade: "6px 6px 0 0 #1E5FFF",
      },
      keyframes: {
        // Transform, not background-position: only the former is composited.
        // 96px is two 48px tiles, so the loop point is invisible.
        "stripe-drift": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-96px)" },
        },
      },
      animation: {
        "stripe-drift": "stripe-drift 12s linear infinite",
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      // Every diagonal runs the same direction (x grows as y grows) and uses
      // fixed rem offsets, so the angle is identical on every element instead
      // of stretching with percentage-based cuts. notch and blade are both
      // exactly 45deg on opposite corners, which keeps their edges parallel.
      const CUT = "1.25rem";
      const NOTCH = `polygon(0 0, calc(100% - ${CUT}) 0, 100% ${CUT}, 100% 100%, 0 100%)`;
      const BLADE = `polygon(0 0, 100% 0, 100% 100%, ${CUT} 100%, 0 calc(100% - ${CUT}))`;
      const SLICE = "polygon(0 0, calc(100% - 1.5rem) 0, 100% 100%, 0 100%)";

      // A plain `border` next to a `clip-path` breaks: the clip erases the
      // border along the diagonal and leaves the straight edges hanging. So an
      // outlined cut-corner surface is built from two layers instead — the
      // element paints the edge colour, and a ::before inset by --edge-w paints
      // the fill, both clipped to the same shape. Negative z-index keeps the
      // fill above the edge but below the content.
      const outlined = (shape) => ({
        position: "relative",
        isolation: "isolate",
        clipPath: shape,
        backgroundColor: "var(--edge, #2B6FFF)",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: "var(--edge-w, 1px)",
          zIndex: "-1",
          clipPath: shape,
          backgroundColor: "var(--fill, #16161A)",
          transition: "background-color 150ms",
        },
      });

      addUtilities({
        ".clip-slice": { clipPath: SLICE },
        ".clip-blade": { clipPath: BLADE },
        ".clip-notch": { clipPath: NOTCH },
        ".notched": outlined(NOTCH),
        ".bladed": outlined(BLADE),
      });
    },
  ],
};
