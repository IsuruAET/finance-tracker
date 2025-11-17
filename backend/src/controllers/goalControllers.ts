import { Response } from "express";
import Goal, { GoalStatus } from "../models/Goal";
import Wallet from "../models/Wallet";
import { AuthenticatedRequest } from "../types/express";

// Get All Goals for a Wallet
export const getGoalsByWallet = async (
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

    const goals = await Goal.find({ walletId })
      .populate("walletId", "name type balance")
      .sort({ targetDate: -1 });

    // Calculate progress for each goal
    const goalsWithProgress = goals.map((goal) => {
      const progress = (wallet.balance / goal.targetAmount) * 100;
      const daysRemaining = Math.ceil(
        (goal.targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      // Update status based on current conditions
      let status = goal.status;
      if (wallet.balance >= goal.targetAmount && daysRemaining >= 0) {
        status = "SUCCESS";
      } else if (daysRemaining < 0 && wallet.balance < goal.targetAmount) {
        status = "FAIL";
      } else {
        status = "IN_PROGRESS";
      }

      // Update status in DB if changed
      if (status !== goal.status) {
        goal.status = status;
        goal.save();
      }

      return {
        ...goal.toObject(),
        progress: Math.min(100, Math.max(0, progress)),
        daysRemaining,
      };
    });

    return res.status(200).json(goalsWithProgress);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res
        .status(500)
        .json({
          message: "Error getting goals",
          error: error.message,
        });
    }
    return res.status(500).json({ message: "Unknown error occurred" });
  }
};

// Get All Goals for User (all wallets)
export const getAllGoals = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const userId = req.user?._id;

  try {
    // Get all user's wallets
    const wallets = await Wallet.find({ userId });
    const walletIds = wallets.map((w) => w._id);

    const goals = await Goal.find({ walletId: { $in: walletIds } })
      .populate("walletId", "name type balance")
      .sort({ targetDate: -1 });

    // Calculate progress for each goal
    const goalsWithProgress = await Promise.all(
      goals.map(async (goal) => {
        const wallet = await Wallet.findById(goal.walletId);
        if (!wallet) return null;

        const progress = (wallet.balance / goal.targetAmount) * 100;
        const daysRemaining = Math.ceil(
          (goal.targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );

        // Update status based on current conditions
        let status = goal.status;
        if (wallet.balance >= goal.targetAmount && daysRemaining >= 0) {
          status = "SUCCESS";
        } else if (daysRemaining < 0 && wallet.balance < goal.targetAmount) {
          status = "FAIL";
        } else {
          status = "IN_PROGRESS";
        }

        // Update status in DB if changed
        if (status !== goal.status) {
          goal.status = status;
          await goal.save();
        }

        return {
          ...goal.toObject(),
          progress: Math.min(100, Math.max(0, progress)),
          daysRemaining,
        };
      })
    );

    return res.status(200).json(goalsWithProgress.filter(Boolean));
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res
        .status(500)
        .json({
          message: "Error getting goals",
          error: error.message,
        });
    }
    return res.status(500).json({ message: "Unknown error occurred" });
  }
};

// Add Goal
export const addGoal = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const userId = req.user?._id;

  try {
    const { walletId, targetAmount, targetDate } = req.body || {};

    if (!walletId || !targetAmount || !targetDate) {
      return res.status(400).json({
        message: "Wallet ID, target amount, and target date are required",
      });
    }

    if (targetAmount <= 0) {
      return res.status(400).json({
        message: "Target amount must be greater than 0",
      });
    }

    // Verify wallet exists and belongs to user
    const wallet = await Wallet.findOne({ _id: walletId, userId });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    const targetDateObj = new Date(targetDate);
    if (targetDateObj <= new Date()) {
      return res.status(400).json({
        message: "Target date must be in the future",
      });
    }

    // Determine initial status
    const daysRemaining = Math.ceil(
      (targetDateObj.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    let status: GoalStatus = "IN_PROGRESS";
    if (wallet.balance >= targetAmount && daysRemaining >= 0) {
      status = "SUCCESS";
    } else if (daysRemaining < 0 && wallet.balance < targetAmount) {
      status = "FAIL";
    }

    const newGoal = new Goal({
      walletId,
      targetAmount,
      targetDate: targetDateObj,
      status,
    });

    await newGoal.save();

    const goalWithProgress = {
      ...newGoal.toObject(),
      progress: Math.min(100, Math.max(0, (wallet.balance / targetAmount) * 100)),
      daysRemaining,
    };

    return res.status(201).json(goalWithProgress);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res
        .status(500)
        .json({
          message: "Error adding goal",
          error: error.message,
        });
    }
    return res.status(500).json({ message: "Unknown error occurred" });
  }
};

// Update Goal
export const updateGoal = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const userId = req.user?._id;

  try {
    const goal = await Goal.findById(req.params.id)
      .populate("walletId");

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    // Verify wallet belongs to user
    const wallet = await Wallet.findOne({
      _id: (goal.walletId as any)._id,
      userId,
    });
    if (!wallet) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { targetAmount, targetDate, status } = req.body || {};

    if (targetAmount !== undefined) {
      if (targetAmount <= 0) {
        return res.status(400).json({
          message: "Target amount must be greater than 0",
        });
      }
      goal.targetAmount = targetAmount;
    }

    if (targetDate !== undefined) {
      const targetDateObj = new Date(targetDate);
      goal.targetDate = targetDateObj;
    }

    if (status !== undefined && ["SUCCESS", "FAIL", "IN_PROGRESS"].includes(status)) {
      goal.status = status as GoalStatus;
    } else {
      // Auto-update status based on current conditions
      const daysRemaining = Math.ceil(
        (goal.targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      if (wallet.balance >= goal.targetAmount && daysRemaining >= 0) {
        goal.status = "SUCCESS";
      } else if (daysRemaining < 0 && wallet.balance < goal.targetAmount) {
        goal.status = "FAIL";
      } else {
        goal.status = "IN_PROGRESS";
      }
    }

    await goal.save();

    const daysRemaining = Math.ceil(
      (goal.targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    const goalWithProgress = {
      ...goal.toObject(),
      progress: Math.min(100, Math.max(0, (wallet.balance / goal.targetAmount) * 100)),
      daysRemaining,
    };

    return res.status(200).json(goalWithProgress);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res
        .status(500)
        .json({
          message: "Error updating goal",
          error: error.message,
        });
    }
    return res.status(500).json({ message: "Unknown error occurred" });
  }
};

// Delete Goal
export const deleteGoal = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const userId = req.user?._id;

  try {
    const goal = await Goal.findById(req.params.id)
      .populate("walletId");

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    // Verify wallet belongs to user
    const wallet = await Wallet.findOne({
      _id: (goal.walletId as any)._id,
      userId,
    });
    if (!wallet) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Goal.findByIdAndDelete(req.params.id);

    return res.status(200).json({ message: "Goal deleted successfully" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res
        .status(500)
        .json({
          message: "Error deleting goal",
          error: error.message,
        });
    }
    return res.status(500).json({ message: "Unknown error occurred" });
  }
};

// Get Goal by ID
export const getGoalById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const userId = req.user?._id;

  try {
    const goal = await Goal.findById(req.params.id)
      .populate("walletId", "name type balance");

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    // Verify wallet belongs to user
    const wallet = await Wallet.findOne({
      _id: (goal.walletId as any)._id,
      userId,
    });
    if (!wallet) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const daysRemaining = Math.ceil(
      (goal.targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    const goalWithProgress = {
      ...goal.toObject(),
      progress: Math.min(100, Math.max(0, (wallet.balance / goal.targetAmount) * 100)),
      daysRemaining,
    };

    return res.status(200).json(goalWithProgress);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res
        .status(500)
        .json({
          message: "Error getting goal",
          error: error.message,
        });
    }
    return res.status(500).json({ message: "Unknown error occurred" });
  }
};

