import { Response } from "express";
import Category, { CategoryType } from "../models/Category";
import { AuthenticatedRequest } from "../types/express";

// Get All Categories (default + user-specific)
export const getAllCategories = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const userId = req.user?._id;

  try {
    const { type } = req.query;

    const query: any = {};
    if (type && (type === "INCOME" || type === "EXPENSE")) {
      query.type = type;
    }

    // Get default categories
    const defaultCategories = await Category.find({
      ...query,
      isDefault: true,
    });

    // Get user-specific categories
    const userCategories = userId
      ? await Category.find({
          ...query,
          userId,
          isDefault: false,
        })
      : [];

    return res.status(200).json({
      default: defaultCategories,
      custom: userCategories,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res
        .status(500)
        .json({
          message: "Error getting categories",
          error: error.message,
        });
    }
    return res.status(500).json({ message: "Unknown error occurred" });
  }
};

// Add Custom Category
export const addCategory = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const userId = req.user?._id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const { name, type, icon } = req.body || {};

    if (!name || !type) {
      return res.status(400).json({
        message: "Name and type are required",
      });
    }

    if (type !== "INCOME" && type !== "EXPENSE") {
      return res.status(400).json({
        message: "Type must be INCOME or EXPENSE",
      });
    }

    // Check if category already exists for this user
    const existingCategory = await Category.findOne({
      userId,
      name: name.trim(),
      type,
      isDefault: false,
    });

    if (existingCategory) {
      return res.status(400).json({
        message: "Category with this name and type already exists",
      });
    }

    const newCategory = new Category({
      userId,
      name: name.trim(),
      type,
      icon: icon || "default-icon",
      isDefault: false,
    });

    await newCategory.save();

    return res.status(201).json(newCategory);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res
        .status(500)
        .json({
          message: "Error adding category",
          error: error.message,
        });
    }
    return res.status(500).json({ message: "Unknown error occurred" });
  }
};

// Update Category (only custom categories)
export const updateCategory = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const userId = req.user?._id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const category = await Category.findOne({
      _id: req.params.id,
      userId,
      isDefault: false,
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const { name, icon } = req.body || {};

    if (name !== undefined) {
      // Check if another category with same name and type exists
      const existingCategory = await Category.findOne({
        userId,
        name: name.trim(),
        type: category.type,
        isDefault: false,
        _id: { $ne: req.params.id },
      });

      if (existingCategory) {
        return res.status(400).json({
          message: "Category with this name and type already exists",
        });
      }

      category.name = name.trim();
    }

    if (icon !== undefined) {
      category.icon = icon;
    }

    await category.save();

    return res.status(200).json(category);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res
        .status(500)
        .json({
          message: "Error updating category",
          error: error.message,
        });
    }
    return res.status(500).json({ message: "Unknown error occurred" });
  }
};

// Delete Category (only custom categories)
export const deleteCategory = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const userId = req.user?._id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const category = await Category.findOne({
      _id: req.params.id,
      userId,
      isDefault: false,
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // TODO: Check if category is used in transactions before deleting
    // For now, we'll allow deletion

    await Category.findByIdAndDelete(req.params.id);

    return res.status(200).json({ message: "Category deleted successfully" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res
        .status(500)
        .json({
          message: "Error deleting category",
          error: error.message,
        });
    }
    return res.status(500).json({ message: "Unknown error occurred" });
  }
};

// Get Category by ID
export const getCategoryById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const userId = req.user?._id;

  try {
    const category = await Category.findOne({
      _id: req.params.id,
      $or: [{ isDefault: true }, { userId }],
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.status(200).json(category);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res
        .status(500)
        .json({
          message: "Error getting category",
          error: error.message,
        });
    }
    return res.status(500).json({ message: "Unknown error occurred" });
  }
};

