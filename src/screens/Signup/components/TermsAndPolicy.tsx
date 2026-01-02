import { CheckBox } from '@components/CheckBox/CheckBox';
import { Control, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SignupFormValues } from '../Signup.types';

interface TermsAndPolicyProps {
  control: Control<SignupFormValues>;
}

export const TermsAndPolicy: React.FC<TermsAndPolicyProps> = ({ control }) => {
  const { t } = useTranslation();

  return (
    <Controller
      control={control}
      name="terms"
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <View style={styles.container}>
          <View style={styles.checkboxContainer}>
            <CheckBox
              checked={!!value.length}
              onPress={() => onChange(value?.length ? [] : ['tos-and-privacy'])}
            />
            <View style={styles.textContainer}>
              <Text style={styles.text}>
                {t('SignupForm.agreeToTerms', 'I agree to the ')}{' '}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  // Handle terms of service navigation
                  console.log('Navigate to Terms of Service');
                }}
              >
                <Text style={styles.linkText}>
                  {t('SignupForm.termsOfService', 'Terms of Service')}
                </Text>
              </TouchableOpacity>
              <Text style={styles.text}> {t('SignupForm.and', 'and')} </Text>
              <TouchableOpacity
                onPress={() => {
                  // Handle privacy policy navigation
                  console.log('Navigate to Privacy Policy');
                }}
              >
                <Text style={styles.linkText}>
                  {t('SignupForm.privacyPolicy', 'Privacy Policy')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {error && (
            <Text style={styles.errorText}>
              {error.message ||
                t(
                  'SignupForm.termsRequired',
                  'Please accept the terms and conditions',
                )}
            </Text>
          )}
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 4,
  },
  textContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: 12,
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  linkText: {
    fontSize: 14,
    color: '#007AFF',
    textDecorationLine: 'underline',
    lineHeight: 20,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 8,
    marginLeft: 4,
  },
});
