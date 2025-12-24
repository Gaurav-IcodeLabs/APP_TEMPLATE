import React, { useState } from 'react';
import { Controller, Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { CommonText } from '@components/index';
import { colors } from '@constants/colors';
import { ListingFieldConfigItem } from '@appTypes/config';
import { CreateListingFormValues } from '../CreateListingForm.types';
import { getLabel } from './CustomExtendedDataField';

interface CustomFieldMultiselectProps {
  fieldConfig: ListingFieldConfigItem;
  name: string;
  control: Control<CreateListingFormValues>;
}

const CustomFieldMultiselect: React.FC<CustomFieldMultiselectProps> = ({
  fieldConfig,
  name,
  control,
}) => {
  const { t } = useTranslation();
  const { enumOptions = [], saveConfig } = fieldConfig || {};
  const { placeholderMessage } = saveConfig || {};
  
  const placeholder = placeholderMessage || t('CreateListingForm.multiselectPlaceholder');
  const label = getLabel(fieldConfig);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value = [] }, fieldState: { error } }) => {
        const selectedValues = Array.isArray(value) ? value : [];

        const toggleOption = (option: string) => {
          const newValues = selectedValues.includes(option)
            ? selectedValues.filter(v => v !== option)
            : [...selectedValues, option];
          onChange(newValues);
        };

        return (
          <View style={styles.container}>
            {label && (
              <CommonText style={styles.label}>{label}</CommonText>
            )}
            
            <View style={styles.optionsContainer}>
              {enumOptions.map((option) => {
                const isSelected = selectedValues.includes(option.option);
                return (
                  <TouchableOpacity
                    key={option.option}
                    style={[
                      styles.optionButton,
                      isSelected && styles.optionButtonSelected,
                    ]}
                    onPress={() => toggleOption(option.option)}
                  >
                    <CommonText
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                      ]}
                    >
                      {option.label}
                    </CommonText>
                  </TouchableOpacity>
                );
              })}
            </View>

            {selectedValues.length === 0 && (
              <CommonText style={styles.placeholder}>
                {placeholder}
              </CommonText>
            )}

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
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.lightGray,
    backgroundColor: colors.white,
  },
  optionButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: 14,
    color: colors.gray,
  },
  optionTextSelected: {
    color: colors.white,
    fontWeight: '600',
  },
  placeholder: {
    fontSize: 14,
    color: colors.lightGray,
    marginTop: 8,
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 12,
    color: colors.red,
    marginTop: 4,
  },
});

export default CustomFieldMultiselect;