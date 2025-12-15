import { extractYouTubeID } from './string';
import { ListingField } from '../types/config/configListing';
import { UserFieldConfigItem } from '../types/config/configUser';
import { ExtendedDataValue } from './userHelpers';

// Config type for sanitization
export interface SanitizeConfig {
  listingFields?: ListingField[];
  userFields?: UserFieldConfigItem[];
}

// Location structure in listing publicData
export interface ListingLocation {
  address?: string;
  building?: string;
}

// User profile structure with extended data
export interface UserProfileData {
  displayName?: string;
  abbreviatedName?: string;
  bio?: string;
  publicData?: Record<string, ExtendedDataValue>;
  metadata?: Record<string, string | number | boolean | null | string[] | Record<string, string | number | boolean | null | string[]>>;
  [key: string]: string | number | boolean | null | undefined | string[] | Record<string, ExtendedDataValue> | Record<string, string | number | boolean | null | string[] | Record<string, string | number | boolean | null | string[]>> | undefined;
}

// User attributes structure
export interface UserAttributesData {
  profile?: UserProfileData;
  banned?: boolean;
  deleted?: boolean;
  email?: string;
  emailVerified?: boolean;
  stripeConnected?: boolean;
  [key: string]: string | number | boolean | null | undefined | UserProfileData | Record<string, ExtendedDataValue> | Record<string, string | number | boolean | null | string[] | Record<string, string | number | boolean | null | string[]>> | undefined;
}

// Listing attributes structure
export interface ListingAttributesData {
  title?: string;
  description?: string;
  publicData?: Record<string, ExtendedDataValue> & {
    location?: ListingLocation;
  };
  geolocation?: { lat: number; lng: number };
  deleted?: boolean;
  state?: string;
  price?: { amount: number; currency: string };
  [key: string]: string | number | boolean | null | undefined | Record<string, ExtendedDataValue> | { lat: number; lng: number } | { amount: number; currency: string } | ListingLocation | undefined;
}

/**
 * By default, React DOM escapes any values embedded in JSX before rendering them,
 * but sometimes it is necessary to sanitize the user-generated content of received entities.
 * If you use this data in component props without any sanitization or encoding,
 * it might create XSS vulnerabilities.
 *
 * You should especially consider how you are using extended data inside the app.
 */

const ESCAPE_TEXT_REGEXP = /[<>]/g;
const ESCAPE_TEXT_REPLACEMENTS = {
  //fullwidth lesser-than character
  '<': '\uff1c',
  //fullwidth greater-than character
  '>': '\uff1e',
};

// An example how you could sanitize text content.
// This swaps some coding related characters to less dangerous ones
const sanitizeText = (str: string | null | undefined): string => {
  if (str == null) {
    return '';
  }
  if (typeof str === 'string') {
    return str.replace(ESCAPE_TEXT_REGEXP, ch => ESCAPE_TEXT_REPLACEMENTS[ch as keyof typeof ESCAPE_TEXT_REPLACEMENTS]);
  }
  return '';
};

// Enum and multi-enum work with predefined option configuration
interface EnumOption {
  option: string;
  label?: string;
}

const sanitizeEnum = (str: string | null | undefined, options: EnumOption[]): string | null => {
  if (str == null) return null;
  const optionValues = options.map(o => `${o.option}`);
  return optionValues.includes(str) ? str : null;
};

const sanitizeMultiEnum = (arr: string | number | boolean | null | undefined | string[] | number[] | Array<string | number | boolean | null | undefined>, options: EnumOption[]): string[] => {
  if (!Array.isArray(arr)) {
    return [];
  }
  return arr.reduce<string[]>((ret, value) => {
    const enumValue = sanitizeEnum(String(value), options);
    return enumValue ? [...ret, enumValue] : ret;
  }, []);
};

const sanitizeLong = (lng: string | number | boolean | null | undefined): number | null => {
  return lng == null || typeof lng === 'number' ? (lng as number | null) : null;
};

const sanitizeBoolean = (bool: string | number | boolean | null | undefined): boolean | null => {
  return bool == null || typeof bool === 'boolean' ? (bool as boolean | null) : null;
};

const sanitizeYoutubeVideoUrl = (url: string | null | undefined): string | null => {
  const sanitizedUrl = sanitizeUrl(url);
  const videoID = extractYouTubeID(sanitizedUrl);
  return videoID ? `https://www.youtube.com/watch?v=${videoID}` : null;
};

// URL sanitizer. This code is adapted from
// https://github.com/braintree/sanitize-url/
// <sanitizeUrl>
const INVALID_PROTOCOL_REGEXP = /^([^\w]*)(javascript|data|vbscript)/im;
const HTML_ENTITIES_REGEXP = /&#(\w+)(^\w|;)?/g;
const CTRL_CHARACTERS_REGEXP = /[\u0000-\u001F\u007F-\u009F\u2000-\u200D\uFEFF]/gim;
const URL_SCHEME_REGEXP = /^([^:]+):/gm;
const RELATIVE_FIRST_CHARACTERS = ['.', '/'];

function isRelativeUrlWithoutProtocol(url: string): boolean {
  return RELATIVE_FIRST_CHARACTERS.indexOf(url[0]) > -1;
}

// adapted from https://stackoverflow.com/a/29824550/2601552
function decodeHtmlCharacters(str: string): string {
  return str.replace(HTML_ENTITIES_REGEXP, (match, dec) => {
    return String.fromCharCode(Number(dec));
  });
}

export function sanitizeUrl(url: string | null | undefined): string {
  const sanitizedUrl = decodeHtmlCharacters(url || '')
    .replace(CTRL_CHARACTERS_REGEXP, '')
    .trim();

  if (!sanitizedUrl) {
    return 'about:blank';
  }

  if (isRelativeUrlWithoutProtocol(sanitizedUrl)) {
    return sanitizedUrl;
  }

  const urlSchemeParseResults = sanitizedUrl.match(URL_SCHEME_REGEXP);

  if (!urlSchemeParseResults) {
    return sanitizedUrl;
  }

  const urlScheme = urlSchemeParseResults[0];

  if (INVALID_PROTOCOL_REGEXP.test(urlScheme)) {
    return 'about:blank';
  }

  return sanitizedUrl;
}
// </sanitizeUrl>

// Base entity structure
export interface BaseEntity {
  id?: string | number | null;
  type?: string;
  attributes?: UserAttributesData | ListingAttributesData | Record<string, string | number | boolean | null | undefined | Date | Array<string | number | boolean | null> | Record<string, string | number | boolean | null | string[] | ExtendedDataValue>>;
  [key: string]: string | number | boolean | null | undefined | Date | Array<string | number | boolean | null> | UserAttributesData | ListingAttributesData | Record<string, string | number | boolean | null | string[] | ExtendedDataValue> | BaseEntity | undefined;
}

/**
 * Sanitize user entity.
 * If you add public data, you should probably sanitize it here.
 * By default, React DOM escapes any values embedded in JSX before rendering them,
 * but if you use this data on props, it might create XSS vulnerabilities
 * E.g. you should sanitize and encode URI if you are creating links from public data.
 */
export const sanitizeUser = (entity: BaseEntity | null | undefined, config: SanitizeConfig = {}): BaseEntity => {
  const { attributes, ...restEntity } = entity || {};
  const attributesObj = attributes as UserAttributesData | undefined;
  const profile = attributesObj?.profile;
  const { bio, displayName, abbreviatedName, publicData, metadata, ...restProfile } =
    profile || {};
  const publicDataObj = publicData || {};
  const metadataObj = metadata || {};
  const restAttributes: Partial<UserAttributesData> = {};
  if (attributesObj) {
    Object.keys(attributesObj).forEach(key => {
      if (key !== 'profile') {
        (restAttributes as Record<string, string | number | boolean | null | undefined>)[key] = (attributesObj as Record<string, string | number | boolean | null | undefined>)[key];
      }
    });
  }

  const sanitizePublicDataFn = (pd: Record<string, ExtendedDataValue> | null | undefined): { publicData?: Record<string, ExtendedDataValue> } => {
    // TODO: If you add public data, you should probably sanitize it here.
    const sanitizedConfiguredPublicData = sanitizeConfiguredPublicData(pd, config);
    return pd ? { publicData: sanitizedConfiguredPublicData } : {};
  };
  const sanitizeMetadataFn = (md: Record<string, string | number | boolean | null | string[] | Record<string, string | number | boolean | null | string[]>> | null | undefined): { metadata?: Record<string, string | number | boolean | null | string[] | Record<string, string | number | boolean | null | string[]>> } => {
    // TODO: If you add user-generated metadata through Integration API,
    // you should probably sanitize it here.
    return md ? { metadata: md } : {};
  };

  const profileMaybe = profile
    ? {
        profile: {
          abbreviatedName: sanitizeText(abbreviatedName),
          displayName: sanitizeText(displayName),
          bio: sanitizeText(bio),
          ...sanitizePublicDataFn(publicDataObj),
          ...sanitizeMetadataFn(metadataObj),
          ...restProfile,
        },
      }
    : {};
  const attributesMaybe = attributesObj ? { attributes: { ...profileMaybe, ...restAttributes } } : {};

  return { ...attributesMaybe, ...restEntity } as BaseEntity;
};

/**
 * Sanitize extended data against configuration (against schemaType)
 * @param value Any JSON value
 * @param config containing "schemaType"
 * @returns sanitized value or null
 */
const sanitizedExtendedDataFields = (
  value: ExtendedDataValue,
  config: ListingField | UserFieldConfigItem
): ExtendedDataValue => {
  const { schemaType, enumOptions } = config;
  const enumOpts = (enumOptions as EnumOption[]) || [];
  const sanitized =
    schemaType === 'text'
      ? sanitizeText(value as string)
      : schemaType === 'enum'
      ? sanitizeEnum(value as string, enumOpts)
      : schemaType === 'multi-enum'
      ? sanitizeMultiEnum(value as string | number | boolean | null | undefined | string[] | number[] | Array<string | number | boolean | null | undefined>, enumOpts)
      : schemaType === 'long'
      ? sanitizeLong(value as string | number | boolean | null | undefined)
      : schemaType === 'boolean'
      ? sanitizeBoolean(value as string | number | boolean | null | undefined)
      : schemaType === 'youtubeVideoUrl' || String(schemaType) === 'youtubeVideoUrl'
      ? sanitizeYoutubeVideoUrl(value as string)
      : null;

  return sanitized;
};

/**
 * Some of the public data is configurable. This validates that data against the given config.
 * (The config paramter contains listingFields config.)
 *
 * NOTE: this does not handle nested JSON-like objects or other extra data,
 * but there's handling for string type content ('<' & '>' characters are replaced with full-width ones).
 *
 * @param publicData
 * @param config
 * @returns sanitized public data
 */
const sanitizeConfiguredPublicData = (
  publicData: Record<string, ExtendedDataValue> | null | undefined,
  config: SanitizeConfig = {}
): Record<string, ExtendedDataValue> => {
  // The publicData could be null (e.g. for banned user)
  const publicDataObj = publicData || {};
  return Object.entries(publicDataObj).reduce((sanitized, entry) => {
    const [key, value] = entry;
    const foundListingFieldConfig = config?.listingFields?.find(d => d.key === key);
    const foundUserFieldConfig = config?.userFields?.find(d => d.key === key);
    const knownKeysWithString = [
      'listingType',
      'transactionProcessAlias',
      'unitType',
      'userType',
      'cardStyle',
    ];
    const sanitizedValue: ExtendedDataValue = knownKeysWithString.includes(key)
      ? sanitizeText(value as string)
      : foundListingFieldConfig
      ? sanitizedExtendedDataFields(value, foundListingFieldConfig)
      : foundUserFieldConfig
      ? sanitizedExtendedDataFields(value, foundUserFieldConfig)
      : typeof value === 'string'
      ? sanitizeText(value)
      : value;

    return {
      ...sanitized,
      [key]: sanitizedValue,
    };
  }, {});
};

/**
 * Sanitize listing entity.
 * If you add public data, you should probably sanitize it here.
 * By default, React DOM escapes any values embedded in JSX before rendering them,
 * but if you use this data on props, it might create XSS vulnerabilities
 * E.g. you should sanitize and encode URI if you are creating links from public data.
 */
export const sanitizeListing = (entity: BaseEntity, config: SanitizeConfig = {}): BaseEntity => {
  const { attributes, ...restEntity } = entity;
  const attributesObj = attributes as ListingAttributesData | undefined;
  const { title, description, publicData, ...restAttributes } = attributesObj || {};

  const sanitizeLocation = (location: ListingLocation | null | undefined): ListingLocation => {
    const { address, building } = location || {};
    return { address: sanitizeText(address), building: sanitizeText(building) };
  };

  const sanitizePublicDataFn = (pd: (Record<string, ExtendedDataValue> & { location?: ListingLocation }) | null | undefined): { publicData?: Record<string, ExtendedDataValue> & { location?: ListingLocation } } => {
    // Here's an example how you could sanitize location and rules from publicData:
    // TODO: If you add public data, you should probably sanitize it here.
    const pdObj = pd || {};
    const location = pdObj.location;
    const restPublicData: Record<string, ExtendedDataValue> = { ...pdObj };
    if ('location' in restPublicData) {
      delete restPublicData.location;
    }
    const locationMaybe = location ? { location: sanitizeLocation(location) } : {};
    const sanitizedConfiguredPublicData = sanitizeConfiguredPublicData(restPublicData, config);

    return pd ? { publicData: { ...locationMaybe, ...sanitizedConfiguredPublicData } as Record<string, ExtendedDataValue> & { location?: ListingLocation } } : {};
  };

  const attributesMaybe = attributesObj
    ? {
        attributes: {
          title: sanitizeText(title),
          description: sanitizeText(description),
          ...sanitizePublicDataFn(publicData),
          ...restAttributes,
        },
      }
    : {};

  return { ...attributesMaybe, ...restEntity } as BaseEntity;
};

/**
 * Sanitize entities if needed.
 * Remember to add your own sanitization rules for your extended data
 */
export const sanitizeEntity = (entity: BaseEntity | null | undefined, config: SanitizeConfig = {}): BaseEntity => {
  if (!entity) {
    return {} as BaseEntity;
  }
  const { type } = entity;
  switch (type) {
    case 'listing':
      return sanitizeListing(entity, config);
    case 'user':
      return sanitizeUser(entity, config);
    default:
      return entity;
  }
};
