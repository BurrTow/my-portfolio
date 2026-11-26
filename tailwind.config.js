/** Every colour reads a role variable from index.css (RGB channels), so the
 * /opacity modifiers keep working and <html data-theme> flips all of them. */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;
// A fade variable pulls a translucent class toward opaque per theme: at 1 the
// alpha is exactly what the class says (dark), below 1 it is raised (light),
// at 0 the colour is solid. Used where light needs more contrast than the
// class's alpha gives, without changing the dark classes.
const faded = (name, fade) =>
  `rgb(var(--${name}) / calc(1 - (1 - <alpha-value>) * var(--${fade})))`;
const ink = faded("ink", "ink-fade");

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Role tokens. Prefer these in new code.
        page: token("page"),
        surface: token("surface"),
        raised: token("raised"),
        line: token("border"),
        ink: { DEFAULT: ink, muted: token("ink-muted") },
        accent: {
          // Blocks, rules, borders, and blue text (4.5:1 in light; see
          // index.css for the dark-mode exception).
          DEFAULT: token("accent"),
          // Fills that carry on-accent text.
          strong: token("accent-strong"),
          // Subdued tint for muted edges and wipe bars.
          tint: token("accent-tint"),
        },
        "on-accent": token("on-accent"),
        // Cyan in light: on the blue side only.
        highlight: token("highlight"),
        // Emphasis only: selection underline, one slash per section.
        danger: token("danger"),
        focus: token("focus"),

        // Persona 3 Reload names, kept as aliases of the roles above so every
        // existing class (including App.tsx and the intro, which are not
        // edited) follows the theme. In light, "black" is the pale ground and
        // "white" the navy ink.
        "p3-black": {
          DEFAULT: token("page"),
          panel: token("surface"),
          raised: token("raised"),
        },
        "p3-blue": {
          DEFAULT: token("accent"),
          deep: token("accent-strong"),
          dark: token("accent-tint"),
        },
        "p3-white": { DEFAULT: ink, dim: token("ink-muted") },
        "p3-red": { DEFAULT: token("danger") },
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
        blade: "6px 6px 0 0 rgb(var(--accent-strong))",
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
      // Container notch: 16px, the size every card and panel uses.
      const CUT = "1rem";
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
        backgroundColor: "var(--edge, rgb(var(--border)))",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: "var(--edge-w, 1px)",
          zIndex: "-1",
          clipPath: shape,
          backgroundColor: "var(--fill, rgb(var(--surface)))",
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
