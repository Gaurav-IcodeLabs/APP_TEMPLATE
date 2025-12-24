import React from 'react';
import { Controller, Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TextInput } from '@components/index';
import { CreateListingFormValues } from '../CreateListingForm.types';

interface ListingDescriptionFieldProps {
  control: Control<CreateListingFormValues>;
}

export const ListingDescriptionField: React.FC<ListingDescriptionFieldProps> = ({ control }) => {
  const { t } = useTranslation();

  return (
    <Controller
      control={control}
      name="description"
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <TextInput
          label={t('CreateListingForm.descriptionLabel')}
          placeholder={t('CreateListingForm.descriptionPlaceholder')}
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message}
          multiline
          numberOfLines={4}
          maxLength={1000}
        />
      )}
    />
  );
};