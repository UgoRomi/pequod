import { useWeb3React } from "@web3-react/core";
import { Navigate, useLocation } from "react-router-dom";

export default function RequireNoAuth({ children }: { children: JSX.Element }) {
  const { active } = useWeb3React();

  const location = useLocation();
  if(process.env.REACT_APP_MAINTENANCE === "True"){
    return <Navigate to="/maintenance" state={{ from: location }} />;
  }

  if (active) {
    return <Navigate to="/" />;
  }

  return children;
}
