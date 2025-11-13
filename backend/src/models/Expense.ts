import mongoose, { Document, Schema } from "mongoose";

// Define the Expense interface
export interface IExpense extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  icon?: string;
  category: string; // Example: Food, Groceries etc.
  amount: number;
  date?: Date;
}

// Define schema
const ExpenseSchema = new Schema<IExpense>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    icon: { type: String },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Export model
const Expense = mongoose.model<IExpense>("Expense", ExpenseSchema);
export default Expense;
