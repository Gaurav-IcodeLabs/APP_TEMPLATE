import { ListingType, ListingField, SaveConfig } from '@appTypes/config';
import { AppConfig } from '@redux/slices/hostedAssets.slice';
import {
  displayLocation,
  displayPrice,
  displayDeliveryPickup,
  displayDeliveryShipping,
  requireListingImage,
} from '@util/configHelpers';
import { isFieldForCategory, isFieldForListingType, pickCategoryFields } from '@util/fieldHelpers';
import {
  SCHEMA_TYPE_ENUM,
  SCHEMA_TYPE_MULTI_ENUM,
  SCHEMA_TYPE_TEXT,
  SCHEMA_TYPE_LONG,
  SCHEMA_TYPE_BOOLEAN,
  SCHEMA_TYPE_YOUTUBE,
} from '@constants/schemaTypes';
import {
  DETAILS,
  PRICING,
  PRICING_AND_STOCK,
  DELIVERY,
  LOCATION,
  AVAILABILITY,
  PHOTOS,
  STYLE,
  TabType,
} from './constants/tabs';
import { EditListingForm } from './types/editListingForm.type';
import { INQUIRY_PROCESS_NAME } from '@transactions/transaction';

/**
 * Pick only allowed tabs for the given process and listing type configuration.
 * - The location tab could be omitted for booking process
 * - The delivery tab could be omitted for purchase process
 * - The location and pricing tabs could be omitted for negotiation process
 * - The location and pricing tabs could be omitted for inquiry process
 *
 * @param processName - The name of the process
 * @param listingTypeConfig - The listing type configuration
 * @returns The allowed tabs for the given process and listing type configuration
 */
export const tabsForListingType = (
  processName: string,
  listingTypeConfig: ListingType | undefined,
): TabType[] => {
  const locationMaybe = (displayLocation(listingTypeConfig) ? [LOCATION] : []) as TabType[];
  const pricingMaybe = (displayPrice(listingTypeConfig) ? [PRICING] : []) as TabType[];
  const deliveryMaybe =
    (displayDeliveryPickup(listingTypeConfig) || displayDeliveryShipping(listingTypeConfig)
      ? [DELIVERY]
      : []) as TabType[];
  const styleOrPhotosTab = (requireListingImage(listingTypeConfig) ? [PHOTOS] : [STYLE]) as TabType[];

  // You can reorder these panels.
  // Note 1: You need to change save button translations for new listing flow
  // Note 2: Ensure that draft listing is created after the first panel
  //         and listing publishing happens after last panel.
  // Note 3: The first tab creates a draft listing and title is mandatory attribute for it.
  //         Details tab asks for "title" and is therefore the first tab in the wizard flow.
  const tabs: Record<string, TabType[]> = {
    'default-booking': [DETAILS, ...locationMaybe, PRICING, AVAILABILITY, ...styleOrPhotosTab],
    'default-purchase': [DETAILS, PRICING_AND_STOCK, ...deliveryMaybe, ...styleOrPhotosTab],
    'default-negotiation': [DETAILS, ...locationMaybe, ...pricingMaybe, ...styleOrPhotosTab],
    'default-inquiry': [DETAILS, ...locationMaybe, ...pricingMaybe, ...styleOrPhotosTab],
  };

  return tabs[processName] || tabs[INQUIRY_PROCESS_NAME];
};

/**
 * Validate listing fields (in extended data) that are included through configListing.js
 * This is used to check if listing creation flow can show the "next" tab as active.
 *
 * @param publicData - Public data from form
 * @param privateData - Private data from form
 * @param config - App configuration
 */
const hasValidListingFieldsInExtendedData = (
  publicData: Record<string, any>,
  privateData: Record<string, any>,
  config: AppConfig | undefined,
): boolean => {
  if (!config?.listing?.listingFields) {
    return true;
  }

  const isValidField = (fieldConfig: ListingField, fieldData: Record<string, any>): boolean => {
    const { key, schemaType, enumOptions = [], saveConfig = {} as SaveConfig } = fieldConfig;

    const schemaOptionKeys = enumOptions.map(o => `${(o as any).option}`);
    const hasValidEnumValue = (optionData: string) => {
      return schemaOptionKeys.includes(optionData);
    };
    const hasValidMultiEnumValues = (savedOptions: string[]) => {
      return savedOptions.every(optionData => schemaOptionKeys.includes(optionData));
    };

    const categoryKey = config.categoryConfiguration?.key;
    const categoryOptions = config.categoryConfiguration?.categories;
    const categoriesObj = categoryKey && categoryOptions
      ? pickCategoryFields(publicData, categoryKey, 1, categoryOptions)
      : {};
    const currentCategories = Object.values(categoriesObj);

    const isTargetListingType = isFieldForListingType(publicData?.listingType, fieldConfig);
    const isTargetCategory = isFieldForCategory(currentCategories, fieldConfig);
    const isRequired =
      !!saveConfig.isRequired && isTargetListingType && isTargetCategory;

    if (isRequired) {
      const savedListingField = fieldData[key];
      switch (schemaType) {
        case SCHEMA_TYPE_ENUM:
          return typeof savedListingField === 'string' && hasValidEnumValue(savedListingField);
        case SCHEMA_TYPE_MULTI_ENUM:
          return Array.isArray(savedListingField) && hasValidMultiEnumValues(savedListingField);
        case SCHEMA_TYPE_TEXT:
          return typeof savedListingField === 'string';
        case SCHEMA_TYPE_LONG:
          return typeof savedListingField === 'number' && Number.isInteger(savedListingField);
        case SCHEMA_TYPE_BOOLEAN:
          return savedListingField === true || savedListingField === false;
        case SCHEMA_TYPE_YOUTUBE:
          return typeof savedListingField === 'string';
        default:
          return false;
      }
    }
    return true;
  };

  return config.listing.listingFields.reduce((isValid, fieldConfig) => {
    const data = fieldConfig.scope === 'private' ? privateData : publicData;
    return isValid && isValidField(fieldConfig, data);
  }, true);
};

/**
 * Check if a wizard tab is completed based on form data.
 *
 * @param tab - wizard's tab
 * @param formData - form data to be checked
 * @param config - app configuration
 * @returns true if tab / step is completed
 */
export const tabCompleted = (
  tab: TabType,
  formData: EditListingForm,
  config: AppConfig | undefined,
): boolean => {
  const {
    listingType,
    title,
    description,
    location,
    price,
    images,
    availabilityPlan,
    deliveryOptions,
    fields,
  } = formData;

  // Extract public and private data from fields
  // In the form, custom fields are stored in the 'fields' object
  // We need to separate them by scope (public vs private)
  const publicData: Record<string, any> = {
    listingType,
    ...fields,
  };
  const privateData: Record<string, any> = {};

  // Separate public and private fields based on config
  if (config?.listing?.listingFields) {
    config.listing.listingFields.forEach(fieldConfig => {
      const fieldKey = fieldConfig.scope === 'private' ? `priv_${fieldConfig.key}` : `pub_${fieldConfig.key}`;
      if (fields[fieldKey] !== undefined) {
        if (fieldConfig.scope === 'private') {
          privateData[fieldConfig.key] = fields[fieldKey];
        } else {
          publicData[fieldConfig.key] = fields[fieldKey];
        }
      }
    });
  }

  // Get transaction process info from config
  const listingTypeConfig = config?.listing?.listingTypes?.find(
    type => type.listingType === listingType,
  );
  const transactionProcessAlias = listingTypeConfig?.transactionType?.alias;
  const unitType = listingTypeConfig?.transactionType?.unitType;

  switch (tab) {
    case DETAILS:
      return !!(
        description &&
        title &&
        listingType &&
        transactionProcessAlias &&
        unitType &&
        hasValidListingFieldsInExtendedData(publicData, privateData, config)
      );
    case PRICING:
      return !!price;
    case PRICING_AND_STOCK:
      return !!price;
    case DELIVERY:
      return !!(deliveryOptions && deliveryOptions.length > 0);
    case LOCATION:
      return !!(location?.origin?.length === 2 && location?.address);
    case AVAILABILITY:
      return !!availabilityPlan;
    case PHOTOS:
      return !!(images && images.length > 0);
    case STYLE:
      // STYLE tab completion check - would need cardStyle in form data
      // For now, return false as it's not in the form type
      return false;
    default:
      return false;
  }
};

/**
 * Check which wizard tabs are active and which are not yet available.
 * - First tab: always active
 * - In edit mode (!isNew): tabs are active if listingType exists (existing listings should have this)
 * - In new listing flow (isNew): tabs are active only if previous tab is completed
 *
 * @param isNew - flag if a new listing is being created or an old one being edited
 * @param formData - form data to be checked
 * @param tabs - array of tabs used for this listing. These depend on transaction process.
 * @param config - app configuration
 * @returns object containing activity / editability of different tabs of this wizard
 */
export const tabsActive = (
  isNew: boolean,
  formData: EditListingForm,
  tabs: TabType[],
  config: AppConfig | undefined,
): Record<TabType, boolean> => {
  return tabs.reduce(
    (acc, tab) => {
      const previousTabIndex = tabs.findIndex(t => t === tab) - 1;
      const validTab = previousTabIndex >= 0;
      const hasListingType = !!formData.listingType;
      const prevTabCompletedInNewFlow = validTab
        ? tabCompleted(tabs[previousTabIndex], formData, config)
        : false;
      // Logic matches web-template:
      // - First tab: always active (validTab = false)
      // - Edit mode (!isNew): active if hasListingType
      // - New listing (isNew): active if previous tab completed
      const isActive =
        validTab && !isNew
          ? hasListingType
          : validTab && isNew
          ? prevTabCompletedInNewFlow
          : true; // First tab is always active
      return { ...acc, [tab]: isActive };
    },
    {} as Record<TabType, boolean>,
  );
};

/**
 * Get tab label and submit button text.
 * This is a simplified version - in a real implementation, you'd use i18n.
 *
 * @param tab - name of the tab/panel in the wizard
 * @param isNewListingFlow - whether this is a new listing flow
 * @param isPriceDisabled - whether price is disabled
 * @param processName - transaction process name
 * @returns object with label and submitButton text
 */
export const tabLabelAndSubmit = (
  tab: TabType,
  isNewListingFlow: boolean,
  isPriceDisabled: boolean,
  // processName: string,
): { label: string; submitButton: string } => {
  // const processNameString = isNewListingFlow ? `${processName}.` : '';
  // const newOrEdit = isNewListingFlow ? 'new' : 'edit';

  let labelKey = '';
  let submitButtonKey = '';

  switch (tab) {
    case DETAILS:
      labelKey = 'Details';
      submitButtonKey = `Save Details`;
      break;
    case PRICING:
      labelKey = 'Pricing';
      submitButtonKey = `Save Pricing`;
      break;
    case PRICING_AND_STOCK:
      labelKey = 'Pricing & Stock';
      submitButtonKey = `Save Pricing & Stock`;
      break;
    case DELIVERY:
      labelKey = 'Delivery';
      submitButtonKey = `Save Delivery`;
      break;
    case LOCATION:
      labelKey = 'Location';
      submitButtonKey =
        isPriceDisabled && isNewListingFlow
          ? `Save Location`
          : `Save Location`;
      break;
    case AVAILABILITY:
      labelKey = 'Availability';
      submitButtonKey = `Save Availability`;
      break;
    case PHOTOS:
      labelKey = 'Photos';
      submitButtonKey = `Save Photos`;
      break;
    case STYLE:
      labelKey = 'Style';
      submitButtonKey = `Save Style`;
      break;
  }

  return {
    label: labelKey,
    submitButton: submitButtonKey,
  };
};
