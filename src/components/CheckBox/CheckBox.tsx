import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { colors } from '../../constants';
import { AppText } from '../AppText/AppText';

interface CheckBoxProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
}

export const CheckBox = <T extends FieldValues>({
  control,
  name,
}: CheckBoxProps<T>) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange } }) => (
        <TouchableOpacity
          style={styles.container}
          onPress={() => onChange(!value)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, value && styles.checkedCheckbox]}>
            {value && <AppText style={styles.checkmark}>✓</AppText>}
          </View>
        </TouchableOpacity>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: colors.lightGrey,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  checkedCheckbox: {
    backgroundColor: colors.marketplaceColor,
    borderColor: colors.marketplaceColor,
  },
  checkmark: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
});