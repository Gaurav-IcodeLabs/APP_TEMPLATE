import React from 'react';
import { Controller, Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TextInput } from '@components/index';
import { CreateListingFormValues } from '../CreateListingForm.types';

interface ListingPriceFieldProps {
  control: Control<CreateListingFormValues>;
}

export const ListingPriceField: React.FC<ListingPriceFieldProps> = ({ control }) => {
  const { t } = useTranslation();

  return (
    <Controller
      control={control}
      name="price"
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <TextInput
          label={t('CreateListingForm.priceLabel')}
          placeholder={t('CreateListingForm.pricePlaceholder')}
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message}
          keyboardType="numeric"
        />
      )}
    />
  );
};