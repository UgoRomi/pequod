import { useWeb3React } from "@web3-react/core";
import { Navigate } from "react-router-dom";

export default function RequireNoAuth({ children }: { children: JSX.Element }) {
  const { active } = useWeb3React();

  if (active) {
    return <Navigate to="/" />;
  }

  return children;
}
