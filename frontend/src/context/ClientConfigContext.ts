import { createContext, useContext } from "react";

export interface ClientConfig {
  defaultWalletId: string | null;
  earliestWalletDate: string | null;
  hasInitializedWallets: boolean;
  walletInitializationDate: string | null;
}

export interface ClientConfigContextType {
  config: ClientConfig | null;
  loading: boolean;
  refreshConfig: () => Promise<void>;
  updateConfig: (defaultWalletId: string | null) => Promise<void>;
}

export const ClientConfigContext = createContext<
  ClientConfigContextType | undefined
>(undefined);

export const useClientConfig = () => {
  const context = useContext(ClientConfigContext);
  if (context === undefined) {
    throw new Error(
      "useClientConfig must be used within a ClientConfigProvider"
    );
  }
  return context;
};
