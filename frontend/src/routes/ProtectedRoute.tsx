import { Navigate, Outlet } from "react-router-dom";
import { useUserContext } from "../context/UserContext";

const ProtectedRoute = () => {
  const { user } = useUserContext();
  const token = localStorage.getItem("token");

  if (!token || !user) return <Navigate to="/login" replace />;

  return <Outlet />;
};

export default ProtectedRoute;
