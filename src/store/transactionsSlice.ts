import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EventType } from '../utils/consts';
import { RootState } from './store';

interface TransactionsState {
  transactions: { txHash: string; type: EventType }[];
}

const initialState: TransactionsState = {
  transactions: [],
};

export const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    addTransaction: (
      state,
      action: PayloadAction<{ txHash: string; type: EventType }>
    ) => {
      state.transactions.push(action.payload);
    },
    removeTransaction: (state, action: PayloadAction<{ txHash: string }>) => {
      state.transactions = state.transactions.filter(
        ({ txHash }) => txHash !== action.payload.txHash
      );
    },
  },
});

export const { addTransaction, removeTransaction } = transactionsSlice.actions;

// #region Selectors
export const selectPendingTransactions = (state: RootState) =>
  state.transactions.transactions;
// #endregion

export default transactionsSlice.reducer;
