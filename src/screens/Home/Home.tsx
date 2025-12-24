import { View, Text } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import { Button } from '@components/index';
import { loginOutInProgress, logout } from '@redux/slices/auth.slice';
import { useAppDispatch, useTypedSelector } from '@redux/store';
import { SCREENS } from '@constants/screens';
import { AppStackParamList } from '@appTypes/navigation/paramList';

type HomeNavigationProp = NavigationProp<AppStackParamList, 'Home'>;

const Home = () => {
  const navigation = useNavigation<HomeNavigationProp>();
  const dispatch = useAppDispatch();
  const logoutInProcess = useTypedSelector(loginOutInProgress);
  
  const handleLogout = async () => {
    try {
      await dispatch(logout());
    } catch (error) {
      console.log('error', error);
    }
  };

  const handleCreateListing = () => {
    navigation.navigate(SCREENS.CREATE_LISTING);
  };

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text>Home</Text>

      <Button
        title="Create Listing"
        onPress={handleCreateListing}
        style={{
          width: 200,
          marginBottom: 20
        }}
      />

      <Button
        title="Log out"
        onPress={handleLogout}
        loader={logoutInProcess}
        disabled={logoutInProcess}
        style={{
          width: 200,
        }}
      />
    </View>
  );
};

export default Home;
