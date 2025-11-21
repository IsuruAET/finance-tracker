import mongoose from "mongoose";

// Connection states: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
const CONNECTION_STATES = {
  DISCONNECTED: 0,
  CONNECTED: 1,
  CONNECTING: 2,
  DISCONNECTING: 3,
} as const;

let isConnected = false;
let eventHandlersSetup = false;

// Setup connection event handlers once
const setupEventHandlers = (): void => {
  if (eventHandlersSetup) return;

  mongoose.connection.on("error", (err) => {
    console.error("❌ MongoDB connection error:", err);
    isConnected = false;
  });

  mongoose.connection.on("disconnected", () => {
    console.log("⚠️ MongoDB disconnected");
    isConnected = false;
  });

  mongoose.connection.on("reconnected", () => {
    console.log("✅ MongoDB reconnected");
    isConnected = true;
  });

  eventHandlersSetup = true;
};

const connectDB = async (): Promise<void> => {
  // Setup event handlers first
  setupEventHandlers();

  // If already connected, reuse the connection
  if (
    isConnected &&
    mongoose.connection.readyState === CONNECTION_STATES.CONNECTED
  ) {
    return;
  }

  // If connection is in progress, wait for it
  if (mongoose.connection.readyState === CONNECTION_STATES.CONNECTING) {
    return;
  }

  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    const options = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };

    await mongoose.connect(mongoURI, options);

    isConnected = true;
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ Error connecting to MongoDB:", err);
    isConnected = false;
    // Don't exit process in production - let it retry
    if (process.env.NODE_ENV === "development") {
      process.exit(1);
    }
    throw err;
  }
};

export default connectDB;
