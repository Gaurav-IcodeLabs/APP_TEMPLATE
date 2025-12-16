import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { colors } from '../../constants';

interface AppTextProps extends TextProps {
  children: React.ReactNode;
}

export const AppText: React.FC<AppTextProps> = ({ children, style, ...props }) => {
  return (
    <Text style={[styles.defaultText, style]} {...props}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  defaultText: {
    color: colors.black,
    fontSize: 16,
    fontFamily: 'System', // You can replace with your custom font
  },
});