import React from 'react';
import {
  StyleSheet,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { CommonText } from '../CommonText/CommonText';
import { colors } from '@constants/colors';

interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  style?: ViewStyle;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  style,
  ...textInputProps
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && (
        <CommonText style={styles.label}>{label}</CommonText>
      )}
      
      <RNTextInput
        style={[
          styles.input,
          error && styles.inputError,
          textInputProps.multiline && styles.inputMultiline,
        ]}
        placeholderTextColor={colors.placeholder}
        {...textInputProps}
      />

      {error && (
        <CommonText style={styles.errorText}>{error}</CommonText>
      )}
    </View>
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
  input: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.black,
    backgroundColor: colors.white,
    minHeight: 48,
  },
  inputError: {
    borderColor: colors.red,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  errorText: {
    fontSize: 12,
    color: colors.red,
    marginTop: 4,
  },
});