import React from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { SignupFormValues } from './Signup.types';
import { isNonEmptyString } from '@util/validators';

type Props = {
  control: Control<SignupFormValues>;
  errors: FieldErrors<SignupFormValues>;
};

export const SignupFirstNameInputField: React.FC<Props> = ({ control, errors }) => {
  return (
    <Controller
      control={control}
      name="firstName"
      rules={{
        required: 'First name is required',
        validate: {
          nonEmpty: (value) => {
            return isNonEmptyString(value) || 'First name is required';
          },
        },
      }}
      render={({ field: { onChange, onBlur, value } }) => (
        <>
          <TextInput
            style={styles.input}
            placeholder="First name"
            autoComplete="given-name"
            autoCapitalize="words"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
          {errors.firstName && (
            <Text style={styles.errorText}>{errors.firstName.message}</Text>
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
