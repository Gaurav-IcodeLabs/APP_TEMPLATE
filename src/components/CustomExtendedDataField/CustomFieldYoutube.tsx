import { UserFieldConfigItem } from '@appTypes/config';
import { ListingField } from '@appTypes/config/configListing';
import { CommonTextInput } from '@components/index';
import { Control } from 'react-hook-form';
import { SignupFormValues } from '../../screens/Signup/Signup.types';
import { getLabel } from './CustomExtendedDataField';

type CustomFieldYoutubePropsBase = {
  name: string;
  control: Control<SignupFormValues>;
};

type CustomFieldYoutubePropsUser = CustomFieldYoutubePropsBase & {
  fieldType: 'user';
  fieldConfig: UserFieldConfigItem;
};

type CustomFieldYoutubePropsListing = CustomFieldYoutubePropsBase & {
  fieldType: 'listing';
  fieldConfig: ListingField;
};

type CustomFieldYoutubeProps = CustomFieldYoutubePropsUser | CustomFieldYoutubePropsListing;

export const CustomFieldYoutube = (props: CustomFieldYoutubeProps) => {
  const { fieldConfig, control, name, fieldType } = props;
  const { saveConfig } = fieldConfig;
  
  // Handle different placeholder message structures
  const placeholder =
    fieldType === 'user' && 'placeholderMessage' in (saveConfig || {})
      ? (saveConfig as any)?.placeholderMessage
      : 'CustomExtendedDataField.placeholderText ';

  const label = getLabel(fieldConfig);

  return (
    <CommonTextInput
      control={control}
      name={name}
      labelKey={label}
      placeholder={placeholder}
    />
  );
};
