import { UUID } from './types';

// Denormalised image object
export interface Image {
  id: UUID;
  type: 'image';
  attributes?: {
    variants?: Record<string, ImageVariant>;
  };
}

// ImageAsset type from Asset Delivery API
export interface ImageAsset {
  id: string;
  type: 'imageAsset';
  attributes: {
    variants?: Record<string, ImageVariant>;
    assetPath: string;
  };
}

export interface ImageVariant {
  width: number;
  height: number;
  url: string;
  name?: string;
}
