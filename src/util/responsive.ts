import { Dimensions, Platform /*, PixelRatio */ } from 'react-native';
/**
 * -----------------------------------------------------------------------------
 * Screen dimensions
 * -----------------------------------------------------------------------------
 * We use the window dimensions (not screen) because they correctly account for
 * split-screen and orientation changes.
 */
const { width, height } = Dimensions.get('window');

/**
 * -----------------------------------------------------------------------------
 * Design baseline
 * -----------------------------------------------------------------------------
 * iPhone 8 (375 x 812) is used as the reference device for all scaling.
 * All sizes in the design system are based on this.
 */
const GUIDELINE_BASE_WIDTH = 375;
const GUIDELINE_BASE_HEIGHT = 812;

/**
 * -----------------------------------------------------------------------------
 * Scale ratios
 * -----------------------------------------------------------------------------
 * Width-based scaling is used consistently for both layout and typography.
 * Height scaling is intentionally NOT used to avoid vertical stretching.
 */
const widthScale = width / GUIDELINE_BASE_WIDTH;
// const heightScale = height / GUIDELINE_BASE_HEIGHT; // not used by design

/**
 * -----------------------------------------------------------------------------
 * Layout scaling
 * -----------------------------------------------------------------------------
 * Used for spacing, icon sizes, widths, heights, paddings, margins, etc.
 *
 * We intentionally keep this simple and deterministic:
 * - No platform-specific multipliers
 * - No PixelRatio adjustments
 * - Matches design expectations exactly
 */
const scale = (size: number): number => {
  return Math.round(size * widthScale);
};

/**
 * -----------------------------------------------------------------------------
 * Font scaling
 * -----------------------------------------------------------------------------
 * System font scaling is disabled globally via:
 *   <Text allowFontScaling={false} />
 *
 * Therefore:
 * - PixelRatio.getFontScale() is NOT used
 * - Fonts scale only based on screen width
 * - Typography remains visually consistent across devices
 */
const fontScale = (size: number): number => {
  return Math.round(size * widthScale);
};

/**
 * -----------------------------------------------------------------------------
 * Optional: PixelRatio-based scaling (COMMENTED OUT)
 * -----------------------------------------------------------------------------
 * Uncomment this ONLY if you decide to respect system font scaling in the future.
 *
 * ⚠️ Requires allowFontScaling={true}
 * ⚠️ Changes typography behavior across devices
 */

// const fontScale = (size: number): number => {
//   const fontScaleFactor = PixelRatio.getFontScale();
//   return Math.round((size * widthScale) / fontScaleFactor);
// };

/**
 * -----------------------------------------------------------------------------
 * Device helpers
 * -----------------------------------------------------------------------------
 */
const isIphone8 = (): boolean => {
  return Platform.OS === 'ios' && height <= GUIDELINE_BASE_HEIGHT;
};

/**
 * -----------------------------------------------------------------------------
 * HitSlop helper
 * -----------------------------------------------------------------------------
 * Expands touchable area without affecting layout.
 */
const hitSlop = (size: number) => ({
  top: size,
  bottom: size,
  left: size,
  right: size,
});

/**
 * -----------------------------------------------------------------------------
 * Color utilities
 * -----------------------------------------------------------------------------
 * Lightens a hex color by a given percentage and returns an RGBA string.
 */
const lightenColor = (color: string, percent: number): string => {
  const hex = color.replace('#', '');

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const amt = Math.round(2.55 * percent);
  const clamp = (val: number) => Math.max(0, Math.min(255, val));

  const R = clamp(r + amt);
  const G = clamp(g + amt);
  const B = clamp(b + amt);

  return `rgba(${R}, ${G}, ${B}, 0.2)`;
};

/**
 * -----------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------
 */
export {
  scale,
  fontScale,
  isIphone8,
  hitSlop,
  lightenColor,
  width as SCREEN_WIDTH,
  height as SCREEN_HEIGHT,
};
