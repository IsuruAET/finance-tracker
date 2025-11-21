import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";
import { useClientConfig } from "../context/ClientConfigContext";

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
  const { config, loading: configLoading } = useClientConfig();
  const [checkingWallets, setCheckingWallets] = useState(true);
  const [walletsInitialized, setWalletsInitialized] = useState(false);
  const [showInitModal, setShowInitModal] = useState(false);

  useEffect(() => {
    const checkWallets = async () => {
      if (!token || !user) {
        setCheckingWallets(false);
        return;
      }

      // Wait for config to load
      if (configLoading) {
        return;
      }

      // If config indicates wallets are initialized, skip API call
      if (config?.hasInitializedWallets) {
        setWalletsInitialized(true);
        setCheckingWallets(false);
        return;
      }

      // Only call API if config says wallets haven't been initialized
      // This handles edge cases where config might be out of sync
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
  }, [isLoading, user, token, pathname, config, configLoading]);

  const handleInitComplete = () => {
    setShowInitModal(false);
    setWalletsInitialized(true);
    // Dispatch custom event to notify components (like Dashboard) to refetch data
    window.dispatchEvent(new CustomEvent("walletsInitialized"));
  };

  return {
    checkingWallets,
    walletsInitialized,
    showInitModal,
    handleInitComplete,
  };
}


