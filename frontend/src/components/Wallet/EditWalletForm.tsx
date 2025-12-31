import { useState, useEffect } from "react";
import Input from "../Inputs/Input";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import axios from "axios";

interface EditWalletFormProps {
  walletId: string;
  currentName: string;
  onUpdateComplete: () => void;
}

const EditWalletForm = ({
  walletId,
  currentName,
  onUpdateComplete,
}: EditWalletFormProps) => {
  const [name, setName] = useState(currentName);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setName(currentName);
  }, [currentName]);

  const handleSubmit = async () => {
    if (!name || name.trim().length === 0) {
      toast.error("Wallet name is required");
      return;
    }

    if (name.trim() === currentName) {
      toast.error("Wallet name unchanged");
      return;
    }

    setIsSubmitting(true);

    try {
      await axiosInstance.put(API_PATHS.WALLET.UPDATE_WALLET(walletId), {
        name: name.trim(),
      });

      toast.success("Wallet name updated successfully!");
      onUpdateComplete();
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to update wallet name"
        : "Failed to update wallet name";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
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

      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          className="add-btn"
          onClick={onUpdateComplete}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="button"
          className="add-btn add-btn-fill"
          onClick={handleSubmit}
          disabled={isSubmitting || name.trim() === currentName}
        >
          {isSubmitting ? "Updating..." : "Update"}
        </button>
      </div>
    </div>
  );
};

export default EditWalletForm;

