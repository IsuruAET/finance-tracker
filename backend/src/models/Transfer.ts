import mongoose, { Document, Schema } from "mongoose";

// Define the Transfer interface
export interface ITransfer extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  fromWalletId: mongoose.Schema.Types.ObjectId;
  toWalletId: mongoose.Schema.Types.ObjectId;
  amount: number;
  date?: Date;
  note?: string;
}

// Define schema
const TransferSchema = new Schema<ITransfer>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fromWalletId: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
    },
    toWalletId: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
    },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    note: { type: String },
  },
  { timestamps: true }
);

// Export model
const Transfer = mongoose.model<ITransfer>("Transfer", TransferSchema);
export default Transfer;
