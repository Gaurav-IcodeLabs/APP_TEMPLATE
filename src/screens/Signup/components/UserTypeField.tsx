import { RadioList } from '@components/index';
import { AppConfig } from '@redux/slices/hostedAssets.slice';
import { useMemo } from 'react';

type UserTypeOption = AppConfig['user']['userTypes'][number];

type Props = {
  hasExistingUserType: boolean;
  userTypes: UserTypeOption[];
  onUserTypeChange?: (userType: string) => void;
  value?: string;
};

export const UserTypeField: React.FC<Props> = ({
  hasExistingUserType,
  userTypes,
  onUserTypeChange,
  value,
}) => {
  const hasMultipleUserTypes = userTypes.length > 1;

  // Transform userTypes to RadioList options format
  const options = useMemo(
    () =>
      userTypes.map((type) => ({
        label: type.label,
        value: type.userType,
      })),
    [userTypes],
  );

  return (
    <RadioList
      label="I want to be"
      options={options}
      value={value}
      onChange={onUserTypeChange}
      visible={!hasExistingUserType && hasMultipleUserTypes}
    />
  );
};
