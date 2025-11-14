import { Response } from "express";
import Income from "../models/Income";
import { AuthenticatedRequest } from "../types/express";
import ExcelJS from "exceljs";
import { validateAndCreateDateFilter } from "../utils/dateFilter";

// Add Income Source
export const addIncome = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const userId = req.user?._id;

  try {
    const { icon, source, amount, date } = req.body || {};

    // Validation: Check for missing fields
    if (!source || !amount || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newIncome = new Income({
      userId,
      icon,
      source,
      amount,
      date: new Date(date),
    });

    await newIncome.save();
    return res.status(201).json(newIncome);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res
        .status(500)
        .json({ message: "Error adding income", error: error.message });
    }
    return res.status(500).json({ message: "Unknown error occurred" });
  }
};

// Get All Income Source
export const getAllIncomes = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const userId = req.user?._id;

  try {
    // Validate date filter query parameters
    const { startDate, endDate } = req.query;
    const dateFilterResult = validateAndCreateDateFilter(
      startDate as string,
      endDate as string
    );

    if (!dateFilterResult.isValid) {
      return res.status(400).json({ message: dateFilterResult.error });
    }

    // Build query with date filter if provided
    const query: any = { userId };
    if (dateFilterResult.dateFilter) {
      query.date = dateFilterResult.dateFilter;
    }

    const income = await Income.find(query).sort({ date: -1 });

    return res.status(200).json(income);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res
        .status(500)
        .json({ message: "Error getting all income", error: error.message });
    }
    return res.status(500).json({ message: "Unknown error occurred" });
  }
};

// Delete Income Source
export const deleteIncome = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    await Income.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Income delete successfully" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res
        .status(500)
        .json({ message: "Error deleting income", error: error.message });
    }
    return res.status(500).json({ message: "Unknown error occurred" });
  }
};

// Download Excel
export const downloadIncomeExcel = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?._id;

  try {
    // Validate date filter query parameters
    const { startDate, endDate } = req.query;
    const dateFilterResult = validateAndCreateDateFilter(
      startDate as string,
      endDate as string
    );

    if (!dateFilterResult.isValid) {
      res.status(400).json({ message: dateFilterResult.error });
      return;
    }

    // Build query with date filter if provided
    const query: any = { userId };
    if (dateFilterResult.dateFilter) {
      query.date = dateFilterResult.dateFilter;
    }

    const income = await Income.find(query).sort({ date: -1 });

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Income Details");

    // Define columns
    worksheet.columns = [
      { header: "Source", key: "source", width: 25 },
      { header: "Amount", key: "amount", width: 15 },
      { header: "Date", key: "date", width: 20 },
    ];

    // Add rows
    income.forEach((item) => {
      worksheet.addRow({
        source: item.source,
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
      'attachment; filename="income_details.xlsx"'
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
