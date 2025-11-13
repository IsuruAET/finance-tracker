import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import User from "../models/User";
import { AuthenticatedRequest } from "../types/express";

const JWT_SECRET = process.env.JWT_SECRET as string;

// Generate JWT token
const generateToken = (id: string): string => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: "1h" });
};

// Register User
export const registerUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { fullName, email, password, profileImageUrl } = req.body || {};

  // Validation: Check for missing fields
  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Create the user
    const user = await User.create({
      fullName,
      email,
      password,
      profileImageUrl,
    });

    // Remove password from user object
    const { password: rPassword, ...userWithoutPassword } = user.toObject();

    return res.status(201).json({
      id: user._id,
      user: userWithoutPassword,
      token: generateToken(String(user._id)),
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res
        .status(500)
        .json({ message: "Error registering user", error: error.message });
    }
    return res.status(500).json({ message: "Unknown error occurred" });
  }
};

// Login User
export const loginUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    // Remove password from user object
    const { password: rPassword, ...userWithoutPassword } = user.toObject();

    return res.status(200).json({
      id: user._id,
      user: userWithoutPassword,
      token: generateToken(String(user._id)),
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res
        .status(500)
        .json({ message: "Error login user", error: error.message });
    }
    return res.status(500).json({ message: "Unknown error occurred" });
  }
};

// Get User Information
export const getUserInfo = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const user = await User.findById(req.user?._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res
        .status(500)
        .json({ message: "Error fetching user info", error: error.message });
    }
    return res.status(500).json({ message: "Unknown error occurred" });
  }
};

// Upload Image
export const uploadImage = (req: Request, res: Response): Response => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const file = req.file as Express.MulterS3.File; // cast to multer-s3 file

  return res.status(200).json({
    imageUrl: file.location,
  });
};
