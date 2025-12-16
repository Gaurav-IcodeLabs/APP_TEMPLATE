import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SCREENS } from '@constants/screens';
import { Login, Signup } from '@screens/index';
import { AuthStackParamList } from '@appTypes/index';
import navigationConfig from './navigationConfig';

const { Screen, Navigator } = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
  return (
    <Navigator screenOptions={navigationConfig} initialRouteName='Signup'>
      <Screen name={SCREENS.SIGNUP} component={Signup} />
      <Screen name={SCREENS.LOGIN} component={Login} />
    </Navigator>
  );
};

export default AuthNavigator;
