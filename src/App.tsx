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
import LaunchpadPage from "./pages/LaunchpadPage";
import MigrationPage from "./pages/MigrationPage";
import LaunchpadDetailPage from "./pages/LaunchpadDetailPage";

function App() {
  useEagerConnect();
  const getAndUpdateUserInfo = useUserInfo();
  const pequodApiInstance = useAppSelector(selectPequodApiInstance);
  const dispatch = useAppDispatch();

  useEffect(() => {
    getAndUpdateUserInfo();
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
          <RequireAuth>
            <Layout>
              <TradingPage />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/staking"
        element={
          <RequireAuth>
            <Layout>
              <StakingPage />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/launchpad/:launchpadId"
        element={
          <RequireAuth>
            <Layout>
              <LaunchpadDetailPage />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/launchpad/"
        element={
          <RequireAuth>
            <Layout>
              <LaunchpadPage />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/migration"
        element={
          <RequireAuth>
            <Layout>
              <MigrationPage />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/login"
        element={
          <RequireNoAuth>
            <LoginPage />
          </RequireNoAuth>
        }
      />
      <Route path="/maintenance" element={<MaintenancePage />} />
    </Routes>
  );
}

export default App;
