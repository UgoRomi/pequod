import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import RequireAuth from './components/RequireAuth';
import RequireNoAuth from './components/RequireNoAuth';
import useEagerConnect from './hooks/useEagerConnect';
import LoginPage from './pages/LoginPage';
import StakingPage from './pages/StakingPage';
import { useWeb3React } from '@web3-react/core';
import { useEffect } from 'react';
import { useUserInfo } from './utils/utils';
import { useAppDispatch } from './store/hooks';
import {
  addUserFarms,
  FarmState,
  setBnbAMount,
  setWotAMount,
} from './store/userInfoSlice';
import { setBnbUsdPrice } from './store/pricesSlice';

function App() {
  useEagerConnect();
  const { active } = useWeb3React();
  const getUserInfo = useUserInfo();
  const dispatch = useAppDispatch();

  useEffect(() => {
    getUserInfo().then((res) => {
      res?.personalWallet?.tokens?.forEach((token) => {
        switch (token.symbol) {
          case 'BNB':
            dispatch(setBnbAMount(token.amount));
            dispatch(setBnbUsdPrice(token.currentPrice));
            break;
          case process.env.REACT_APP_WOT_SYMBOL:
            dispatch(setWotAMount(token.amount));
            break;
        }
      });

      // Save the current user farms to the store
      const userFarms = res?.pequodFarms?.map((farm): FarmState => {
        return {
          id: parseInt(farm.id),
          tokenAddress: farm.token.address,
          tokenUSDPrice: parseFloat(farm.token.priceInUsd),
          amountEarned: farm.totalEarningInToken,
          farmPercentageAPY: farm.farmPercentageAPY,
          totalAmount: parseFloat(farm.amount),
          unStakingTimeInSeconds: parseInt(farm.unStakingTimeInSeconds),
          tokenSymbol: farm.token.symbol,
          farmContractAddress: farm.address,
        };
      });
      if (userFarms) dispatch(addUserFarms(userFarms));
    });
  }, [active, dispatch, getUserInfo]);

  return (
    <Routes>
      <Route
        path='/'
        element={
          <RequireAuth>
            <Layout>
              <StakingPage />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path='/login'
        element={
          <RequireNoAuth>
            <LoginPage />
          </RequireNoAuth>
        }
      />
    </Routes>
  );
}

export default App;
