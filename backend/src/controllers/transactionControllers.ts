import { Response } from "express";
import Transaction, { TransactionType } from "../models/Transaction";
import Wallet from "../models/Wallet";
import Category from "../models/Category";
import { AuthenticatedRequest } from "../types/express";
import ExcelJS from "exceljs";
import { validateAndCreateDateFilter } from "../utils/dateFilter";

// Add Transaction
export const addTransaction = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const userId = req.user?._id;

  try {
    const {
      type,
      amount,
      walletId,
      fromWalletId,
      toWalletId,
      categoryId,
      desc,
      date,
    } = req.body || {};

    // Validation
    if (!type || !amount || !date) {
      return res.status(400).json({
        message: "Type, amount, and date are required",
      });
    }

    if (!["INCOME", "EXPENSE", "TRANSFER", "INITIAL_BALANCE"].includes(type)) {
      return res.status(400).json({
        message: "Invalid transaction type",
      });
    }

    // Validate transaction type specific requirements
    if (type === "EXPENSE" || type === "INCOME" || type === "INITIAL_BALANCE") {
      if (!walletId) {
        return res.status(400).json({
          message: "Wallet ID is required for this transaction type",
        });
      }

      // Verify wallet exists and belongs to user
      const wallet = await Wallet.findOne({ _id: walletId, userId });
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }

      // Check sufficient balance for expenses
      if (type === "EXPENSE" && wallet.balance < amount) {
        return res
          .status(400)
          .json({ message: "Insufficient balance in selected wallet" });
      }

      // Verify category exists and matches transaction type
      if (categoryId) {
        const category = await Category.findById(categoryId);
        if (!category) {
          return res.status(404).json({ message: "Category not found" });
        }
        if (
          (type === "INCOME" && category.type !== "INCOME") ||
          (type === "EXPENSE" && category.type !== "EXPENSE")
        ) {
          return res.status(400).json({
            message: "Category type does not match transaction type",
          });
        }
      }

      // Update wallet balance
      if (type === "INCOME" || type === "INITIAL_BALANCE") {
        wallet.balance += amount;
      } else if (type === "EXPENSE") {
        wallet.balance -= amount;
      }
      await wallet.save();
    } else if (type === "TRANSFER") {
      if (!fromWalletId || !toWalletId) {
        return res.status(400).json({
          message: "From wallet and to wallet are required for transfers",
        });
      }

      if (fromWalletId === toWalletId) {
        return res
          .status(400)
          .json({ message: "Cannot transfer to the same wallet" });
      }

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

      fromWallet.balance -= amount;
      toWallet.balance += amount;
      await fromWallet.save();
      await toWallet.save();
    }

    const newTransaction = new Transaction({
      userId,
      type,
      amount,
      walletId: type === "TRANSFER" ? undefined : walletId,
      fromWalletId: type === "TRANSFER" ? fromWalletId : undefined,
      toWalletId: type === "TRANSFER" ? toWalletId : undefined,
      categoryId: type === "TRANSFER" ? undefined : categoryId,
      desc,
      date: new Date(date),
    });

    await newTransaction.save();

    return res.status(201).json(newTransaction);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res
        .status(500)
        .json({ message: "Error adding transaction", error: error.message });
    }
    return res.status(500).json({ message: "Unknown error occurred" });
  }
};

// Get All Transactions
export const getAllTransactions = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const userId = req.user?._id;

  try {
    const { startDate, endDate, type, walletId } = req.query;

    // Validate date filter
    const dateFilterResult = validateAndCreateDateFilter(
      startDate as string,
      endDate as string
    );

    if (!dateFilterResult.isValid) {
      return res.status(400).json({ message: dateFilterResult.error });
    }

    // Validate type filter
    if (
      type &&
      !["INCOME", "EXPENSE", "TRANSFER", "INITIAL_BALANCE"].includes(
        type as string
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid transaction type. Valid types are: INCOME, EXPENSE, TRANSFER, INITIAL_BALANCE",
      });
    }

    // Build query
    const query: any = { userId };
    if (dateFilterResult.dateFilter) {
      query.date = dateFilterResult.dateFilter;
    }
    if (type) {
      query.type = type;
    }
    if (walletId) {
      query.$or = [
        { walletId },
        { fromWalletId: walletId },
        { toWalletId: walletId },
      ];
    }

    const transactions = await Transaction.find(query)
      .populate("walletId", "name type balance")
      .populate("fromWalletId", "name type")
      .populate("toWalletId", "name type")
      .populate("categoryId", "name type icon")
      .sort({ date: -1, createdAt: -1 });

    return res.status(200).json(transactions);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({
        message: "Error getting transactions",
        error: error.message,
      });
    }
    return res.status(500).json({ message: "Unknown error occurred" });
  }
};

// Get Transaction by ID
export const getTransactionById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const userId = req.user?._id;

  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId,
    })
      .populate("walletId", "name type balance")
      .populate("fromWalletId", "name type")
      .populate("toWalletId", "name type")
      .populate("categoryId", "name type icon");

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    return res.status(200).json(transaction);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({
        message: "Error getting transaction",
        error: error.message,
      });
    }
    return res.status(500).json({ message: "Unknown error occurred" });
  }
};

// Update Transaction
export const updateTransaction = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const userId = req.user?._id;

  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const {
      type,
      amount,
      walletId,
      fromWalletId,
      toWalletId,
      categoryId,
      desc,
      date,
    } = req.body || {};

    // Revert old transaction's wallet balance changes
    if (
      transaction.type === "EXPENSE" ||
      transaction.type === "INCOME" ||
      transaction.type === "INITIAL_BALANCE"
    ) {
      const oldWallet = await Wallet.findById(transaction.walletId);
      if (oldWallet) {
        if (
          transaction.type === "INCOME" ||
          transaction.type === "INITIAL_BALANCE"
        ) {
          oldWallet.balance -= transaction.amount;
        } else if (transaction.type === "EXPENSE") {
          oldWallet.balance += transaction.amount;
        }
        await oldWallet.save();
      }
    } else if (transaction.type === "TRANSFER") {
      const oldFromWallet = await Wallet.findById(transaction.fromWalletId);
      const oldToWallet = await Wallet.findById(transaction.toWalletId);
      if (oldFromWallet && oldToWallet) {
        oldFromWallet.balance += transaction.amount;
        oldToWallet.balance -= transaction.amount;
        await oldFromWallet.save();
        await oldToWallet.save();
      }
    }

    // Apply new transaction changes
    const newType = type || transaction.type;
    const newAmount = amount !== undefined ? amount : transaction.amount;
    const newWalletId =
      walletId !== undefined ? walletId : transaction.walletId;
    const newFromWalletId =
      fromWalletId !== undefined ? fromWalletId : transaction.fromWalletId;
    const newToWalletId =
      toWalletId !== undefined ? toWalletId : transaction.toWalletId;

    if (
      newType === "EXPENSE" ||
      newType === "INCOME" ||
      newType === "INITIAL_BALANCE"
    ) {
      if (newWalletId) {
        const wallet = await Wallet.findOne({ _id: newWalletId, userId });
        if (!wallet) {
          return res.status(404).json({ message: "Wallet not found" });
        }

        if (newType === "EXPENSE" && wallet.balance < newAmount) {
          return res
            .status(400)
            .json({ message: "Insufficient balance in selected wallet" });
        }

        if (newType === "INCOME" || newType === "INITIAL_BALANCE") {
          wallet.balance += newAmount;
        } else if (newType === "EXPENSE") {
          wallet.balance -= newAmount;
        }
        await wallet.save();
      }
    } else if (newType === "TRANSFER") {
      if (newFromWalletId && newToWalletId) {
        if (newFromWalletId === newToWalletId) {
          return res
            .status(400)
            .json({ message: "Cannot transfer to the same wallet" });
        }

        const fromWallet = await Wallet.findOne({
          _id: newFromWalletId,
          userId,
        });
        const toWallet = await Wallet.findOne({ _id: newToWalletId, userId });

        if (!fromWallet || !toWallet) {
          return res.status(404).json({ message: "Wallet not found" });
        }

        if (fromWallet.balance < newAmount) {
          return res
            .status(400)
            .json({ message: "Insufficient balance in source wallet" });
        }

        fromWallet.balance -= newAmount;
        toWallet.balance += newAmount;
        await fromWallet.save();
        await toWallet.save();
      }
    }

    // Update transaction
    transaction.type = newType;
    transaction.amount = newAmount;
    if (newType === "TRANSFER") {
      delete transaction.walletId;
      transaction.fromWalletId = newFromWalletId;
      transaction.toWalletId = newToWalletId;
      delete transaction.categoryId;
    } else {
      transaction.walletId = newWalletId;
      delete transaction.fromWalletId;
      delete transaction.toWalletId;
      transaction.categoryId =
        categoryId !== undefined ? categoryId : transaction.categoryId;
    }
    if (desc !== undefined) transaction.desc = desc;
    if (date !== undefined) transaction.date = new Date(date);

    await transaction.save();

    return res.status(200).json(transaction);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({
        message: "Error updating transaction",
        error: error.message,
      });
    }
    return res.status(500).json({ message: "Unknown error occurred" });
  }
};

// Delete Transaction
export const deleteTransaction = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const userId = req.user?._id;

  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Revert wallet balance changes
    if (
      transaction.type === "EXPENSE" ||
      transaction.type === "INCOME" ||
      transaction.type === "INITIAL_BALANCE"
    ) {
      const wallet = await Wallet.findById(transaction.walletId);
      if (wallet) {
        if (
          transaction.type === "INCOME" ||
          transaction.type === "INITIAL_BALANCE"
        ) {
          wallet.balance -= transaction.amount;
        } else if (transaction.type === "EXPENSE") {
          wallet.balance += transaction.amount;
        }
        await wallet.save();
      }
    } else if (transaction.type === "TRANSFER") {
      const fromWallet = await Wallet.findById(transaction.fromWalletId);
      const toWallet = await Wallet.findById(transaction.toWalletId);
      if (fromWallet && toWallet) {
        fromWallet.balance += transaction.amount;
        toWallet.balance -= transaction.amount;
        await fromWallet.save();
        await toWallet.save();
      }
    }

    await Transaction.findByIdAndDelete(req.params.id);
    return res
      .status(200)
      .json({ message: "Transaction deleted successfully" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({
        message: "Error deleting transaction",
        error: error.message,
      });
    }
    return res.status(500).json({ message: "Unknown error occurred" });
  }
};

// Download Excel
export const downloadTransactionExcel = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?._id;

  try {
    const { startDate, endDate, type } = req.query;
    const dateFilterResult = validateAndCreateDateFilter(
      startDate as string,
      endDate as string
    );

    if (!dateFilterResult.isValid) {
      res.status(400).json({ message: dateFilterResult.error });
      return;
    }

    // Validate type filter
    if (
      type &&
      !["INCOME", "EXPENSE", "TRANSFER", "INITIAL_BALANCE"].includes(
        type as string
      )
    ) {
      res.status(400).json({
        message:
          "Invalid transaction type. Valid types are: INCOME, EXPENSE, TRANSFER, INITIAL_BALANCE",
      });
      return;
    }

    const query: any = { userId };
    if (dateFilterResult.dateFilter) {
      query.date = dateFilterResult.dateFilter;
    }
    if (type) {
      query.type = type;
    }

    const transactions = await Transaction.find(query)
      .populate("walletId", "name")
      .populate("fromWalletId", "name")
      .populate("toWalletId", "name")
      .populate("categoryId", "name")
      .sort({ date: -1, createdAt: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Transaction Details");

    worksheet.columns = [
      { header: "Type", key: "type", width: 15 },
      { header: "Amount", key: "amount", width: 15 },
      { header: "Wallet/From/To", key: "wallet", width: 25 },
      { header: "Category", key: "category", width: 20 },
      { header: "Description", key: "desc", width: 30 },
      { header: "Date", key: "date", width: 20 },
    ];

    transactions.forEach((item) => {
      let walletInfo = "";
      if (item.type === "TRANSFER") {
        walletInfo = `${(item.fromWalletId as any)?.name || ""} → ${
          (item.toWalletId as any)?.name || ""
        }`;
      } else {
        walletInfo = (item.walletId as any)?.name || "";
      }

      worksheet.addRow({
        type: item.type,
        amount: item.amount,
        wallet: walletInfo,
        category: (item.categoryId as any)?.name || "",
        desc: item.desc || "",
        date: item.date ? new Date(item.date).toLocaleDateString() : "",
      });
    });

    worksheet.getRow(1).font = { bold: true };

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="transaction_details.xlsx"'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error: unknown) {
    if (error instanceof Error) {
      res
        .status(500)
        .json({ message: "Error downloading Excel", error: error.message });
    } else {
      res.status(500).json({ message: "Unknown error occurred" });
    }
  }
};
