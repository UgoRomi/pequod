import { Navigate, useLocation } from "react-router-dom";

export default function MaintenanceCheck({ children }: { children: JSX.Element }) {
  const location = useLocation();
    console.log(process.env.MAINTENANCE)
  if (process.env.MAINTENANCE) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/maintenance" state={{ from: location }} />;
  }

  return children;
}
