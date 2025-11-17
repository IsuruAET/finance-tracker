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

    // Fetch total income & expenses
    const totalIncomeResult = await Transaction.aggregate([
      { $match: { ...baseMatch, type: { $in: ["INCOME", "INITIAL_BALANCE"] } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalExpenseResult = await Transaction.aggregate([
      { $match: { ...baseMatch, type: "EXPENSE" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalIncome = totalIncomeResult[0]?.total || 0;
    const totalExpense = totalExpenseResult[0]?.total || 0;

    // Get income transactions for last 60 days
    const incomeDateFilter = {
      $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    };

    const last60DaysIncomeTransactions = await Transaction.find({
      userId: userObjectId,
      type: { $in: ["INCOME", "INITIAL_BALANCE"] },
      date: incomeDateFilter,
    })
      .populate("walletId", "name type")
      .populate("categoryId", "name type icon")
      .sort({ date: -1 });

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
      .sort({ date: -1 });

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
      .sort({ date: -1 })
      .limit(5);

    // Get wallet balances
    const wallets = await Wallet.find({ userId: userObjectId });

    // Final Response
    return res.status(200).json({
      totalBalance: totalIncome - totalExpense,
      totalIncome,
      totalExpenses: totalExpense,
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
