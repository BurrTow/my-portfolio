/**
 * Abstract skyline drawn as inline SVG — no asset request, and it scales to
 * any viewport without a raster's resolution ceiling.
 *
 * Three depth layers read as parallax without any motion: far is darkest and
 * shortest, near is largest and lightest. Everything is a flat fill, so the
 * whole thing rasterises once and costs nothing per frame. There is no
 * transparency over animated content here — the map overlay above it is
 * opaque, which is what the earlier frame-rate regression turned on.
 *
 * Values sit roughly 12% darker than the first pass so the red selection
 * state stays the focal point instead of competing with the backdrop.
 */
export function CityscapeBackdrop() {
  return (
    <svg
      aria-hidden
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="cb-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0D255E" />
          <stop offset="55%" stopColor="#0E1020" />
          <stop offset="100%" stopColor="#0E0E10" />
        </linearGradient>
        <linearGradient id="cb-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#18336B" />
          <stop offset="100%" stopColor="#10132B" />
        </linearGradient>
        <linearGradient id="cb-mid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#132044" />
          <stop offset="100%" stopColor="#0C1020" />
        </linearGradient>
        <linearGradient id="cb-near" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#16264F" />
          <stop offset="100%" stopColor="#0B0E1C" />
        </linearGradient>
        <pattern id="cb-win" width="16" height="22" patternUnits="userSpaceOnUse">
          <rect x="4" y="5" width="4" height="6" fill="#2B6FFF" fillOpacity="0.28" />
        </pattern>
      </defs>

      <rect width="1200" height="800" fill="url(#cb-sky)" />

      {/* Diagonal shafts, same motif as the site's stripe backdrop. */}
      <g opacity="0.08" fill="#2B6FFF">
        <polygon points="120,0 260,0 60,800 -80,800" />
        <polygon points="700,0 760,0 560,800 500,800" />
        <polygon points="1080,0 1200,0 1000,800 880,800" />
      </g>

      {/* Far layer — shortest, flattest, no detail. */}
      <g fill="url(#cb-far)" opacity="0.7">
        <rect x="40" y="360" width="90" height="440" />
        <rect x="150" y="410" width="70" height="390" />
        <rect x="250" y="335" width="110" height="465" />
        <rect x="390" y="395" width="80" height="405" />
        <rect x="500" y="315" width="120" height="485" />
        <rect x="650" y="378" width="85" height="422" />
        <rect x="760" y="342" width="105" height="458" />
        <rect x="900" y="400" width="75" height="400" />
        <rect x="1000" y="322" width="130" height="478" />
      </g>

      {/* Mid layer — lit windows start here. */}
      <g>
        <rect x="95" y="470" width="120" height="330" fill="url(#cb-mid)" />
        <rect x="95" y="470" width="120" height="330" fill="url(#cb-win)" />
        <rect x="300" y="432" width="140" height="368" fill="url(#cb-mid)" />
        <rect x="300" y="432" width="140" height="368" fill="url(#cb-win)" />
        <rect x="560" y="488" width="130" height="312" fill="url(#cb-mid)" />
        <rect x="560" y="488" width="130" height="312" fill="url(#cb-win)" />
        <rect x="820" y="450" width="150" height="350" fill="url(#cb-mid)" />
        <rect x="820" y="450" width="150" height="350" fill="url(#cb-win)" />
        <polygon points="300,432 440,432 440,404 370,386 300,404" fill="#132044" />
        <polygon points="820,450 970,450 970,420 895,400 820,420" fill="#132044" />
      </g>

      {/* Near layer — largest blocks, closest to the viewer. */}
      <g>
        <rect x="-20" y="585" width="190" height="215" fill="url(#cb-near)" />
        <rect x="430" y="610" width="165" height="190" fill="url(#cb-near)" />
        <rect x="430" y="610" width="165" height="190" fill="url(#cb-win)" />
        <rect x="1010" y="565" width="210" height="235" fill="url(#cb-near)" />
        <rect x="1010" y="565" width="210" height="235" fill="url(#cb-win)" />
        <polygon points="1010,565 1220,565 1220,538 1110,516 1010,538" fill="#16264F" />
      </g>

      {/* Single red accent, the same punctuation role red plays site-wide. */}
      <rect x="612" y="458" width="24" height="30" fill="#D91E36" opacity="0.8" />
      <rect x="152" y="444" width="9" height="26" fill="#2B6FFF" opacity="0.6" />

      <rect x="0" y="726" width="1200" height="74" fill="#0E0E10" opacity="0.5" />
      <line
        x1="0" y1="726" x2="1200" y2="726"
        stroke="#2B6FFF" strokeOpacity="0.2" strokeWidth="2"
      />
    </svg>
  );
}
