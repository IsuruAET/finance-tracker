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

    // Get reference month/year (from query or fallback to current month)
    const { month: monthQuery, year: yearQuery } = req.query;

    let referenceDate = new Date();

    if (monthQuery && yearQuery) {
      const parsedMonth = Number(monthQuery);
      const parsedYear = Number(yearQuery);

      if (
        Number.isFinite(parsedMonth) &&
        Number.isFinite(parsedYear) &&
        parsedMonth >= 1 &&
        parsedMonth <= 12
      ) {
        referenceDate = new Date(parsedYear, parsedMonth - 1, 1);
      }
    }

    const currentYear = referenceDate.getFullYear();
    const currentMonth = referenceDate.getMonth();

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

    // Closing balance history (last 5 months up to selected month)
    const monthsToInclude = 5;
    const targetMonths: { year: number; monthIndex: number }[] = [];
    for (let i = monthsToInclude - 1; i >= 0; i -= 1) {
      const targetDate = new Date(currentYear, currentMonth - i, 1);
      targetMonths.push({
        year: targetDate.getFullYear(),
        monthIndex: targetDate.getMonth(), // zero-based
      });
    }

    let closingBalanceHistory: { monthLabel: string; balance: number }[] = [];

    const [firstTargetMonth] = targetMonths;

    if (firstTargetMonth) {
      const closingWindowStart = new Date(
        firstTargetMonth.year,
        firstTargetMonth.monthIndex,
        1
      );

      // Sum transactions prior to the window to get the starting balance
      const balanceBeforeWindowAgg = await Transaction.aggregate([
        {
          $match: {
            ...baseMatch,
            date: { $lt: closingWindowStart },
            type: { $in: ["INCOME", "EXPENSE", "INITIAL_BALANCE"] },
          },
        },
        {
          $group: {
            _id: "$type",
            total: { $sum: "$amount" },
          },
        },
      ]);

      const balanceBeforeWindow = balanceBeforeWindowAgg.reduce(
        (acc, curr) => {
          acc[curr._id as keyof typeof acc] = curr.total;
          return acc;
        },
        {
          INCOME: 0,
          EXPENSE: 0,
          INITIAL_BALANCE: 0,
        }
      );

      const monthlyTotalsAgg = await Transaction.aggregate([
        {
          $match: {
            ...baseMatch,
            date: { $gte: closingWindowStart, $lt: firstDayOfNextMonth },
            type: { $in: ["INCOME", "EXPENSE", "INITIAL_BALANCE"] },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$date" },
              month: { $month: "$date" },
              type: "$type",
            },
            total: { $sum: "$amount" },
          },
        },
      ]);

      type MonthlyTotals = Record<
        string,
        { income: number; expense: number; initial: number }
      >;

      const monthlyTotals = monthlyTotalsAgg.reduce<MonthlyTotals>(
        (acc, curr) => {
          const monthKey = `${curr._id.year}-${curr._id.month}`;
          if (!acc[monthKey]) {
            acc[monthKey] = { income: 0, expense: 0, initial: 0 };
          }

          if (curr._id.type === "INCOME") {
            acc[monthKey].income = curr.total;
          } else if (curr._id.type === "EXPENSE") {
            acc[monthKey].expense = curr.total;
          } else if (curr._id.type === "INITIAL_BALANCE") {
            acc[monthKey].initial = curr.total;
          }

          return acc;
        },
        {}
      );

      let rollingBalance =
        (balanceBeforeWindow.INCOME || 0) +
        (balanceBeforeWindow.INITIAL_BALANCE || 0) -
        (balanceBeforeWindow.EXPENSE || 0);

      closingBalanceHistory = targetMonths.map(({ year, monthIndex }) => {
        const key = `${year}-${monthIndex + 1}`;
        const totals = monthlyTotals[key] || {
          income: 0,
          expense: 0,
          initial: 0,
        };

        rollingBalance += totals.income + totals.initial - totals.expense;

        const monthLabel = new Date(year, monthIndex, 1).toLocaleString(
          "default",
          {
            month: "short",
            year: "numeric",
          }
        );

        return {
          monthLabel,
          balance: rollingBalance,
        };
      });
    }

    // Get income transactions for selected month only
    const thisMonthIncomeTransactions = await Transaction.find({
      userId: userObjectId,
      type: "INCOME",
      date: { $gte: firstDayOfCurrentMonth, $lt: firstDayOfNextMonth },
    })
      .populate("walletId", "name type")
      .populate("categoryId", "name type icon")
      .sort({ date: -1, createdAt: -1 });

    // Get total income for selected month
    const incomeThisMonth = thisMonthIncomeTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    // Get expense transactions for selected month only
    const thisMonthExpenseTransactions = await Transaction.find({
      userId: userObjectId,
      type: "EXPENSE",
      date: { $gte: firstDayOfCurrentMonth, $lt: firstDayOfNextMonth },
    })
      .populate("walletId", "name type")
      .populate("categoryId", "name type icon")
      .sort({ date: -1, createdAt: -1 });

    // Get total expenses for selected month
    const expensesThisMonth = thisMonthExpenseTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    // Fetch recent transactions for selected month only (all types)
    const lastTransactions = await Transaction.find({
      ...baseMatch,
      date: { $gte: firstDayOfCurrentMonth, $lt: firstDayOfNextMonth },
    })
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
        total: expensesThisMonth,
        transactions: thisMonthExpenseTransactions,
      },
      last60DaysIncome: {
        total: incomeThisMonth,
        transactions: thisMonthIncomeTransactions,
      },
      recentTransactions: lastTransactions,
      closingBalanceHistory,
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
