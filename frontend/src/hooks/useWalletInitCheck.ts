import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

type UseWalletInitCheckParams = {
  isLoading: boolean;
  user: unknown;
  token: string | null;
  pathname: string;
};

export function useWalletInitCheck({
  isLoading,
  user,
  token,
  pathname,
}: UseWalletInitCheckParams) {
  const [checkingWallets, setCheckingWallets] = useState(true);
  const [walletsInitialized, setWalletsInitialized] = useState(false);
  const [showInitModal, setShowInitModal] = useState(false);

  useEffect(() => {
    const checkWallets = async () => {
      if (!token || !user) {
        setCheckingWallets(false);
        return;
      }

      try {
        const response = await axiosInstance.get(API_PATHS.WALLET.GET_ALL);
        if (response.data && response.data.length > 0) {
          setWalletsInitialized(true);
        } else {
          if (pathname !== "/login" && pathname !== "/signup") {
            setShowInitModal(true);
          }
        }
      } catch (error) {
        console.error("Error checking wallets", error);
        if (pathname !== "/login" && pathname !== "/signup") {
          setShowInitModal(true);
        }
      } finally {
        setCheckingWallets(false);
      }
    };

    if (!isLoading && user) {
      checkWallets();
    } else if (!isLoading) {
      setCheckingWallets(false);
    }
  }, [isLoading, user, token, pathname]);

  const handleInitComplete = () => {
    setShowInitModal(false);
    setWalletsInitialized(true);
  };

  return {
    checkingWallets,
    walletsInitialized,
    showInitModal,
    handleInitComplete,
  };
}


