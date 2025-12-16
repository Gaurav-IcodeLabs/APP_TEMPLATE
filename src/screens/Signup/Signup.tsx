import React from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';

import { SignupForm } from './components/SignupForm';
import { SignupFormValues, transformFormToSignupParams } from './helper';
import { colors, SCREENS } from '../../constants';
import { signup, selectSignupInProgress, selectSignupError } from '../../redux/slices/auth.slice';
import { AppDispatch } from '../../redux/store';
import { useToast } from '../../util';

type NavigationProp = NativeStackNavigationProp<any>;

export const Signup: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();
  
  const signupInProgress = useSelector(selectSignupInProgress);
  const signupError = useSelector(selectSignupError);

  const handleSignup = async (values: SignupFormValues) => {
    try {
      const signupParams = transformFormToSignupParams(values);
      console.log('Signup params:', signupParams);
      
      const result = await dispatch(signup(signupParams)).unwrap();
      console.log('Signup successful:', result);
      
      // Show success message
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Account created successfully! You are now logged in.',
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      
      // Handle specific error cases
      let errorMessage = 'Failed to create account. Please try again.';
      
      if (error?.status === 409) {
        errorMessage = 'An account with this email already exists.';
      } else if (error?.status === 400) {
        errorMessage = 'Please check your information and try again.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      showToast({
        type: 'error',
        title: 'Signup Failed',
        message: errorMessage,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <SignupForm 
          onSubmit={handleSignup} 
          loading={signupInProgress}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
  },
});
