import { EXTENDED_DATA_SCHEMA_TYPES } from '@constants/schemaTypes';
import { getFieldValue } from './fieldHelpers';
import {
  CustomListingFieldInputProps,
  ListingFieldConfigItem,
} from '@appTypes/config';

interface PickedFields {
  [key: string]: any;
}

/**
 * Get the namespaced attribute key based on the specified extended data scope and attribute key
 * @param {*} scope extended data scope
 * @param {*} key attribute key in extended data
 * @returns a string containing the namespace prefix and the attribute name
 */
export const addScopePrefix = (
  scope: 'private' | 'public',
  key: string,
) => {
  const scopeFnMap = {
    private: (k: string) => `priv_${k}`,
    public: (k: string) => `pub_${k}`,
  };

  const validKey = key.replace(/\s/g, '_');
  const keyScoper = scopeFnMap[scope];

  return !!keyScoper ? keyScoper(validKey) : validKey;
};

/**
 * Pick extended data fields from given form data for listings.
 * Picking is based on extended data configuration for the listing and target scope and listing type.
 *
 * @param {Object} data values to look through against listingConfig
 * @param {String} targetScope Check that the scope of extended data the config matches
 * @param {String} targetListingType Check that the extended data is relevant for this listing type.
 * @param {Object} listingFieldConfigs Extended data configurations for listing fields.
 * @returns Array of picked extended data fields from submitted data.
 */
export const pickListingFieldsData = (
  data: any,
  targetScope: 'public' | 'private',
  targetListingType: string,
  listingFieldConfigs: ListingFieldConfigItem[],
): PickedFields => {
  return listingFieldConfigs.reduce(
    (fields: PickedFields, field: ListingFieldConfigItem) => {
      const { key, listingTypeConfig, scope = 'public', schemaType } = field || {};
      const namespacedKey = addScopePrefix(scope, key);

      const isKnownSchemaType = EXTENDED_DATA_SCHEMA_TYPES.includes(schemaType);
      const isTargetScope = scope === targetScope;
      const isTargetListingType =
        !listingTypeConfig?.limitToListingTypeIds ||
        (listingTypeConfig?.listingTypeIds || []).includes(targetListingType);

      if (isKnownSchemaType && isTargetScope && isTargetListingType) {
        const fieldValue = getFieldValue(data, namespacedKey);
        return { ...fields, [key]: fieldValue };
      } else if (isKnownSchemaType && isTargetScope && !isTargetListingType) {
        // Clear extra custom fields that don't match listing type
        return { ...fields, [key]: null };
      }
      return fields;
    },
    {},
  );
};

/**
 * Pick extended data fields from given extended data of the listing entity.
 * This returns namespaced initial values for the form.
 *
 * @param {Object} data extended data values to look through
 * @param {String} targetScope Check that the scope of extended data the config matches
 * @param {String} targetListingType Check that the extended data is relevant for this listing type.
 * @param {Object} listingFieldConfigs Extended data configurations for listing fields.
 * @returns Array of picked extended data fields
 */
export const initialValuesForListingFields = (
  data: any,
  targetScope: 'public' | 'private',
  targetListingType: string,
  listingFieldConfigs: ListingFieldConfigItem[],
) => {
  return listingFieldConfigs.reduce((fields, field) => {
    const { key, listingTypeConfig, scope = 'public', schemaType } = field || {};
    const namespacedKey = addScopePrefix(scope, key);

    const isKnownSchemaType = EXTENDED_DATA_SCHEMA_TYPES.includes(schemaType);
    const isTargetScope = scope === targetScope;
    const isTargetListingType =
      !listingTypeConfig?.limitToListingTypeIds ||
      listingTypeConfig?.listingTypeIds?.includes(targetListingType);

    if (isKnownSchemaType && isTargetScope && isTargetListingType) {
      const fieldValue = getFieldValue(data, key);
      return { ...fields, [namespacedKey]: fieldValue };
    }
    return fields;
  }, {});
};

/**
 * Returns props for custom listing fields
 * @param {*} listingFieldsConfig Configuration for listing fields
 * @param {*} t Translation function
 * @param {*} listingType Listing type to restrict fields to
 * @returns an array of props for CustomExtendedDataField
 */
export const getPropsForCustomListingFieldInputs = (
  listingFieldsConfig: ListingFieldConfigItem[],
  t: (key: string) => string,
  listingType: string | null = null,
): CustomListingFieldInputProps[] => {
  return (
    listingFieldsConfig?.reduce<CustomListingFieldInputProps[]>(
      (pickedFields, fieldConfig) => {
        const { key, listingTypeConfig, schemaType, scope } = fieldConfig || {};
        const namespacedKey = addScopePrefix(scope || 'public', key);

        const isKnownSchemaType = EXTENDED_DATA_SCHEMA_TYPES.includes(schemaType);
        const isTargetListingType =
          !listingTypeConfig?.limitToListingTypeIds ||
          listingTypeConfig?.listingTypeIds?.includes(listingType ?? '');

        if (isKnownSchemaType && isTargetListingType) {
          const defaultRequiredMessage = t('CreateListingForm.requiredFieldGeneric');
          
          pickedFields.push({
            key: namespacedKey,
            name: namespacedKey,
            fieldConfig,
            defaultRequiredMessage,
          });
        }
        return pickedFields;
      },
      [],
    ) || []
  );
};

/**
 * Get non-listing field parameters from form data
 * These are the standard listing fields like title, description, price, etc.
 */
export const getNonListingFieldParams = (values: any) => {
  const {
    title,
    description,
    price,
    location,
    images,
    stock,
    availabilityPlan,
    ...customFields
  } = values;

  return {
    title,
    description,
    price,
    location,
    images,
    stock,
    availabilityPlan,
  };
};