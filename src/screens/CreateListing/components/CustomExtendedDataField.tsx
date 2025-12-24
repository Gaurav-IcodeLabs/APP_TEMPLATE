import React from 'react';
import { Text } from 'react-native';
import { Control } from 'react-hook-form';
import {
  SCHEMA_TYPE_ENUM,
  SCHEMA_TYPE_LONG,
  SCHEMA_TYPE_MULTI_ENUM,
  SCHEMA_TYPE_TEXT,
  SCHEMA_TYPE_BOOLEAN,
} from '@constants/schemaTypes';
import { ListingFieldConfigItem } from '@appTypes/config';
import { CreateListingFormValues } from '../CreateListingForm.types';
import CustomFieldText from './CustomFieldText';
import CustomFieldSingleSelect from './CustomFieldSingleSelect';
import CustomFieldMultiselect from './CustomFieldMultiselect';
import CustomFieldBoolean from './CustomFieldBoolean';

interface CustomExtendedDataFieldProps {
  name: string;
  fieldConfig: ListingFieldConfigItem;
  control: Control<CreateListingFormValues>;
}

export const getLabel = (fieldConfig: ListingFieldConfigItem | undefined) =>
  fieldConfig?.saveConfig?.label || fieldConfig?.showConfig?.label;

const CustomExtendedDataField: React.FC<CustomExtendedDataFieldProps> = ({
  fieldConfig,
  control,
  name,
}) => {
  const { schemaType, enumOptions = [] } = fieldConfig || {};

  switch (schemaType) {
    case SCHEMA_TYPE_TEXT:
    case SCHEMA_TYPE_LONG:
      return (
        <CustomFieldText
          fieldConfig={fieldConfig}
          name={name}
          control={control}
        />
      );
    case SCHEMA_TYPE_ENUM:
      return enumOptions?.length > 0 ? (
        <CustomFieldSingleSelect
          fieldConfig={fieldConfig}
          name={name}
          control={control}
        />
      ) : null;
    case SCHEMA_TYPE_MULTI_ENUM:
      return enumOptions?.length > 0 ? (
        <CustomFieldMultiselect
          fieldConfig={fieldConfig}
          name={name}
          control={control}
        />
      ) : null;
    case SCHEMA_TYPE_BOOLEAN:
      return (
        <CustomFieldBoolean
          fieldConfig={fieldConfig}
          name={name}
          control={control}
        />
      );

    default:
      return <Text>Unknown schema type: {schemaType}</Text>;
  }
};

export default CustomExtendedDataField;