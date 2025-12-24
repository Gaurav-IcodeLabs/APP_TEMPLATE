export const colors = {
  marketplaceColor: '#d29d27',
  marketplaceColorLight: '',
  marketplaceColorDark: '',
  colorPrimaryButton: '',
  colorPrimaryButtonLight: '',
  colorPrimaryButtonDark: '',
  transparent: 'transparent',
  black: '#000000',
  lightblack: '#161616',
  white: '#FFFFFF',
  grey: '#6C7278',
  gray: '#6C7278', // Alias for grey
  lightGrey: '#F5F5F5',
  lightGray: '#F5F5F5', // Alias for lightGrey
  placeholder: '#949494',
  red: '#FF0000',
  lightRed: '#FFE6E6',
  errorRed: '#D03739',
  primary: '#d29d27', // Use marketplace color as primary
};

export type AppColors = typeof colors;

export const mergeColors = (appColors: Partial<AppColors>) => ({
  ...colors,
  marketplaceColor: appColors.marketplaceColor,
  marketplaceColorLight: appColors.marketplaceColorLight,
  marketplaceColorDark: appColors.marketplaceColorDark,
});
