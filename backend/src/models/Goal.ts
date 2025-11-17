import mongoose, { Document, Schema } from "mongoose";

export type GoalStatus = "SUCCESS" | "FAIL" | "IN_PROGRESS";

export interface IGoal extends Document {
  walletId: mongoose.Schema.Types.ObjectId;
  targetAmount: number;
  targetDate: Date;
  status: GoalStatus;
  createdAt: Date;
  updatedAt: Date;
}

const GoalSchema = new Schema<IGoal>(
  {
    walletId: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
    },
    targetAmount: { type: Number, required: true, min: 0 },
    targetDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["SUCCESS", "FAIL", "IN_PROGRESS"],
      default: "IN_PROGRESS",
      required: true,
    },
  },
  { timestamps: true }
);

GoalSchema.index({ walletId: 1, status: 1 });
GoalSchema.index({ walletId: 1, targetDate: -1 });

const Goal = mongoose.model<IGoal>("Goal", GoalSchema);
export default Goal;
