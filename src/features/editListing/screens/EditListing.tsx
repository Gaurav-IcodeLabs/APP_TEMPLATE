import { Listing } from '@appTypes/index';
import { useAppDispatch, useTypedSelector } from '@redux/store';
import { FormProvider, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import EditListingCustomFields from '../components/EditListingCustomFields';
import EditListingDescription from '../components/EditListingDescription';
import EditListingTitle from '../components/EditListingTitle';
import SelectListingCategory from '../components/SelectListingCategory';
import SelectListingType from '../components/SelectListingType';
import { transformFormToListingData, useEditListingWizardRoute } from '../editListing.helper';
import { EditListingForm } from '../types/editListingForm.type';
import EditListingLocation from '../components/EditListingLocation';
import EditListingPricing from '../components/EditListingPricing';
import EditListingPricingAndStock from '../components/EditListingPricingAndStock';
import EditListingPriceVariations from '../components/EditListingPriceVariations';
import EditListingAvailability from '../components/EditListingAvailability';
import EditListingDelivery from '../components/EditListingDelivery';
import EditListingPhotos from '../components/EditListingPhotos';
import { Button } from '@components/index';
import {
  createListing,
  selectCreateListingInProgress,
} from '../editListing.slice';
import { Alert } from 'react-native';
import { useConfiguration } from '@context/configurationContext';

const EditListing = () => {
  const dispatch = useAppDispatch();
  const config = useConfiguration();

  const { listingId, wizardKey } = useEditListingWizardRoute().params;

  const isNewListing = !listingId;

  const existingListingType = useTypedSelector(state =>
    listingId
      ? (state.marketplaceData.entities[listingId] as Listing)?.type
      : undefined,
  );

  const createListingInProgress = useTypedSelector(state =>
    selectCreateListingInProgress(state, wizardKey),
  );

  const formMethods = useForm<EditListingForm>({
    defaultValues: {
      listingType: existingListingType ?? undefined,
      location: {
        origin: [],
        address: '',
      },
      images: [],
      fields: {},
    },
  });

  const handlePublishListing = async () => {
    const formData = formMethods.getValues();

    if (!formData.listingType || !formData.title) {
      Alert.alert('Error', 'Listing type and title are required');
      return;
    }

    try {
      const listingPayload = transformFormToListingData(
        formData,
        config
      );

      const params = {
        wizardKey,
        ...listingPayload,
      };

      const result = await dispatch(createListing(params)).unwrap();

      Alert.alert('Success', 'Listing created successfully!');
      console.log('Created listing:', result);
    } catch (error: any) {
      console.error('Create listing error', error);

      const apiError = error?.apiErrors?.[0];
      Alert.alert(
        'Error',
        apiError?.title || apiError?.detail || 'Failed to create listing',
      );
    }
  };

  return (
    <FormProvider {...formMethods}>
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>
            {isNewListing ? 'Create Listing' : 'Edit Listing'}
          </Text>
          <Text style={styles.subtitle}>Wizard Key: {wizardKey}</Text>

          <SelectListingType />

          <SelectListingCategory />

          <EditListingTitle />

          <EditListingDescription />

          <EditListingCustomFields />

          <EditListingLocation />

          <EditListingPricing />

          <EditListingPriceVariations />

          <EditListingAvailability />

          <EditListingPricingAndStock />

          <EditListingDelivery />

          <EditListingPhotos />

          {isNewListing && (
            <Button
              title="Publish listing"
              onPress={handlePublishListing}
              loader={createListingInProgress}
              disabled={createListingInProgress}
              style={styles.publishButton}
            />
          )}
        </View>
      </ScrollView>
    </FormProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
    paddingBottom: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 24,
  },
  publishButton: {
    marginTop: 32,
    marginBottom: 16,
  },
});

export default EditListing;
