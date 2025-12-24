// Types for listing configuration

export interface ListingTypeConfigItem {
  listingType: string;
  label: string;
  transactionType: {
    process: string;
    alias: string;
    unitType: string;
  };
  stockType: 'infiniteStock' | 'finiteStock';
  defaultListingFields: {
    title?: boolean;
    description?: boolean;
    price?: boolean;
    location?: boolean;
    images?: boolean;
    availability?: boolean;
    stock?: boolean;
  };
}

export interface ListingFieldConfigItem {
  key: string;
  scope?: 'public' | 'private';
  schemaType: 'enum' | 'multi-enum' | 'text' | 'long' | 'boolean';
  enumOptions?: Array<{
    option: string;
    label: string;
  }>;
  listingTypeConfig?: {
    limitToListingTypeIds: boolean;
    listingTypeIds: string[];
  };
  saveConfig: {
    label: string;
    placeholderMessage?: string;
    isRequired: boolean;
    requiredMessage?: string;
  };
  showConfig: {
    label: string;
    isDetail: boolean;
  };
}

export interface CustomListingFieldInputProps {
  key: string;
  name: string;
  fieldConfig: ListingFieldConfigItem;
  defaultRequiredMessage?: string;
}