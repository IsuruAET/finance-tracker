import { Response } from "express";
import Goal from "../models/Goal";
import Wallet from "../models/Wallet";
import Transaction from "../models/Transaction";
import { AuthenticatedRequest } from "../types/express";
import { Types } from "mongoose";

// Get Monthly Goal for a Wallet
export const getMonthlyGoalByWallet = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const userId = req.user?._id;

  try {
    const { walletId } = req.query;

    if (!walletId) {
      return res.status(400).json({ message: "Wallet ID is required" });
    }

    // Verify wallet belongs to user
    const wallet = await Wallet.findOne({ _id: walletId, userId });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    // Find monthly goal for this wallet (applies to all months)
    const goal = await Goal.findOne({
      walletId,
    }).populate("walletId", "name type balance");

    if (!goal) {
      return res.status(200).json(null);
    }

    // Calculate cumulative target amount
    const cumulativeTarget = goal.targets.reduce(
      (sum, target) => sum + target.amount,
      0
    );

    // Calculate average (middle point)
    const averageTarget = cumulativeTarget / goal.targets.length;

    return res.status(200).json({
      ...goal.toObject(),
      cumulativeTarget,
      averageTarget,
      currentBalance: wallet.balance,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res
        .status(500)
        .json({
          message: "Error getting monthly goal",
          error: error.message,
        });
    }
    return res.status(500).json({ message: "Unknown error occurred" });
  }
};

// Add or Update Monthly Goal
export const upsertMonthlyGoal = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const userId = req.user?._id;

  try {
    const { walletId, targets } = req.body || {};

    if (!walletId || !targets || !Array.isArray(targets)) {
      return res.status(400).json({
        message: "Wallet ID and targets array are required",
      });
    }

    // Verify wallet exists and belongs to user
    const wallet = await Wallet.findOne({ _id: walletId, userId });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    // Validate targets
    if (targets.length === 0) {
      return res.status(400).json({
        message: "At least one target is required",
      });
    }

    for (const target of targets) {
      if (!target.amount || target.amount <= 0) {
        return res.status(400).json({
          message: "All targets must have a positive amount",
        });
      }
    }

    // Calculate cumulative target
    const cumulativeTarget = targets.reduce(
      (sum: number, target: any) => sum + target.amount,
      0
    );

    // Find existing monthly goal (one per wallet, applies to all months)
    let goal = await Goal.findOne({
      walletId,
    });

    const averageTarget = cumulativeTarget / targets.length;

    if (goal) {
      // Update existing goal
      goal.targets = targets;
      goal.targetAmount = cumulativeTarget;
      await goal.save();
    } else {
      // Create new goal
      goal = new Goal({
        walletId,
        targets,
        targetAmount: cumulativeTarget,
      });
      await goal.save();
    }

    return res.status(200).json({
      ...goal.toObject(),
      cumulativeTarget,
      averageTarget,
      currentBalance: wallet.balance,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res
        .status(500)
        .json({
          message: "Error saving monthly goal",
          error: error.message,
        });
    }
    return res.status(500).json({ message: "Unknown error occurred" });
  }
};

// Delete Monthly Goal
export const deleteMonthlyGoal = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const userId = req.user?._id;

  try {
    const { walletId } = req.query;

    if (!walletId) {
      return res.status(400).json({ message: "Wallet ID is required" });
    }

    // Verify wallet belongs to user
    const wallet = await Wallet.findOne({ _id: walletId, userId });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    const goal = await Goal.findOne({
      walletId,
    });

    if (!goal) {
      return res.status(404).json({ message: "Monthly goal not found" });
    }

    await Goal.findByIdAndDelete(goal._id);

    return res.status(200).json({ message: "Monthly goal deleted successfully" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res
        .status(500)
        .json({
          message: "Error deleting monthly goal",
          error: error.message,
        });
    }
    return res.status(500).json({ message: "Unknown error occurred" });
  }
};

// Get All Monthly Goals for Dashboard
export const getAllMonthlyGoals = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const userId = req.user?._id;

  try {
    // Get all user's wallets
    const wallets = await Wallet.find({ userId });
    const walletIds = wallets.map((w) => w._id);

    // Find all monthly goals (one per wallet, applies to all months)
    const goals = await Goal.find({
      walletId: { $in: walletIds },
    })
      .populate("walletId", "name type balance")
      .sort({ createdAt: -1 });

    // Calculate metrics for each goal
    const goalsWithMetrics = await Promise.all(
      goals.map(async (goal) => {
        const wallet = await Wallet.findById(goal.walletId);
        if (!wallet) return null;

        const cumulativeTarget = goal.targets.reduce(
          (sum, target) => sum + target.amount,
          0
        );
        const averageTarget = cumulativeTarget / goal.targets.length;

        return {
          ...goal.toObject(),
          cumulativeTarget,
          averageTarget,
          currentBalance: wallet.balance,
        };
      })
    );

    return res.status(200).json(goalsWithMetrics.filter(Boolean));
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res
        .status(500)
        .json({
          message: "Error getting monthly goals",
          error: error.message,
        });
    }
    return res.status(500).json({ message: "Unknown error occurred" });
  }
};

// Get Wallet Metrics for Target Meter
export const getWalletMetrics = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const userId = req.user?._id;
  const userObjectId = new Types.ObjectId(String(userId));

  try {
    const { walletId, month, year } = req.query;

    if (!walletId) {
      return res.status(400).json({ message: "Wallet ID is required" });
    }

    // Verify wallet belongs to user
    const wallet = await Wallet.findOne({ _id: walletId, userId });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    // Parse month and year (default to current month if not provided)
    let referenceDate = new Date();
    if (month && year) {
      const parsedMonth = Number(month);
      const parsedYear = Number(year);
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

    // First day of selected month
    const firstDayOfCurrentMonth = new Date(currentYear, currentMonth, 1);
    // First day of next month (end of selected month)
    const firstDayOfNextMonth = new Date(currentYear, currentMonth + 1, 1);
    // End of last month (for opening balance calculation)
    const endOfLastMonth = new Date(
      currentYear,
      currentMonth,
      0,
      23,
      59,
      59,
      999
    );

    const walletObjectId = new Types.ObjectId(String(walletId));

    // Calculate opening balance (all transactions up to end of last month)
    const openingBalanceIncome = await Transaction.aggregate([
      {
        $match: {
          userId: userObjectId,
          walletId: walletObjectId,
          type: { $in: ["INCOME", "INITIAL_BALANCE"] },
          date: { $lte: endOfLastMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const openingBalanceExpense = await Transaction.aggregate([
      {
        $match: {
          userId: userObjectId,
          walletId: walletObjectId,
          type: "EXPENSE",
          date: { $lte: endOfLastMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const openingTransferIn = await Transaction.aggregate([
      {
        $match: {
          userId: userObjectId,
          toWalletId: walletObjectId,
          type: "TRANSFER",
          date: { $lte: endOfLastMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const openingTransferOut = await Transaction.aggregate([
      {
        $match: {
          userId: userObjectId,
          fromWalletId: walletObjectId,
          type: "TRANSFER",
          date: { $lte: endOfLastMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const openingBalance =
      (openingBalanceIncome[0]?.total || 0) -
      (openingBalanceExpense[0]?.total || 0) +
      (openingTransferIn[0]?.total || 0) -
      (openingTransferOut[0]?.total || 0);

    // Calculate metrics for selected month
    const monthIncome = await Transaction.aggregate([
      {
        $match: {
          userId: userObjectId,
          walletId: walletObjectId,
          type: "INCOME",
          date: { $gte: firstDayOfCurrentMonth, $lt: firstDayOfNextMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const monthInitialBalance = await Transaction.aggregate([
      {
        $match: {
          userId: userObjectId,
          walletId: walletObjectId,
          type: "INITIAL_BALANCE",
          date: { $gte: firstDayOfCurrentMonth, $lt: firstDayOfNextMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const monthExpense = await Transaction.aggregate([
      {
        $match: {
          userId: userObjectId,
          walletId: walletObjectId,
          type: "EXPENSE",
          date: { $gte: firstDayOfCurrentMonth, $lt: firstDayOfNextMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const monthTransferIn = await Transaction.aggregate([
      {
        $match: {
          userId: userObjectId,
          toWalletId: walletObjectId,
          type: "TRANSFER",
          date: { $gte: firstDayOfCurrentMonth, $lt: firstDayOfNextMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const monthTransferOut = await Transaction.aggregate([
      {
        $match: {
          userId: userObjectId,
          fromWalletId: walletObjectId,
          type: "TRANSFER",
          date: { $gte: firstDayOfCurrentMonth, $lt: firstDayOfNextMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // Calculate current balance
    const currentBalance =
      openingBalance +
      (monthIncome[0]?.total || 0) +
      (monthInitialBalance[0]?.total || 0) -
      (monthExpense[0]?.total || 0) +
      (monthTransferIn[0]?.total || 0) -
      (monthTransferOut[0]?.total || 0);

    return res.status(200).json({
      openingBalance,
      income: monthIncome[0]?.total || 0,
      initialBalance: monthInitialBalance[0]?.total || 0,
      expenses: monthExpense[0]?.total || 0,
      transferIn: monthTransferIn[0]?.total || 0,
      transferOut: monthTransferOut[0]?.total || 0,
      currentBalance,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({
        message: "Error getting wallet metrics",
        error: error.message,
      });
    }
    return res.status(500).json({ message: "Unknown error occurred" });
  }
};
