export interface TransactionApiResponse {
  _id: string;
  userId: string;
  type: "INCOME" | "EXPENSE" | "TRANSFER" | "INITIAL_BALANCE";
  amount: number;
  date: string;
  desc?: string;
  walletId?: {
    _id: string;
    name: string;
    type: string;
    balance?: number;
  };
  categoryId?: {
    _id: string;
    name: string;
    type: string;
    icon: string;
  };
  fromWalletId?: {
    _id: string;
    name: string;
    type: string;
  };
  toWalletId?: {
    _id: string;
    name: string;
    type: string;
  };
}

export type Wallet = {
  _id: string;
  name: string;
  type: "CASH" | "CARD";
  balance: number;
  icon?: string;
  createdDate?: string;
};

export type DashboardDataResponse = {
  broadForwardBalanceLastMonth: number;
  thisMonthNewSavings: number;
  thisMonthTotalIncome: number;
  thisMonthTotalExpenses: number;
  thisMonthTotalBalance: number;
  wallets?: Wallet[];
  last30DaysExpenses: {
    total: number;
    transactions: TransactionApiResponse[];
  };
  last60DaysIncome: {
    total: number;
    transactions: TransactionApiResponse[];
  };
  recentTransactions: TransactionApiResponse[];
};
