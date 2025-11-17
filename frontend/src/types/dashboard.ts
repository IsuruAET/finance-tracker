export type Transaction = {
  _id: string;
  userId: string;
  date: string;
  amount: number;
  category?: string;
  source?: string;
  icon?: string;
  type?: "income" | "expense" | "transfer";
  fromWalletId?: {
    _id: string;
    name: string;
    icon?: string;
  } | string;
  toWalletId?: {
    _id: string;
    name: string;
    icon?: string;
  } | string;
};

export type Wallet = {
  _id: string;
  name: string;
  type: "cash" | "card";
  balance: number;
  icon?: string;
};

export type DashboardDataResponse = {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  wallets?: Wallet[];
  last30DaysExpenses: {
    total: number;
    transactions: Transaction[];
  };
  last60DaysIncome: {
    total: number;
    transactions: Transaction[];
  };
  recentTransactions: Transaction[];
};
