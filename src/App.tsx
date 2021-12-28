import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import RequireAuth from './components/RequireAuth';
import RequireNoAuth from './components/RequireNoAuth';
import useEagerConnect from './hooks/useEagerConnect';
import TradingPage from './pages/TradingPage';
import LoginPage from './pages/LoginPage';
import PortfolioPage from './pages/PortfolioPage';
import StakingPage from './pages/StakingPage';
import { useWeb3React } from '@web3-react/core';
import { useEffect } from 'react';
import { useUserInfo } from './utils/utils';
import { useAppDispatch } from './store/hooks';
import { setBnbAMount, setWotAMount } from './store/userInfoSlice';

function App() {
  useEagerConnect();
  const { active } = useWeb3React();
  const getUserInfo = useUserInfo();
  const dispatch = useAppDispatch();

  useEffect(() => {
    getUserInfo().then((res) => {
      res.personalWallet.tokens.forEach((token) => {
        switch (token.symbol) {
          case 'BNB':
            dispatch(setBnbAMount(token.amount));
            break;
          case process.env.REACT_APP_WOT_SYMBOL:
            dispatch(setWotAMount(token.amount));
            break;
        }
      });
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
        path='/portfolio'
        element={
          <RequireAuth>
            <Layout>
              <PortfolioPage />
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
