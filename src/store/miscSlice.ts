import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TokensListResponse } from '../utils/apiTypes';
import { RootState } from './store';

interface MiscState {
  tokens: TokensListResponse[];
}

const initialState: MiscState = {
  tokens: [],
};

export const miscSlice = createSlice({
  name: 'misc',
  initialState,
  reducers: {
    setTokens: (state, action: PayloadAction<TokensListResponse[]>) => {
      state.tokens = action.payload;
    },
  },
});

export const { setTokens } = miscSlice.actions;

// #region Selectors
export const selectTokensList = (state: RootState) => state.misc.tokens;
// #endregion

export default miscSlice.reducer;
