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
  setUserTokens,
  UserToken,
} from './store/userInfoSlice';
import { setBnbUsdPrice } from './store/pricesSlice';
import TradingPage from './pages/TradingPage';

function App() {
  useEagerConnect();
  const { active } = useWeb3React();
  const getUserInfo = useUserInfo();
  const dispatch = useAppDispatch();

  useEffect(() => {
    getUserInfo().then((res) => {
      const bnbUsdPrice =
        res?.personalWallet?.tokens?.find(
          (token) => token.address === process.env.REACT_APP_BNB_ADDRESS
        )?.currentPrice || 0;
      dispatch(setBnbUsdPrice(bnbUsdPrice));
      const userTokens: UserToken[] =
        res?.personalWallet?.tokens.map((token) => ({
          address: token.address,
          symbol: token.symbol,
          amount: token.amount,
        })) || [];
      dispatch(setUserTokens(userTokens));

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
              <TradingPage />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path='/staking'
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
