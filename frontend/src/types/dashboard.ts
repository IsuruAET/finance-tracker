export type Transaction = {
  _id: string;
  userId: string;
  date: string;
  amount: number;
  category?: string;
  source?: string;
  icon?: string;
  type?: "income" | "expense";
};

export type DashboardDataResponse = {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
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
