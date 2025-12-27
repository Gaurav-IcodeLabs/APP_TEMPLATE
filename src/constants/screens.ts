import { EDIT_LISTING_STACK } from 'features/editListing';

const SCREENS = {
  // Auth screens
  ONBOARDING: 'Onboarding',
  LOGIN: 'Login',
  SIGNUP: 'Signup',
  FORGET_PASSWORD: 'ForgetPassword',
  RESET_PASSWORD: 'ResetPassword',

  HOME: 'Home',
} as const;

Object.assign(SCREENS, EDIT_LISTING_STACK);

export { SCREENS };
