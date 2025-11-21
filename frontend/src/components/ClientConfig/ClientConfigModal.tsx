import { useState, useEffect } from "react";
import { DateTime } from "luxon";
import Select from "../Inputs/Select";
import Input from "../Inputs/Input";
import { useClientConfig } from "../../context/ClientConfigContext";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { categorizeWallets } from "../../utils/helper";
import toast from "react-hot-toast";

interface Wallet {
  _id: string;
  name: string;
  type: "CASH" | "BANK" | "CARD" | "OTHER";
  balance: number;
  icon?: string;
  initializedAt?: string;
}

interface ClientConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ClientConfigModal = ({ isOpen, onClose }: ClientConfigModalProps) => {
  const { config, updateConfig } = useClientConfig();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [defaultWalletId, setDefaultWalletId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchWallets = async () => {
        try {
          const response = await axiosInstance.get<Wallet[]>(
            API_PATHS.WALLET.GET_ALL
          );
          setWallets(response.data);
        } catch (error) {
          console.error("Error fetching wallets", error);
          toast.error("Failed to load wallets");
        }
      };
      fetchWallets();
    }
  }, [isOpen]);

  useEffect(() => {
    if (config && isOpen) {
      setDefaultWalletId(config.defaultWalletId || "");
    }
  }, [config, isOpen]);

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateConfig(defaultWalletId || null);
      onClose();
    } catch {
      // Error is already handled in updateConfig
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "N/A";
    const date = DateTime.fromISO(dateString);
    if (!date.isValid) return "N/A";
    return date.toFormat("MMM dd, yyyy");
  };

  if (!isOpen) return null;

  const walletGroups = categorizeWallets(wallets);
  // Add "None" option to allow clearing selection
  const walletGroupsWithNone = [
    {
      label: "",
      options: [{ value: "", label: "None (No default)" }],
    },
    ...walletGroups,
  ];
  const earliestWalletDate = config?.earliestWalletDate || null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center items-center w-full h-screen bg-black/50 dark:bg-black/75 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative p-4 w-full max-w-2xl max-h-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-bg-primary rounded-lg shadow-sm transition-colors">
          <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-border transition-colors">
            <h3 className="text-lg font-medium text-text-primary transition-colors">
              Client Configuration
            </h3>
            <button
              type="button"
              className="text-text-secondary bg-transparent hover:bg-hover hover:text-text-primary rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center cursor-pointer transition-colors"
              onClick={onClose}
            >
              <svg
                className="w-3 h-3"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
                aria-hidden="true"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M1 1L13 13M13 1L1 13"
                />
              </svg>
            </button>
          </div>

          <div className="p-4 md:p-5 space-y-4">
            <div className="space-y-4">
              <Select
                value={defaultWalletId}
                onChange={(e) => setDefaultWalletId(e.target.value)}
                label="Main Wallet (Optional)"
                placeholder="Select main wallet"
                groups={walletGroupsWithNone}
              />
              <p className="text-xs text-text-secondary -mt-2">
                This wallet will be used as default for both income and expense
                transactions
              </p>

              <Input
                value={formatDate(earliestWalletDate)}
                onChange={() => {}}
                label="First Wallet Initial Date"
                placeholder="N/A"
                type="text"
                required={false}
                disabled={true}
              />
              <p className="text-xs text-text-secondary mt-1">
                Date pickers will only allow dates on or after this date
              </p>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-text-primary bg-bg-secondary hover:bg-hover rounded-lg transition-colors"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientConfigModal;
