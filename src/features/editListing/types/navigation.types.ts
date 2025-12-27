import { EDIT_LISTING_SCREENS } from '../screens.constant';

export type EditListingStackParamList = {
  [EDIT_LISTING_SCREENS.EDIT_LISTING_PAGE]: {
    wizardKey: string;
    listingId: string | undefined;
  };
};

export type EditListingStackParam = {
  EditListingStack: {
    listingId: string | undefined;
  };
};
