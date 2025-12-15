import { ConfigurationProvider } from '@context/configurationContext';
import {
  appConfigSelector,
  fetchAppAssets,
} from '@redux/slices/hostedAssets.slice';
import { store, useAppDispatch, useTypedSelector } from '@redux/store';
import { useEffect } from 'react';
import { Text } from 'react-native';
import { hideSplash } from 'react-native-splash-view';

const Root = () => {
  const dispatch = useAppDispatch();
  const config = useTypedSelector(appConfigSelector);
  // console.log('conf', JSON.stringify(config));₹

  // if (!i18n.isInitialized) {  // add this in useEffect
  //   await i18n.init();
  // }

  useEffect(() => {
    dispatch(fetchAppAssets());

    setTimeout(() => {
      const isAuthenticated = store.getState()?.auth?.isAuthenticated;
      if (isAuthenticated === null) {
        hideSplash();
      }
    }, 10000);
  }, [dispatch]);

  return (
    <ConfigurationProvider value={config}>
      <Text>Root</Text>
    </ConfigurationProvider>
  );
};

export default Root;
