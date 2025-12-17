import React from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { SignupFormValues } from './Signup.types';
import { EMAIL_PATTERN } from '@util/validators';

type Props = {
  control: Control<SignupFormValues>;
  errors: FieldErrors<SignupFormValues>;
};

export const SignupEmailInputField: React.FC<Props> = ({ control, errors }) => {
  return (
    <Controller
      control={control}
      name="email"
      rules={{
        required: 'Email is required',
        pattern: {
          value: EMAIL_PATTERN,
          message: 'Enter a valid email',
        },
      }}
      render={({ field: { onChange, onBlur, value } }) => (
        <>
          <TextInput
            style={styles.input}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
          {errors.email && (
            <Text style={styles.errorText}>{errors.email.message}</Text>
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
