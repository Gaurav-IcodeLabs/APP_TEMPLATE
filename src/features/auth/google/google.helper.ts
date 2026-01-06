import { ENV } from '@constants/env';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GoogleSignInResponse } from './types';

export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: '105323808148-q69q5jl92adv8cu1gpmfrtg6gmsgiqmn.apps.googleusercontent.com', // Hardcoded for testing
    iosClientId: '105323808148-3b8sjcash69abmfrg0e0r458k8ma4ngg.apps.googleusercontent.com', // Hardcoded for testing
    offlineAccess: true, // Needed if you want refresh tokens / server auth code
    forceCodeForRefreshToken: true, // Important for getting a server auth code (recommended)

    // Optional but recommended
    scopes: ['profile', 'email'], // Add more scopes if needed (e.g., 'https://www.googleapis.com/auth/drive.file')
    hostedDomain: undefined, // Restrict to GSuite domain if needed
    profileImageSize: 150,
  });
};

export const signInWithGoogle = async (): Promise<GoogleSignInResponse> => {
  try {
    // 1. Ensure Play Services (Android only – harmless on iOS)
    await GoogleSignin.hasPlayServices({
      showPlayServicesUpdateDialog: true,
    });

    // 2. Always sign out first to clear any cached credentials
    try {
      await GoogleSignin.signOut();
    } catch (error) {
      // Ignore sign out errors if user wasn't signed in
      console.log('Sign out error (expected if not signed in):', error);
    }

    // 3. Trigger sign-in
    const userInfo = await GoogleSignin.signIn();
    const idpClientId = '105323808148-q69q5jl92adv8cu1gpmfrtg6gmsgiqmn.apps.googleusercontent.com'; // Hardcoded for testing

    console.log('Google Sign-In userInfo:', JSON.stringify(userInfo, null, 2));

    // Handle different response structures
    const userData = userInfo.data || userInfo;
    const user = userData.user || userData;

    if (!user || !user.email) {
      console.error('Invalid user data structure:', userInfo);
      throw new Error('Google Sign-In failed: Invalid user data structure');
    }

    // Return exactly the same format as easycare
    return {
      idpId: 'google',
      idpToken: userData.idToken || '',
      idpClientId,
      email: user.email,
      firstName: user.givenName || user.name || 'Google',
      lastName: user.familyName || user.givenName || 'User',
    };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    
    // Handle specific Google Sign-In errors
    if (error.code === 'SIGN_IN_CANCELLED') {
      throw new Error('Google Sign-In was cancelled');
    } else if (error.code === 'SIGN_IN_REQUIRED') {
      throw new Error('Google Sign-In is required');
    } else if (error.code === 'NETWORK_ERROR') {
      throw new Error('Network error during Google Sign-In');
    }
    
    throw error;
  }
};
