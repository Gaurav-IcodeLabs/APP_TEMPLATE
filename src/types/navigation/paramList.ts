import { SCREENS } from '@constants/screens';
import { EditListingStackParam } from 'features/editListing/types/navigation.types';

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
}
& EditListingStackParam;

// bottom Stack
export type BottomTabParamList = {};
