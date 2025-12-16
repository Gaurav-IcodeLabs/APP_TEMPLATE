import React from 'react';
import { StyleSheet } from 'react-native';
import { AppText } from '../AppText/AppText';
import { colors } from '../../constants';

interface ErrorMessageProps {
  error: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ error }) => {
  return <AppText style={styles.errorText}>{error}</AppText>;
};

const styles = StyleSheet.create({
  errorText: {
    color: colors.errorRed,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 16,
  },
});