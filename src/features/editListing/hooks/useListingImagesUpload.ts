import { ListingImageLayout } from "@appTypes/config/configLayoutAndBranding";
import { useConfiguration } from "@context/configurationContext";
import { useAppDispatch } from "@redux/store";
import { useState } from "react";
import { useEditListingWizardRoute } from "../editListing.helper";
import { uploadListingImage } from "../editListing.slice";
import { ImageItem } from "../types/editListingForm.type";

type ImageInput = {
  uri: string;
  id: string;
  type: string;
  name: string;
}

export const useListingImagesUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { wizardKey } = useEditListingWizardRoute().params;
  const dispatch = useAppDispatch();
  const config = useConfiguration();

  const uploadImages = async (imagesInput: ImageInput[]): Promise<false | ImageItem[]> => {
    const imageConfig = config?.layout?.listingImage;
    if (!imageConfig || !('variantPrefix' in imageConfig)) {
      console.log('Image configuration not available');
      return false
    }

    setIsUploading(true);

    const res = await Promise.all(imagesInput.map(async (imageInput) => {
      return dispatch(
        uploadListingImage({
          wizardKey,
          file: imageInput,
          listingImageConfig: imageConfig as ListingImageLayout,
        }),
      ).unwrap();
    }));

    if (res.length && res.some(r => !('uri' in r) || !r.uri)) {
      console.log('Image upload failed');
      // console how many images failed
      console.log('Failed images: ', res.filter(r => !('uri' in r) || !r.uri).length);
      // console how many images succeeded
      console.log('Succeeded images: ', res.filter(r => 'uri' in r && r.uri).length);
      return false
    }
    setIsUploading(false);
    return res.map(r => ('id' in r && 'uri' in r) ? ({
      id: r.id,
      uri: r.uri,
    }) : null).filter(r => r !== null);
  }

  return {
    uploadImages,
    isUploading,
  }
}