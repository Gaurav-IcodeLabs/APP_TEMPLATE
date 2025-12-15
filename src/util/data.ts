// Type-safe wrappers for lodash functions
// @ts-ignore - lodash individual module imports don't have types
import isArray from 'lodash/isArray';
// @ts-ignore - lodash individual module imports don't have types
import reduce from 'lodash/reduce';
import { sanitizeEntity } from '../util/sanitize';
import { UUID } from '../types/common/types';
import { SanitizeConfig } from './sanitize';
import { ImageAsset } from '../types/common/images';
import { Image } from '../types/common/images';
import { AvailabilityEntry } from '../types/entities/listing';
import {
  ListingAttributes,
  OwnListingAttributes,
} from '../types/entities/listing';
import {
  UserAttributes,
  CurrentUserAttributes,
} from '../types/entities/user';
import {
  Transaction,
} from '../types/entities/transaction';
import {
  Booking,
} from '../types/entities/booking';

// NOTE: This file imports sanitize.js, which may lead to circular dependency
// BaseEntity is imported from sanitize.ts
import type { BaseEntity } from './sanitize';

// Resource identifier structure
interface ResourceIdentifier {
  id: UUID;
  type: string;
}

// Relationship reference structure
interface RelationshipReference {
  data: ResourceIdentifier | ResourceIdentifier[] | null;
}

// Resource object structure (normalized)
interface ResourceObject {
  id: UUID;
  type: string;
  attributes?: ListingAttributes | OwnListingAttributes | UserAttributes | CurrentUserAttributes | Transaction['attributes'] | Booking['attributes'] | Record<string, string | number | boolean | null | undefined | Date | Array<string | number | boolean | null> | Record<string, string | number | boolean | null | string[]>>;
  relationships?: Record<string, RelationshipReference>;
  [key: string]: UUID | string | number | boolean | null | undefined | Date | Array<string | number | boolean | null> | Record<string, string | number | boolean | null | string[]> | RelationshipReference | ResourceObject | Image | ImageAsset | ResourceIdentifier | ResourceIdentifier[];
}

// Entities structure - normalized entities by type
interface Entities {
  [type: string]: {
    [uuid: string]: ResourceObject;
  };
}

// API response structure
interface ApiResponse {
  data: ResourceObject | ResourceObject[];
  included?: ResourceObject[];
  meta?: Record<string, string | number | boolean | null | undefined | Date | Array<string | number | boolean | null> | Record<string, string | number | boolean | null | string[]>>;
}

// SDK response structure
interface SdkResponse {
  data: ApiResponse;
}

/**
 * Combine the given relationships objects
 *
 * See: http://jsonapi.org/format/#document-resource-object-relationships
 */
export const combinedRelationships = (
  oldRels: Record<string, RelationshipReference> | null | undefined,
  newRels: Record<string, RelationshipReference> | null | undefined
): Record<string, RelationshipReference> | null => {
  if (!oldRels && !newRels) {
    // Special case to avoid adding an empty relationships object when
    // none of the resource objects had any relationships.
    return null;
  }
  return { ...oldRels, ...newRels };
};

/**
 * Combine the given resource objects
 *
 * See: http://jsonapi.org/format/#document-resource-objects
 */
export const combinedResourceObjects = (oldRes: ResourceObject, newRes: ResourceObject): ResourceObject => {
  const { id, type } = oldRes;
  if (newRes.id.uuid !== id.uuid || newRes.type !== type) {
    throw new Error('Cannot merge resource objects with different ids or types');
  }
  const attributes = newRes.attributes || oldRes.attributes;
  const attributesOld = oldRes.attributes || {};
  const attributesNew = newRes.attributes || {};
  // Allow (potentially) sparse attributes to update only relevant fields
  const attrs = attributes ? { attributes: { ...attributesOld, ...attributesNew } } : null;
  const relationships = combinedRelationships(oldRes.relationships, newRes.relationships);
  const rels = relationships ? { relationships } : null;
  return { id, type, ...attrs, ...rels };
};

/**
 * Combine the resource objects form the given api response to the
 * existing entities.
 */
export const updatedEntities = (
  oldEntities: Entities,
  apiResponse: ApiResponse,
  sanitizeConfig: SanitizeConfig = {}
): Entities => {
  const { data, included = [] } = apiResponse;
  const objects = (Array.isArray(data) ? data : [data]).concat(included);

  const newEntities = objects.reduce<Entities>((entities, curr) => {
    const { id, type } = curr;

    // Some entities (e.g. listing and user) might include extended data,
    // you should check if src/util/sanitize.js needs to be updated.
    const current = sanitizeEntity(curr as BaseEntity, sanitizeConfig) as ResourceObject;

    entities[type] = entities[type] || {};
    const entity = entities[type][id.uuid];
    entities[type][id.uuid] = entity ? combinedResourceObjects({ ...entity }, current) : current;

    return entities;
  }, oldEntities);

  return newEntities;
};

/**
 * Denormalise the entities with the resources from the entities object
 *
 * This function calculates the dernormalised tree structure from the
 * normalised entities object with all the relationships joined in.
 *
 * @param entities entities object in the SDK Redux store
 * @param resources array of objects with id and type
 * @param throwIfNotFound whether to skip a resource that
 * is not found (false), or to throw an Error (true)
 *
 * @return the given resource objects denormalised that were
 * found in the entities
 */
export const denormalisedEntities = (
  entities: Entities,
  resources: ResourceIdentifier[],
  throwIfNotFound: boolean = true
): ResourceObject[] => {
  const denormalised = resources.map(res => {
    const { id, type } = res;
    const entityFound = entities[type] && id && entities[type][id.uuid];
    if (!entityFound) {
      if (throwIfNotFound) {
        throw new Error(`Entity with type "${type}" and id "${id ? id.uuid : id}" not found`);
      }
      return null;
    }
    const entity = entities[type][id.uuid];
    const { relationships, ...entityData } = entity;

    if (relationships) {
      // Recursively join in all the relationship entities
      const result = reduce<Record<string, RelationshipReference>, ResourceObject>(
        relationships,
        (ent: ResourceObject, relRef: RelationshipReference, relName: string) => {
          // A relationship reference can be either a single object or
          // an array of objects. We want to keep that form in the final
          // result.
          const relData = relRef.data;
          const hasMultipleRefs = Array.isArray(relData);
          const multipleRefsEmpty = hasMultipleRefs && relData.length === 0;
          if (!relData || multipleRefsEmpty) {
            (ent as Record<string, ResourceObject[] | null>)[relName] = hasMultipleRefs ? [] : null;
          } else {
            const refs: ResourceIdentifier[] = hasMultipleRefs ? relData : [relData];

            // If a relationship is not found, an Error should be thrown
            const rels = denormalisedEntities(entities, refs, true);

            (ent as Record<string, ResourceObject | ResourceObject[] | null>)[relName] = hasMultipleRefs ? rels : rels[0];
          }
          return ent;
        },
        entityData as ResourceObject
      );
      return result;
    }
    return entityData;
  });
  return denormalised.filter(e => !!e);
};

/**
 * Denormalise the data from the given SDK response
 *
 * @param sdkResponse response object from an SDK call
 *
 * @return entities in the response with relationships
 * denormalised from the included data
 */
export const denormalisedResponseEntities = (sdkResponse: SdkResponse): ResourceObject[] => {
  const apiResponse = sdkResponse.data;
  const data = apiResponse.data;
  const resources = Array.isArray(data) ? data : [data];

  if (!data || resources.length === 0) {
    return [];
  }

  const entities = updatedEntities({}, apiResponse);
  return denormalisedEntities(entities, resources);
};

// Image reference structure
interface ImageRef {
  _ref?: {
    type?: 'imageAsset' | string;
    id?: string;
    resolver?: 'image' | string;
  };
}

// Asset JSON data structure - specific types for common asset structures
// This represents the structure of asset data from Asset Delivery API
export interface AssetConfigData {
  marketplaceName?: string;
  categories?: string[];
  colors?: Record<string, string>;
  images?: Record<string, ImageRef | ImageAsset>;
  [key: string]: string | number | boolean | null | string[] | Record<string, string> | Record<string, ImageRef | ImageAsset> | AssetJsonPrimitive | AssetJsonPrimitive[] | AssetJsonObject | undefined;
}

export interface AssetPageData {
  sections?: AssetPageSection[];
  meta?: {
    pageTitle?: string;
    pageDescription?: string;
    socialSharing?: {
      title?: string;
      description?: string;
      image?: ImageRef | ImageAsset;
    };
  };
  [key: string]: string | number | boolean | null | AssetPageSection[] | { pageTitle?: string; pageDescription?: string; socialSharing?: { title?: string; description?: string; image?: ImageRef | ImageAsset } } | AssetJsonPrimitive | AssetJsonPrimitive[] | AssetJsonObject | undefined;
}

export interface AssetPageSection {
  sectionId?: string;
  sectionType: string;
  [key: string]: string | number | boolean | null | AssetJsonPrimitive | AssetJsonPrimitive[] | AssetJsonObject | undefined;
}

export interface AssetFooterData {
  links?: Array<{
    text: string;
    href: string;
  }>;
  copyright?: string;
  socialMedia?: Array<{
    platform: string;
    url: string;
    icon?: ImageRef | ImageAsset;
  }>;
  [key: string]: string | number | boolean | null | Array<{ text: string; href: string } | { platform: string; url: string; icon?: ImageRef | ImageAsset }> | AssetJsonPrimitive | AssetJsonPrimitive[] | AssetJsonObject | undefined;
}

// Primitive JSON values
type AssetJsonPrimitive = string | number | boolean | null;

// Asset JSON object structure - can contain primitives, arrays, objects, ImageRefs, or ImageAssets
export interface AssetJsonObject {
  [key: string]: AssetJsonPrimitive | AssetJsonPrimitive[] | AssetJsonObject | AssetJsonObject[] | ImageRef | ImageAsset | AssetJsonData | undefined;
}

// Asset JSON data type - union of all possible asset data structures
export type AssetJsonData = 
  | AssetJsonPrimitive
  | AssetJsonPrimitive[]
  | AssetJsonObject
  | AssetConfigData
  | AssetPageData
  | AssetFooterData
  | ImageRef
  | ImageAsset
  | AssetJsonData[];

/**
 * Denormalize JSON object.
 * NOTE: Currently, this only handles denormalization of image references
 *
 * @param data from Asset API (e.g. page asset)
 * @param included array of asset references (currently only images supported)
 * @returns deep copy of data with images denormalized into it.
 */
const denormalizeJsonData = (data: AssetJsonData, included: ImageAsset[] = []): AssetJsonData => {
  // Handle strings, numbers, booleans, null
  if (data === null || typeof data !== 'object') {
    return data;
  }

  // At this point the data has typeof 'object' (aka Array or Object)
  // Array is the more specific case (of Object)
  if (data instanceof Array) {
    const copyArray: AssetJsonData[] = data.map(datum => denormalizeJsonData(datum, included));
    return copyArray;
  }

  // Generic Objects
  if (data instanceof Object) {
    const copyObj: Record<string, AssetJsonData> = {};
    Object.entries(data as Record<string, AssetJsonData | ImageRef | ImageAsset>).forEach(([key, value]) => {
      // Handle denormalization of image reference
      const valueAsRef = value as ImageRef | undefined;
      const hasImageRefAsValue =
        typeof value === 'object' && valueAsRef?._ref?.type === 'imageAsset' && valueAsRef?._ref?.id;
      // If there is no image included,
      // the _ref might contain parameters for image resolver (Asset Delivery API resolves image URLs on the fly)
      const hasUnresolvedImageRef = typeof value === 'object' && valueAsRef?._ref?.resolver === 'image';

      if (hasImageRefAsValue) {
        const foundRef = included.find((inc: ImageAsset) => {
          return inc.id === valueAsRef._ref?.id;
        });
        copyObj[key] = (foundRef || null) as AssetJsonData;
      } else if (hasUnresolvedImageRef) {
        // Don't add faulty image ref
        // Note: At the time of writing, assets can expose resolver configs,
        //       which we don't want to deal with.
      } else {
        copyObj[key] = denormalizeJsonData(value as AssetJsonData, included);
      }
    });
    return copyObj;
  }

  throw new Error("Unable to traverse data! It's not JSON.");
};

/**
 * Denormalize asset json from Asset API.
 * @param assetJson in format: { data, included }
 * @returns deep copy of asset data with images denormalized into it.
 */
export const denormalizeAssetData = (assetJson: { data?: AssetJsonData | AssetJsonData[]; included?: ImageAsset[] } | null | undefined): AssetJsonData => {
  const { data, included = [] } = assetJson || {};
  if (Array.isArray(data)) {
    // If data is an array, return the first element or null
    return (data.length > 0 ? denormalizeJsonData(data[0], included) : null) as AssetJsonData;
  }
  return denormalizeJsonData(data || null, included);
};

/**
 * Create shell objects to ensure that attributes etc. exists.
 *
 * @param transaction entity object, which is to be ensured against null values
 */
export const ensureTransaction = (
  transaction: Partial<ResourceObject> | null | undefined,
  booking: ResourceObject | null = null,
  listing: ResourceObject | null = null,
  provider: ResourceObject | null = null
): ResourceObject & { booking?: ResourceObject | null; listing?: ResourceObject | null; provider?: ResourceObject | null } => {
  const empty = {
    id: null,
    type: 'transaction',
    attributes: {},
    booking,
    listing,
    provider,
  };
  return { ...empty, ...transaction };
};

/**
 * Create shell objects to ensure that attributes etc. exists.
 *
 * @param booking entity object, which is to be ensured against null values
 */
export const ensureBooking = (booking: Partial<ResourceObject> | null | undefined): ResourceObject => {
  const empty = { id: null, type: 'booking', attributes: {} };
  return { ...empty, ...booking };
};

/**
 * Create shell objects to ensure that attributes etc. exists.
 *
 * @param listing entity object, which is to be ensured against null values
 */
export const ensureListing = (listing: Partial<ResourceObject> | null | undefined): ResourceObject & { images?: Image[] } => {
  const empty = {
    id: null,
    type: 'listing',
    attributes: { publicData: {} },
    images: [],
  };
  return { ...empty, ...listing };
};

/**
 * Create shell objects to ensure that attributes etc. exists.
 *
 * @param listing entity object, which is to be ensured against null values
 */
export const ensureOwnListing = (listing: Partial<ResourceObject> | null | undefined): ResourceObject & { images?: Image[] } => {
  const empty = {
    id: null,
    type: 'ownListing',
    attributes: { publicData: {} },
    images: [],
  };
  return { ...empty, ...listing };
};

/**
 * Create shell objects to ensure that attributes etc. exists.
 *
 * @param user entity object, which is to be ensured against null values
 */
export const ensureUser = (user: Partial<ResourceObject> | null | undefined): ResourceObject => {
  const empty = { id: null, type: 'user', attributes: { profile: {} } };
  return { ...empty, ...user };
};

/**
 * Create shell objects to ensure that attributes etc. exists.
 *
 * @param user current user entity object, which is to be ensured against null values
 */
export const ensureCurrentUser = (user: Partial<ResourceObject> | null | undefined): ResourceObject & { profileImage?: Image } => {
  const empty = { id: null, type: 'currentUser', attributes: { profile: {} }, profileImage: undefined };
  return { ...empty, ...user };
};

/**
 * Create shell objects to ensure that attributes etc. exists.
 *
 * @param timeSlot entity object, which is to be ensured against null values
 */
export const ensureTimeSlot = (timeSlot: Partial<ResourceObject> | null | undefined): ResourceObject => {
  const empty = { id: null, type: 'timeSlot', attributes: {} };
  return { ...empty, ...timeSlot };
};

/**
 * Create shell objects to ensure that attributes etc. exists.
 *
 * @param availabilityPlan entity object, which is to be ensured against null values
 */
export const ensureDayAvailabilityPlan = (availabilityPlan: Partial<{ type: string; entries: AvailabilityEntry[] }> | null | undefined): { type: string; entries: AvailabilityEntry[] } => {
  const empty = { type: 'availability-plan/day', entries: [] };
  return { ...empty, ...availabilityPlan };
};

/**
 * Create shell objects to ensure that attributes etc. exists.
 *
 * @param availabilityException entity object, which is to be ensured against null values
 */
export const ensureAvailabilityException = (availabilityException: Partial<ResourceObject> | null | undefined): ResourceObject => {
  const empty = { id: null, type: 'availabilityException', attributes: {} };
  return { ...empty, ...availabilityException };
};

/**
 * Create shell objects to ensure that attributes etc. exists.
 *
 * @param stripeCustomer entity from API, which is to be ensured against null values
 */
export const ensureStripeCustomer = (stripeCustomer: Partial<ResourceObject> | null | undefined): ResourceObject => {
  const empty = { id: null, type: 'stripeCustomer', attributes: {} };
  return { ...empty, ...stripeCustomer };
};

/**
 * Create shell objects to ensure that attributes etc. exists.
 *
 * @param stripePaymentMethod entity from API, which is to be ensured against null values
 */
export const ensurePaymentMethodCard = (stripePaymentMethod: Partial<ResourceObject> | null | undefined): ResourceObject => {
  const empty = {
    id: null,
    type: 'stripePaymentMethod',
    attributes: { type: 'stripe-payment-method/card', card: {} } as Record<string, string | number | boolean | null | undefined | Date | Array<string | number | boolean | null> | Record<string, string | number | boolean | null | string[]>>,
  };
  const cardPaymentMethod = { ...empty, ...stripePaymentMethod };

  const attrs = cardPaymentMethod.attributes as Record<string, string | number | boolean | null | undefined | Date | Array<string | number | boolean | null> | Record<string, string | number | boolean | null | string[]>>;
  if (attrs.type !== 'stripe-payment-method/card') {
    throw new Error(`'ensurePaymentMethodCard' got payment method with wrong type.
      'stripe-payment-method/card' was expected, received ${attrs.type}`);
  }

  return cardPaymentMethod;
};

/**
 * Get the display name of the given user as string. This function handles
 * missing data (e.g. when the user object is still being downloaded),
 * fully loaded users, as well as banned users.
 *
 * For banned or deleted users, a translated name should be provided.
 *
 * @param user user entity object
 * @param defaultUserDisplayName default display name to use if user doesn't have one
 *
 * @return display name that can be rendered in the UI
 */
export const userDisplayNameAsString = (
  user: ResourceObject | null | undefined,
  defaultUserDisplayName?: string
): string => {
  const attributes = user?.attributes as { profile?: { displayName?: string } } | undefined;
  const displayName = attributes?.profile?.displayName;

  if (displayName) {
    return displayName;
  } else {
    return defaultUserDisplayName || '';
  }
};

/**
 * DEPRECATED: Use userDisplayNameAsString function or UserDisplayName component instead
 *
 * @param user user entity object
 * @param bannedUserDisplayName default display name for banned users
 *
 * @return display name that can be rendered in the UI
 */
export const userDisplayName = (
  user: ResourceObject | null | undefined,
  bannedUserDisplayName?: string
): string => {
  console.warn(
    `Function userDisplayName is deprecated!
User function userDisplayNameAsString or component UserDisplayName instead.`
  );

  return userDisplayNameAsString(user, bannedUserDisplayName);
};

/**
 * Get the abbreviated name of the given user. This function handles
 * missing data (e.g. when the user object is still being downloaded),
 * fully loaded users, as well as banned users.
 *
 * For banned  or deleted users, a default abbreviated name should be provided.
 *
 * @param user user entity object
 * @param defaultUserAbbreviatedName default abbreviated name to use if user doesn't have one
 *
 * @return abbreviated name that can be rendered in the UI
 * (e.g. in Avatar initials)
 */
export const userAbbreviatedName = (
  user: ResourceObject | null | undefined,
  defaultUserAbbreviatedName?: string
): string => {
  const attributes = user?.attributes as { profile?: { abbreviatedName?: string } } | undefined;
  const abbreviatedName = attributes?.profile?.abbreviatedName;

  if (abbreviatedName) {
    return abbreviatedName;
  } else {
    return defaultUserAbbreviatedName || '';
  }
};

/**
 * A customizer function to be used with the
 * mergeWith function from lodash.
 *
 * Works like merge in every way except that on case of
 * an array the old value is completely overridden with
 * the new value.
 *
 * @param objValue Value of current field, denoted by key
 * @param srcValue New value
 * @param key Key of the field currently being merged
 * @param object Target object that is receiving values from source
 * @param source Source object that is merged into object param
 * @param stack Tracks merged values
 *
 * @return New value for objValue if the original is an array,
 * otherwise undefined is returned, which results in mergeWith using the
 * standard merging function
 */
export const overrideArrays = (
  objValue: string | number | boolean | null | undefined | Array<string | number | boolean | null> | Record<string, string | number | boolean | null | string[] | Record<string, string | number | boolean | null | string[]>>,
  srcValue: string | number | boolean | null | undefined | Array<string | number | boolean | null> | Record<string, string | number | boolean | null | string[] | Record<string, string | number | boolean | null | string[]>>,
  _key?: string,
  _object?: Record<string, string | number | boolean | null | string[] | Record<string, string | number | boolean | null | string[]>>,
  _source?: Record<string, string | number | boolean | null | string[] | Record<string, string | number | boolean | null | string[]>>,
  _stack?: Array<{ object: Record<string, string | number | boolean | null | string[] | Record<string, string | number | boolean | null | string[]>>; source: Record<string, string | number | boolean | null | string[] | Record<string, string | number | boolean | null | string[]>> }>
): string | number | boolean | null | undefined | Array<string | number | boolean | null> | Record<string, string | number | boolean | null | string[] | Record<string, string | number | boolean | null | string[]>> | undefined => {
  if (isArray(objValue)) {
    return srcValue;
  }
  return undefined;
};

/**
 * Humanizes a line item code. Strips the "line-item/" namespace
 * definition from the beginning, replaces dashes with spaces and
 * capitalizes the first character.
 *
 * @param code a line item code
 *
 * @return returns the line item code humanized
 */
export const humanizeLineItemCode = (code: string): string => {
  if (!/^line-item\/.+/.test(code)) {
    throw new Error(`Invalid line item code: ${code}`);
  }
  const lowercase = code.replace(/^line-item\//, '').replace(/-/g, ' ');

  return lowercase.charAt(0).toUpperCase() + lowercase.slice(1);
};
