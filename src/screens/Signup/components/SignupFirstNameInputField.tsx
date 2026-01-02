import { CommonTextInput } from '@components/index';
import { Control } from 'react-hook-form';
import { SignupFormValues } from '../Signup.types';

type Props = {
  control: Control<SignupFormValues>;
};

export const SignupFirstNameInputField: React.FC<Props> = ({ control }) => {
  return (
    <CommonTextInput
      control={control}
      name="firstName"
      labelKey="firstName"
      placeholder="Enter your firstName"
    />
  );
};
