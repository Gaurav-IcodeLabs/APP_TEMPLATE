import React from 'react';
import { Controller, Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { CommonText } from '@components/index';
import { colors } from '@constants/colors';
import { ListingFieldConfigItem } from '@appTypes/config';
import { CreateListingFormValues } from '../CreateListingForm.types';
import { getLabel } from './CustomExtendedDataField';

interface CustomFieldBooleanProps {
  fieldConfig: ListingFieldConfigItem;
  name: string;
  control: Control<CreateListingFormValues>;
}

const CustomFieldBoolean: React.FC<CustomFieldBooleanProps> = ({
  fieldConfig,
  name,
  control,
}) => {
  const { t } = useTranslation();
  const label = getLabel(fieldConfig);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const booleanValue = Boolean(value);

        return (
          <View style={styles.container}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => onChange(!booleanValue)}
            >
              <View style={[
                styles.checkbox,
                booleanValue && styles.checkboxChecked,
              ]}>
                {booleanValue && (
                  <CommonText style={styles.checkmark}>✓</CommonText>
                )}
              </View>
              
              {label && (
                <CommonText style={styles.label}>{label}</CommonText>
              )}
            </TouchableOpacity>

            {error && (
              <CommonText style={styles.errorText}>
                {error.message}
              </CommonText>
            )}
          </View>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
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
  label: {
    fontSize: 16,
    color: colors.black,
    flex: 1,
  },
  errorText: {
    fontSize: 12,
    color: colors.red,
    marginTop: 4,
    marginLeft: 36,
  },
});

export default CustomFieldBoolean;