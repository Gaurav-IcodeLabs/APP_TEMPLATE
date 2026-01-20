import { RouteProp, useRoute } from '@react-navigation/native';
import { EDIT_LISTING_SCREENS } from './screens.constant';
import { EditListingWizardParamList } from './types/navigation.types';
import { createImageVariantConfig, types } from '@util/sdkLoader';
import { ListingImageLayout } from '@appTypes/config/configLayoutAndBranding';
import { isFieldForCategory, isFieldForListingType, pickCategoryFields } from '@util/fieldHelpers';
import { EXTENDED_DATA_SCHEMA_TYPES } from '@constants/schemaTypes';
import { CategoryNode, ListingField, ListingFields } from '@appTypes/config';
import { EditListingForm } from './types/editListingForm.type';

export const useEditListingWizardRoute = () => {
  return useRoute<
    RouteProp<
      EditListingWizardParamList,
      typeof EDIT_LISTING_SCREENS.EDIT_LISTING_PAGE
    >
  >();
};

export const getImageVariantInfo = (listingImageConfig: ListingImageLayout) => {
  const {
    aspectWidth = 1,
    aspectHeight = 1,
    variantPrefix = 'listing-card',
  } = listingImageConfig;
  const aspectRatio = aspectHeight / aspectWidth;
  const fieldsImage = [
    `variants.${variantPrefix}`,
    `variants.${variantPrefix}-2x`,
  ];

  return {
    fieldsImage,
    imageVariants: {
      ...createImageVariantConfig(`${variantPrefix}`, 400, aspectRatio),
      ...createImageVariantConfig(`${variantPrefix}-2x`, 800, aspectRatio),
    },
  };
};

/**
 * Pick extended data fields from given form data.
 */
export const pickListingFieldsData = (
  data: Record<string, any>,
  targetScope: 'public' | 'private',
  targetListingType: string,
  targetCategories: Record<string, string>,
  listingFieldConfigs: ListingFields,
): Record<string, any> => {
  const targetCategoryIds = Object.values(targetCategories) as string[];

  return listingFieldConfigs.reduce(
    (fields: Record<string, any>, fieldConfig: ListingField) => {
      const { key, scope = 'public', schemaType } = fieldConfig || {};
      const namespacePrefix = scope === 'public' ? `pub_` : `priv_`;
      const namespacedKey = `${namespacePrefix}${key}`;

      const isKnownSchemaType = EXTENDED_DATA_SCHEMA_TYPES.includes(schemaType);
      const isTargetScope = scope === targetScope;
      const isTargetListingType = isFieldForListingType(
        targetListingType,
        fieldConfig as any,
      );
      const isTargetCategory = isFieldForCategory(
        targetCategoryIds,
        fieldConfig as any,
      );

      if (
        isKnownSchemaType &&
        isTargetScope &&
        isTargetListingType &&
        isTargetCategory
      ) {
        const fieldValue = data[namespacedKey] || null;
        return { ...fields, [key]: fieldValue };
      } else if (isKnownSchemaType && isTargetScope) {
        // Note: this clears extra custom fields
        return { ...fields, [key]: null };
      }
      return fields;
    },
    {},
  );
};

export const transformFormToListingData = (
  formData: EditListingForm,
  marketplaceCurrency: string,
  listingType: string,
  categoryKey: string,
  listingCategories: CategoryNode[] = [],
  listingFields: ListingFields,
) => {
  const {
    title,
    description,
    location,
    images,
    price,
    priceVariants,
    bookingLengthInMinutes,
    startTimeInterval,
    availabilityPlan,
    deliveryOptions,
    pickupLocation,
    shippingPriceOneItem,
    shippingPriceAdditionalItems,
    ...rest
  } = formData;

  /* ---------------------------
     PUBLIC DATA
  ---------------------------- */
  const publicData: Record<string, any> = {
    listingType,
    transactionProcessAlias: rest.fields.transactionProcessAlias,
    unitType: rest.fields.unitType,
  };

  if (priceVariants?.length) {
    publicData.priceVariationsEnabled = true;
    publicData.priceVariants = priceVariants.map(v => ({
      name: v.name,
      price: v.priceInSubunits ? v.priceInSubunits * 100 : undefined,
      bookingLengthInMinutes: v.bookingLengthInMinutes,
    }));
  }

  if (bookingLengthInMinutes) {
    publicData.bookingLengthInMinutes = bookingLengthInMinutes;
  }

  if (startTimeInterval) {
    publicData.startTimeInterval = startTimeInterval;
  }

  if (deliveryOptions?.length) {
    publicData.deliveryOptions = deliveryOptions;
  }

  if (location?.address) {
    publicData.location = {
      address: location.address,
      building: location.building ?? '',
    };
  }

  if (pickupLocation?.address) {
    publicData.pickupLocation = {
      address: pickupLocation.address,
      building: pickupLocation.building,
    };
  }

  if (pickupLocation?.origin?.length === 2) {
    publicData.pickupLocationGeolocation = {
      lat: pickupLocation.origin[0],
      lng: pickupLocation.origin[1],
    };
  }

  if (shippingPriceOneItem) {
    publicData.shippingPriceOneItem = Math.round(
      Number(shippingPriceOneItem) * 100,
    );
  }

  if (shippingPriceAdditionalItems) {
    publicData.shippingPriceAdditionalItems = Math.round(
      Number(shippingPriceAdditionalItems) * 100,
    );
  }

  /* ---------------------------
     CATEGORY + CUSTOM FIELDS
  ---------------------------- */
  const nestedCategories = pickCategoryFields(
    rest.fields,
    categoryKey,
    1,
    listingCategories,
  );

  Object.assign(publicData, {
    ...[1, 2, 3].reduce((a, i) => ({ ...a, [`${categoryKey}${i}`]: null }), {}),
    ...nestedCategories,
  });

  const publicListingFields = pickListingFieldsData(
    rest,
    'public',
    listingType,
    nestedCategories,
    listingFields,
  );

  const privateListingFields = pickListingFieldsData(
    rest,
    'private',
    listingType,
    nestedCategories,
    listingFields,
  );

  Object.assign(publicData, publicListingFields);

  /* ---------------------------
     PRICE (Sharetribe requires one)
  ---------------------------- */
  let resolvedPrice: any | undefined;

  if (priceVariants?.length && priceVariants[0].priceInSubunits != null) {
    resolvedPrice = new types.Money(
      priceVariants[0].priceInSubunits * 100,
      marketplaceCurrency,
    );
  } else if (price != null) {
    resolvedPrice = new types.Money(price * 100, marketplaceCurrency);
  }

  /* ---------------------------
     FINAL PAYLOAD
  ---------------------------- */
  return {
    title,
    description,
    price: resolvedPrice,
    images: images?.map(i => i.id),
    geolocation:
      location?.origin?.length === 2
        ? { lat: location.origin[0], lng: location.origin[1] }
        : undefined,
    availabilityPlan,
    publicData: Object.keys(publicData).length ? publicData : undefined,
    privateData: Object.keys(privateListingFields).length
      ? privateListingFields
      : undefined,
  };
};