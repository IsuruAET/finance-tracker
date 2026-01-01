import { useState, useEffect, useCallback } from "react";
import Input from "../Inputs/Input";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import axios from "axios";
import { LuPlus, LuTrash2, LuPencil } from "react-icons/lu";
import { formatCurrency } from "../../utils/helper";

interface Target {
  _id?: string;
  amount: number;
  description?: string;
}

interface MonthlyGoal {
  _id: string;
  walletId: string;
  targets: Target[];
  cumulativeTarget: number;
  averageTarget: number;
  currentBalance: number;
}

interface MonthlyGoalModalProps {
  walletId: string;
  walletName: string;
  onClose: () => void;
  onSaveComplete: () => void;
}

const MonthlyGoalModal = ({
  walletId,
  walletName,
  onClose,
  onSaveComplete,
}: MonthlyGoalModalProps) => {
  const [targets, setTargets] = useState<Target[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [hasExistingGoal, setHasExistingGoal] = useState(false);

  const fetchMonthlyGoal = useCallback(async () => {
    setFetching(true);
    try {
      const response = await axiosInstance.get<MonthlyGoal | null>(
        API_PATHS.GOALS.MONTHLY.GET_BY_WALLET,
        {
          params: { walletId },
        }
      );

      if (response.data && response.data.targets) {
        setTargets(response.data.targets);
        setHasExistingGoal(true);
      } else {
        setTargets([]);
        setHasExistingGoal(false);
      }
    } catch (error) {
      console.error("Error fetching monthly goal", error);
      setTargets([]);
    } finally {
      setFetching(false);
    }
  }, [walletId]);

  useEffect(() => {
    fetchMonthlyGoal();
    return () => {
      setTargets([]);
      setEditingIndex(null);
    };
  }, [fetchMonthlyGoal]);

  const addTarget = () => {
    setTargets([...targets, { amount: 0, description: "" }]);
    setEditingIndex(targets.length);
  };

  const updateTarget = (index: number, field: keyof Target, value: string | number) => {
    const updated = [...targets];
    updated[index] = { ...updated[index], [field]: value };
    setTargets(updated);
  };

  const removeTarget = (index: number) => {
    setTargets(targets.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
    } else if (editingIndex !== null && editingIndex > index) {
      setEditingIndex(editingIndex - 1);
    }
  };

  const deleteAllTargets = async () => {
    if (targets.length === 0) return;

    if (!confirm("Are you sure you want to delete all targets?")) {
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.delete(API_PATHS.GOALS.MONTHLY.DELETE, {
        params: { walletId },
      });

      toast.success("Monthly goal deleted successfully");
      setTargets([]);
      onSaveComplete();
      onClose();
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to delete monthly goal"
        : "Failed to delete monthly goal";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (loading) return; // Prevent double submission

    // Validate targets
    const validTargets = targets.filter((t) => t.amount > 0);
    
    // If no valid targets, delete the goal if it exists
    if (validTargets.length === 0) {
      if (hasExistingGoal) {
        setLoading(true);
        try {
          await axiosInstance.delete(API_PATHS.GOALS.MONTHLY.DELETE, {
            params: { walletId },
          });
          toast.success("Monthly goal deleted successfully");
          onSaveComplete();
          onClose();
        } catch (error: unknown) {
          const message = axios.isAxiosError(error)
            ? error.response?.data?.message || "Failed to delete monthly goal"
            : "Failed to delete monthly goal";
          toast.error(message);
        } finally {
          setLoading(false);
        }
      } else {
        toast.error("Please add at least one target with amount greater than 0");
      }
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post(API_PATHS.GOALS.MONTHLY.UPSERT, {
        walletId,
        targets: validTargets.map((target) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { _id, ...rest } = target;
          return rest;
        }),
      });

      toast.success("Monthly goal saved successfully");
      onSaveComplete();
      onClose();
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to save monthly goal"
        : "Failed to save monthly goal";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const cumulativeTarget = targets.reduce((sum, target) => sum + (target.amount || 0), 0);
  const validTargetsCount = targets.filter((t) => t.amount > 0).length;
  // Allow save if there are valid targets OR if there's an existing goal (to delete it)
  const canSave = validTargetsCount > 0 || hasExistingGoal;

  return (
    <div>
      <div className="mb-4">
        <h4 className="text-base font-medium text-text-primary mb-2">
          Monthly Goal for {walletName}
        </h4>
        <p className="text-sm text-text-secondary">
          Add multiple targets to track your monthly savings goal
        </p>
      </div>

      {fetching ? (
        <div className="text-center py-8">
          <p className="text-text-secondary">Loading...</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 max-h-[400px] overflow-y-auto mb-4">
            {targets.length === 0 ? (
              <div className="text-center py-8 bg-bg-secondary rounded-lg">
                <p className="text-text-secondary">No targets added yet</p>
                <p className="text-xs text-text-secondary mt-1">
                  Click "Add Target" to get started
                </p>
              </div>
            ) : (
              targets.map((target, index) => (
                <div
                  key={index}
                  className="p-3 bg-bg-secondary rounded-lg border border-border"
                >
                  {editingIndex === index ? (
                    <div className="space-y-2">
                      <Input
                        type="number"
                        label="Amount"
                        value={target.amount.toString()}
                        onChange={(e) =>
                          updateTarget(index, "amount", parseFloat(e.target.value) || 0)
                        }
                        placeholder="Enter amount"
                      />
                      <Input
                        type="text"
                        label="Description (optional)"
                        value={target.description || ""}
                        onChange={(e) => updateTarget(index, "description", e.target.value)}
                        placeholder="e.g., Emergency fund, Vacation"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="add-btn add-btn-fill text-sm"
                          onClick={() => setEditingIndex(null)}
                        >
                          Done
                        </button>
                        <button
                          type="button"
                          className="add-btn text-sm"
                          onClick={() => removeTarget(index)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-text-primary">
                            {formatCurrency(target.amount)}
                          </span>
                        </div>
                        {target.description && (
                          <p className="text-sm text-text-secondary mt-1">
                            {target.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingIndex(index)}
                          className="p-1.5 text-text-secondary hover:text-primary rounded transition-colors"
                          title="Edit"
                        >
                          <LuPencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeTarget(index)}
                          className="p-1.5 text-red-500 hover:text-red-600 rounded transition-colors"
                          title="Remove"
                        >
                          <LuTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {targets.length > 0 && (
            <div className="mb-4 p-3 bg-primary/10 dark:bg-primary/20 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-primary">
                  Cumulative Target:
                </span>
                <span className="text-lg font-semibold text-primary">
                  {formatCurrency(cumulativeTarget)}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              className="add-btn"
              onClick={addTarget}
              disabled={loading}
            >
              <LuPlus className="h-4 w-4" />
              Add Target
            </button>
            {targets.length > 0 && (
              <button
                type="button"
                className="add-btn text-red-500 hover:text-red-600 border-red-500/50 hover:border-red-600"
                onClick={deleteAllTargets}
                disabled={loading}
              >
                <LuTrash2 className="h-4 w-4" />
                Delete All
              </button>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              className="add-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="add-btn add-btn-fill"
              onClick={handleSave}
              disabled={loading || !canSave}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MonthlyGoalModal;

