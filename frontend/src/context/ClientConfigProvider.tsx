import { useState, useEffect, useContext, useCallback } from "react";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";
import toast from "react-hot-toast";
import { ClientConfigContext } from "./ClientConfigContext";
import type { ClientConfig } from "./ClientConfigContext";
import { UserContext } from "./UserContext";

export const ClientConfigProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [config, setConfig] = useState<ClientConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(UserContext)!;

  const fetchConfig = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.get<ClientConfig>(
        API_PATHS.CLIENT_CONFIG.GET
      );
      setConfig(response.data);
    } catch (error) {
      console.error("Error fetching client config", error);
      // Set default values on error
      setConfig({
        defaultWalletId: null,
        earliestWalletDate: null,
        hasInitializedWallets: false,
        walletInitializationDate: null,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const updateConfig = async (defaultWalletId: string | null) => {
    try {
      const response = await axiosInstance.put<ClientConfig>(
        API_PATHS.CLIENT_CONFIG.UPDATE,
        {
          defaultWalletId,
        }
      );
      setConfig(response.data);
      toast.success("Client configuration updated successfully");
    } catch (error) {
      console.error("Error updating client config", error);
      toast.error("Failed to update client configuration");
      throw error;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && user) {
      fetchConfig();
    } else {
      setLoading(false);
    }
  }, [user, fetchConfig]);

  return (
    <ClientConfigContext.Provider
      value={{
        config,
        loading,
        refreshConfig: fetchConfig,
        updateConfig,
      }}
    >
      {children}
    </ClientConfigContext.Provider>
  );
};
