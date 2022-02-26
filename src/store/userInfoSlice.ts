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
  secondsInStaking: number;
  totalEarningInUsdt: number;
  initialAmountInUsdt: number;
  imageUrl?: string;
}

export interface UserToken {
  address: string;
  symbol: string;
  name: string;
  amount: number;
  totalInDollars: number;
  earningPercentage?: number;
  logoUrl?: string;
  takeProfit?: number;
  stopLoss?: number;
}
interface UserInfoState {
  signedMessage: string;
  farms: FarmState[];
  tokens: UserToken[];
}

const initialState: UserInfoState = {
  signedMessage: '',
  farms: [],
  tokens: [],
};

export const userInfoSlice = createSlice({
  name: 'userInfo',
  initialState,
  reducers: {
    setUserTokens: (state, action: PayloadAction<UserToken[]>) => {
      state.tokens = action.payload;
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

export const { setSignedMessage, addUserFarms, updateUserFarm, setUserTokens } =
  userInfoSlice.actions;

// #region Selectors
export const selectUserBnbAmount = (state: RootState) =>
  state.userInfo.tokens.find(
    (token) =>
      token.address.toUpperCase() ===
      process.env.REACT_APP_BNB_ADDRESS?.toUpperCase()
  )?.amount || 0;
export const selectUserWotAmount = (state: RootState) =>
  state.userInfo.tokens.find(
    (token) =>
      token.address.toUpperCase() ===
      process.env.REACT_APP_WOT_ADDRESS?.toUpperCase()
  )?.amount || 0;
export const selectUserTokens = (state: RootState) => state.userInfo.tokens;
export const selectUserSignedMessage = (state: RootState) =>
  state.userInfo.signedMessage;
export const selectUserFarms = (state: RootState) => state.userInfo.farms;
// #endregion

export default userInfoSlice.reducer;
