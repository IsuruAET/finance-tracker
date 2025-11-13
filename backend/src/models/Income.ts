import mongoose, { Document, Schema } from "mongoose";

// Define the Income interface
export interface IIncome extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  icon?: string;
  source: string; // Example: Salary, Freelance, etc.
  amount: number;
  date?: Date;
}

// Define schema
const IncomeSchema = new Schema<IIncome>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    icon: { type: String },
    source: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Export model
const Income = mongoose.model<IIncome>("Income", IncomeSchema);
export default Income;
