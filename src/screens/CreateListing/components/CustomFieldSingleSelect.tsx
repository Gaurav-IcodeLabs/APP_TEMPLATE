import React from 'react';
import { Controller, Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Dropdown } from '@components/index';
import { ListingFieldConfigItem } from '@appTypes/config';
import { CreateListingFormValues } from '../CreateListingForm.types';
import { getLabel } from './CustomExtendedDataField';

interface CustomFieldSingleSelectProps {
  fieldConfig: ListingFieldConfigItem;
  name: string;
  control: Control<CreateListingFormValues>;
}

const CustomFieldSingleSelect: React.FC<CustomFieldSingleSelectProps> = ({
  fieldConfig,
  name,
  control,
}) => {
  const { t } = useTranslation();
  const { enumOptions = [], saveConfig } = fieldConfig || {};
  const { placeholderMessage } = saveConfig || {};
  
  const placeholder = placeholderMessage || t('CreateListingForm.selectPlaceholder');
  const label = getLabel(fieldConfig);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <Dropdown
          label={label}
          placeholder={placeholder}
          data={enumOptions}
          labelField="label"
          valueField="option"
          value={value}
          onChange={(item) => onChange(item.option)}
          error={error?.message}
        />
      )}
    />
  );
};

export default CustomFieldSingleSelect;