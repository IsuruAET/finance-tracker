import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { WalletFilterContext } from "./WalletFilterContext";

const STORAGE_KEY = "finance-tracker-wallet-filter";

const persistWalletId = (walletId: string) => {
  if (typeof window === "undefined") return;

  try {
    if (walletId && walletId !== "") {
      window.sessionStorage.setItem(STORAGE_KEY, walletId);
    } else {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors (e.g., quota exceeded, disabled cookies)
  }
};

const getStoredWalletId = (): string | null => {
  if (typeof window === "undefined") return null;

  try {
    return window.sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

const getAllWallets = (): string => {
  return ""; // Default to all wallets
};

export const WalletFilterProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize from URL params or storage, default to "" (all wallets)
  const getInitialWalletId = useCallback((): string => {
    const walletParam = searchParams.get("walletId");
    if (walletParam !== null) {
      persistWalletId(walletParam);
      return walletParam;
    }

    const stored = getStoredWalletId();
    if (stored !== null) {
      return stored;
    }

    return getAllWallets();
  }, [searchParams]);

  const [selectedWalletId, setSelectedWalletIdState] = useState<string>(
    getInitialWalletId()
  );

  // Update URL params when wallet changes
  const applyWalletToUrl = useCallback(
    (walletId: string) => {
      const params = new URLSearchParams(searchParams);
      if (walletId && walletId !== "") {
        params.set("walletId", walletId);
      } else {
        params.delete("walletId");
      }
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const setSelectedWalletId = useCallback(
    (walletId: string) => {
      setSelectedWalletIdState(walletId);
      persistWalletId(walletId);
      applyWalletToUrl(walletId);
    },
    [applyWalletToUrl]
  );

  // Sync state when URL params change (e.g., browser back/forward)
  useEffect(() => {
    const walletParam = searchParams.get("walletId");

    if (walletParam !== null && walletParam !== selectedWalletId) {
      setSelectedWalletIdState(walletParam);
      persistWalletId(walletParam);
    } else if (walletParam === null && selectedWalletId !== "") {
      // URL doesn't have walletId, but state does - sync to URL
      applyWalletToUrl(selectedWalletId);
    } else if (walletParam === null && selectedWalletId === "") {
      // Both are empty, ensure storage is cleared
      persistWalletId("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  // Initial sync: if we have a stored value but no URL param, add it to URL
  useEffect(() => {
    const walletParam = searchParams.get("walletId");
    if (walletParam === null && selectedWalletId !== "") {
      applyWalletToUrl(selectedWalletId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <WalletFilterContext.Provider
      value={{
        selectedWalletId,
        setSelectedWalletId,
        getAllWallets,
      }}
    >
      {children}
    </WalletFilterContext.Provider>
  );
};

