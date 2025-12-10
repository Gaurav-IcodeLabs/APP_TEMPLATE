// Supported schema types for custom fields added to extended data through configuration.
export const SCHEMA_TYPE_ENUM = 'enum';
export const SCHEMA_TYPE_MULTI_ENUM = 'multi-enum';
export const SCHEMA_TYPE_TEXT = 'text';
export const SCHEMA_TYPE_LONG = 'long';
export const SCHEMA_TYPE_BOOLEAN = 'boolean';
export const SCHEMA_TYPE_YOUTUBE = 'youtubeVideoUrl';

export const EXTENDED_DATA_SCHEMA_TYPES = [
  SCHEMA_TYPE_ENUM,
  SCHEMA_TYPE_MULTI_ENUM,
  SCHEMA_TYPE_TEXT,
  SCHEMA_TYPE_LONG,
  SCHEMA_TYPE_BOOLEAN,
  SCHEMA_TYPE_YOUTUBE,
] as const;
