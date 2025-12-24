import React, { useMemo, useState } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, CommonText } from '@components/index';
import { colors } from '@constants/colors';
import { SCREENS } from '@constants/screens';
import { useConfiguration } from '@context/configurationContext';
import { useAppDispatch, useTypedSelector } from '@redux/store';
import { 
  selectedListingTypeSelector,
  createListingDraft,
  createListingDraftInProgressSelector,
  createListingDraftErrorSelector,
  resetListingForm,
} from '@redux/slices/listing.slice';
import { listingTypes, listingFields } from '@config/configListing';
import { getPropsForCustomListingFieldInputs, pickListingFieldsData, getNonListingFieldParams } from '@util/listingHelpers';
import { NavigationProp } from '@react-navigation/native';
import { AppStackParamList } from '@appTypes/navigation/paramList';
import { z } from 'zod';
import { ListingFieldConfigItem } from '@appTypes/config';

// Inline types to avoid import issues
interface CreateListingFormValues {
  title: string;
  description: string;
  price: string;
  [key: string]: any;
}

const getCreateListingSchema = (
  selectedListingType: string | null,
  listingFields: ListingFieldConfigItem[],
  t: (key: string) => string
) => {
  const baseSchema = {
    title: z
      .string()
      .min(1, t('CreateListingForm.titleRequired'))
      .max(100, t('CreateListingForm.titleTooLong')),
    description: z
      .string()
      .min(1, t('CreateListingForm.descriptionRequired'))
      .max(1000, t('CreateListingForm.descriptionTooLong')),
    price: z
      .string()
      .min(1, t('CreateListingForm.priceRequired'))
      .refine(
        (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
        t('CreateListingForm.priceInvalid')
      ),
  };

  return z.object(baseSchema);
};

type CreateListingFormNavigationProp = NavigationProp<AppStackParamList, 'CreateListingForm'>;

export const CreateListingForm: React.FC = () => {
  const navigation = useNavigation<CreateListingFormNavigationProp>();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const config = useConfiguration();
  
  const selectedListingType = useTypedSelector(selectedListingTypeSelector);
  const createInProgress = useTypedSelector(createListingDraftInProgressSelector);
  const createError = useTypedSelector(createListingDraftErrorSelector);

  // Get listing type configuration
  const listingTypeConfig = useMemo(() => {
    return listingTypes.find(lt => lt.listingType === selectedListingType);
  }, [selectedListingType]);

  // Redirect if no listing type selected
  React.useEffect(() => {
    if (!selectedListingType) {
      navigation.navigate(SCREENS.CREATE_LISTING);
    }
  }, [selectedListingType, navigation]);

  const { control, handleSubmit, formState: { errors } } = useForm<CreateListingFormValues>({
    defaultValues: {
      title: '',
      description: '',
      price: '',
    },
    resolver: zodResolver(
      getCreateListingSchema(selectedListingType, listingFields, t)
    ),
    mode: 'onChange',
  });

  const onSubmit = async (values: CreateListingFormValues) => {
    if (!selectedListingType || !listingTypeConfig) {
      Alert.alert(t('CreateListingForm.error'), t('CreateListingForm.noListingTypeError'));
      return;
    }

    try {
      const listingData = {
        title: values.title,
        description: values.description,
        price: values.price ? parseFloat(values.price) : undefined,
        listingType: selectedListingType,
        publicData: {},
        privateData: {},
      };

      const result = await dispatch(createListingDraft({ 
        listingData, 
        config 
      })).unwrap();

      Alert.alert(
        t('CreateListingForm.success'),
        t('CreateListingForm.draftCreatedMessage'),
        [
          {
            text: t('CreateListingForm.ok'),
            onPress: () => {
              dispatch(resetListingForm());
              navigation.navigate(SCREENS.HOME);
            },
          },
        ]
      );
    } catch (error) {
      console.error('Create listing error:', error);
      Alert.alert(
        t('CreateListingForm.error'),
        t('CreateListingForm.createErrorMessage')
      );
    }
  };

  if (!selectedListingType || !listingTypeConfig) {
    return null;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <CommonText style={styles.title}>
          {t('CreateListingForm.title', { type: listingTypeConfig.label })}
        </CommonText>
        <CommonText style={styles.subtitle}>
          {t('CreateListingForm.subtitle')}
        </CommonText>
      </View>

      <View style={styles.form}>
        <CommonText>Basic listing form - Custom fields will be added next</CommonText>

        <Button
          title={t('CreateListingForm.createDraft')}
          onPress={handleSubmit(onSubmit)}
          loader={createInProgress}
          disabled={createInProgress}
          style={styles.submitButton}
        />

        <Button
          title={t('CreateListingForm.back')}
          onPress={() => navigation.goBack()}
          style={[styles.backButton, styles.outlineButton]}
          titleStyle={styles.outlineButtonText}
        />
      </View>

      {createError && (
        <View style={styles.errorContainer}>
          <CommonText style={styles.errorText}>
            {t('CreateListingForm.createErrorMessage')}
          </CommonText>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray,
    lineHeight: 22,
  },
  form: {
    padding: 20,
    paddingTop: 10,
    gap: 20,
  },
  submitButton: {
    marginTop: 20,
  },
  backButton: {
    marginTop: 10,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  outlineButtonText: {
    color: colors.primary,
  },
  errorContainer: {
    margin: 20,
    padding: 15,
    backgroundColor: colors.lightRed,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.red,
  },
  errorText: {
    color: colors.red,
    fontSize: 14,
    textAlign: 'center',
  },
});