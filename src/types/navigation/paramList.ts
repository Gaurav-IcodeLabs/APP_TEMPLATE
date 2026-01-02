import { SCREENS } from '@constants/screens';
import { EditListingWizardParam } from 'features/editListing/types/navigation.types';

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
& EditListingWizardParam;

// bottom Stack
export type BottomTabParamList = {};
