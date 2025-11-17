import { useState, useEffect } from "react";
import Input from "../Inputs/Input";
import Select from "../Inputs/Select";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";

interface AddWalletFormProps {
  walletType: "cash" | "card";
  onAddComplete: () => void;
}

const AddWalletForm = ({ walletType, onAddComplete }: AddWalletFormProps) => {
  const [name, setName] = useState("");
  const [type, setType] = useState<"cash" | "card">(walletType);
  const [balance, setBalance] = useState<string>("0");
  const [createdDate, setCreatedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    setType(walletType);
    setName("");
    setBalance("0");
    setCreatedDate(new Date().toISOString().split("T")[0]);
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
        type === "cash"
          ? "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4b5.png"
          : "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4b3.png";

      await axiosInstance.post(API_PATHS.WALLET.ADD, {
        name,
        type,
        balance: balanceNum,
        icon: defaultIcon,
        createdDate: createdDate || new Date().toISOString().split("T")[0],
      });

      toast.success("Wallet added successfully!");
      setName("");
      setBalance("0");
      setCreatedDate(new Date().toISOString().split("T")[0]);
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
        onChange={(e) => setType(e.target.value as "cash" | "card")}
        label="Wallet Type"
        placeholder="Select wallet type"
        options={[
          {
            value: "cash",
            label: "Cash",
            icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4b5.png",
          },
          {
            value: "card",
            label: "Card",
            icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4b3.png",
          },
        ]}
        required
      />

      <Input
        value={balance}
        onChange={(e) => setBalance(e.target.value)}
        label="Initial Balance"
        placeholder="0"
        type="number"
      />

      <Input
        value={createdDate}
        onChange={(e) => setCreatedDate(e.target.value)}
        label="Created Date"
        placeholder=""
        type="date"
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
