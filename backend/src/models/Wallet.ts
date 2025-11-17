import mongoose, { Document, Schema } from "mongoose";

// Define the Wallet interface
export interface IWallet extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  name: string; // "Cash In Hand", "Card 1", "Card 2", etc.
  type: "cash" | "card";
  balance: number;
  icon?: string;
  createdDate: Date;
}

// Define schema
const WalletSchema = new Schema<IWallet>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    type: { type: String, enum: ["cash", "card"], required: true },
    balance: { type: Number, default: 0, required: true },
    icon: { type: String },
    createdDate: { type: Date, default: Date.now, required: true },
  },
  { timestamps: true }
);

// Export model
const Wallet = mongoose.model<IWallet>("Wallet", WalletSchema);
export default Wallet;
