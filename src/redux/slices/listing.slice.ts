import { Thunk } from '@appTypes/index';
import {
  createAsyncThunk,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit';
import { storableError } from '../../util';
import * as log from '../../util/log';
import { RootState } from '../store';
import { types as sdkTypes } from 'sharetribe-flex-sdk';

// ================ Initial State ================ //

const initialState = {
  // Selected listing type
  selectedListingType: null as string | null,

  // Create listing draft
  createListingDraftError: null as any,
  createListingDraftInProgress: false,
  listingDraft: null as any,

  // Update listing
  updateListingError: null as any,
  updateListingInProgress: false,

  // Publish listing
  publishListingError: null as any,
  publishListingInProgress: false,

  // Current listing being edited
  currentListingId: null as string | null,
  currentListing: null as any,

  // Show listing
  showListingError: null as any,
  showListingInProgress: false,

  // Image upload
  uploadImageError: null as any,
  uploadImageInProgress: false,
  uploadedImages: {} as Record<string, any>,
  uploadedImagesOrder: [] as string[],
  removedImageIds: [] as string[],

  // Form state
  formStep: 'listingType' as 'listingType' | 'details' | 'images' | 'pricing' | 'location' | 'review',
  formData: {} as any,
};

// ================ Async Thunks ================ //

export const createListingDraft = createAsyncThunk<
  any,
  { listingData: any; config: any },
  {
    dispatch: any;
    state: RootState;
    extra: any;
  }
>(
  'listing/createListingDraft',
  async ({ listingData, config }, thunkAPI) => {
    const { rejectWithValue, extra: sdk } = thunkAPI;

    try {
      // Transform form data to API format
      const {
        title,
        description,
        price,
        listingType,
        publicData,
        privateData,
        images,
        ...otherData
      } = listingData;

      // Clean up publicData and privateData - remove null/undefined values
      const cleanPublicData = Object.keys(publicData || {}).reduce((acc, key) => {
        const value = publicData[key];
        if (value !== null && value !== undefined && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {} as any);

      const cleanPrivateData = Object.keys(privateData || {}).reduce((acc, key) => {
        const value = privateData[key];
        if (value !== null && value !== undefined && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {} as any);

      // Prepare the listing parameters according to Sharetribe SDK format
      const listingParams = {
        title,
        description,
        ...(price && {
          price: new sdkTypes.Money(Math.round(price * 100), 'USD') // Use SDK Money type
        }),
        publicData: {
          listingType,
          ...cleanPublicData,
        },
        ...(Object.keys(cleanPrivateData).length > 0 && {
          privateData: cleanPrivateData
        }),
        // Images should be handled separately via image upload API
        // For now, we'll skip images in the initial creation
      };

      console.log('Creating listing with params:', JSON.stringify(listingParams, null, 2));

      const response = await sdk.ownListings.create(listingParams);
      return response.data;
    } catch (e: any) {
      console.log('Errors returned by Marketplace API call:', e.data?.errors || e.message);
      log.error(e, 'create-listing-draft-failed');
      return rejectWithValue(storableError(e));
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState();
      return !state.listing.createListingDraftInProgress;
    },
  },
);

export const updateListing = createAsyncThunk<
  any,
  { id: string; listingData: any; config: any },
  {
    dispatch: any;
    state: RootState;
    extra: any;
  }
>(
  'listing/updateListing',
  async ({ id, listingData, config }, thunkAPI) => {
    const { rejectWithValue, extra: sdk } = thunkAPI;

    try {
      const {
        title,
        description,
        price,
        listingType,
        publicData,
        privateData,
        images,
        ...otherData
      } = listingData;

      // Create proper UUID object if id is a string
      const listingId = typeof id === 'string' ? new sdkTypes.UUID(id) : id;

      // Clean up publicData and privateData - remove null/undefined values
      const cleanPublicData = Object.keys(publicData || {}).reduce((acc, key) => {
        const value = publicData[key];
        if (value !== null && value !== undefined && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {} as any);

      const cleanPrivateData = Object.keys(privateData || {}).reduce((acc, key) => {
        const value = privateData[key];
        if (value !== null && value !== undefined && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {} as any);

      const listingParams = {
        id: listingId,
        title,
        description,
        ...(price && {
          price: new sdkTypes.Money(Math.round(price * 100), 'USD')
        }),
        publicData: {
          listingType,
          ...cleanPublicData,
        },
        ...(Object.keys(cleanPrivateData).length > 0 && {
          privateData: cleanPrivateData
        }),
        ...otherData,
      };

      const response = await sdk.ownListings.update(listingParams);
      return response.data;
    } catch (e: any) {
      log.error(e, 'update-listing-failed');
      return rejectWithValue(storableError(e));
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState();
      return !state.listing.updateListingInProgress;
    },
  },
);

export const publishListing = createAsyncThunk<
  any,
  { id: string },
  {
    dispatch: any;
    state: RootState;
    extra: any;
  }
>(
  'listing/publishListing',
  async ({ id }, thunkAPI) => {
    const { rejectWithValue, extra: sdk } = thunkAPI;

    try {
      // Create proper UUID object if id is a string
      const listingId = typeof id === 'string' ? new sdkTypes.UUID(id) : id;
      
      console.log('Publishing listing with ID:', listingId);
      
      const response = await sdk.ownListings.publish({ id: listingId });
      return response.data;
    } catch (e: any) {
      console.log('Publish listing error:', e.data?.errors || e.message);
      log.error(e, 'publish-listing-failed');
      return rejectWithValue(storableError(e));
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState();
      return !state.listing.publishListingInProgress;
    },
  },
);

export const showListing = createAsyncThunk<
  any,
  { id: string },
  {
    dispatch: any;
    state: RootState;
    extra: any;
  }
>(
  'listing/showListing',
  async ({ id }, thunkAPI) => {
    const { rejectWithValue, extra: sdk } = thunkAPI;

    try {
      // Create proper UUID object if id is a string
      const listingId = typeof id === 'string' ? new sdkTypes.UUID(id) : id;
      
      const response = await sdk.listings.show({ id: listingId });
      return response.data;
    } catch (e: any) {
      log.error(e, 'show-listing-failed');
      return rejectWithValue(storableError(e));
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState();
      return !state.listing.showListingInProgress;
    },
  },
);

// ================ Slice ================ //

const listingSlice = createSlice({
  name: 'listing',
  initialState,
  reducers: {
    setListingType: (state, { payload }) => {
      state.selectedListingType = payload;
      state.formStep = 'details';
    },
    setFormStep: (state, { payload }) => {
      state.formStep = payload;
    },
    updateFormData: (state, { payload }) => {
      state.formData = { ...state.formData, ...payload };
    },
    resetListingForm: (state) => {
      state.selectedListingType = null;
      state.formStep = 'listingType';
      state.formData = {};
      state.uploadedImages = {};
      state.uploadedImagesOrder = [];
      state.removedImageIds = [];
    },
    clearListingErrors: (state) => {
      state.createListingDraftError = null;
      state.updateListingError = null;
      state.publishListingError = null;
      state.showListingError = null;
      state.uploadImageError = null;
    },
  },
  extraReducers: (builder) => {
    // Create listing draft
    builder
      .addCase(createListingDraft.pending, (state) => {
        state.createListingDraftInProgress = true;
        state.createListingDraftError = null;
      })
      .addCase(createListingDraft.fulfilled, (state, { payload }) => {
        state.createListingDraftInProgress = false;
        state.listingDraft = payload;
        state.currentListingId = payload.id?.uuid;
        state.currentListing = payload;
      })
      .addCase(createListingDraft.rejected, (state, { payload }) => {
        state.createListingDraftInProgress = false;
        state.createListingDraftError = payload;
      });

    // Update listing
    builder
      .addCase(updateListing.pending, (state) => {
        state.updateListingInProgress = true;
        state.updateListingError = null;
      })
      .addCase(updateListing.fulfilled, (state, { payload }) => {
        state.updateListingInProgress = false;
        state.currentListing = payload;
      })
      .addCase(updateListing.rejected, (state, { payload }) => {
        state.updateListingInProgress = false;
        state.updateListingError = payload;
      });

    // Publish listing
    builder
      .addCase(publishListing.pending, (state) => {
        state.publishListingInProgress = true;
        state.publishListingError = null;
      })
      .addCase(publishListing.fulfilled, (state, { payload }) => {
        state.publishListingInProgress = false;
        state.currentListing = payload;
      })
      .addCase(publishListing.rejected, (state, { payload }) => {
        state.publishListingInProgress = false;
        state.publishListingError = payload;
      });

    // Show listing
    builder
      .addCase(showListing.pending, (state) => {
        state.showListingInProgress = true;
        state.showListingError = null;
      })
      .addCase(showListing.fulfilled, (state, { payload }) => {
        state.showListingInProgress = false;
        state.currentListing = payload;
      })
      .addCase(showListing.rejected, (state, { payload }) => {
        state.showListingInProgress = false;
        state.showListingError = payload;
      });
  },
});

// ================ Actions ================ //

export const {
  setListingType,
  setFormStep,
  updateFormData,
  resetListingForm,
  clearListingErrors,
} = listingSlice.actions;

// ================ Selectors ================ //

export const selectedListingTypeSelector = (state: RootState) =>
  state.listing.selectedListingType;

export const formStepSelector = (state: RootState) => state.listing.formStep;

export const formDataSelector = (state: RootState) => state.listing.formData;

export const createListingDraftInProgressSelector = (state: RootState) =>
  state.listing.createListingDraftInProgress;

export const createListingDraftErrorSelector = (state: RootState) =>
  state.listing.createListingDraftError;

export const updateListingInProgressSelector = (state: RootState) =>
  state.listing.updateListingInProgress;

export const updateListingErrorSelector = (state: RootState) =>
  state.listing.updateListingError;

export const publishListingInProgressSelector = (state: RootState) =>
  state.listing.publishListingInProgress;

export const publishListingErrorSelector = (state: RootState) =>
  state.listing.publishListingError;

export const currentListingSelector = (state: RootState) =>
  state.listing.currentListing;

export const listingDraftSelector = (state: RootState) =>
  state.listing.listingDraft;

export const uploadedImagesSelector = (state: RootState) =>
  state.listing.uploadedImages;

export const uploadedImagesOrderSelector = (state: RootState) =>
  state.listing.uploadedImagesOrder;

// Combined selectors
export const listingInProgressSelector = createSelector(
  [
    createListingDraftInProgressSelector,
    updateListingInProgressSelector,
    publishListingInProgressSelector,
  ],
  (createInProgress, updateInProgress, publishInProgress) =>
    createInProgress || updateInProgress || publishInProgress,
);

export const listingErrorSelector = createSelector(
  [
    createListingDraftErrorSelector,
    updateListingErrorSelector,
    publishListingErrorSelector,
  ],
  (createError, updateError, publishError) =>
    createError || updateError || publishError,
);

export default listingSlice.reducer;