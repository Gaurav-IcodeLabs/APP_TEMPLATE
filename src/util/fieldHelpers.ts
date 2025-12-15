// This util file is about user and listing fields.
// I.e. These are custom fields to data entities. They are added through the Marketplace Console.
// In the codebase, we also have React Final Form fields, which are wrapper around user inputs.

import {
  isPurchaseProcessAlias,
  isBookingProcessAlias,
  isNegotiationProcessAlias,
} from '../transactions/transaction';
import { SCHEMA_TYPE_MULTI_ENUM, SCHEMA_TYPE_TEXT, SCHEMA_TYPE_YOUTUBE } from '../constants';
import appSettings from '../config/settings';
import { ListingField, EnumOption } from '../types/config/configListing';
import { UserFieldConfigItem } from '../types/config/configUser';
import { CategoryNode } from '../types/config/config';
import { ExtendedDataValue } from './userHelpers';

const { stripeSupportedCurrencies, subUnitDivisors } = appSettings;

type EntityTypeKey = 'userType' | 'listingType' | 'category';

interface KeyMappingConfig {
  wrapper: string;
  limitTo: string;
  ids: string;
}

const keyMapping: Record<EntityTypeKey, KeyMappingConfig> = {
  userType: {
    wrapper: 'userTypeConfig',
    limitTo: 'limitToUserTypeIds',
    ids: 'userTypeIds',
  },
  listingType: {
    wrapper: 'listingTypeConfig',
    limitTo: 'limitToListingTypeIds',
    ids: 'listingTypeIds',
  },
  category: {
    wrapper: 'categoryConfig',
    limitTo: 'limitToCategoryIds',
    ids: 'categoryIds',
  },
};

// Union type for field configs that can have entity type restrictions
type FieldConfigWithRestrictions = ListingField | UserFieldConfigItem;

// Type for entity type config wrappers
// Note: UserFieldTypeConfig in types doesn't include userTypeIds, but it's used in practice
interface UserTypeConfigWrapper {
  limitToUserTypeIds: boolean;
  userTypeIds?: string[];
}

interface ListingTypeConfigWrapper {
  limitToListingTypeIds: boolean;
  listingTypeIds?: string[];
}

interface CategoryConfigWrapper {
  limitToCategoryIds: boolean;
  categoryIds?: string[];
}

// Union type for all config wrappers
type EntityTypeConfigWrapper = UserTypeConfigWrapper | ListingTypeConfigWrapper | CategoryConfigWrapper;

interface EntityTypeRestrictions {
  isLimited: boolean;
  limitToIds: string[] | undefined;
}

const getEntityTypeRestrictions = (
  entityTypeKey: EntityTypeKey,
  config: FieldConfigWithRestrictions | null | undefined
): EntityTypeRestrictions => {
  const mapping = keyMapping[entityTypeKey];
  if (!mapping || !config) {
    return { isLimited: false, limitToIds: undefined };
  }
  
  // Type-safe access to config wrapper based on entity type key
  let wrapper: EntityTypeConfigWrapper | undefined;
  
  if (entityTypeKey === 'userType') {
    const userFieldConfig = config as UserFieldConfigItem;
    if (userFieldConfig.userTypeConfig) {
      wrapper = {
        limitToUserTypeIds: userFieldConfig.userTypeConfig.limitToUserTypeIds,
        userTypeIds: (userFieldConfig.userTypeConfig as UserTypeConfigWrapper).userTypeIds,
      };
    }
  } else if (entityTypeKey === 'listingType') {
    const listingFieldConfig = config as ListingField;
    if (listingFieldConfig.listingTypeConfig) {
      wrapper = {
        limitToListingTypeIds: listingFieldConfig.listingTypeConfig.limitToListingTypeIds,
        listingTypeIds: listingFieldConfig.listingTypeConfig.listingTypeIds,
      };
    }
  } else if (entityTypeKey === 'category') {
    const listingFieldConfig = config as ListingField;
    if (listingFieldConfig.categoryConfig) {
      wrapper = {
        limitToCategoryIds: listingFieldConfig.categoryConfig.limitToCategoryIds,
        categoryIds: listingFieldConfig.categoryConfig.categoryIds,
      };
    }
  }
  
  if (!wrapper) {
    return { isLimited: false, limitToIds: undefined };
  }
  
  // Access the properties using the mapping keys
  const isLimitedKey = mapping.limitTo as keyof EntityTypeConfigWrapper;
  const idsKey = mapping.ids as keyof EntityTypeConfigWrapper;
  
  const isLimited = wrapper[isLimitedKey] as boolean | undefined;
  const limitToIds = wrapper[idsKey] as string[] | undefined;

  return { isLimited: Boolean(isLimited), limitToIds };
};

/**
 * Check if the given listing type is allowed according to the given listing field config.
 *
 * @param entityTypeKey entity type key (e.g. 'listingType', 'userType')
 * @param entityType entity type to be checked (e.g. 'amenities'). Accepts an array too.
 * @param fieldConfig the config of a custom listing field
 * @returns true if listingTypeConfig allows the listingType
 */
export const isFieldFor = (
  entityTypeKey: EntityTypeKey,
  entityType: string | string[],
  fieldConfig: FieldConfigWithRestrictions | null | undefined
): boolean => {
  const { isLimited, limitToIds } = getEntityTypeRestrictions(entityTypeKey, fieldConfig);

  if (!isLimited || !limitToIds) {
    return true;
  }

  if (Array.isArray(entityType)) {
    return limitToIds.some(cid => entityType.includes(cid));
  }
  return limitToIds.includes(entityType);
};

export const isFieldForUserType = (
  userType: string,
  fieldConfig: FieldConfigWithRestrictions | null | undefined
): boolean => isFieldFor('userType', userType, fieldConfig);

export const isFieldForListingType = (
  listingType: string,
  fieldConfig: FieldConfigWithRestrictions | null | undefined
): boolean => isFieldFor('listingType', listingType, fieldConfig);

export const isFieldForCategory = (
  categories: string | string[],
  fieldConfig: FieldConfigWithRestrictions | null | undefined
): boolean => isFieldFor('category', categories, fieldConfig);

/**
 * Returns the value of the attribute in extended data.
 * @param data extended data containing the value
 * @param key attribute key in extended data
 * @returns the value or null if not found
 */
export const getFieldValue = (
  data: Record<string, ExtendedDataValue> | null | undefined,
  key: string
): ExtendedDataValue => {
  const value = data?.[key];
  return value != null ? value : null;
};

/**
 * Picks current values for listing categories based on provided public data and configuration.
 * This function validates if the initial values match with the configuration received via assets.
 * If a categoryLevel value doesn't match with the category configuration, it is not passed on to the form.
 *
 * @param data publicData or some other set where category-related nested data is available
 * @param prefix prefix used for storing nested values.
 * @param level refers to nesting level (starts from 1)
 * @param categoryLevelOptions array of nested category structure
 * @returns pick valid prefixed properties
 */
export const pickCategoryFields = (
  data: Record<string, ExtendedDataValue> | null | undefined,
  prefix: string,
  level: number,
  categoryLevelOptions: CategoryNode[] = []
): Record<string, ExtendedDataValue> => {
  const currentCategoryKey = `${prefix}${level}`;
  const currentCategoryValue = data?.[currentCategoryKey];
  const isCategoryLevelSet = typeof currentCategoryValue !== 'undefined';

  // Validate the value against category options
  const categoryOptionConfig = categoryLevelOptions.find(
    category => category.id === currentCategoryValue
  );
  const isValidCategoryValue = !!categoryOptionConfig;
  const nextLevelOptions = categoryOptionConfig?.subcategories || [];

  // Return category level property if it's found from the data and the value is one of the valid options.
  // Go through all the nested levels.
  return isCategoryLevelSet && isValidCategoryValue
    ? {
        [currentCategoryKey]: currentCategoryValue,
        ...pickCategoryFields(data, prefix, level + 1, nextLevelOptions),
      }
    : {};
};

// Types for custom field props
type MultiEnumFieldProps = {
  schemaType: typeof SCHEMA_TYPE_MULTI_ENUM;
  key: string;
  heading: string;
  options: Array<{ key: string; label: string }>;
  selectedOptions: string[];
  showUnselectedOptions: boolean;
};

type TextFieldProps = {
  schemaType: typeof SCHEMA_TYPE_TEXT;
  key: string;
  heading: string;
  text: string;
};

type YoutubeFieldProps = {
  schemaType: typeof SCHEMA_TYPE_YOUTUBE;
  key: string;
  heading: string;
  videoUrl: ExtendedDataValue;
};

type CustomFieldProps = MultiEnumFieldProps | TextFieldProps | YoutubeFieldProps;

/**
 * Pick props for SectionMultiEnumMaybe and SectionTextMaybe display components.
 *
 * @param publicData entity public data containing the value(s) to be displayed
 * @param metadata entity metadata containing the value(s) to be displayed
 * @param fieldConfigs array of custom field configuration objects
 * @param entityTypeKey the name of the key denoting the entity type in publicData.
 * E.g. 'listingType', 'userType', or 'category'
 * @param shouldPickFn an optional function to add extra check before including the field props
 * @returns an array of objects with attributes 'schemaType', 'key', and 'heading', as well as either
 * - 'options' and 'selectedOptions' for SCHEMA_TYPE_MULTI_ENUM
 * - or 'text' for SCHEMA_TYPE_TEXT
 */
export const pickCustomFieldProps = (
  publicData: Record<string, ExtendedDataValue> | null | undefined,
  metadata: Record<string, ExtendedDataValue> | null | undefined,
  fieldConfigs: ListingField[] | null | undefined,
  entityTypeKey: 'listingType' | 'userType' | 'category',
  shouldPickFn?: (config: ListingField) => boolean
): CustomFieldProps[] => {
  return fieldConfigs?.reduce<CustomFieldProps[]>((pickedElements, config) => {
    const { key, enumOptions, schemaType, scope = 'public', showConfig } = config;
    const { label, unselectedOptions: showUnselectedOptions } = showConfig || {};
    const entityType = publicData?.[entityTypeKey] as string | string[] | undefined;
    const isTargetEntityType = isFieldFor(entityTypeKey, entityType || '', config);

    const createFilterOptions = (options: EnumOption[] | undefined): Array<{ key: string; label: string }> =>
      (options || []).map(o => ({ key: `${o.option}`, label: o.label }));

    const shouldPick = shouldPickFn ? shouldPickFn(config) : true;

    const value =
      scope === 'public'
        ? getFieldValue(publicData, key)
        : scope === 'metadata'
        ? getFieldValue(metadata, key)
        : null;

    if (!isTargetEntityType || !shouldPick) {
      return pickedElements;
    }

    // Handle multi-enum schema type
    if (schemaType === SCHEMA_TYPE_MULTI_ENUM) {
      return [
        ...pickedElements,
        {
          schemaType: SCHEMA_TYPE_MULTI_ENUM,
          key,
          heading: label,
          options: createFilterOptions(enumOptions),
          selectedOptions: (Array.isArray(value) ? value : []) as string[],
          showUnselectedOptions: showUnselectedOptions !== false,
        },
      ];
    }

    // Handle text schema type
    if (schemaType === SCHEMA_TYPE_TEXT && value) {
      return [
        ...pickedElements,
        {
          schemaType: SCHEMA_TYPE_TEXT,
          key,
          heading: label,
          text: String(value),
        },
      ];
    }

    // Handle youtube schema type (check as string since ListingField schemaType doesn't include it)
    const schemaTypeStr = String(schemaType);
    if (schemaTypeStr === SCHEMA_TYPE_YOUTUBE || schemaTypeStr === 'youtubeVideoUrl') {
      return [
        ...pickedElements,
        {
          schemaType: SCHEMA_TYPE_YOUTUBE,
          key,
          videoUrl: value,
          heading: label,
        },
      ];
    }

    return pickedElements;
  }, []) || [];
};

/**
 * Validates if the specified currency is compatible with the transaction process
 * and the payment processor being used.
 *
 * @param transactionProcessAlias - The alias of the transaction process. Expected to be in the format
 *                               of "PROCESS_NAME/version" (e.g., "booking-default/release-1").
 * @param listingCurrency - A currency code (e.g., "USD", "EUR").
 * @param paymentProcessor - (Optional) The name of the payment processor, such as "stripe".
 *                                         Defaults to null if no payment processor is specified.
 *
 * @returns Returns true if the currency is valid for the specified transaction process
 *                      and payment processor, otherwise false.
 *
 * Notes:
 * - The function checks if the specified currency is compatible with Stripe (for booking or purchase processes).
 * - Stripe only supports certain currencies. You can use other currencies on your marketplace for transactions that
 * - don't utilise Stripe. This function performs a check that the currency and transaction process provided are compatible
 * - with each other.
 * - When the paymentProcessor flag is passed as null, this function ensures either:
 *    a) the currency is listed in the subUnitDivisors list (in settingsCurrency.js)
 *    b) The process is Stripe-compatible with a Stripe-supported currency.
 */
export const isValidCurrencyForTransactionProcess = (
  transactionProcessAlias: string,
  listingCurrency: string,
  paymentProcessor: string | null = null
): boolean => {
  // booking and purchase processes use Stripe actions.
  const isStripeRelatedProcess =
    isPurchaseProcessAlias(transactionProcessAlias) ||
    isBookingProcessAlias(transactionProcessAlias) ||
    isNegotiationProcessAlias(transactionProcessAlias);

  // Determine if the listing currency is supported by Stripe
  const isStripeSupportedCurrency = stripeSupportedCurrencies.includes(listingCurrency);

  if (paymentProcessor === 'stripe') {
    // If using Stripe, only return true if both process and currency are compatible with Stripe
    return isStripeRelatedProcess && isStripeSupportedCurrency;
  } else if (paymentProcessor === null) {
    // If payment processor is not specified, allow any non-stripe related process with valid subunits or Stripe-related processes with supported currency
    return (
      (isStripeRelatedProcess && isStripeSupportedCurrency) ||
      (!isStripeRelatedProcess && Object.keys(subUnitDivisors).includes(listingCurrency))
    );
  }
  
  // For other payment processors, return false (not supported)
  return false;
};
