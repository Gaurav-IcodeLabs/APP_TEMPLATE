import { Thunk } from '@appTypes/index';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../../redux/store';
import * as log from '../../util/log';
import { fetchAuthenticationState } from '../../redux/slices/auth.slice';

// ================ Initial State ================ //

interface IdpAuthState {
  loginWithIdpInProgress: boolean;
  loginWithIdpError: any;
  signupWithIdpInProgress: boolean;
  signupWithIdpError: any;
}

const initialState: IdpAuthState = {
  loginWithIdpInProgress: false,
  loginWithIdpError: null,
  signupWithIdpInProgress: false,
  signupWithIdpError: null,
};

// ================ Async Thunks ================ //

/**
 * Login with Identity Provider (IDP)
 * This handles login for Google, Apple, Facebook, etc.
 */
export const loginWithIdp = createAsyncThunk<
  any,
  {
    idpId: string;
    idpClientId: string;
    idpToken: string;
    email?: string;
  },
  Thunk
>(
  'idpAuth/loginWithIdp',
  async (params, { dispatch, extra: sdk, rejectWithValue }) => {
    try {
      const res = await sdk.loginWithIdp({
        idpId: params.idpId,
        idpClientId: params.idpClientId,
        idpToken: params.idpToken,
      });

      // Refresh auth info after successful login
      await dispatch(fetchAuthenticationState());

      return res;
    } catch (error: any) {
      const statusCode = error?.response?.status || error?.status;
      const errorData = error?.response?.data;
      const errorCode = errorData?.code || errorData?.error || error?.code;
      const message = errorData?.message || error?.message || 'IDP login failed';

      log.error(error, 'idp-login-failed', { params });

      return rejectWithValue({
        message,
        statusCode,
        ...(errorCode && { code: errorCode }),
      } as any);
    }
  },
);

/**
 * Signup with Identity Provider (IDP)
 * This handles signup for Google, Apple, Facebook, etc.
 */
export const signupWithIdp = createAsyncThunk<
  any,
  {
    idpId: string;
    idpClientId: string;
    idpToken: string;
    email: string;
    firstName: string;
    lastName: string;
    publicData: undefined;
  },
  Thunk
>(
  'idpAuth/signupWithIdp',
  async (params, { dispatch, extra: sdk, rejectWithValue }) => {
    try {
      // Create user with IDP
            console.log('params', params)
      const res = await sdk.currentUser.createWithIdp({
        ...params,
        publicData: {
          userType: 'customer',
        },
      });
            console.log('res------', res)
      // After successful signup, authenticate the user
      await sdk.loginWithIdp({
        idpId: params.idpId,
        idpClientId: params.idpClientId,
        idpToken: params.idpToken,
      });

      // Refresh auth info after successful signup
      await dispatch(fetchAuthenticationState());

      return res.data;
    } catch (error: any) {
      const statusCode = error?.response?.status || error?.status;
      const errorData = error?.response?.data;
      const errorCode = errorData?.code || errorData?.error || error?.code;
      const message = errorData?.message || error?.message || 'IDP signup failed';

      log.error(error, 'idp-signup-failed', { params });

      return rejectWithValue({
        message,
        statusCode,
        ...(errorCode && { code: errorCode }),
      } as any);
    }
  },
);

// ================ Slice ================ //

const idpAuthSlice = createSlice({
  name: 'idpAuth',
  initialState,
  reducers: {
    clearIdpErrors: state => {
      state.loginWithIdpError = null;
      state.signupWithIdpError = null;
    },
  },
  extraReducers: builder => {
    // Login with IDP
    builder
      .addCase(loginWithIdp.pending, state => {
        state.loginWithIdpInProgress = true;
        state.loginWithIdpError = null;
      })
      .addCase(loginWithIdp.fulfilled, state => {
        state.loginWithIdpInProgress = false;
        state.loginWithIdpError = null;
      })
      .addCase(loginWithIdp.rejected, (state, action) => {
        state.loginWithIdpInProgress = false;
        state.loginWithIdpError = action.payload;
      });

    // Signup with IDP
    builder
      .addCase(signupWithIdp.pending, state => {
        state.signupWithIdpInProgress = true;
        state.signupWithIdpError = null;
      })
      .addCase(signupWithIdp.fulfilled, state => {
        state.signupWithIdpInProgress = false;
        state.signupWithIdpError = null;
      })
      .addCase(signupWithIdp.rejected, (state, action) => {
        state.signupWithIdpInProgress = false;
        state.signupWithIdpError = action.payload;
      });
  },
});

export const { clearIdpErrors } = idpAuthSlice.actions;
export default idpAuthSlice.reducer;

// ================ Selectors ================ //

export const selectIdpAuthState = (state: RootState) => state.idpAuth;
export const selectLoginWithIdpInProgress = (state: RootState) =>
  state.idpAuth?.loginWithIdpInProgress || false;
export const selectLoginWithIdpError = (state: RootState) =>
  state.idpAuth?.loginWithIdpError;
export const selectSignupWithIdpInProgress = (state: RootState) =>
  state.idpAuth?.signupWithIdpInProgress || false;
export const selectSignupWithIdpError = (state: RootState) =>
  state.idpAuth?.signupWithIdpError;