import { Response } from "express";
import Transaction from "../models/Transaction";
import Wallet from "../models/Wallet";
import { AuthenticatedRequest } from "../types/express";
import { Types } from "mongoose";

// Dashboard Data
export const getDashboardData = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user?._id as string;
    if (!userId) {
      return res.status(400).json({ message: "User not found in request" });
    }

    const userObjectId = new Types.ObjectId(String(userId));

    // Build match conditions
    const baseMatch = { userId: userObjectId };

    // Get current date and calculate month boundaries
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // First day of current month
    const firstDayOfCurrentMonth = new Date(currentYear, currentMonth, 1);
    // First day of next month (end of current month)
    const firstDayOfNextMonth = new Date(currentYear, currentMonth + 1, 1);
    // End of last month
    const endOfLastMonth = new Date(
      currentYear,
      currentMonth,
      0,
      23,
      59,
      59,
      999
    );

    // Calculate This Month metrics
    const thisMonthIncomeResult = await Transaction.aggregate([
      {
        $match: {
          ...baseMatch,
          type: "INCOME",
          date: { $gte: firstDayOfCurrentMonth, $lt: firstDayOfNextMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const thisMonthExpenseResult = await Transaction.aggregate([
      {
        $match: {
          ...baseMatch,
          type: "EXPENSE",
          date: { $gte: firstDayOfCurrentMonth, $lt: firstDayOfNextMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // Get INITIAL_BALANCE separately for balance calculation (not income)
    const thisMonthInitialBalanceResult = await Transaction.aggregate([
      {
        $match: {
          ...baseMatch,
          type: "INITIAL_BALANCE",
          date: { $gte: firstDayOfCurrentMonth, $lt: firstDayOfNextMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // Calculate Broad Forward Balance Last Month (all transactions up to end of last month)
    const lastMonthIncomeResult = await Transaction.aggregate([
      {
        $match: {
          ...baseMatch,
          type: "INCOME",
          date: { $lte: endOfLastMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const lastMonthExpenseResult = await Transaction.aggregate([
      {
        $match: {
          ...baseMatch,
          type: "EXPENSE",
          date: { $lte: endOfLastMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // Get INITIAL_BALANCE separately for balance calculation (not income)
    const lastMonthInitialBalanceResult = await Transaction.aggregate([
      {
        $match: {
          ...baseMatch,
          type: "INITIAL_BALANCE",
          date: { $lte: endOfLastMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const broadForwardBalanceLastMonth =
      (lastMonthIncomeResult[0]?.total || 0) +
      (lastMonthInitialBalanceResult[0]?.total || 0) -
      (lastMonthExpenseResult[0]?.total || 0);

    const thisMonthIncome = thisMonthIncomeResult[0]?.total || 0;
    const thisMonthExpenses = thisMonthExpenseResult[0]?.total || 0;
    const thisMonthInitialBalance =
      thisMonthInitialBalanceResult[0]?.total || 0;

    // New Savings = External Seed Money (Initial Funding of New Accounts / External Initial Deposit)
    const thisMonthNewSavings = thisMonthInitialBalance;

    // Total Balance = BF + ExternalSeedMoney + Income - Expenses
    const thisMonthTotalBalance =
      broadForwardBalanceLastMonth +
      thisMonthNewSavings +
      thisMonthIncome -
      thisMonthExpenses;

    // Get income transactions for last 60 days (excluding INITIAL_BALANCE)
    const incomeDateFilter = {
      $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    };

    const last60DaysIncomeTransactions = await Transaction.find({
      userId: userObjectId,
      type: "INCOME",
      date: incomeDateFilter,
    })
      .populate("walletId", "name type")
      .populate("categoryId", "name type icon")
      .sort({ date: -1, createdAt: -1 });

    // Get total income for filtered period
    const incomeLast60Days = last60DaysIncomeTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    // Get expense transactions for last 30 days
    const expenseDateFilter = {
      $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    };

    const last30DaysExpenseTransactions = await Transaction.find({
      userId: userObjectId,
      type: "EXPENSE",
      date: expenseDateFilter,
    })
      .populate("walletId", "name type")
      .populate("categoryId", "name type icon")
      .sort({ date: -1, createdAt: -1 });

    // Get total expenses for filtered period
    const expensesLast30Days = last30DaysExpenseTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    // Fetch last 5 transactions (all types)
    const lastTransactions = await Transaction.find(baseMatch)
      .populate("walletId", "name type")
      .populate("fromWalletId", "name type")
      .populate("toWalletId", "name type")
      .populate("categoryId", "name type icon")
      .sort({ date: -1, createdAt: -1 })
      .limit(5);

    // Get wallet balances
    const wallets = await Wallet.find({ userId: userObjectId });

    // Final Response
    return res.status(200).json({
      broadForwardBalanceLastMonth,
      thisMonthNewSavings,
      thisMonthTotalIncome: thisMonthIncome,
      thisMonthTotalExpenses: thisMonthExpenses,
      thisMonthTotalBalance,
      wallets,
      last30DaysExpenses: {
        total: expensesLast30Days,
        transactions: last30DaysExpenseTransactions,
      },
      last60DaysIncome: {
        total: incomeLast60Days,
        transactions: last60DaysIncomeTransactions,
      },
      recentTransactions: lastTransactions,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({
        message: "Error fetching dashboard data",
        error: error.message,
      });
    }
    return res.status(500).json({ message: "Unknown error occurred" });
  }
};
