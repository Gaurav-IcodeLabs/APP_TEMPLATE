import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SCREENS } from '@constants/screens';
import { Signup } from '@screens/index';
import { AppStackParamList } from '@appTypes/index';
import navigationConfig from './navigationConfig';

const { Screen, Navigator } = createNativeStackNavigator<AppStackParamList>();

const AppNavigator = () => {
  return (
    <Navigator screenOptions={navigationConfig}>
      <Screen name={SCREENS.SIGNUP} component={Signup} />
    </Navigator>
  );
};

export default AppNavigator;
