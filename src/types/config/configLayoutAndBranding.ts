// -----------------------------------------------------------------------------
// BRANDING
// -----------------------------------------------------------------------------

import { ImageAsset } from "../common/images";

export type BrandingAssetData = {
  logo: ImageAsset;
  favicon: ImageAsset;
  appIcon: ImageAsset
  loginBackgroundImage: ImageAsset
  socialSharingImage: ImageAsset
  marketplaceColors: {
    mainColor: string;
  };
};

// -----------------------------------------------------------------------------
// LAYOUT
// -----------------------------------------------------------------------------

export interface LayoutVariant {
  variantType: string;
}

export interface ListingImageLayout {
  variantType: string;
  aspectRatio: string;
  aspectWidth?: number;
  aspectHeight?: number;
  variantPrefix: string;
}

export interface LayoutAssetData {
  searchPage: LayoutVariant;
  listingPage: LayoutVariant;
  listingImage: ListingImageLayout;
}
