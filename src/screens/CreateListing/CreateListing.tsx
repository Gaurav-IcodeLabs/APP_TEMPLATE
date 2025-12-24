import React, { useMemo, useState } from 'react';
import { StyleSheet, View, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Button, CommonText, TextInput } from '@components/index';
import { colors } from '@constants/colors';
import { SCREENS } from '@constants/screens';
import { useConfiguration } from '@context/configurationContext';
import { useAppDispatch, useTypedSelector } from '@redux/store';
import { 
  createListingDraft,
  publishListing,
  createListingDraftInProgressSelector,
  publishListingInProgressSelector,
  createListingDraftErrorSelector,
  publishListingErrorSelector,
  resetListingForm,
} from '@redux/slices/listing.slice';
import { listingTypes, listingFields } from '@config/configListing';
import { getPropsForCustomListingFieldInputs, pickListingFieldsData } from '@util/listingHelpers';
import { NavigationProp } from '@react-navigation/native';
import { AppStackParamList } from '@appTypes/navigation/paramList';
import ImageUploadField from '@screens/CreateListing/components/ImageUploadField';

type CreateListingNavigationProp = NavigationProp<AppStackParamList, 'CreateListing'>;

export const CreateListing: React.FC = () => {
  const navigation = useNavigation<CreateListingNavigationProp>();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const config = useConfiguration();
  
  const createInProgress = useTypedSelector(createListingDraftInProgressSelector);
  const publishInProgress = useTypedSelector(publishListingInProgressSelector);
  const createError = useTypedSelector(createListingDraftErrorSelector);
  const publishError = useTypedSelector(publishListingErrorSelector);

  const [selectedListingType, setSelectedListingType] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    images: [] as string[],
  });
  const [customFieldData, setCustomFieldData] = useState<Record<string, any>>({});

  React.useEffect(() => {
    // Reset form when entering this screen
    dispatch(resetListingForm());
  }, [dispatch]);

  // Get listing type configuration
  const listingTypeConfig = useMemo(() => {
    return listingTypes.find(lt => lt.listingType === selectedListingType);
  }, [selectedListingType]);

  // Get custom listing field props
  const customFieldProps = useMemo(() => {
    return getPropsForCustomListingFieldInputs(
      listingFields,
      t,
      selectedListingType
    );
  }, [listingFields, t, selectedListingType]);

  const showListingForm = !!selectedListingType;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImagesChange = (images: string[]) => {
    setFormData(prev => ({ ...prev, images }));
  };

  const handleCustomFieldChange = (fieldName: string, value: any) => {
    setCustomFieldData(prev => ({ ...prev, [fieldName]: value }));
  };

  const validateForm = (isPublishing: boolean = false) => {
    // Basic validation
    if (!formData.title.trim()) {
      Alert.alert(t('CreateListingForm.error'), t('CreateListingForm.titleRequired'));
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert(t('CreateListingForm.error'), t('CreateListingForm.descriptionRequired'));
      return false;
    }
    if (!formData.price.trim()) {
      Alert.alert(t('CreateListingForm.error'), t('CreateListingForm.priceRequired'));
      return false;
    }

    const priceValue = parseFloat(formData.price);
    if (isNaN(priceValue) || priceValue <= 0) {
      Alert.alert(t('CreateListingForm.error'), t('CreateListingForm.priceInvalid'));
      return false;
    }

    // For publishing, require images
    if (isPublishing && formData.images.length === 0) {
      Alert.alert(t('CreateListingForm.error'), t('CreateListingForm.imagesRequired'));
      return false;
    }

    // Validate required custom fields for publishing
    if (isPublishing) {
      for (const fieldProp of customFieldProps) {
        const fieldConfig = fieldProp.fieldConfig;
        if (fieldConfig.saveConfig.isRequired) {
          const value = customFieldData[fieldProp.name];
          if (!value || (Array.isArray(value) && value.length === 0)) {
            Alert.alert(
              t('CreateListingForm.error'), 
              fieldConfig.saveConfig.requiredMessage || t('CreateListingForm.fieldRequired')
            );
            return false;
          }
        }
      }
    }

    return true;
  };

  const onSubmit = async (isDraft: boolean = true) => {
    if (!selectedListingType || !listingTypeConfig) {
      Alert.alert(t('CreateListingForm.error'), t('CreateListingForm.noListingTypeError'));
      return;
    }

    if (!validateForm(!isDraft)) {
      return;
    }

    try {
      // Combine form data with custom field data
      const allFormData = { ...formData, ...customFieldData };

      // Extract custom listing fields for public data
      const publicData = pickListingFieldsData(
        allFormData,
        'public',
        selectedListingType,
        listingFields
      );

      // Extract custom listing fields for private data
      const privateData = pickListingFieldsData(
        allFormData,
        'private',
        selectedListingType,
        listingFields
      );

      const listingData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        listingType: selectedListingType,
        publicData,
        privateData,
        images: formData.images,
      };

      if (isDraft) {
        const result = await dispatch(createListingDraft({ 
          listingData, 
          config 
        })).unwrap();
        
        console.log('Draft created successfully:', result);
        
        Alert.alert(
          t('CreateListingForm.success'),
          t('CreateListingForm.draftCreatedMessage'),
          [
            {
              text: t('CreateListingForm.ok'),
              onPress: () => {
                dispatch(resetListingForm());
                resetForm();
                navigation.navigate(SCREENS.HOME);
              },
            },
          ]
        );
      } else {
        // First create draft, then publish
        console.log('Creating draft for publishing...');
        const draftResult = await dispatch(createListingDraft({ 
          listingData, 
          config 
        })).unwrap();
        
        console.log('Draft created, now publishing...', draftResult);
        
        // Then publish the draft
        await dispatch(publishListing({ 
          id: draftResult.data.id.uuid 
        })).unwrap();
        
        console.log('Listing published successfully');
        
        Alert.alert(
          t('CreateListingForm.publishSuccess'),
          t('CreateListingForm.publishedMessage'),
          [
            {
              text: t('CreateListingForm.ok'),
              onPress: () => {
                dispatch(resetListingForm());
                resetForm();
                navigation.navigate(SCREENS.HOME);
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Create/Publish listing error:', error);
      Alert.alert(
        t('CreateListingForm.error'),
        isDraft ? t('CreateListingForm.createErrorMessage') : t('CreateListingForm.publishErrorMessage')
      );
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', price: '', images: [] });
    setCustomFieldData({});
    setSelectedListingType('');
  };

  const renderCustomField = (fieldProp: any) => {
    const { fieldConfig, name } = fieldProp;
    const { schemaType, enumOptions = [] } = fieldConfig;
    const label = fieldConfig.saveConfig?.label || fieldConfig.showConfig?.label;
    const placeholder = fieldConfig.saveConfig?.placeholderMessage || '';
    const value = customFieldData[name] || '';

    switch (schemaType) {
      case 'text':
      case 'long':
        return (
          <TextInput
            key={name}
            label={label}
            placeholder={placeholder}
            value={value}
            onChangeText={(text) => handleCustomFieldChange(name, text)}
            keyboardType={schemaType === 'long' ? 'numeric' : 'default'}
          />
        );
      
      case 'enum':
        return (
          <View key={name} style={styles.customFieldContainer}>
            <CommonText style={styles.fieldLabel}>{label}</CommonText>
            <View style={styles.enumContainer}>
              {enumOptions.map((option: any) => (
                <TouchableOpacity
                  key={option.option}
                  style={[
                    styles.enumOption,
                    value === option.option && styles.enumOptionSelected,
                  ]}
                  onPress={() => handleCustomFieldChange(name, option.option)}
                >
                  <CommonText
                    style={[
                      styles.enumOptionText,
                      value === option.option && styles.enumOptionTextSelected,
                    ]}
                  >
                    {option.label}
                  </CommonText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'multi-enum':
        const multiValue = Array.isArray(value) ? value : [];
        return (
          <View key={name} style={styles.customFieldContainer}>
            <CommonText style={styles.fieldLabel}>{label}</CommonText>
            <View style={styles.multiEnumContainer}>
              {enumOptions.map((option: any) => {
                const isSelected = multiValue.includes(option.option);
                return (
                  <TouchableOpacity
                    key={option.option}
                    style={[
                      styles.multiEnumOption,
                      isSelected && styles.multiEnumOptionSelected,
                    ]}
                    onPress={() => {
                      const newValue = isSelected
                        ? multiValue.filter((v: string) => v !== option.option)
                        : [...multiValue, option.option];
                      handleCustomFieldChange(name, newValue);
                    }}
                  >
                    <CommonText
                      style={[
                        styles.multiEnumOptionText,
                        isSelected && styles.multiEnumOptionTextSelected,
                      ]}
                    >
                      {option.label}
                    </CommonText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      case 'boolean':
        return (
          <TouchableOpacity
            key={name}
            style={styles.booleanContainer}
            onPress={() => handleCustomFieldChange(name, !value)}
          >
            <View style={[styles.checkbox, value && styles.checkboxChecked]}>
              {value && <CommonText style={styles.checkmark}>✓</CommonText>}
            </View>
            <CommonText style={styles.booleanLabel}>{label}</CommonText>
          </TouchableOpacity>
        );

      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <CommonText style={styles.title}>
          {t('CreateListing.title')}
        </CommonText>
        <CommonText style={styles.subtitle}>
          {t('CreateListing.subtitle')}
        </CommonText>
      </View>

      <View style={styles.form}>
        {/* Listing Type Selection - Radio Buttons */}
        <CommonText style={styles.label}>
          {t('CreateListing.selectTypeLabel')}
        </CommonText>
        <View style={styles.listingTypeContainer}>
          {listingTypes.map(type => (
            <TouchableOpacity
              key={type.listingType}
              style={[
                styles.listingTypeOption,
                selectedListingType === type.listingType && styles.listingTypeOptionSelected,
              ]}
              onPress={() => setSelectedListingType(type.listingType)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.radio,
                  selectedListingType === type.listingType && styles.radioSelected,
                ]}
              >
                {selectedListingType === type.listingType && <View style={styles.radioDot} />}
              </View>
              <View style={styles.textContainer}>
                <CommonText
                  style={[
                    styles.listingTypeLabel,
                    selectedListingType === type.listingType && styles.listingTypeLabelSelected,
                  ]}
                >
                  {type.label}
                </CommonText>
                <CommonText
                  style={[
                    styles.listingTypeDescription,
                    selectedListingType === type.listingType && styles.listingTypeDescriptionSelected,
                  ]}
                >
                  {t(`CreateListing.${type.listingType}.description`)}
                </CommonText>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Dynamic Form Fields - Show only when listing type is selected */}
        {showListingForm && (
          <>
            <View style={styles.formSection}>
              <CommonText style={styles.sectionTitle}>
                {t('CreateListingForm.title', { type: listingTypeConfig?.label })}
              </CommonText>
              
              {/* Standard Fields */}
              <TextInput
                label={t('CreateListingForm.titleLabel')}
                placeholder={t('CreateListingForm.titlePlaceholder')}
                value={formData.title}
                onChangeText={(text) => handleInputChange('title', text)}
                maxLength={100}
              />
              
              <TextInput
                label={t('CreateListingForm.descriptionLabel')}
                placeholder={t('CreateListingForm.descriptionPlaceholder')}
                value={formData.description}
                onChangeText={(text) => handleInputChange('description', text)}
                multiline
                numberOfLines={4}
                maxLength={1000}
              />
              
              <TextInput
                label={t('CreateListingForm.priceLabel')}
                placeholder={t('CreateListingForm.pricePlaceholder')}
                value={formData.price}
                onChangeText={(text) => handleInputChange('price', text)}
                keyboardType="numeric"
              />

              {/* Image Upload Field */}
              <ImageUploadField
                label={t('CreateListingForm.imagesLabel')}
                value={formData.images}
                onChange={handleImagesChange}
                maxImages={10}
              />

              {/* Custom Fields */}
              {customFieldProps.map(renderCustomField)}
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <Button
                title={t('CreateListingForm.saveDraft')}
                onPress={() => onSubmit(true)}
                loader={createInProgress && !publishInProgress}
                disabled={createInProgress || publishInProgress}
                style={[styles.actionButton, styles.draftButton]}
                titleStyle={styles.draftButtonText}
              />
              
              <Button
                title={t('CreateListingForm.publishListing')}
                onPress={() => onSubmit(false)}
                loader={publishInProgress}
                disabled={createInProgress || publishInProgress}
                style={[styles.actionButton, styles.publishButton]}
              />
            </View>
          </>
        )}

        {(createError || publishError) && (
          <View style={styles.errorContainer}>
            <CommonText style={styles.errorText}>
              {createError ? t('CreateListingForm.createErrorMessage') : t('CreateListingForm.publishErrorMessage')}
            </CommonText>
          </View>
        )}
      </View>
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    padding: 20,
    paddingTop: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: colors.black,
  },
  listingTypeContainer: {
    marginBottom: 16,
  },
  listingTypeOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    backgroundColor: colors.white,
  },
  listingTypeOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: '#F0F7FF',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.lightGray,
    marginRight: 12,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  textContainer: {
    flex: 1,
  },
  listingTypeLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.black,
    marginBottom: 4,
  },
  listingTypeLabelSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  listingTypeDescription: {
    fontSize: 14,
    color: colors.gray,
    lineHeight: 18,
  },
  listingTypeDescriptionSelected: {
    color: colors.primary,
  },
  formSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 16,
  },
  customFieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 8,
  },
  enumContainer: {
    gap: 8,
  },
  enumOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  enumOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: '#F0F7FF',
  },
  enumOptionText: {
    fontSize: 16,
    color: colors.black,
  },
  enumOptionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  multiEnumContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  multiEnumOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 20,
    backgroundColor: colors.white,
  },
  multiEnumOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  multiEnumOptionText: {
    fontSize: 14,
    color: colors.black,
  },
  multiEnumOptionTextSelected: {
    color: colors.white,
    fontWeight: '600',
  },
  booleanContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.lightGray,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  booleanLabel: {
    fontSize: 16,
    color: colors.black,
    flex: 1,
  },
  buttonContainer: {
    marginTop: 30,
    gap: 12,
  },
  actionButton: {
    height: 50,
  },
  draftButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  draftButtonText: {
    color: colors.primary,
  },
  publishButton: {
    backgroundColor: colors.primary,
  },
  errorContainer: {
    marginTop: 20,
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