import { useState, useEffect } from "react";
import Input from "../Inputs/Input";
import Select from "../Inputs/Select";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";

interface AddWalletFormProps {
  walletType: "CASH" | "BANK" | "CARD" | "OTHER";
  onAddComplete: () => void;
}

const AddWalletForm = ({ walletType, onAddComplete }: AddWalletFormProps) => {
  const [name, setName] = useState("");
  const [type, setType] = useState<"CASH" | "BANK" | "CARD" | "OTHER">(
    walletType
  );
  const [balance, setBalance] = useState<string>("");

  useEffect(() => {
    setType(walletType);
    setName("");
    setBalance("");
  }, [walletType]);

  const handleSubmit = async () => {
    if (!name || !type) {
      toast.error("Name and type are required");
      return;
    }

    const balanceNum = Number(balance);
    if (isNaN(balanceNum) || balanceNum < 0) {
      toast.error("Balance must be a valid number");
      return;
    }

    try {
      const defaultIcon =
        type === "CASH"
          ? "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4b5.png"
          : "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4b3.png";

      await axiosInstance.post(API_PATHS.WALLET.ADD, {
        name,
        type,
        balance: balanceNum,
        icon: defaultIcon,
      });

      toast.success("Wallet added successfully!");
      setName("");
      setBalance("");
      onAddComplete();
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "response" in error
          ? (error.response as { data?: { message?: string } })?.data?.message
          : undefined;
      toast.error(errorMessage || "Failed to add wallet");
    }
  };

  return (
    <div>
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        label="Wallet Name"
        placeholder="e.g., My Cash, Credit Card"
        type="text"
      />

      <Select
        value={type}
        onChange={(e) =>
          setType(e.target.value as "CASH" | "BANK" | "CARD" | "OTHER")
        }
        label="Wallet Type"
        placeholder="Select wallet type"
        options={[
          {
            value: "CASH",
            label: "Cash",
            icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4b5.png",
          },
          {
            value: "BANK",
            label: "Bank",
            icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4b3.png",
          },
          {
            value: "CARD",
            label: "Card",
            icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4b3.png",
          },
          {
            value: "OTHER",
            label: "Other",
            icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4b3.png",
          },
        ]}
        required
      />

      <Input
        value={balance}
        onChange={(e) => setBalance(e.target.value)}
        label="Initial Balance"
        placeholder="Enter starting balance"
        type="number"
      />

      <div className="flex justify-end mt-6">
        <button
          type="button"
          className="add-btn add-btn-fill"
          onClick={handleSubmit}
        >
          Add Wallet
        </button>
      </div>
    </div>
  );
};

export default AddWalletForm;
