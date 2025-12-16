import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  TextInputField,
  Button,
  AppText,
  CheckBox,
} from '../../../components';
import { colors, SCREENS } from '../../../constants';
import { SignupFormValues, signupFormSchema } from '../helper';

interface SignupFormProps {
  onSubmit: (values: SignupFormValues) => void;
  loading?: boolean;
}

type NavigationProp = NativeStackNavigationProp<any>;

export const SignupForm: React.FC<SignupFormProps> = ({
  onSubmit,
  loading = false,
}) => {
  const navigation = useNavigation<NavigationProp>();

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<SignupFormValues>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
    resolver: zodResolver(signupFormSchema),
    mode: 'onChange',
  });

  const handleLoginPress = () => {
    navigation.navigate(SCREENS.LOGIN);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <AppText style={styles.title}>Create Account</AppText>
          <AppText style={styles.subtitle}>
            Sign up to get started with your account
          </AppText>
        </View>

        <View style={styles.formContainer}>
          <TextInputField
            control={control}
            name="firstName"
            label="First Name"
            placeholder="Enter your first name"
            autoCapitalize="words"
          />

          <TextInputField
            control={control}
            name="lastName"
            label="Last Name"
            placeholder="Enter your last name"
            autoCapitalize="words"
          />

          <TextInputField
            control={control}
            name="email"
            label="Email"
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInputField
            control={control}
            name="password"
            label="Password"
            placeholder="Enter your password"
            isPassword
            autoCapitalize="none"
          />

          <TextInputField
            control={control}
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Confirm your password"
            isPassword
            autoCapitalize="none"
          />

          <View style={styles.checkboxContainer}>
            <CheckBox control={control} name="agreeToTerms" />
            <AppText style={styles.termsText}>
              I agree to the{' '}
              <AppText style={styles.termsLink}>Terms and Conditions</AppText>
            </AppText>
          </View>
        </View>

        <Button
          title="Sign Up"
          onPress={handleSubmit(onSubmit)}
          disabled={!isValid || loading}
          loading={loading}
          style={styles.signupButton}
        />

        <View style={styles.loginContainer}>
          <AppText style={styles.loginText}>
            Already have an account?{' '}
          </AppText>
          <TouchableOpacity onPress={handleLoginPress}>
            <AppText style={styles.loginLink}>Sign In</AppText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.grey,
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 32,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  termsText: {
    fontSize: 14,
    color: colors.grey,
    flex: 1,
    lineHeight: 20,
  },
  termsLink: {
    color: colors.marketplaceColor,
    fontWeight: '600',
  },
  signupButton: {
    marginBottom: 24,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: colors.grey,
  },
  loginLink: {
    fontSize: 14,
    color: colors.marketplaceColor,
    fontWeight: '600',
  },
});