import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import connectDB from "../config/db";

// Connection states: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
const CONNECTION_STATES = {
  DISCONNECTED: 0,
  CONNECTED: 1,
  CONNECTING: 2,
  DISCONNECTING: 3,
} as const;

// Middleware to ensure database connection before handling requests
export const ensureDBConnection = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const readyState = mongoose.connection.readyState;
  
  // Check if already connected
  if (readyState === CONNECTION_STATES.CONNECTED) {
    return next();
  }

  // If connection is in progress, wait a bit and check again
  if (readyState === CONNECTION_STATES.CONNECTING) {
    // Wait up to 5 seconds for connection
    const maxWait = 5000;
    const startTime = Date.now();
    
    while (mongoose.connection.readyState === CONNECTION_STATES.CONNECTING && Date.now() - startTime < maxWait) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    
    // After waiting, check if connection succeeded (read fresh state)
    const finalState: number = mongoose.connection.readyState;
    if (finalState === CONNECTION_STATES.CONNECTED) {
      return next();
    }
  }

  // Try to connect
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection failed in middleware:", error);
    res.status(503).json({
      message: "Database connection unavailable. Please try again in a moment.",
    });
  }
};

