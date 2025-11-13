import { useState } from "react";
import Input from "../Inputs/Input";
import EmojiPickerPopup from "../Inputs/EmojiPickerPopup";

export interface ExpenseData {
  category: string;
  amount: number;
  date: string;
  icon: string;
}

interface AddExpenseFormProps {
  onAddExpense: (expense: ExpenseData) => void;
}

const AddExpenseForm = ({ onAddExpense }: AddExpenseFormProps) => {
  const [expense, setExpense] = useState<ExpenseData>({
    category: "",
    amount: 0,
    date: "",
    icon: "",
  });

  const handleChange = (key: keyof ExpenseData, value: string) => {
    setExpense((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div>
      <EmojiPickerPopup
        icon={expense.icon}
        onSelect={(selectedIcon: string) => handleChange("icon", selectedIcon)}
      />

      <Input
        value={expense.category}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          handleChange("category", e.target.value)
        }
        label="Expense Category"
        placeholder="Rent, Groceries, etc"
        type="text"
      />

      <Input
        value={String(expense.amount)}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          handleChange("amount", e.target.value)
        }
        label="Amount"
        placeholder=""
        type="number"
      />

      <Input
        value={expense.date}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          handleChange("date", e.target.value)
        }
        label="Date"
        placeholder=""
        type="date"
      />

      <div className="flex justify-end mt-6">
        <button
          type="button"
          className="add-btn add-btn-fill"
          onClick={() => onAddExpense(expense)}
        >
          Add Expense
        </button>
      </div>
    </div>
  );
};

export default AddExpenseForm;
