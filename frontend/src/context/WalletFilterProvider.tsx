import { useState, useCallback, useEffect } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
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

// Routes where search params should be applied
const DASHBOARD_ROUTES = ["/income", "/expense", "/transaction"];

const shouldApplySearchParams = (pathname: string): boolean => {
  return DASHBOARD_ROUTES.some((route) => pathname.startsWith(route));
};

export const WalletFilterProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

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

  // Update URL params when wallet changes (only on dashboard routes)
  const applyWalletToUrl = useCallback(
    (walletId: string) => {
      if (!shouldApplySearchParams(location.pathname)) {
        return; // Don't update URL params on non-dashboard routes
      }
      const params = new URLSearchParams(searchParams);
      if (walletId && walletId !== "") {
        params.set("walletId", walletId);
      } else {
        params.delete("walletId");
      }
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams, location.pathname]
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
    } else if (
      walletParam === null &&
      selectedWalletId !== "" &&
      shouldApplySearchParams(location.pathname)
    ) {
      // URL doesn't have walletId, but state does - sync to URL (only on dashboard routes)
      applyWalletToUrl(selectedWalletId);
    } else if (walletParam === null && selectedWalletId === "") {
      // Both are empty, ensure storage is cleared
      persistWalletId("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString(), location.pathname]);

  // Initial sync: if we have a stored value but no URL param, add it to URL (only on dashboard routes)
  useEffect(() => {
    const walletParam = searchParams.get("walletId");
    if (
      walletParam === null &&
      selectedWalletId !== "" &&
      shouldApplySearchParams(location.pathname)
    ) {
      applyWalletToUrl(selectedWalletId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

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
