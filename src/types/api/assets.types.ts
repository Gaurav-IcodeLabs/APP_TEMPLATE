// /**
//  * Asset Delivery API Complete TypeScript Definitions
//  * Based on Sharetribe Asset Delivery API Reference
//  * https://www.sharetribe.com/api-reference/asset-delivery-api.html
//  */

import { ImageAsset } from '../common/images';
import { BrandingAssetData, LayoutAssetData } from '../config';

// import { BaseApiResponse } from "./api.types";

// // ============================================================================
// // Asset Reference Types
// // ============================================================================

// /**
//  * Asset reference in JSON data
//  * Used to reference other assets (like images) within an asset
//  *
//  * Example in JSON:
//  * {
//  *   "heroBackground": {
//  *     "_ref": {
//  *       "id": "f51d406b-cf63-4ab7-a3b5-cf3c74f265a0",
//  *       "type": "imageAsset"
//  *     }
//  *   }
//  * }
//  */
// export interface AssetReference {
//   _ref: {
//     id: string;
//     type: 'imageAsset';
//   };
// }

// /**
//  * Image variant data
//  */
// export interface ImageVariant {
//   width: number;
//   height: number;
//   url: string;
// }

// /**
//  * Image variants object with dynamic variant names
//  * Common variants: 'scaled', 'cropped', 'thumbnail', etc.
//  */
// export interface ImageVariants {
//   [variantName: string]: ImageVariant;
// }

// /**
//  * Image asset attributes
//  */
// export interface ImageAssetAttributes {
//   assetPath: string;
//   variants: ImageVariants;
// }

// /**
//  * Image asset resource (appears in 'included' array)
//  */
// export interface ImageAssetResource {
//   id: string;
//   type: 'imageAsset';
//   attributes: ImageAssetAttributes;
// }

// // ============================================================================
// // JSON Asset Types
// // ============================================================================

// /**
//  * JSON asset attributes for multiple asset queries
//  */
// export interface JsonAssetAttributes<TData = any> {
//   assetPath: string;
//   data: TData;
// }

// /**
//  * JSON asset resource (used in multiple asset responses)
//  */
// export interface JsonAssetResource<TData = any> {
//   id: string;
//   type: 'jsonAsset';
//   attributes: JsonAssetAttributes<TData>;
// }

// // ============================================================================
// // API Response Types
// // ============================================================================

// /**
//  * Asset metadata
//  */
// export interface AssetMeta {
//   version: string;
// }

// /**
//  * Single asset response (assetByAlias or assetByVersion)
//  *
//  * Key difference: The data is the ACTUAL CONTENT of the asset,
//  * not wrapped in a resource object.
//  *
//  * Example:
//  * {
//  *   "data": {
//  *     "config": { "marketplaceName": "My Marketplace" },
//  *     "images": { "heroBackground": { "_ref": {...} } }
//  *   },
//  *   "included": [...],
//  *   "meta": { "version": "abcd" }
//  * }
//  */
// export interface SingleAssetResponse<TData = any> {
//   data: TData;
//   included?: ImageAssetResource[];
//   meta: AssetMeta;
// }

// /**
//  * Multiple assets response (assetsByAlias or assetsByVersion)
//  *
//  * Key difference: The data is an ARRAY of jsonAsset resources.
//  *
//  * Example:
//  * {
//  *   "data": [
//  *     {
//  *       "id": "bf98a0b4-...",
//  *       "type": "jsonAsset",
//  *       "attributes": {
//  *         "assetPath": "/example/asset1.json",
//  *         "data": { ... }
//  *       }
//  *     }
//  *   ],
//  *   "included": [...],
//  *   "meta": { "version": "abcd" }
//  * }
//  */
// export interface MultipleAssetsResponse<TData = any> {
//   data: JsonAssetResource<TData>[];
//   included?: ImageAssetResource[];
//   meta: AssetMeta;
// }

// /**
//  * Generic Asset Delivery API response
//  */
// export type AssetDeliveryResponse<TData = any> =
//   | SingleAssetResponse<TData>
//   | MultipleAssetsResponse<TData>;

// /**
//  * Asset Delivery API success response
//  * Note: Asset responses don't contain SDK types, only JSON-compatible data
//  */
// export interface AssetDeliveryApiSuccessResponse<TData = any>
//   extends BaseApiResponse<200> {
//   data: AssetDeliveryResponse<TData>;
// }

// // ============================================================================
// // SDK Method Parameter Types
// // ============================================================================

// /**
//  * Parameters for sdk.assetByAlias() method
//  *
//  * Example:
//  * sdk.assetByAlias({
//  *   alias: 'latest',
//  *   path: '/content/translations.json'
//  * })
//  */
// export interface AssetByAliasParams {
//   alias: 'latest';
//   path: string;
// }

// /**
//  * Parameters for sdk.assetByVersion() method
//  *
//  * Example:
//  * sdk.assetByVersion({
//  *   version: 'ESz8ULLX68PiENQV',
//  *   path: '/content/translations.json'
//  * })
//  */
// export interface AssetByVersionParams {
//   version: string;
//   path: string;
// }

// /**
//  * Parameters for sdk.assetsByAlias() method
//  *
//  * Example:
//  * sdk.assetsByAlias({
//  *   alias: 'latest',
//  *   paths: ['/content/translations.json', '/content/footer.json']
//  * })
//  */
// export interface AssetsByAliasParams {
//   alias: 'latest';
//   paths: string[];
// }

// /**
//  * Parameters for sdk.assetsByVersion() method
//  *
//  * Example:
//  * sdk.assetsByVersion({
//  *   version: 'ESz8ULLX68PiENQV',
//  *   paths: ['/content/translations.json', '/content/footer.json']
//  * })
//  */
// export interface AssetsByVersionParams {
//   version: string;
//   paths: string[];
// }

// // ============================================================================
// // Common Asset Data Types
// // ============================================================================

// /**
//  * Translation asset structure
//  * Path: /content/translations.json
//  */
// export interface TranslationAsset {

//   [translationKey: string]: string;
// }

// /**
//  * Page content asset structure
//  * Path: /content/pages/*.json
//  */
// export interface PageAsset {
//   sections?: PageSection[];
//   meta?: {
//     pageTitle?: string;
//     pageDescription?: string;
//     socialSharing?: {
//       title?: string;
//       description?: string;
//       image?: AssetReference;
//     };
//   };
//   [key: string]: any;
// }

// /**
//  * Page section structure
//  */
// export interface PageSection {
//   sectionId?: string;
//   sectionType: string;
//   [key: string]: any;
// }

// /**
//  * Footer configuration asset
//  * Path: /content/footer.json
//  */
// export interface FooterAsset {
//   links?: Array<{
//     text: string;
//     href: string;
//   }>;
//   copyright?: string;
//   socialMedia?: Array<{
//     platform: string;
//     url: string;
//     icon?: AssetReference;
//   }>;
//   [key: string]: any;
// }

// /**
//  * General configuration asset
//  * Path: /design/config.json
//  */
// export interface ConfigAsset {
//   marketplaceName?: string;
//   categories?: string[];
//   colors?: {
//     primary?: string;
//     secondary?: string;
//     [key: string]: string | undefined;
//   };
//   images?: {
//     [key: string]: AssetReference;
//   };
//   [key: string]: any;
// }

// // ============================================================================
// // Helper Type Guards
// // ============================================================================

// /**
//  * Type guard to check if response is a single asset response
//  */
// export const isSingleAssetResponse = <TData = any>(
//   response: AssetDeliveryResponse<TData>
// ): response is SingleAssetResponse<TData> => {
//   return !Array.isArray(response.data);
// };

// /**
//  * Type guard to check if response is a multiple assets response
//  */
// export const isMultipleAssetsResponse = <TData = any>(
//   response: AssetDeliveryResponse<TData>
// ): response is MultipleAssetsResponse<TData> => {
//   return Array.isArray(response.data);
// };

// /**
//  * Type guard to check if data contains asset references
//  */
// export const isAssetReference = (data: any): data is AssetReference => {
//   return data && typeof data === 'object' && '_ref' in data;
// };

// // ============================================================================
// // Helper Utility Functions
// // ============================================================================

// /**
//  * Find an image asset from included array by reference ID
//  */
// export const findImageAssetById = (
//   included: ImageAssetResource[] | undefined,
//   id: string
// ): ImageAssetResource | null => {
//   if (!included) return null;
//   return included.find(asset => asset.id === id && asset.type === 'imageAsset') || null;
// };

// /**
//  * Resolve image asset reference to actual image data
//  */
// export const resolveImageReference = (
//   reference: AssetReference,
//   included: ImageAssetResource[] | undefined
// ): ImageAssetResource | null => {
//   return findImageAssetById(included, reference._ref.id);
// };

// /**
//  * Get image URL for a specific variant
//  */
// export const getImageVariantUrl = (
//   imageAsset: ImageAssetResource,
//   variantName: string = 'scaled'
// ): string | null => {
//   const variant = imageAsset.attributes.variants[variantName];
//   return variant ? variant.url : null;
// };

// /**
//  * Extract data from single asset response
//  */
// export const extractSingleAssetData = <TData = any>(
//   response: SingleAssetResponse<TData>
// ): TData => {
//   return response.data;
// };

// /**
//  * Extract data from multiple assets response
//  */
// export const extractMultipleAssetsData = <TData = any>(
//   response: MultipleAssetsResponse<TData>
// ): Array<{ path: string; data: TData }> => {
//   return response.data.map(asset => ({
//     path: asset.attributes.assetPath,
//     data: asset.attributes.data,
//   }));
// };

// /**
//  * Find specific asset by path from multiple assets response
//  */
// export const findAssetByPath = <TData = any>(
//   response: MultipleAssetsResponse<TData>,
//   path: string
// ): TData | null => {
//   const asset = response.data.find(a => a.attributes.assetPath === path);
//   return asset ? asset.attributes.data : null;
// };

export type TranslationAssetData = {
  [translationKey: string]: string;
};

export type FooterAssetData = any;

export type TopbarAssetData = any;

export type Assets = {
  translations: {
    path: '/content/translations.json';
    data: TranslationAssetData;
  };
  footer: {
    path: '/content/footer.json';
    data: FooterAssetData;
  };
  topbar: {
    path: '/content/top-bar.json';
    data: TopbarAssetData;
  };
  branding: {
    path: '/design/branding.json';
    data: BrandingAssetData;
  };
  layout: {
    path: '/design/layout.json';
    data: LayoutAssetData;
  };
};
