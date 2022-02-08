import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";

interface PricesState {
  bnbUsdPrice: number;
}

const initialState: PricesState = {
  bnbUsdPrice: 0,
};

export const pricesSlice = createSlice({
  name: "prices",
  initialState,
  reducers: {
    setBnbUsdPrice: (state, action: PayloadAction<number>) => {
      state.bnbUsdPrice = action.payload;
    },
  },
});

export const { setBnbUsdPrice } = pricesSlice.actions;

// #region Selectors
export const selectBnbUsdPrice = (state: RootState) => state.prices.bnbUsdPrice;
// #endregion

export default pricesSlice.reducer;
