import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import RequireAuth from './components/RequireAuth';
import RequireNoAuth from './components/RequireNoAuth';
import useEagerConnect from './hooks/useEagerConnect';
import TradingPage from './pages/TradingPage';
import LoginPage from './pages/LoginPage';
import PortfolioPage from './pages/PortfolioPage';
import StakingPage from './pages/StakingPage';
import { useAppSelector } from './store/hooks';
import { selectPequodApiInstance } from './store/axiosInstancesSlice';
import { useWeb3React } from '@web3-react/core';
import { useEffect } from 'react';
import { validateSessionIfInvalid } from './utils/utils';

function App() {
  useEagerConnect();
  const { account, library, active } = useWeb3React();
  const pequodApi = useAppSelector(selectPequodApiInstance);

  useEffect(() => {
    if (!active || !account || !library || !pequodApi) return;
    validateSessionIfInvalid(account, library, pequodApi);
  }, [active, account, library, pequodApi]);

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
