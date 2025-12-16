import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { AppText } from '../AppText/AppText';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';
import { colors } from '../../constants';

interface TextInputFieldProps<T extends FieldValues> extends TextInputProps {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

export const TextInputField = <T extends FieldValues>({
  control,
  name,
  label,
  isPassword = false,
  containerStyle,
  inputStyle,
  ...textInputProps
}: TextInputFieldProps<T>) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
        <View style={[styles.container, containerStyle]}>
          {label && <AppText style={styles.label}>{label}</AppText>}
          
          <View style={[
            styles.inputContainer,
            isFocused && styles.focusedContainer,
            error && styles.errorContainer,
          ]}>
            <TextInput
              style={[styles.input, inputStyle]}
              value={value}
              onChangeText={onChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                onBlur();
                setIsFocused(false);
              }}
              secureTextEntry={isPassword && !showPassword}
              placeholderTextColor={colors.placeholder}
              {...textInputProps}
            />
            
            {isPassword && (
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <AppText style={styles.eyeText}>
                  {showPassword ? '🙈' : '👁️'}
                </AppText>
              </TouchableOpacity>
            )}
          </View>
          
          {error?.message && <ErrorMessage error={error.message} />}
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.black,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.lightGrey,
    borderRadius: 12,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  focusedContainer: {
    borderColor: colors.marketplaceColor,
  },
  errorContainer: {
    borderColor: colors.errorRed,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.black,
    paddingVertical: 0, // Remove default padding
  },
  eyeButton: {
    padding: 8,
    marginLeft: 8,
  },
  eyeText: {
    fontSize: 18,
  },
});