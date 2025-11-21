import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUserContext } from "../context/UserContext";
import LoadingSpinner from "../components/LoadingSpinner";
import Modal from "../components/Modal";
import InitializeWallets from "../components/Wallet/InitializeWallets";
import { useWalletInitCheck } from "../hooks/useWalletInitCheck";

const ProtectedRoute = () => {
  const { user, isLoading } = useUserContext();
  const token = localStorage.getItem("token");
  const location = useLocation();
  const {
    checkingWallets,
    walletsInitialized,
    showInitModal,
    handleInitComplete,
  } = useWalletInitCheck({
    isLoading,
    user,
    token,
    pathname: location.pathname,
  });

  // Wait for auth check to complete
  if (isLoading || checkingWallets) {
    return <LoadingSpinner />;
  }

  if (!token || !user) return <Navigate to="/login" replace />;

  return (
    <>
      <Outlet />
      {showInitModal && !walletsInitialized && (
        <Modal
          isOpen={showInitModal}
          onClose={() => {}}
          title="Initialize Your Wallets - Required"
          hideCloseButton={true}
        >
          <InitializeWallets onComplete={handleInitComplete} />
        </Modal>
      )}
    </>
  );
};

export default ProtectedRoute;
