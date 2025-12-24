import React from 'react';
import { Controller, Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TextInput } from '@components/index';
import { ListingFieldConfigItem } from '@appTypes/config';
import { CreateListingFormValues } from '../CreateListingForm.types';
import { getLabel } from './CustomExtendedDataField';
import { SCHEMA_TYPE_LONG } from '@constants/schemaTypes';

interface CustomFieldTextProps {
  fieldConfig: ListingFieldConfigItem;
  name: string;
  control: Control<CreateListingFormValues>;
}

const CustomFieldText: React.FC<CustomFieldTextProps> = ({
  fieldConfig,
  name,
  control,
}) => {
  const { t } = useTranslation();
  const { placeholderMessage = '' } = fieldConfig?.saveConfig || {};
  const { schemaType } = fieldConfig || {};
  
  const placeholder = placeholderMessage || t('CreateListingForm.textFieldPlaceholder');
  const label = getLabel(fieldConfig);
  const isNumeric = schemaType === SCHEMA_TYPE_LONG;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <TextInput
          label={label}
          placeholder={placeholder}
          value={value || ''}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message}
          keyboardType={isNumeric ? 'numeric' : 'default'}
        />
      )}
    />
  );
};

export default CustomFieldText;