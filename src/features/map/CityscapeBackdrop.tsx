import {
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
} from "framer-motion";
import type { ReactNode } from "react";

/**
 * How the stack behaves. `3d` is the full perspective stack, `shift` keeps the
 * depth parallax but drops perspective and tilt, `static` renders the same
 * planes with no movement at all — the painted depth survives either way.
 */
export type DepthMode = "3d" | "shift" | "static";

/** Whole-stack tilt at the edges of travel, in degrees. */
const TILT_DEG = 2;
/** Every plane is drawn larger than the frame so parallax, and the tilt,
 * cannot expose an edge. */
const OVERSIZE = 1.09;

/**
 * Back to front. `shift` is the px a plane travels against the pointer; the
 * light shafts take a positive value so they move *with* the cursor, which
 * reads as them being behind everything else.
 */
const PLANES = {
  sky: { shift: 6 },
  far: { shift: -4 },
  mid: { shift: -9 },
  near: { shift: -14 },
  fore: { shift: -16 },
} as const;

function Plane({
  depth,
  px,
  py,
  mode,
  children,
}: {
  depth: { shift: number };
  px: MotionValue<number>;
  py: MotionValue<number>;
  mode: DepthMode;
  children: ReactNode;
}) {
  const x = useTransform(px, (v) => v * depth.shift);
  const y = useTransform(py, (v) => v * depth.shift);
  // Depth comes from differential shift and painted perspective, not from
  // translateZ — see the note on the component.
  const scale = OVERSIZE;

  return (
    <motion.div
      // The planes are scenery and some of them sit in front of the pins, so
      // none of them may swallow a click. The pins opt back in themselves.
      className="pointer-events-none absolute inset-0"
      style={{
        x,
        y,
        scale,
        // Promote the plane so its SVG rasterises once and movement only
        // composites the result.
        willChange: mode === "static" ? undefined : "transform",
      }}
    >
      {children}
    </motion.div>
  );
}

/** Shared frame for every plane's artwork. */
function Art({ children }: { children: ReactNode }) {
  return (
    <svg
      aria-hidden
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
    >
      {children}
    </svg>
  );
}

/**
 * Abstract skyline drawn as five stacked planes of inline SVG — no asset
 * request, and it scales to any viewport without a raster's ceiling.
 *
 * Depth is painted, not filtered. Atmospheric perspective does the work:
 * distant planes are lighter, bluer and lower contrast, near planes darker
 * with sharper edges, and the nearest buildings carry an angled side face so
 * they read as volumes rather than rectangles. There is no blur and no
 * backdrop-filter anywhere — those are the costs this project keeps paying for.
 *
 * Everything that moves is a transform on a plane. The artwork itself never
 * changes, so each plane rasterises once.
 */
export function CityscapeBackdrop({
  px,
  py,
  mode = "static",
  children,
}: {
  /** Pointer offset from centre, -1..1. */
  px?: MotionValue<number>;
  py?: MotionValue<number>;
  mode?: DepthMode;
  /** Rendered on the near plane, so pins travel with the buildings they sit on. */
  children?: ReactNode;
} = {}) {
  // Hooks cannot be conditional, so a parked value stands in for `static`.
  const still = useMotionValue(0);
  const sx = mode === "static" ? still : (px ?? still);
  const sy = mode === "static" ? still : (py ?? still);

  // A flat rotate, not rotateX/rotateY under perspective. The 3D version was
  // measured at 30fps even unthrottled: a continuously changing 3D transform
  // re-rasterises the vector artwork every frame instead of compositing it.
  // The same five planes with a 2D transform hold 60fps.
  const rotate = useTransform(sx, (v) => (mode === "3d" ? v * TILT_DEG : 0));

  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-0"
        style={mode === "3d" ? { rotate, willChange: "transform" } : undefined}
      >
        {/* 1 — sky and light shafts, furthest back. */}
        <Plane depth={PLANES.sky} px={sx} py={sy} mode={mode}>
          <Art>
            <defs>
              <linearGradient id="cb-sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0D255E" />
                <stop offset="55%" stopColor="#0E1020" />
                <stop offset="100%" stopColor="#0E0E10" />
              </linearGradient>
            </defs>
            <rect width="1200" height="800" fill="url(#cb-sky)" />
            <g opacity="0.08" fill="#2B6FFF">
              <polygon points="120,0 260,0 60,800 -80,800" />
              <polygon points="700,0 760,0 560,800 500,800" />
              <polygon points="1080,0 1200,0 1000,800 880,800" />
            </g>
          </Art>
        </Plane>

        {/* 2 — far skyline: lightest, bluest, lowest contrast. */}
        <Plane depth={PLANES.far} px={sx} py={sy} mode={mode}>
          <Art>
            <g fill="#2B4C8C" opacity="0.3">
              <polygon points="40,372 118,372 130,386 130,800 40,800" />
              <rect x="150" y="410" width="70" height="390" />
              <polygon points="250,348 348,348 360,362 360,800 250,800" />
              <rect x="390" y="395" width="80" height="405" />
              <polygon points="500,328 608,328 620,342 620,800 500,800" />
              <rect x="650" y="378" width="85" height="422" />
              <polygon points="760,355 853,355 865,369 865,800 760,800" />
              <rect x="900" y="400" width="75" height="400" />
              <polygon points="1000,336 1118,336 1130,350 1130,800 1000,800" />
            </g>
          </Art>
        </Plane>

        {/* 3 — mid buildings: first lit windows, mid contrast. */}
        <Plane depth={PLANES.mid} px={sx} py={sy} mode={mode}>
          <Art>
            <defs>
              <linearGradient id="cb-mid" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#16264E" />
                <stop offset="100%" stopColor="#0B1022" />
              </linearGradient>
              <pattern
                id="cb-win-m"
                width="18"
                height="24"
                patternUnits="userSpaceOnUse"
              >
                <rect
                  x="5"
                  y="6"
                  width="4"
                  height="6"
                  fill="#2B6FFF"
                  fillOpacity="0.22"
                />
              </pattern>
            </defs>
            <g>
              <polygon
                points="95,470 203,470 215,484 215,800 95,800"
                fill="url(#cb-mid)"
              />
              <rect
                x="95"
                y="484"
                width="120"
                height="316"
                fill="url(#cb-win-m)"
              />
              <polygon
                points="300,432 428,432 440,446 440,800 300,800"
                fill="url(#cb-mid)"
              />
              <rect
                x="300"
                y="446"
                width="140"
                height="354"
                fill="url(#cb-win-m)"
              />
              <polygon
                points="560,488 678,488 690,502 690,800 560,800"
                fill="url(#cb-mid)"
              />
              <rect
                x="560"
                y="502"
                width="130"
                height="298"
                fill="url(#cb-win-m)"
              />
              <polygon
                points="820,450 958,450 970,464 970,800 820,800"
                fill="url(#cb-mid)"
              />
              <rect
                x="820"
                y="464"
                width="150"
                height="336"
                fill="url(#cb-win-m)"
              />
              <rect
                x="612"
                y="458"
                width="24"
                height="30"
                fill="#D91E36"
                opacity="0.8"
              />
            </g>
          </Art>
        </Plane>

        {/* 4 — near buildings: darkest, highest contrast, with side faces so
            they read as solid volumes. Pins sit on this plane. */}
        <Plane depth={PLANES.near} px={sx} py={sy} mode={mode}>
          <Art>
            <defs>
              <linearGradient id="cb-near" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0C1730" />
                <stop offset="100%" stopColor="#05070E" />
              </linearGradient>
              <pattern
                id="cb-win-n"
                width="20"
                height="26"
                patternUnits="userSpaceOnUse"
              >
                <rect
                  x="6"
                  y="7"
                  width="5"
                  height="7"
                  fill="#2B6FFF"
                  fillOpacity="0.3"
                />
              </pattern>
            </defs>
            {/* front face, then the angled side face one shade darker */}
            <g>
              <polygon
                points="-20,585 148,585 170,604 170,800 -20,800"
                fill="url(#cb-near)"
              />
              <polygon
                points="170,604 196,620 196,800 170,800"
                fill="#03050A"
              />

              <polygon
                points="430,610 573,610 595,629 595,800 430,800"
                fill="url(#cb-near)"
              />
              <rect
                x="430"
                y="629"
                width="165"
                height="171"
                fill="url(#cb-win-n)"
              />
              <polygon
                points="595,629 621,645 621,800 595,800"
                fill="#03050A"
              />

              <polygon
                points="1010,565 1198,565 1220,584 1220,800 1010,800"
                fill="url(#cb-near)"
              />
              <rect
                x="1010"
                y="584"
                width="210"
                height="216"
                fill="url(#cb-win-n)"
              />
              <polygon
                points="1010,565 1010,584 984,600 984,800 1010,800"
                fill="#03050A"
              />
            </g>
          </Art>
          {children}
        </Plane>

        {/* 5 — foreground silhouettes framing left, right and the street. */}
        <Plane depth={PLANES.fore} px={sx} py={sy} mode={mode}>
          <Art>
            <g fill="#05070C">
              <polygon points="0,470 70,470 92,492 92,800 0,800" />
              <polygon points="1200,430 1130,430 1108,452 1108,800 1200,800" />
              <rect x="0" y="770" width="1200" height="30" />
            </g>
          </Art>
        </Plane>
      </motion.div>

      {/* Street-level fog and a vignette. Static, never transformed, and on top
          of every plane — the atmosphere the parallax moves behind. */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="cb-fog" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2B6FFF" stopOpacity="0" />
            <stop offset="70%" stopColor="#16264F" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0E0E10" stopOpacity="0.85" />
          </linearGradient>
          <radialGradient id="cb-vig" cx="50%" cy="48%" r="72%">
            <stop offset="55%" stopColor="#0E0E10" stopOpacity="0" />
            <stop offset="100%" stopColor="#0E0E10" stopOpacity="0.55" />
          </radialGradient>
        </defs>
        <rect x="0" y="520" width="1200" height="280" fill="url(#cb-fog)" />
        <rect width="1200" height="800" fill="url(#cb-vig)" />
        <line
          x1="0"
          y1="726"
          x2="1200"
          y2="726"
          stroke="#2B6FFF"
          strokeOpacity="0.18"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}
