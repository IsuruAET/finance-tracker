import mongoose, { Document, Schema } from "mongoose";

export type TransactionType =
  | "INCOME"
  | "EXPENSE"
  | "TRANSFER"
  | "INITIAL_BALANCE";

export interface ITransaction extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  type: TransactionType;
  amount: number;
  walletId?: mongoose.Schema.Types.ObjectId;
  fromWalletId?: mongoose.Schema.Types.ObjectId;
  toWalletId?: mongoose.Schema.Types.ObjectId;
  categoryId?: mongoose.Schema.Types.ObjectId;
  desc?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["INCOME", "EXPENSE", "TRANSFER", "INITIAL_BALANCE"],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    walletId: { type: Schema.Types.ObjectId, ref: "Wallet" },
    fromWalletId: { type: Schema.Types.ObjectId, ref: "Wallet" },
    toWalletId: { type: Schema.Types.ObjectId, ref: "Wallet" },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category" },
    desc: { type: String },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

TransactionSchema.index({ userId: 1, type: 1, date: -1 });
TransactionSchema.index({ walletId: 1 });
TransactionSchema.index({ fromWalletId: 1 });
TransactionSchema.index({ toWalletId: 1 });

const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  TransactionSchema
);
export default Transaction;

