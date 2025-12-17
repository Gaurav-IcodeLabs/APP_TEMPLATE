import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SCREENS } from '@constants/screens';
import { AppStackParamList } from '@appTypes/index';
import navigationConfig from './navigationConfig';
import Home from '@screens/Home/Home';

const { Screen, Navigator } = createNativeStackNavigator<AppStackParamList>();

const AppNavigator = () => {
  return (
    <Navigator screenOptions={navigationConfig}>
      <Screen name={SCREENS.HOME} component={Home} />
    </Navigator>
  );
};

export default AppNavigator;
