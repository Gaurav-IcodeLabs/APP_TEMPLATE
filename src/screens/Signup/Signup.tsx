import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { useRoute, RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../types/navigation/paramList';
import { UserTypeField } from './UserTypeField';
import { SignupEmailInputField } from './SignupEmailInputField';
import { SignupFirstNameInputField } from './SignupFirstNameInputField';
import { SignupLastNameInputField } from './SignupLastNameInputField';
import { SignupDisplayNameInputField } from './SignupDisplayNameInputField';
import { SignupPasswordInputField } from './SignupPasswordInputField';
import { SignupPhoneNumberInputField } from './SignupPhoneNumberInputField';
import { SignupFormValues } from './Signup.types';
import { useConfiguration } from '@context/configurationContext';
import type { UserTypeConfigItem } from '../../types/config/configUser';
import CustomUserFields from './CustomUserFields';

type SignupRouteProp = RouteProp<AuthStackParamList, 'Signup'>;

export const Signup: React.FC = () => {
  const route = useRoute<SignupRouteProp>();
  const preselectedUserType = route.params?.userType;

  const config = useConfiguration();
  const userTypes = useMemo(() => config?.user.userTypes || [], [config]);

  const hasMultipleUserTypes = userTypes.length > 1;

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormValues>({
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      displayName: '',
      phoneNumber: '',
      userType:
        preselectedUserType ||
        (hasMultipleUserTypes ? '' : userTypes[0]?.userType) ||
        '',
    },
  });

  // watch only triggers re-render when "userType" changes, keeping updates minimal
  const watchedUserType = watch('userType');
  const initialUserTypeKnown = !!preselectedUserType || !hasMultipleUserTypes;
  const showDefaultUserFields = initialUserTypeKnown || !!watchedUserType;

  // Get the user type configuration
  const userTypeConfig = useMemo(() => {
    const foundConfig = userTypes.find(cfg => cfg.userType === watchedUserType);
    return foundConfig as UserTypeConfigItem | undefined;
  }, [userTypes, watchedUserType]);

  // Check if displayName should be shown
  const showDisplayName = useMemo(() => {
    if (!userTypeConfig) return false;
    const { displayNameSettings, defaultUserFields } = userTypeConfig;
    const isDisabled = defaultUserFields?.displayName === false;
    const isAllowedInSignUp = displayNameSettings?.displayInSignUp === true;
    return !isDisabled && isAllowedInSignUp;
  }, [userTypeConfig]);

  const isDisplayNameRequired = useMemo(() => {
    return userTypeConfig?.displayNameSettings?.required === true;
  }, [userTypeConfig]);

  // Check if phone number should be shown
  const showPhoneNumber = useMemo(() => {
    if (!userTypeConfig) return false;
    const { phoneNumberSettings, defaultUserFields } = userTypeConfig;
    const isDisabled = defaultUserFields?.phoneNumber === false;
    const isAllowedInSignUp = phoneNumberSettings?.displayInSignUp === true;
    return !isDisabled && isAllowedInSignUp;
  }, [userTypeConfig]);

  const isPhoneNumberRequired = useMemo(() => {
    return userTypeConfig?.phoneNumberSettings?.required === true;
  }, [userTypeConfig]);

  const onSubmit = (data: SignupFormValues) => {
    console.log('Signup form submitted', data);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign up</Text>

      <UserTypeField
        control={control}
        errors={errors}
        hasExistingUserType={!!preselectedUserType}
        userTypes={userTypes}
      />

      {showDefaultUserFields && (
        <>
          <SignupEmailInputField control={control} errors={errors} />
          <SignupPasswordInputField control={control} errors={errors} />
          <SignupFirstNameInputField control={control} errors={errors} />
          <SignupLastNameInputField control={control} errors={errors} />
          {showDisplayName && (
            <SignupDisplayNameInputField
              control={control}
              errors={errors}
              isRequired={isDisplayNameRequired}
            />
          )}
          {showPhoneNumber && (
            <SignupPhoneNumberInputField
              control={control}
              errors={errors}
              isRequired={isPhoneNumberRequired}
            />
          )}
        </>
      )}

      <CustomUserFields 
      showDefaultUserFields={showDefaultUserFields}
      selectedUserType={watchedUserType}
      />

      {showDefaultUserFields && (
        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit(onSubmit)}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Create account</Text>
        </TouchableOpacity>
      )}
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
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
