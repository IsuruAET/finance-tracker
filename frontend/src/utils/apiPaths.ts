export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// utils/apiPaths.ts
export const API_PATHS = {
  AUTH: {
    LOGIN: "/api/v1/auth/login",
    REGISTER: "/api/v1/auth/register",
    GET_USER_INFO: "/api/v1/auth/getUser",
  },
  DASHBOARD: {
    GET_DASHBOARD_DATA: "/api/v1/dashboard",
  },
  TRANSACTIONS: {
    ADD: "/api/v1/transactions/add",
    GET_ALL: "/api/v1/transactions/get",
    DELETE: (transactionId: string | number): string =>
      `/api/v1/transactions/${transactionId}`,
    DOWNLOAD_EXCEL: "/api/v1/transactions/download/excel",
  },
  CATEGORIES: {
    GET_ALL: "/api/v1/categories/get",
    ADD: "/api/v1/categories/add",
  },
  IMAGE: {
    UPLOAD_IMAGE: "/api/v1/auth/uploadImage",
  },
  WALLET: {
    INITIALIZE: "/api/v1/wallet/initialize",
    GET_ALL: "/api/v1/wallet/get",
    ADD: "/api/v1/wallet/add",
    TRANSFER: "/api/v1/wallet/transfer",
    GET_TRANSFERS: "/api/v1/wallet/transfers",
    UPDATE_WALLET: (walletId: string | number): string =>
      `/api/v1/wallet/${walletId}`,
    DELETE_WALLET: (walletId: string | number): string =>
      `/api/v1/wallet/${walletId}`,
  },
  CLIENT_CONFIG: {
    GET: "/api/v1/client-config/get",
    UPDATE: "/api/v1/client-config/update",
  },
};
