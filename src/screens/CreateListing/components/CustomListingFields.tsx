import React from 'react';
import { View } from 'react-native';
import { Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { CustomListingFieldInputProps } from '@appTypes/config';
import { CreateListingFormValues } from '../CreateListingForm.types';
import CustomExtendedDataField from './CustomExtendedDataField';

interface CustomListingFieldsProps {
  customFieldProps: CustomListingFieldInputProps[];
  control: Control<CreateListingFormValues>;
}

const CustomListingFields: React.FC<CustomListingFieldsProps> = ({
  customFieldProps,
  control,
}) => {
  const { t } = useTranslation();

  if (!customFieldProps || customFieldProps.length === 0) {
    return null;
  }

  return (
    <View>
      {customFieldProps.map((fieldProps) => (
        <CustomExtendedDataField
          key={fieldProps.key}
          name={fieldProps.name}
          fieldConfig={fieldProps.fieldConfig}
          control={control}
        />
      ))}
    </View>
  );
};

export default CustomListingFields;