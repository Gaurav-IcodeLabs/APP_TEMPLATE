/////////////////////////////////////////////////////////
// Configurations related to listing.                  //
// Main configuration here is the extended data config //
/////////////////////////////////////////////////////////

import { ListingFieldConfigItem, ListingTypeConfigItem } from '@appTypes/config';

/**
 * Configuration options for listing types:
 * - listingType: Unique identifier for the listing type
 * - label: Display name for the listing type
 * - transactionType: Configuration for transaction processing
 * - stockType: How stock/availability is managed
 * - defaultListingFields: Which default fields to show/hide
 */
export const listingTypes: ListingTypeConfigItem[] = [
  {
    listingType: 'daily-booking',
    label: 'Daily Booking',
    transactionType: {
      process: 'default-booking',
      alias: 'default-booking/release-1',
      unitType: 'day',
    },
    stockType: 'infiniteStock',
    defaultListingFields: {
      title: true,
      description: true,
      price: true,
      location: true,
      images: true,
      availability: true,
    },
  },
  {
    listingType: 'purchase',
    label: 'Purchase',
    transactionType: {
      process: 'default-purchase',
      alias: 'default-purchase/release-1',
      unitType: 'item',
    },
    stockType: 'finiteStock',
    defaultListingFields: {
      title: true,
      description: true,
      price: true,
      location: true,
      images: true,
      stock: true,
    },
  },
];

/**
 * Configuration options for listing fields (custom extended data fields):
 * - key: Unique key for the extended data field
 * - scope: Scope of the extended data ('public' or 'private')
 * - schemaType: Schema type ('enum', 'multi-enum', 'text', 'long', 'boolean')
 * - enumOptions: Options for enum/multi-enum fields
 * - listingTypeConfig: Restrict field to specific listing types
 * - saveConfig: Configuration for form input
 * - showConfig: Configuration for display
 */
export const listingFields: ListingFieldConfigItem[] = [
  {
    key: 'category',
    scope: 'public',
    schemaType: 'enum',
    enumOptions: [
      { option: 'electronics', label: 'Electronics' },
      { option: 'clothing', label: 'Clothing' },
      { option: 'home-garden', label: 'Home & Garden' },
      { option: 'sports', label: 'Sports & Recreation' },
      { option: 'books', label: 'Books & Media' },
      { option: 'automotive', label: 'Automotive' },
    ],
    saveConfig: {
      label: 'Category',
      placeholderMessage: 'Select a category',
      isRequired: true,
      requiredMessage: 'Please select a category',
    },
    showConfig: {
      label: 'Category',
      isDetail: true,
    },
  },
  {
    key: 'condition',
    scope: 'public',
    schemaType: 'enum',
    enumOptions: [
      { option: 'new', label: 'New' },
      { option: 'like-new', label: 'Like New' },
      { option: 'good', label: 'Good' },
      { option: 'fair', label: 'Fair' },
      { option: 'poor', label: 'Poor' },
    ],
    listingTypeConfig: {
      limitToListingTypeIds: true,
      listingTypeIds: ['purchase'],
    },
    saveConfig: {
      label: 'Condition',
      placeholderMessage: 'Select condition',
      isRequired: true,
      requiredMessage: 'Please select the item condition',
    },
    showConfig: {
      label: 'Condition',
      isDetail: true,
    },
  },
  {
    key: 'amenities',
    scope: 'public',
    schemaType: 'multi-enum',
    enumOptions: [
      { option: 'wifi', label: 'WiFi' },
      { option: 'parking', label: 'Parking' },
      { option: 'kitchen', label: 'Kitchen' },
      { option: 'pool', label: 'Pool' },
      { option: 'gym', label: 'Gym' },
      { option: 'pet-friendly', label: 'Pet Friendly' },
    ],
    listingTypeConfig: {
      limitToListingTypeIds: true,
      listingTypeIds: ['daily-booking'],
    },
    saveConfig: {
      label: 'Amenities',
      placeholderMessage: 'Select amenities',
      isRequired: false,
    },
    showConfig: {
      label: 'Amenities',
      isDetail: true,
    },
  },
  {
    key: 'brand',
    scope: 'public',
    schemaType: 'text',
    saveConfig: {
      label: 'Brand',
      placeholderMessage: 'Enter brand name',
      isRequired: false,
    },
    showConfig: {
      label: 'Brand',
      isDetail: true,
    },
  },
  {
    key: 'model',
    scope: 'public',
    schemaType: 'text',
    saveConfig: {
      label: 'Model',
      placeholderMessage: 'Enter model name',
      isRequired: false,
    },
    showConfig: {
      label: 'Model',
      isDetail: true,
    },
  },
  {
    key: 'capacity',
    scope: 'public',
    schemaType: 'long',
    listingTypeConfig: {
      limitToListingTypeIds: true,
      listingTypeIds: ['daily-booking'],
    },
    saveConfig: {
      label: 'Capacity',
      placeholderMessage: 'Enter maximum capacity',
      isRequired: false,
    },
    showConfig: {
      label: 'Capacity',
      isDetail: true,
    },
  },
  {
    key: 'instantBooking',
    scope: 'public',
    schemaType: 'boolean',
    listingTypeConfig: {
      limitToListingTypeIds: true,
      listingTypeIds: ['daily-booking'],
    },
    saveConfig: {
      label: 'Allow instant booking',
      isRequired: false,
    },
    showConfig: {
      label: 'Instant Booking',
      isDetail: true,
    },
  },
];