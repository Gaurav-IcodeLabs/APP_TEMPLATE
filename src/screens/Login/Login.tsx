import { StyleSheet, TouchableOpacity, View, Alert } from 'react-native';
import React from 'react';
import { useAppDispatch, useTypedSelector } from '@redux/store';
import { login, loginInProgress } from '@redux/slices/auth.slice';
import { Button, CommonText } from '@components/index';
import { useTranslation } from 'react-i18next';
import { colors } from '@constants/colors';
import { SCREENS } from '@constants/screens';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { AuthStackParamList } from '@appTypes/index';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginEmailInputField } from './components/LoginEmailInputField';
import { LoginPasswordInputField } from './components/LoginPasswordInputField';
import { LoginFormValues } from './Login.types';
import { getLoginSchema } from './helper';
import { GoogleSignInButton } from '../../features/auth/google/components';
import { useGoogleAuth } from '../../features/auth/google';
import { loginWithIdp, selectLoginWithIdpInProgress } from '../../features/auth/idpAuth.slice';

type LoginNavigationProp = NavigationProp<AuthStackParamList, 'Login'>;

export const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<LoginNavigationProp>();
  const loginInProcess = useTypedSelector(loginInProgress);
  const googleLoginInProgress = useTypedSelector(selectLoginWithIdpInProgress);
  const { t } = useTranslation();
  const { signIn: googleSignIn, isLoading: googleSignInLoading, errorMessage: googleErrorMessage } = useGoogleAuth();

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await dispatch(
        login({
          username: values.email,
          password: values.password,
        }),
      ).unwrap();
    } catch (error: any) {
      console.log('Login error:', error);
      Alert.alert('Login Failed', error?.message || 'An error occurred during login');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const googleResult = await googleSignIn();
      
      await dispatch(
        loginWithIdp({
          idpId: googleResult.idpId,
          idpClientId: googleResult.idpClientId,
          idpToken: googleResult.idToken,
          email: googleResult.email,
        }),
      ).unwrap();

      Alert.alert('Success', 'Login successful!');
    } catch (error: any) {
      console.log('Google login error:', error);
      const errorMessage = error?.message || googleErrorMessage || 'Google login failed';
      Alert.alert('Google Login Failed', errorMessage);
    }
  };

  const { control, handleSubmit } = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
    resolver: zodResolver(getLoginSchema(t)),
    mode: 'onChange',
  });

  const handleSignupPress = () => navigation.navigate(SCREENS.SIGNUP);

  return (
    <View style={styles.container}>
      <CommonText style={styles.title}>Login</CommonText>

      <LoginEmailInputField control={control} />
      <LoginPasswordInputField control={control} />

      <Button
        title="Login"
        onPress={handleSubmit(onSubmit)}
        loader={loginInProcess}
        disabled={loginInProcess}
      />

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <CommonText style={styles.dividerText}>or</CommonText>
        <View style={styles.dividerLine} />
      </View>

      <GoogleSignInButton
        onPress={handleGoogleLogin}
        loading={googleSignInLoading || googleLoginInProgress}
        disabled={googleSignInLoading || googleLoginInProgress}
        title="Sign in with Google"
      />

      <View style={styles.loginContainer}>
        <CommonText style={styles.loginText}>
          {t('Authentication.dontHaveAnAccount')}{' '}
        </CommonText>
        <TouchableOpacity onPress={handleSignupPress}>
          <CommonText style={styles.loginLink}>
            {t('Authentication.signup')}
          </CommonText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.grey,
  },
  dividerText: {
    marginHorizontal: 16,
    color: colors.grey,
    fontSize: 14,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    color: colors.grey,
    fontSize: 14,
    // ...primaryFont('400'),
  },
  loginLink: {
    color: colors.marketplaceColor,
    fontSize: 14,
    textDecorationLine: 'underline',
    // ...primaryFont('600'),
  },
});
