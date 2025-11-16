import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useUserAuth } from "../hooks/useUserAuth";
import PublicRoute from "./PublicRoute";
import ProtectedRoute from "./ProtectedRoute";
import LoadingSpinner from "../components/LoadingSpinner";

// Lazy load components to trigger Suspense
const Home = lazy(() => import("../pages/Dashboard/Home"));
const Login = lazy(() => import("../pages/Auth/Login"));
const SignUp = lazy(() => import("../pages/Auth/SignUp"));
const Income = lazy(() => import("../pages/Dashboard/Income"));
const Expense = lazy(() => import("../pages/Dashboard/Expense"));
const Wallet = lazy(() => import("../pages/Dashboard/Wallet"));
const NotFound = lazy(() => import("../pages/NotFound"));

const AppRoutes = () => {
  useUserAuth();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public (unauthenticated) */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
        </Route>

        {/* Protected (authenticated) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Home />} />
          <Route path="/income" element={<Income />} />
          <Route path="/expense" element={<Expense />} />
          <Route path="/wallet" element={<Wallet />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
