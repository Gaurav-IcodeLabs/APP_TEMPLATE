import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Control } from 'react-hook-form';
import { LoginFormValues } from '../Login.types';
import { CommonTextInput } from '@components/index';

type Props = {
  control: Control<LoginFormValues>;
};

export const LoginEmailInputField: React.FC<Props> = ({ control }) => {
  return (
    <CommonTextInput
      control={control}
      name="email"
      labelKey="Email"
      placeholder="Enter your email"
    />
  );
};

const styles = StyleSheet.create({});
