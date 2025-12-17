import { SCREENS } from '@constants/screens';

// Auth Stack
export type AuthStackParamList = {
  [SCREENS.ONBOARDING]: undefined;
  [SCREENS.LOGIN]: undefined;
  [SCREENS.SIGNUP]: { userType?: string } | undefined;
  [SCREENS.FORGET_PASSWORD]: undefined;
  [SCREENS.RESET_PASSWORD]: undefined;
};

// Main Stack
export type AppStackParamList = {
  [SCREENS.HOME]: undefined;
};

// bottom Stack
export type BottomTabParamList = {};
