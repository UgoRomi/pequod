import { createSlice } from '@reduxjs/toolkit';
import { RootState } from './store';
import axios, { AxiosInstance } from 'axios';

interface AxiosInstancesState {
  pequodAPI: AxiosInstance | null;
}

const initialState: AxiosInstancesState = {
  pequodAPI: null,
};

export const axiosInterfacesSlice = createSlice({
  name: 'tradeDialog',
  initialState,
  reducers: {
    initializePequodInstance: (state) => {
      const pequodInstance = axios.create({
        baseURL: process.env.REACT_APP_API_BASE_URL,
      });
      state.pequodAPI = pequodInstance;
    },
  },
});

export const { initializePequodInstance } = axiosInterfacesSlice.actions;

// region Selectors
export const selectPequodApiInstance = (state: RootState) =>
  state.axiosInstances.pequodAPI;
// endregion

export default axiosInterfacesSlice.reducer;
