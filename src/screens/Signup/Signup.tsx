/* eslint-disable react-native/no-inline-styles */
import { Button, CommonText } from '@components/index';
import { colors } from '@constants/colors';
import { SCREENS } from '@constants/screens';
import { useConfiguration } from '@context/configurationContext';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {
  signupInProgress,
  signupWithEmailPassword,
} from '@redux/slices/auth.slice';
import { ENV } from '@constants/env';
import { useAppDispatch, useTypedSelector } from '@redux/store';
import { getNonUserFieldParams, pickUserFieldsData } from '@util/userHelpers';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, TouchableOpacity, View, Alert, Platform } from 'react-native';
import type { UserTypeConfigItem } from '../../types/config/configUser';
import { AuthStackParamList } from '../../types/navigation/paramList';
import CustomUserFields from './components/CustomUserFields';
import { SignupDisplayNameInputField } from './components/SignupDisplayNameInputField';
import { SignupEmailInputField } from './components/SignupEmailInputField';
import { SignupFirstNameInputField } from './components/SignupFirstNameInputField';
import { SignupLastNameInputField } from './components/SignupLastNameInputField';
import { SignupPasswordInputField } from './components/SignupPasswordInputField';
import { SignupPhoneNumberInputField } from './components/SignupPhoneNumberInputField';
import { TermsAndPolicy } from './components/TermsAndPolicy';
import { UserTypeField } from './components/UserTypeField';
import { getSignUpSchema, getSoleUserTypeMaybe } from './helper';
import { SignupFormValues } from './Signup.types';
import { GoogleSignInButton } from '../../features/auth/google/components';
import { useGoogleAuth } from '../../features/auth/google';
import { signupWithIdp, selectSignupWithIdpInProgress } from '../../features/auth/idpAuth.slice';

type SignupRouteProp = RouteProp<AuthStackParamList, 'Signup'>;
type SignupNavigationProp = NavigationProp<AuthStackParamList, 'Signup'>;

export const Signup: React.FC = () => {
  const route = useRoute<SignupRouteProp>();
  const preselectedUserType = route.params?.userType;
  const dispatch = useAppDispatch();
  const navigation = useNavigation<SignupNavigationProp>();
  const signupInProcess = useTypedSelector(signupInProgress);
  const googleSignupInProgress = useTypedSelector(selectSignupWithIdpInProgress);
   const idpClientId = ENV.GOOGLE_WEB_CLIENT_ID;
  const config = useConfiguration();
  const { t } = useTranslation();
  const userTypes = useMemo(() => config?.user.userTypes || [], [config]);
  const userFields = useMemo(() => config?.user.userFields || [], [config]);
  const hasMultipleUserTypes = userTypes.length > 1;
  const [selectedUserType, setSelectedUserType] = useState<string>(
    preselectedUserType || getSoleUserTypeMaybe(userTypes) || '',
  );
  const { signIn: googleSignIn, isLoading: googleSignInLoading, errorMessage: googleErrorMessage } = useGoogleAuth();

  const { control, handleSubmit } = useForm<SignupFormValues>({
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      displayName: '',
      phoneNumber: '',
      terms: [],
    },
    resolver: zodResolver(
      getSignUpSchema(userTypes, selectedUserType, userFields, t),
    ),

    mode: 'onChange',
  });

  const initialUserTypeKnown = !!preselectedUserType || !hasMultipleUserTypes;
  const showDefaultUserFields = initialUserTypeKnown || !!selectedUserType;

  // Get the user type configuration
  const userTypeConfig = useMemo(() => {
    const foundConfig = userTypes.find(
      cfg => cfg.userType === selectedUserType,
    );
    return foundConfig as UserTypeConfigItem | undefined;
  }, [userTypes, selectedUserType]);

  // Check if displayName should be shown
  const showDisplayName = useMemo(() => {
    if (!userTypeConfig) return false;
    const { displayNameSettings, defaultUserFields } = userTypeConfig;
    const isDisabled = defaultUserFields?.displayName === false;
    const isAllowedInSignUp = displayNameSettings?.displayInSignUp === true;
    return !isDisabled && isAllowedInSignUp;
  }, [userTypeConfig]);

  // Check if phone number should be shown
  const showPhoneNumber = useMemo(() => {
    if (!userTypeConfig) return false;
    const { phoneNumberSettings, defaultUserFields } = userTypeConfig;
    const isDisabled = defaultUserFields?.phoneNumber === false;
    const isAllowedInSignUp = phoneNumberSettings?.displayInSignUp === true;
    return !isDisabled && isAllowedInSignUp;
  }, [userTypeConfig]);

  const onSubmit = (data: SignupFormValues) => {
    data.userType = selectedUserType; // append user type to the form data before submitting
    const {
      userType,
      email,
      password,
      firstName,
      lastName,
      displayName,
      ...rest
    } = data;
    const displayNameMaybe = displayName
      ? { displayName: displayName.trim() }
      : {};

    const params = {
      email,
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      ...displayNameMaybe,
      publicData: {
        userType,
        ...pickUserFieldsData(rest, 'public', userType, userFields),
      },
      privateData: {
        ...pickUserFieldsData(rest, 'private', userType, userFields),
      },
      protectedData: {
        ...pickUserFieldsData(rest, 'protected', userType, userFields),
        ...getNonUserFieldParams(rest, userFields),
      },
    };

    dispatch(signupWithEmailPassword(params));
  };

  const handleGoogleSignup = async () => {
    try {
      if (!selectedUserType) {
        Alert.alert('Error', 'Please select a user type first');
        return;
      }
      const googleResult = await googleSignIn();
      console.log('idpClientId', idpClientId)


      console.log('googleResult', googleResult)
      
      await dispatch(
        signupWithIdp({
          idpId: googleResult.idpId,
          idpToken: googleResult.idpToken,
          idpClientId:Platform.OS==='android'?ENV.GOOGLE_WEB_CLIENT_ID:ENV.GOOGLE_IOS_CLIENT_ID,
          email: googleResult.email || '',
          firstName: googleResult.firstName,
          lastName: googleResult.lastName,
        }),
      ).unwrap();

      Alert.alert('Success', 'Account created successfully!');
    } catch (error: any) {
      console.log('error........', JSON.stringify(error));
      const errorMessage = error?.message || googleErrorMessage || 'Google signup failed';
      Alert.alert('Google Signup Failed >>>>.', errorMessage);
    }
  };

  const handleLoginPress = () => navigation.navigate(SCREENS.LOGIN);

  return (
    <View style={styles.container}>
      <CommonText style={styles.title}>Sign up</CommonText>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 100,
        }}
      >
        <UserTypeField
          value={selectedUserType}
          onUserTypeChange={setSelectedUserType}
          hasExistingUserType={!!preselectedUserType}
          userTypes={userTypes}
        />

        {showDefaultUserFields && (
          <>
            <SignupEmailInputField control={control} />
            <SignupPasswordInputField control={control} />
            <SignupFirstNameInputField control={control} />
            <SignupLastNameInputField control={control} />
            {showDisplayName && (
              <SignupDisplayNameInputField control={control} />
            )}
            {showPhoneNumber && (
              <SignupPhoneNumberInputField control={control} />
            )}
          </>
        )}

        {showDefaultUserFields ? (
          <CustomUserFields
            showDefaultUserFields={showDefaultUserFields}
            selectedUserType={selectedUserType}
            control={control}
          />
        ) : null}

        {showDefaultUserFields && (
          <>
            <TermsAndPolicy control={control} />
            <Button
              title="Create Account"
              onPress={handleSubmit(onSubmit)}
              style={{ marginBottom: 20 }}
              loader={signupInProcess}
              disabled={signupInProcess}
              //   // don't use disabled prop = isValid because it will prevent the error to be displayed on cross field validation
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <CommonText style={styles.dividerText}>or</CommonText>
              <View style={styles.dividerLine} />
            </View>

            <GoogleSignInButton
              onPress={handleGoogleSignup}
              loading={googleSignInLoading || googleSignupInProgress}
              disabled={googleSignInLoading || googleSignupInProgress}
              title="Sign up with Google"
            />

            <View style={styles.loginContainer}>
              <CommonText style={styles.loginText}>
                {t('Authentication.haveAnAccount')}{' '}
              </CommonText>
              <TouchableOpacity onPress={handleLoginPress}>
                <CommonText style={styles.loginLink}>
                  {t('Authentication.login')}
                </CommonText>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    backgroundColor: '#fff',
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
