import React from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { SignupFormValues } from './Signup.types';
import { isNonEmptyString } from '@util/validators';

type Props = {
  control: Control<SignupFormValues>;
  errors: FieldErrors<SignupFormValues>;
  isRequired?: boolean;
};

export const SignupPhoneNumberInputField: React.FC<Props> = ({ control, errors, isRequired }) => {
  return (
    <Controller
      control={control}
      name="phoneNumber"
      rules={
        isRequired
          ? {
              required: 'Phone number is required',
              validate: {
                nonEmpty: value => isNonEmptyString(value) || 'Phone number is required',
              },
            }
          : undefined
      }
      render={({ field: { onChange, onBlur, value } }) => (
        <>
          <TextInput
            style={styles.input}
            placeholder="Phone number"
            keyboardType="phone-pad"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
          {errors.phoneNumber && (
            <Text style={styles.errorText}>{errors.phoneNumber.message}</Text>
          )}
        </>
      )}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 8,
  },
  errorText: {
    color: 'red',
    marginBottom: 8,
    fontSize: 12,
  },
});
