import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import RequireAuth from './components/RequireAuth';
import RequireNoAuth from './components/RequireNoAuth';
import useEagerConnect from './hooks/useEagerConnect';
import LoginPage from './pages/LoginPage';
import StakingPage from './pages/StakingPage';
import { useEffect } from 'react';
import { useUserInfo } from './utils/utils';
import TradingPage from './pages/TradingPage';

function App() {
  useEagerConnect();
  const getAndUpdateUserInfo = useUserInfo();

  useEffect(() => {
    getAndUpdateUserInfo();
  }, [getAndUpdateUserInfo]);

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
