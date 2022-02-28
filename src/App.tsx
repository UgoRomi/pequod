import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import RequireAuth from "./components/RequireAuth";
import RequireNoAuth from "./components/RequireNoAuth";
import useEagerConnect from "./hooks/useEagerConnect";
import LoginPage from "./pages/LoginPage";
import StakingPage from "./pages/StakingPage";
import { useEffect } from "react";
import { useUserInfo } from "./utils/utils";
import TradingPage from "./pages/TradingPage";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { selectPequodApiInstance } from "./store/axiosInstancesSlice";
import { TokensListResponse } from "./utils/apiTypes";
import { setTokens } from "./store/miscSlice";
import _ from "lodash";
import MaintenancePage from "./pages/MaintenancePage";
import MaintenanceCheck from "./components/MaintenanceCheck";

function App() {
  useEagerConnect();
  const getAndUpdateUserInfo = useUserInfo();
  const pequodApiInstance = useAppSelector(selectPequodApiInstance);
  const dispatch = useAppDispatch();

  useEffect(() => {
    getAndUpdateUserInfo();

    const interval = setInterval(getAndUpdateUserInfo, 30000);

    return () => clearInterval(interval);
  }, [getAndUpdateUserInfo]);

  useEffect(() => {
    const getTokens = async () => {
      const { data: tokensList }: { data: TokensListResponse[] } =
        await pequodApiInstance.get("/tokens/list");
      dispatch(setTokens(_.uniqBy(tokensList, "address")));
    };
    getTokens();
    // TODO: FIX
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <MaintenanceCheck>
            <RequireAuth>
              <Layout>
                <TradingPage />
              </Layout>
            </RequireAuth>
          </MaintenanceCheck>
        }
      />
      <Route
        path="/staking"
        element={
          
          <MaintenanceCheck>
            <RequireAuth>
              <Layout>
                <StakingPage />
              </Layout>
            </RequireAuth>
          </MaintenanceCheck>
        }
      />
      <Route
        path="/login"
        element={
          <MaintenanceCheck>
            <RequireNoAuth>
              <LoginPage />
            </RequireNoAuth>
          </MaintenanceCheck>
        }
      />
      <Route
        path="/maintenance"
        element={
          
          <RequireNoAuth>
            <MaintenancePage />
          </RequireNoAuth>
        }
      />
    </Routes>
  );
}

export default App;
