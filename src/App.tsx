import { useWeb3React } from '@web3-react/core';
import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import RequireAuth from './components/RequireAuth';
import RequireNoAuth from './components/RequireNoAuth';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import { injectedConnector } from './utils/connectors';

function App() {
  const { active, error, activate } = useWeb3React();

  useEffect(() => {
    injectedConnector.isAuthorized().then((isAuthorized) => {
      if (isAuthorized && !active && !error) {
        activate(injectedConnector);
      }
    });
  }, [activate, active, error]);

  return (
    <Routes>
      <Route
        path='/'
        element={
          <RequireAuth>
            <HomePage />
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
