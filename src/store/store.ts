import { configureStore } from "@reduxjs/toolkit";
import tradeDialogReducer from "./tradeDialogSlice";
import axiosInstancesReducer from "./axiosInstancesSlice";
import userInfoReducer from "./userInfoSlice";
import transactionsReducer from "./transactionsSlice";
import pricesReducer from "./pricesSlice";
import farmsReducer from "./farmsSlice";
import miscReducer from "./miscSlice";

export const store = configureStore({
  reducer: {
    tradeDialog: tradeDialogReducer,
    axiosInstances: axiosInstancesReducer,
    userInfo: userInfoReducer,
    pendingTransactions: transactionsReducer,
    prices: pricesReducer,
    farms: farmsReducer,
    misc: miscReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
