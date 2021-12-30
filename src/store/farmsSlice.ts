import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

export interface AvailableFarmState {
  id: number;
  farmContractAddress: string;
  apy: number;
  lockupTime: number;
  tokenSymbol: string;
  tokenAddress: string;
  minimumToStake: number;
}
interface FarmsState {
  available: AvailableFarmState[];
}

const initialState: FarmsState = {
  available: [],
};

export const farmsSlice = createSlice({
  name: 'farms',
  initialState,
  reducers: {
    addAvailableFarms: (state, action: PayloadAction<AvailableFarmState[]>) => {
      state.available = action.payload;
    },
  },
});

export const { addAvailableFarms } = farmsSlice.actions;

// #region Selectors
export const selectAvailableFarms = (state: RootState) => state.farms.available;
// #endregion

export default farmsSlice.reducer;
