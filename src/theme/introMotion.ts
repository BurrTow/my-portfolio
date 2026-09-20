/**
 * Motion for the intro exit only.
 *
 * Deliberately separate from theme/motion.ts: the tab wipe runs many times a
 * session and has to stay quick and unobtrusive, while this plays once and
 * can afford weight. Sharing presets would mean every tweak to the opening
 * moment also retuned ordinary navigation.
 *
 * One treatment, not two. A shard variant was built alongside this one so the
 * pair could be compared, and it lost: seven pieces flying apart degrade under
 * CPU throttling where three heavy panels hold. Keeping the loser reachable
 * only left a way to ship it by accident, which is what happened.
 */

/** Two passes: a heavy cover, then a slower reveal. */
export const WIPE_PANELS = 3;
export const WIPE_COVER_MS = 380;
export const WIPE_CLEAR_DURATION = 0.62;
export const WIPE_STAGGER = 0.07;

/** Total travel time for one panel, cover through clear. */
export const WIPE_DURATION = WIPE_COVER_MS / 1000 + WIPE_CLEAR_DURATION + 0.18;

/**
 * Keyframe stops: arrive, hold covered, then leave.
 *
 * The hold is wider than it needs to look right. Panels land staggered, so the
 * moment *every* panel is down is ~49ms before the first one would start
 * leaving on the original timing — three frames to mount the destination, and
 * fewer than that under CPU throttling. Holding longer buys the swap a margin
 * it can miss without anything showing through.
 */
export const WIPE_TIMES = [0, 0.3, 0.56, 1];

/**
 * When the last panel has landed and the frame is fully covered.
 *
 * The destination has to be swapped inside this window. Doing it when the
 * animation *ends* means the panels clear over whatever was already on screen,
 * and the old view is visible the whole way out — the flash this is here to
 * prevent. Derived from the same numbers the animation uses so the two cannot
 * drift apart; the last panel is the one that matters, hence the stagger.
 */
export const WIPE_COVERED_MS =
  (WIPE_TIMES[1] * WIPE_DURATION + (WIPE_PANELS - 1) * WIPE_STAGGER) * 1000;

/**
 * How far the outer panels reach past the viewport edge.
 *
 * The panels are skewed, so landing at x:0 does not mean the frame is covered:
 * the shear pulls their top and bottom corners sideways and leaves a triangular
 * wedge bare at each edge. The title screen used to hide those wedges by
 * accident, which is why this only became visible once the handover was moved
 * under the panels.
 *
 * Each panel is 150vh tall and centred on the viewport, so the worst shear
 * inside the visible band is 50vh * tan(12deg) ~ 10.6vh. 12vh covers it with a
 * margin. Only the two outer edges need it — every panel carries the same skew,
 * so the seams between them stay aligned.
 */
export const WIPE_EDGE_OVERHANG = "12vh";

export const EASE_HEAVY = [0.7, 0, 0.2, 1] as const;
