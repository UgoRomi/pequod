import { createSlice } from '@reduxjs/toolkit';
import { RootState } from './store';

interface TradeDialogState {
  isOpen: boolean;
}

const initialState: TradeDialogState = {
  isOpen: false,
};

export const tradeDialogSlice = createSlice({
  name: 'tradeDialog',
  initialState,
  reducers: {
    openTradeSettingsDialog: (state) => {
      state.isOpen = true;
    },
    closeTradeSettingsDialog: (state) => {
      state.isOpen = false;
    },
  },
});

export const { openTradeSettingsDialog, closeTradeSettingsDialog } =
  tradeDialogSlice.actions;

// region Selectors
export const selectDialogIsOpen = (state: RootState) =>
  state.tradeDialog.isOpen;
// endregion

export default tradeDialogSlice.reducer;
