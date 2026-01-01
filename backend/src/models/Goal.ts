import mongoose, { Document, Schema } from "mongoose";

export interface ITarget {
  amount: number;
  description?: string;
}

export interface IGoal extends Document {
  walletId: mongoose.Schema.Types.ObjectId;
  targetAmount: number; // Cumulative target (sum of all targets)
  targets: ITarget[];
  createdAt: Date;
  updatedAt: Date;
}

const TargetSchema = new Schema<ITarget>(
  {
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, trim: true },
  },
  { _id: true }
);

const GoalSchema = new Schema<IGoal>(
  {
    walletId: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
    },
    targetAmount: { type: Number, required: true, min: 0 },
    targets: { type: [TargetSchema], required: true },
  },
  { timestamps: true }
);

GoalSchema.index({ walletId: 1 }, { unique: true });

const Goal = mongoose.model<IGoal>("Goal", GoalSchema);
export default Goal;
