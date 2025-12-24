import React from 'react';
import { Controller, Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TextInput } from '@components/index';
import { CreateListingFormValues } from '../CreateListingForm.types';

interface ListingTitleFieldProps {
  control: Control<CreateListingFormValues>;
}

export const ListingTitleField: React.FC<ListingTitleFieldProps> = ({ control }) => {
  const { t } = useTranslation();

  return (
    <Controller
      control={control}
      name="title"
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <TextInput
          label={t('CreateListingForm.titleLabel')}
          placeholder={t('CreateListingForm.titlePlaceholder')}
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message}
          maxLength={100}
        />
      )}
    />
  );
};