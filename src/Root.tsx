import { ConfigurationProvider } from '@context/configurationContext';
import AppNavigator from '@navigators/AppNavigator';
import AuthNavigator from '@navigators/AuthNavigator';
import { NavigationContainer } from '@react-navigation/native';
import {
  fetchAuthenticationState,
  selectShouldShowAuthNavigator,
  selectShouldShowAppNavigator,
  selectAuthInfoInProgress,
  selectIsAuthenticated,
} from '@redux/slices/auth.slice';
import {
  appConfigSelector,
  fetchAppAssets,
} from '@redux/slices/hostedAssets.slice';
import { useAppDispatch, useTypedSelector } from '@redux/store';
import { useEffect } from 'react';
import { hideSplash } from 'react-native-splash-view';

const Root = () => {
  const dispatch = useAppDispatch();
  const config = useTypedSelector(appConfigSelector);
  const shouldShowAuthNavigator = useTypedSelector(
    selectShouldShowAuthNavigator,
  );
  const isAuthenticated = useTypedSelector(selectIsAuthenticated);
  const shouldShowAppNavigator = useTypedSelector(selectShouldShowAppNavigator);
  const authInfoInProgress = useTypedSelector(selectAuthInfoInProgress);

  // if (!i18n.isInitialized) {  // add this in useEffect
  //   await i18n.init();
  // }

  useEffect(() => {
    dispatch(fetchAppAssets());
    // Start the authentication flow
    dispatch(fetchAuthenticationState());
    setTimeout(() => {
      if (isAuthenticated === null) {
        hideSplash();
      }
    }, 10000);
  }, [dispatch]);

  // Show loading while auth info is being processed
  if (
    authInfoInProgress ||
    (!shouldShowAuthNavigator && !shouldShowAppNavigator)
  ) {
    return null; // or a loading component
  }

  return (
    <ConfigurationProvider value={config}>
      <NavigationContainer>
        {shouldShowAppNavigator ? <AppNavigator /> : <AuthNavigator />}
      </NavigationContainer>
    </ConfigurationProvider>
  );
};

export default Root;
