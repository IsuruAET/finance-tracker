import { Response } from "express";
import Wallet from "../models/Wallet";
import Transfer from "../models/Transfer";
import Income from "../models/Income";
import Expense from "../models/Expense";
import { AuthenticatedRequest } from "../types/express";

// Initialize wallets (cash in hand + cards)
export const initializeWallets = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const userId = req.user?._id;

  try {
    const { cashInHand, cards } = req.body || {};

    // Check if user already has wallets
    const existingWallets = await Wallet.find({ userId });
    if (existingWallets.length > 0) {
      return res.status(400).json({
        message: "Wallets already initialized. Use update endpoint to modify.",
      });
    }

    const wallets = [];

    // Create cash in hand wallet
    if (cashInHand !== undefined && cashInHand >= 0) {
      const cashWallet = new Wallet({
        userId,
        name: "Cash In Hand",
        type: "cash",
        balance: cashInHand,
        icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4b5.png",
      });
      await cashWallet.save();
      wallets.push(cashWallet);
    }

    // Create card wallets
    if (cards && Array.isArray(cards)) {
      for (const card of cards) {
        if (card.name && card.balance !== undefined && card.balance >= 0) {
          const cardWallet = new Wallet({
            userId,
            name: card.name,
            type: "card",
            balance: card.balance || 0,
            icon: card.icon || "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4b3.png",
          });
          await cardWallet.save();
          wallets.push(cardWallet);
        }
      }
    }

    return res.status(201).json({ wallets });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res
        .status(500)
        .json({ message: "Error initializing wallets", error: error.message });
    }
    return res.status(500).json({ message: "Unknown error occurred" });
  }
};

// Get all wallets
export const getAllWallets = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const userId = req.user?._id;

  try {
    const wallets = await Wallet.find({ userId }).sort({
      type: 1,
      createdAt: 1,
    });
    return res.status(200).json(wallets);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res
        .status(500)
        .json({ message: "Error getting wallets", error: error.message });
    }
    return res.status(500).json({ message: "Unknown error occurred" });
  }
};

// Add new wallet
export const addWallet = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const userId = req.user?._id;

  try {
    const { name, type, balance, icon } = req.body || {};

    if (!name || !type || balance === undefined) {
      return res
        .status(400)
        .json({ message: "Name, type, and balance are required" });
    }

    if (!["cash", "card"].includes(type)) {
      return res.status(400).json({ message: "Type must be 'cash' or 'card'" });
    }

    const wallet = new Wallet({
      userId,
      name,
      type,
      balance: balance || 0,
      icon: icon || (type === "cash" 
        ? "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4b5.png" 
        : "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4b3.png"),
    });

    await wallet.save();
    return res.status(201).json(wallet);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res
        .status(500)
        .json({ message: "Error adding wallet", error: error.message });
    }
    return res.status(500).json({ message: "Unknown error occurred" });
  }
};

// Transfer between wallets
export const transferBetweenWallets = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const userId = req.user?._id;

  try {
    const { fromWalletId, toWalletId, amount, date, note } = req.body || {};

    if (!fromWalletId || !toWalletId || !amount) {
      return res.status(400).json({
        message: "From wallet, to wallet, and amount are required",
      });
    }

    if (fromWalletId === toWalletId) {
      return res
        .status(400)
        .json({ message: "Cannot transfer to the same wallet" });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    // Get wallets
    const fromWallet = await Wallet.findOne({ _id: fromWalletId, userId });
    const toWallet = await Wallet.findOne({ _id: toWalletId, userId });

    if (!fromWallet || !toWallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    if (fromWallet.balance < amount) {
      return res
        .status(400)
        .json({ message: "Insufficient balance in source wallet" });
    }

    // Update balances
    fromWallet.balance -= amount;
    toWallet.balance += amount;

    await fromWallet.save();
    await toWallet.save();

    // Create transfer record
    const transfer = new Transfer({
      userId,
      fromWalletId,
      toWalletId,
      amount,
      date: date ? new Date(date) : new Date(),
      note,
    });

    await transfer.save();

    return res.status(201).json({
      transfer,
      fromWallet,
      toWallet,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res
        .status(500)
        .json({ message: "Error transferring", error: error.message });
    }
    return res.status(500).json({ message: "Unknown error occurred" });
  }
};

// Get transfer history
export const getTransfers = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const userId = req.user?._id;

  try {
    const transfers = await Transfer.find({ userId })
      .populate("fromWalletId", "name type icon")
      .populate("toWalletId", "name type icon")
      .sort({ date: -1 });

    return res.status(200).json(transfers);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res
        .status(500)
        .json({ message: "Error getting transfers", error: error.message });
    }
    return res.status(500).json({ message: "Unknown error occurred" });
  }
};

// Delete wallet
export const deleteWallet = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const userId = req.user?._id;

  try {
    const walletId = req.params.id;

    // Find wallet and verify it belongs to user
    const wallet = await Wallet.findOne({ _id: walletId, userId });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    // Prevent deletion if this is the last wallet
    const walletCount = await Wallet.countDocuments({ userId });
    if (walletCount === 1) {
      return res.status(400).json({
        message: "Cannot delete the last remaining wallet",
      });
    }

    // Check for associated transactions
    const [incomeCount, expenseCount, transferFromCount, transferToCount] =
      await Promise.all([
        Income.countDocuments({ walletId }),
        Expense.countDocuments({ walletId }),
        Transfer.countDocuments({ fromWalletId: walletId }),
        Transfer.countDocuments({ toWalletId: walletId }),
      ]);

    const hasTransactions =
      incomeCount > 0 ||
      expenseCount > 0 ||
      transferFromCount > 0 ||
      transferToCount > 0;

    // Allow deletion if:
    // 1. No associated transactions, OR
    // 2. Has transactions but balance is 0
    if (hasTransactions && wallet.balance !== 0) {
      return res.status(400).json({
        message:
          "Cannot delete wallet with transactions and non-zero balance. Please transfer or remove all funds first.",
      });
    }

    // Delete the wallet
    await Wallet.findByIdAndDelete(walletId);

    return res.status(200).json({ message: "Wallet deleted successfully" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res
        .status(500)
        .json({ message: "Error deleting wallet", error: error.message });
    }
    return res.status(500).json({ message: "Unknown error occurred" });
  }
};
