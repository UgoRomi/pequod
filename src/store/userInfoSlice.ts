import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

export interface FarmState {
  id: number;
  tokenAddress: string;
  tokenSymbol: string;
  farmContractAddress: string;
  tokenUSDPrice: number;
  totalAmount: number;
  farmPercentageAPY: number;
  amountEarned: number;
  unStakingTimeInSeconds: number;
}
interface UserInfoState {
  bnbAmount: number;
  wotAmount: number;
  signedMessage: string;
  farms: FarmState[];
}

const initialState: UserInfoState = {
  bnbAmount: 0,
  wotAmount: 0,
  signedMessage: '',
  farms: [],
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
    addUserFarms: (state, action: PayloadAction<FarmState[]>) => {
      // Replace the farms with the same ID and add the new ones
      state.farms = action.payload;
    },
    updateUserFarm: (state, action: PayloadAction<FarmState>) => {
      // Replace the farm with the same ID and add the new ones
      state.farms = state.farms.map((farm) => {
        if (farm.id === action.payload.id) {
          return action.payload;
        }
        return farm;
      });
    },
  },
});

export const {
  setBnbAMount,
  setWotAMount,
  setSignedMessage,
  addUserFarms,
  updateUserFarm,
} = userInfoSlice.actions;

// #region Selectors
export const selectUserBnbAmount = (state: RootState) =>
  state.userInfo.bnbAmount;
export const selectUserWotAmount = (state: RootState) =>
  state.userInfo.wotAmount;
export const selectUserSignedMessage = (state: RootState) =>
  state.userInfo.signedMessage;
// #endregion

export default userInfoSlice.reducer;
