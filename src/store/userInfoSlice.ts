import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

interface UserInfoState {
  bnbAmount: number;
  wotAmount: number;
  signedMessage: string;
}

const initialState: UserInfoState = {
  bnbAmount: 0,
  wotAmount: 0,
  signedMessage: '',
};

export const userInfoSlice = createSlice({
  name: 'userInfo',
  initialState,
  reducers: {
    setBnbAMount: (state, action: PayloadAction<number>) => {
      state.bnbAmount = action.payload;
    },
    setWotAMount: (state, action: PayloadAction<number>) => {
      state.wotAmount = action.payload;
    },
    setSignedMessage: (state, action: PayloadAction<string>) => {
      state.signedMessage = action.payload;
    },
  },
});

export const { setBnbAMount, setWotAMount, setSignedMessage } =
  userInfoSlice.actions;

// #region Selectors
export const selectUserBnbAmount = (state: RootState) =>
  state.userInfo.bnbAmount;
export const selectUserWotAmount = (state: RootState) =>
  state.userInfo.wotAmount;
export const selectUserSignedMessage = (state: RootState) =>
  state.userInfo.signedMessage;
// #endregion

export default userInfoSlice.reducer;
