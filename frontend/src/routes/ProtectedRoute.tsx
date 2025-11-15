import { Navigate, Outlet } from "react-router-dom";
import { useUserContext } from "../context/UserContext";
import LoadingSpinner from "../components/LoadingSpinner";

const ProtectedRoute = () => {
  const { user, isLoading } = useUserContext();
  const token = localStorage.getItem("token");

  // Wait for auth check to complete
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!token || !user) return <Navigate to="/login" replace />;

  return <Outlet />;
};

export default ProtectedRoute;
