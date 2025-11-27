import { createContext, useContext } from "react";

type WalletFilterContextType = {
  selectedWalletId: string;
  setSelectedWalletId: (walletId: string) => void;
  getAllWallets: () => string;
};

export const WalletFilterContext = createContext<
  WalletFilterContextType | undefined
>(undefined);

export const useWalletFilter = () => {
  const context = useContext(WalletFilterContext);
  if (!context) {
    throw new Error("useWalletFilter must be used within WalletFilterProvider");
  }
  return context;
};
