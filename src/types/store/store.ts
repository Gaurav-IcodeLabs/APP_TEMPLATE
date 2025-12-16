import { AppDispatch, RootState } from '@redux/store';

export interface Thunk {
  dispatch: AppDispatch;
  state: RootState;
  extra: any; //sdk types
  rejectWithValue: (value: unknown) => never;
}
