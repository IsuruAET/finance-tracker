import mongoose, { Document, Schema } from "mongoose";

export type WalletType = "CASH" | "BANK" | "CARD" | "OTHER";

export interface IWallet extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  name: string;
  type: WalletType;
  balance: number;
  initializedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema = new Schema<IWallet>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["CASH", "BANK", "CARD", "OTHER"],
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
      required: true,
    },
    initializedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  { timestamps: true }
);

const Wallet = mongoose.model<IWallet>("Wallet", WalletSchema);
export default Wallet;
