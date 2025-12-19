import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { CommonText } from '@components/CommonText/CommonText';
import { colors } from '@constants/colors';

interface CheckBoxProps {
  checked: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
}

export const CheckBox = (props: CheckBoxProps) => {
  const { checked, onPress = () => {}, style, disabled = false } = props;

  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.container,
        checked
          ? { backgroundColor: colors.marketplaceColor }
          : // eslint-disable-next-line react-native/no-inline-styles
            { borderWidth: 2, borderColor: colors.grey },
        style,
      ]}
    >
      {checked && <CommonText style={styles.checkmark}>✓</CommonText>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 18,
    width: 18,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: 'white',
    fontSize: 12,
  },
});
