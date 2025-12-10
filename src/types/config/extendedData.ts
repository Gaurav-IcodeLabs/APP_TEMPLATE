import { EXTENDED_DATA_SCHEMA_TYPES } from "../../constants";

// Extended data schema type
export type ExtendedDataSchemaType = typeof EXTENDED_DATA_SCHEMA_TYPES[number];

export interface UserType {
  userType: string;
  label: string;
  defaultUserFields?: {
    displayName?: boolean;
    phoneNumber?: boolean;
  };
  displayNameSettings?: {
    displayInSignUp?: boolean;
    required?: boolean;
  };
  phoneNumberSettings?: {
    displayInSignUp?: boolean;
    required?: boolean;
  };
}

export interface FieldEnumOption {
  option: string | number;
  label: string;
}

export interface UserField {
  key: string;
  scope?: string;
  schemaType: ExtendedDataSchemaType;
  enumOptions?: FieldEnumOption[];
  showConfig?: {
    label: string;
    displayInProfile?: boolean;
  };
  saveConfig: {
    label: string;
    placeholderMessage?: string;
    isRequired?: boolean;
    requiredMessage?: string;
    displayInSignUp?: boolean;
  };
  userTypeConfig?: {
    limitToUserTypeIds: boolean;
    userTypeIds?: string[];
  };
}

export interface ListingType {
  listingType: string;
  label: string;
  transactionType: {
    process: string;
    alias: string;
    unitType: string;
  };
  defaultListingFields?: {
    price?: boolean;
    location?: boolean;
    payoutDetails?: boolean;
    shipping?: boolean;
    pickup?: boolean;
  };
}

export interface ListingField {
  key: string;
  scope?: string;
  schemaType: ExtendedDataSchemaType;
  enumOptions?: FieldEnumOption[];
  filterConfig?: {
    indexForSearch?: boolean;
    label: string;
    group?: 'primary' | 'secondary';
    filterType?: string;
  };
  showConfig?: {
    label: string;
    isDetail?: boolean;
  };
  saveConfig: {
    label: string;
    placeholderMessage?: string;
    isRequired?: boolean;
    requiredMessage?: string;
  };
  listingTypeConfig?: {
    limitToListingTypeIds: boolean;
    listingTypeIds?: string[];
  };
  categoryConfig?: {
    limitToCategoryIds: boolean;
    categoryIds?: string[];
  };
}

export type UserTypes = UserType[];
export type UserFields = UserField[];
export type ListingTypes = ListingType[];
export type ListingFields = ListingField[];
