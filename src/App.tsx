import { useEffect } from 'react';
import { Route, Routes } from 'react-router';
import LoginPage from './pages/LoginPage';

function App() {
  useEffect(() => {}, []);

  return (
    <Routes>
      <Route path='/login' element={<LoginPage />} />
    </Routes>
  );
}

export default App;
