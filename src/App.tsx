import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import RequireAuth from './components/RequireAuth';
import RequireNoAuth from './components/RequireNoAuth';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';

function App() {
  useEffect(() => {}, []);

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
