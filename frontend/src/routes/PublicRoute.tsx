import { Navigate, Outlet } from "react-router-dom";
import { useUserContext } from "../context/UserContext";

const PublicRoute = () => {
  const { user } = useUserContext();
  const token = localStorage.getItem("token");

  if (token && user) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
};

export default PublicRoute;
