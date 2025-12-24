import { z } from 'zod';
import { ListingFieldConfigItem } from '@appTypes/config';

export interface CreateListingFormValues {
  title: string;
  description: string;
  price: string;
  [key: string]: any; // For dynamic custom fields
}

export const getCreateListingSchema = (
  selectedListingType: string | null,
  listingFields: ListingFieldConfigItem[],
  t: (key: string) => string
) => {
  const baseSchema = {
    title: z
      .string()
      .min(1, t('CreateListingForm.titleRequired'))
      .max(100, t('CreateListingForm.titleTooLong')),
    description: z
      .string()
      .min(1, t('CreateListingForm.descriptionRequired'))
      .max(1000, t('CreateListingForm.descriptionTooLong')),
    price: z
      .string()
      .min(1, t('CreateListingForm.priceRequired'))
      .refine(
        (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
        t('CreateListingForm.priceInvalid')
      ),
  };

  // Add custom field validations
  const customFieldSchema: Record<string, z.ZodTypeAny> = {};

  listingFields.forEach((field) => {
    const { key, listingTypeConfig, saveConfig, schemaType, scope = 'public' } = field;
    
    // Check if field applies to selected listing type
    const isApplicable = !listingTypeConfig?.limitToListingTypeIds ||
      listingTypeConfig?.listingTypeIds?.includes(selectedListingType || '');

    if (!isApplicable) return;

    // Create namespaced key
    const namespacedKey = scope === 'private' ? `priv_${key}` : `pub_${key}`;
    
    // Create validation based on schema type
    let fieldValidation: z.ZodTypeAny;

    switch (schemaType) {
      case 'text':
        fieldValidation = z.string();
        if (saveConfig.isRequired) {
          fieldValidation = fieldValidation.min(1, saveConfig.requiredMessage || t('CreateListingForm.fieldRequired'));
        } else {
          fieldValidation = fieldValidation.optional();
        }
        break;

      case 'long':
        fieldValidation = z.string();
        if (saveConfig.isRequired) {
          fieldValidation = fieldValidation
            .min(1, saveConfig.requiredMessage || t('CreateListingForm.fieldRequired'))
            .refine(
              (val) => !isNaN(parseInt(val)),
              t('CreateListingForm.numberInvalid')
            );
        } else {
          fieldValidation = fieldValidation.optional();
        }
        break;

      case 'enum':
        fieldValidation = z.string();
        if (saveConfig.isRequired) {
          fieldValidation = fieldValidation.min(1, saveConfig.requiredMessage || t('CreateListingForm.fieldRequired'));
        } else {
          fieldValidation = fieldValidation.optional();
        }
        break;

      case 'multi-enum':
        fieldValidation = z.array(z.string());
        if (saveConfig.isRequired) {
          fieldValidation = fieldValidation.min(1, saveConfig.requiredMessage || t('CreateListingForm.fieldRequired'));
        } else {
          fieldValidation = fieldValidation.optional();
        }
        break;

      case 'boolean':
        fieldValidation = z.boolean().optional();
        break;

      default:
        fieldValidation = z.string().optional();
    }

    customFieldSchema[namespacedKey] = fieldValidation;
  });

  return z.object({
    ...baseSchema,
    ...customFieldSchema,
  });
};