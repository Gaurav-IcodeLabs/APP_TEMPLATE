import { Alert } from 'react-native';

export interface ToastOptions {
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

export const showToast = ({ type, title, message }: ToastOptions) => {
  // For now, use Alert. In a real app, you might want to use a toast library
  Alert.alert(title, message, [{ text: 'OK' }]);
};

export const useToast = () => {
  return { showToast };
};