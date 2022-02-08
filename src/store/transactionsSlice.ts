import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { EventType } from "../utils/consts";
import { RootState } from "./store";

interface PendingTransactionsState {
  transactions: { txHash: string; type: EventType; addedTimestamp: number }[];
}

const initialState: PendingTransactionsState = {
  transactions: [],
};

export const pendingTransactionsSlice = createSlice({
  name: "pendingTransactions",
  initialState,
  reducers: {
    addTransaction: (
      state,
      action: PayloadAction<{
        txHash: string;
        type: EventType;
        addedTimestamp: number;
      }>
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

export const { addTransaction, removeTransaction } =
  pendingTransactionsSlice.actions;

// #region Selectors
export const selectPendingTransactions = (state: RootState) =>
  state.pendingTransactions.transactions;
// #endregion

export default pendingTransactionsSlice.reducer;
