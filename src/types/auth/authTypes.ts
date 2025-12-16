export interface StorableError {
  type: 'error';
  name?: string;
  message?: string;
  status?: number;
  statusText?: string;
  apiErrors?: any[];
}

export interface SignupParams {
  firstName: string;
  lastName: string;
  email: string;
  displayName?: string;
  password: string;
  protectedData?: {
    phoneNumber?: string | number;
  };
  publicData?: {
    userType?: 'provider' | 'customer';
    [key: string]: any;
  };
}

export interface LoginParams {
  username: string;
  password: string;
}

export interface AuthState {
  isAuthenticated: boolean | null;
  isLoggedInAs: boolean;
  authScopes: string[];
  authInfoLoaded: boolean;
  authInfoInProgress: boolean;
  authInfoError: StorableError | null;
  loginError: StorableError | null;
  loginInProgress: boolean;
  logoutError: StorableError | null;
  logoutInProgress: boolean;
  signupError: StorableError | null;
  signupInProgress: boolean;
}