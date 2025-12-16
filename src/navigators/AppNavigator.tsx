import React from 'react';
import { View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppStackParamList } from '@appTypes/index';
import navigationConfig from './navigationConfig';

const { Screen, Navigator } = createNativeStackNavigator<AppStackParamList>();

// Placeholder component for main app
const PlaceholderScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Main App - Add your screens here</Text>
  </View>
);

const AppNavigator = () => {
  return (
    <Navigator screenOptions={navigationConfig}>
      <Screen name="Placeholder" component={PlaceholderScreen} />
    </Navigator>
  );
};

export default AppNavigator;
