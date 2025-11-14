import { Response } from "express";
import Income from "../models/Income";
import Expense from "../models/Expense";
import { AuthenticatedRequest } from "../types/express";
import { Types } from "mongoose";
import { validateAndCreateDateFilter } from "../utils/dateFilter";

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

    // Validate date filter query parameters
    const { startDate, endDate } = req.query;
    const dateFilterResult = validateAndCreateDateFilter(
      startDate as string,
      endDate as string
    );

    if (!dateFilterResult.isValid) {
      return res.status(400).json({ message: dateFilterResult.error });
    }

    const userObjectId = new Types.ObjectId(String(userId));

    // Build match conditions
    const baseMatch = { userId: userObjectId };
    const incomeMatch = dateFilterResult.dateFilter
      ? { ...baseMatch, date: dateFilterResult.dateFilter }
      : baseMatch;
    const expenseMatch = dateFilterResult.dateFilter
      ? { ...baseMatch, date: dateFilterResult.dateFilter }
      : baseMatch;

    // Fetch total income & expenses
    const totalIncome = await Income.aggregate([
      { $match: incomeMatch },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    console.log("totalIncome", {
      totalIncome,
      userId,
      isValidObjectId: Types.ObjectId.isValid(userId),
    });

    const totalExpense = await Expense.aggregate([
      { $match: expenseMatch },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // Get income transactions (filtered by date range if provided, otherwise last 60 days)
    const incomeDateFilter = dateFilterResult.dateFilter
      ? dateFilterResult.dateFilter
      : { $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) };

    const last60DaysIncomeTransactions = await Income.find({
      userId: userObjectId,
      date: incomeDateFilter,
    }).sort({ date: -1 });

    // Get total income for filtered period
    const incomeLast60Days = last60DaysIncomeTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    // Get expense transactions (filtered by date range if provided, otherwise last 30 days)
    const expenseDateFilter = dateFilterResult.dateFilter
      ? dateFilterResult.dateFilter
      : { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };

    const last30DaysExpenseTransactions = await Expense.find({
      userId: userObjectId,
      date: expenseDateFilter,
    }).sort({ date: -1 });

    // Get total expenses for filtered period
    const expensesLast30Days = last30DaysExpenseTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    // Fetch last 5 transactions (income + expenses) - apply date filter if provided
    const incomeQuery = Income.find(incomeMatch).sort({ date: -1 }).limit(5);
    const expenseQuery = Expense.find(expenseMatch).sort({ date: -1 }).limit(5);

    const lastTransactions = [
      ...(await incomeQuery).map((txn) => ({
        ...txn.toObject(),
        type: "income" as const,
      })),
      ...(await expenseQuery).map((txn) => ({
        ...txn.toObject(),
        type: "expense" as const,
      })),
    ].sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0)); // Sort latest first

    // Final Response
    return res.status(200).json({
      totalBalance:
        (totalIncome[0]?.total || 0) - (totalExpense[0]?.total || 0),
      totalIncome: totalIncome[0]?.total || 0,
      totalExpenses: totalExpense[0]?.total || 0,
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
