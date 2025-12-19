import { Platform, TextStyle } from 'react-native';

/**
 * -----------------------------------------------------------------------------
 * Font weight constants
 * -----------------------------------------------------------------------------
 * React Native expects fontWeight values as strings.
 * These constants keep usage consistent across the app.
 */
export const FONT_WEIGHT = {
  BOLD: '700',
  SEMIBOLD: '600',
  MEDIUM: '500',
  REGULAR: '400',
} as const;

export type FontWeight = (typeof FONT_WEIGHT)[keyof typeof FONT_WEIGHT];

/**
 * -----------------------------------------------------------------------------
 * PRIMARY FONT FAMILY (CURRENT DEFAULT)
 * -----------------------------------------------------------------------------
 * We are currently using system fonts because no custom fonts
 * have been linked to the project yet.
 *
 * 🔮 FUTURE CHANGE:
 * 1. Add your custom fonts inside /assets/fonts/
 *    Example:
 *      InstrumentSans-Regular.ttf
 *      InstrumentSans-Medium.ttf
 *      InstrumentSans-SemiBold.ttf
 *      InstrumentSans-Bold.ttf
 * 2. Run:
 *      npx react-native-asset
 * 3. Replace the PRIMARY_FONT_MAP values with the actual font names
 *    registered by React Native.
 */
const PRIMARY_FONT_MAP: Record<FontWeight, string> = {
  '400': Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'System',
  }),
  '500': Platform.select({
    ios: 'System',
    android: 'sans-serif-medium',
    default: 'System',
  }),
  '600': Platform.select({
    ios: 'System',
    android: 'sans-serif-medium',
    default: 'System',
  }),
  '700': Platform.select({
    ios: 'System',
    android: 'sans-serif-bold',
    default: 'System',
  }),
};

// replace with this
// const PRIMARY_FONT_MAP: Record<FontWeight, string> = {
//   '400': 'InstrumentSans-Regular', // your font family
//   '500': 'InstrumentSans-Medium',
//   '600': 'InstrumentSans-SemiBold',
//   '700': 'InstrumentSans-Bold',
// };

/**
 * -----------------------------------------------------------------------------
 * PRIMARY FONT (NORMAL)
 * -----------------------------------------------------------------------------
 * Returns a TextStyle object for the primary font.
 * Usage example:
 *   ...primaryFont('500')
 *
 * 🔮 FUTURE CHANGE:
 * Replace PRIMARY_FONT_MAP values with actual custom font files per weight.
 */
export const primaryFont = (
  weight: FontWeight = FONT_WEIGHT.REGULAR,
): TextStyle => {
  return {
    fontFamily: PRIMARY_FONT_MAP[weight],
  };
};

/**
 * -----------------------------------------------------------------------------
 * PRIMARY FONT (ITALIC)
 * -----------------------------------------------------------------------------
 * Currently uses system italic styling.
 *
 * 🔮 FUTURE CHANGE:
 * If your custom font provides italic files, map them per weight:
 * Example:
 *   '400': 'InstrumentSans-Italic'
 *   '500': 'InstrumentSans-MediumItalic'
 */
const PRIMARY_FONT_ITALIC_MAP: Record<FontWeight, string> = {
  '400': Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'System',
  }),
  '500': Platform.select({
    ios: 'System',
    android: 'sans-serif-medium',
    default: 'System',
  }),
  '600': Platform.select({
    ios: 'System',
    android: 'sans-serif-medium',
    default: 'System',
  }),
  '700': Platform.select({
    ios: 'System',
    android: 'sans-serif-bold',
    default: 'System',
  }),
};

export const primaryFontItalic = (
  weight: FontWeight = FONT_WEIGHT.REGULAR,
): TextStyle => {
  return {
    fontFamily: PRIMARY_FONT_ITALIC_MAP[weight],
    fontStyle: 'italic',
  };
};

/**
 * -----------------------------------------------------------------------------
 * SECONDARY FONT (PLACEHOLDER)
 * -----------------------------------------------------------------------------
 * When you want a secondary font family (non-italic), add a new constant
 * and implement the function.
 *
 * Example:
 *
 * const SECONDARY_FONT_MAP: Record<FontWeight, string> = {
 *   '400': Platform.select({ ios: 'Secondary-Regular', android: 'Secondary-Regular' }),
 *   '500': Platform.select({ ios: 'Secondary-Medium', android: 'Secondary-Medium' }),
 *   '600': Platform.select({ ios: 'Secondary-SemiBold', android: 'Secondary-SemiBold' }),
 *   '700': Platform.select({ ios: 'Secondary-Bold', android: 'Secondary-Bold' }),
 * };
 *
 * export const secondaryFont = (
 *   weight: FontWeight = FONT_WEIGHT.REGULAR,
 * ): TextStyle => ({
 *   fontFamily: SECONDARY_FONT_MAP[weight],
 * });
 *
 * This keeps primary and secondary typography cleanly separated.
 */
