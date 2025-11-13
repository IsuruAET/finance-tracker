import { Response } from "express";
import Expense from "../models/Expense";
import { AuthenticatedRequest } from "../types/express";
import ExcelJS from "exceljs";

// Add Expense Category
export const addExpense = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const userId = req.user?._id;

  try {
    const { icon, category, amount, date } = req.body || {};

    // Validation: Check for missing fields
    if (!category || !amount || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newExpense = new Expense({
      userId,
      icon,
      category,
      amount,
      date: new Date(date),
    });

    await newExpense.save();
    return res.status(201).json(newExpense);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res
        .status(500)
        .json({ message: "Error adding expense", error: error.message });
    }
    return res.status(500).json({ message: "Unknown error occurred" });
  }
};

// Get All Expense categories
export const getAllExpenses = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const userId = req.user?._id;

  try {
    const expense = await Expense.find({ userId }).sort({ date: -1 });

    return res.status(200).json(expense);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res
        .status(500)
        .json({ message: "Error getting all expense", error: error.message });
    }
    return res.status(500).json({ message: "Unknown error occurred" });
  }
};

// Delete Expense Category
export const deleteExpense = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Expense delete successfully" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res
        .status(500)
        .json({ message: "Error deleting expense", error: error.message });
    }
    return res.status(500).json({ message: "Unknown error occurred" });
  }
};

// Download Excel
export const downloadExpenseExcel = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?._id;

  try {
    const expense = await Expense.find({ userId }).sort({ date: -1 });

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Expense Details");

    // Define columns
    worksheet.columns = [
      { header: "Category", key: "category", width: 25 },
      { header: "Amount", key: "amount", width: 15 },
      { header: "Date", key: "date", width: 20 },
    ];

    // Add rows
    expense.forEach((item) => {
      worksheet.addRow({
        category: item.category,
        amount: item.amount,
        date: item.date ? new Date(item.date).toLocaleDateString() : "",
      });
    });

    // Format header row
    worksheet.getRow(1).font = { bold: true };

    // Set response headers for download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="expense_details.xlsx"'
    );

    // Stream Excel file to response
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
