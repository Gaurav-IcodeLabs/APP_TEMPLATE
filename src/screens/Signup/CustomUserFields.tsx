import { useConfiguration } from '@context/configurationContext';
import { getPropsForCustomUserFieldInputs } from '@util/userHelpers';
import { View } from 'react-native';
import CustomExtendedDataField from './CustomExtendedDataField';

const CustomUserFields = ({
  showDefaultUserFields,
  selectedUserType,
}: {
  showDefaultUserFields: boolean;
  selectedUserType: string;
}) => {
  const config = useConfiguration();
  const userFields = config?.user.userFields || [];

  // Custom user fields. Since user types are not supported here,
  // only fields with no user type id limitation are selected.
  const userFieldProps = getPropsForCustomUserFieldInputs(
    userFields,
    intl,
    selectedUserType,
  );

  const showCustomUserFields =
    showDefaultUserFields && userFieldProps?.length > 0;

  if (!showCustomUserFields) return null;

  return (
    <View>
      {userFieldProps.map(({ key, ...fieldProps }) => (
        <CustomExtendedDataField key={key} {...fieldProps} />
      ))}
    </View>
  );
};

export default CustomUserFields;
