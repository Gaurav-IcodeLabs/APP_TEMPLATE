import { ENV } from '@constants/env';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GoogleSignInResponse } from './types';

export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: ENV.GOOGLE_WEB_CLIENT_ID, // From Google Cloud → Credentials → Web client (auto created by Firebase)
    iosClientId: ENV.GOOGLE_IOS_CLIENT_ID, // Only needed on iOS – this is the iOS-specific client ID
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

    // 2. Clear any previous sign-in (optional – only if you want fresh login every time)
    const hasPrevious = await GoogleSignin.hasPreviousSignIn();
    if (hasPrevious) {
      await GoogleSignin.signOut();
    }

    // 3. Trigger sign-in
    const userInfo = await GoogleSignin.signIn();
    const idpClientId = ENV.GOOGLE_WEB_CLIENT_ID;

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
