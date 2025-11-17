import { useState, useEffect } from "react";
import Input from "../Inputs/Input";
import Select from "../Inputs/Select";
import EmojiPickerPopup from "../Inputs/EmojiPickerPopup";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

export interface IncomeData {
  source: string;
  amount: number;
  date: string;
  icon: string;
  walletId: string;
}

interface Wallet {
  _id: string;
  name: string;
  type: "cash" | "card";
  balance: number;
  icon?: string;
  createdDate?: string;
}

interface AddIncomeFormProps {
  onAddIncome: (income: IncomeData) => void;
}

const AddIncomeForm = ({ onAddIncome }: AddIncomeFormProps) => {
  const [income, setIncome] = useState<IncomeData>({
    source: "",
    amount: 0,
    date: "",
    icon: "",
    walletId: "",
  });
  const [wallets, setWallets] = useState<Wallet[]>([]);

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const response = await axiosInstance.get<Wallet[]>(
          API_PATHS.WALLET.GET_ALL
        );
        setWallets(response.data);
        if (response.data.length > 0 && !income.walletId) {
          setIncome((prev) => ({ ...prev, walletId: response.data[0]._id }));
        }
      } catch (error) {
        console.error("Error fetching wallets", error);
      }
    };
    fetchWallets();
  }, []);

  const handleChange = (key: keyof IncomeData, value: string) => {
    setIncome((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div>
      <EmojiPickerPopup
        icon={income.icon}
        onSelect={(selectedIcon: string) => handleChange("icon", selectedIcon)}
      />

      <Input
        value={income.source}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          handleChange("source", e.target.value)
        }
        label="Income Source"
        placeholder="Freelance, Salary, etc"
        type="text"
      />

      <Input
        value={String(income.amount)}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          handleChange("amount", e.target.value)
        }
        label="Amount"
        placeholder=""
        type="number"
      />

      <Select
        value={income.walletId}
        onChange={(e) => handleChange("walletId", e.target.value)}
        label="Add to Wallet"
        placeholder="Select a wallet"
        options={wallets.map((wallet) => ({
          value: wallet._id,
          label: `${wallet.name} (Balance: ${wallet.balance.toFixed(2)})`,
          icon: wallet.icon,
        }))}
        required
      />

      <Input
        value={income.date}
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
          onClick={() => onAddIncome(income)}
        >
          Add Income
        </button>
      </div>
    </div>
  );
};

export default AddIncomeForm;
