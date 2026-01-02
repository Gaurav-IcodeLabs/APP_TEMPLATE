import { CommonTextInput } from '@components/index';
import { Control } from 'react-hook-form';
import { SignupFormValues } from '../Signup.types';

type Props = {
  control: Control<SignupFormValues>;
};

export const SignupPhoneNumberInputField: React.FC<Props> = ({ control }) => {
  return (
    <CommonTextInput
      control={control}
      name="phoneNumber"
      labelKey="phoneNumber"
      placeholder="Enter your phoneNumber"
    />
  );
};
