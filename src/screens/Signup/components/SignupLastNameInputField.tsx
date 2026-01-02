import { CommonTextInput } from '@components/index';
import { Control } from 'react-hook-form';
import { SignupFormValues } from '../Signup.types';

type Props = {
  control: Control<SignupFormValues>;
};

export const SignupLastNameInputField: React.FC<Props> = ({ control }) => {
  return (
    <CommonTextInput
      control={control}
      name="lastName"
      labelKey="lastName"
      placeholder="Enter your lastName"
    />
  );
};
