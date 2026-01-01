import { useEffect, useState, useCallback, useRef } from "react";
import { formatCurrency } from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { LuList } from "react-icons/lu";
import Modal from "../Modal";

interface WalletMetricsResponse {
  openingBalance: number;
  income: number;
  initialBalance: number;
  expenses: number;
  transferIn: number;
  transferOut: number;
  currentBalance: number;
}

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

interface TargetMeterProps {
  walletId: string;
  walletName: string;
  averageTarget: number;
  cumulativeTarget: number;
  selectedMonth: { month: number; year: number } | null;
}

const TargetMeter = ({
  walletId,
  walletName,
  cumulativeTarget,
  selectedMonth,
}: TargetMeterProps) => {
  const [currentBalance, setCurrentBalance] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [showTargetsModal, setShowTargetsModal] = useState(false);
  const [targets, setTargets] = useState<Target[]>([]);
  const [fetchingTargets, setFetchingTargets] = useState(false);
  const loadingRef = useRef(false);

  // Fetch wallet metrics from backend
  const fetchWalletMetrics = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setShouldAnimate(false);

    try {
      const monthToUse = selectedMonth || (() => {
        const now = new Date();
        return { month: now.getMonth() + 1, year: now.getFullYear() };
      })();

      const response = await axiosInstance.get<WalletMetricsResponse>(
        API_PATHS.GOALS.WALLET_METRICS,
        {
          params: {
            walletId,
            month: monthToUse.month,
            year: monthToUse.year,
          },
        }
      );

      setCurrentBalance(response.data.currentBalance);
      setExpenses(response.data.expenses);
      
      // Trigger animation after a brief delay to ensure DOM is ready
      setTimeout(() => {
        setShouldAnimate(true);
      }, 100);
    } catch (error) {
      console.error("Error fetching wallet metrics", error);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [walletId, selectedMonth]);

  useEffect(() => {
    fetchWalletMetrics();
  }, [fetchWalletMetrics]);

  // Fetch monthly targets when modal opens
  const fetchMonthlyTargets = useCallback(async () => {
    if (!showTargetsModal) return;
    
    setFetchingTargets(true);
    try {
      const response = await axiosInstance.get<MonthlyGoal | null>(
        API_PATHS.GOALS.MONTHLY.GET_BY_WALLET,
        {
          params: { walletId },
        }
      );

      if (response.data && response.data.targets) {
        setTargets(response.data.targets);
      } else {
        setTargets([]);
      }
    } catch (error) {
      console.error("Error fetching monthly targets", error);
      setTargets([]);
    } finally {
      setFetchingTargets(false);
    }
  }, [walletId, showTargetsModal]);

  useEffect(() => {
    fetchMonthlyTargets();
  }, [fetchMonthlyTargets]);

  // Calculate total (current balance + expenses)
  const totalValue = currentBalance + expenses;
  
  // Calculate the position of total value relative to cumulative target
  // Cumulative target must be at 50% (middle), so maxDisplay = cumulativeTarget * 2
  // This ensures the cumulative target is visually centered
  const minDisplay = 0;
  const maxDisplay = cumulativeTarget > 0 
    ? Math.max(cumulativeTarget * 2, totalValue, 1) // Minimum 1 to avoid division by zero
    : Math.max(totalValue, 1);

  // Calculate percentage positions
  // Cumulative target is always at 50% (middle)
  const cumulativeTargetPosition = 50; // Always at middle (50%)
  const range = maxDisplay - minDisplay;
  const totalPosition = range > 0 ? ((totalValue - minDisplay) / range) * 100 : 0;
  const balancePosition = range > 0 && totalValue > 0 ? ((currentBalance / totalValue) * totalPosition) : 0;
  const expensesPosition = range > 0 && totalValue > 0 ? ((expenses / totalValue) * totalPosition) : 0;

  // Determine color based on total (balance + expenses) vs cumulative target
  const isOnTrack = cumulativeTarget > 0 ? totalValue >= cumulativeTarget : false;
  const balanceColor = isOnTrack ? "text-green-600" : "text-red-600";
  const expensesColor = isOnTrack ? "text-green-400" : "text-red-400";
  
  // Two shades of green or red
  const balanceMeterColor = isOnTrack ? "bg-green-600" : "bg-red-600";
  const expensesMeterColor = isOnTrack ? "bg-green-400" : "bg-red-400";

  const cumulativeTargetFromList = targets.reduce((sum, target) => sum + (target.amount || 0), 0);

  return (
    <>
      <div className="card">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <h5 className="text-lg font-medium text-text-primary">{walletName}</h5>
            <button
              onClick={() => setShowTargetsModal(true)}
              className="p-1.5 text-text-secondary hover:text-primary rounded transition-colors"
              title="View Monthly Targets"
            >
              <LuList className="h-5 w-5 cursor-pointer" />
            </button>
          </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Current Balance</span>
            <span className={`text-sm font-semibold ${balanceColor}`}>
              {formatCurrency(currentBalance)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Expenses</span>
            <span className={`text-sm font-semibold ${expensesColor}`}>
              {formatCurrency(expenses)}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-border">
            <span className="text-sm font-medium text-text-primary">Total (Balance + Expenses)</span>
            <span className={`text-lg font-semibold ${isOnTrack ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(totalValue)}
            </span>
          </div>
        </div>
      </div>

      {/* Meter Visualization */}
      <div className="relative">
        {/* Background bar */}
        <div className="h-8 bg-bg-secondary rounded-lg overflow-hidden relative">
          {/* Cumulative target marker (middle) */}
          {cumulativeTarget > 0 && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-primary z-10"
              style={{ left: `${cumulativeTargetPosition}%` }}
            >
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                <span className="text-xs font-medium text-primary">
                  Target: {formatCurrency(cumulativeTarget)}
                </span>
              </div>
            </div>
          )}

          {/* Current balance fill (darker shade) */}
          {currentBalance > 0 && (
            <div
              className={`h-full ${balanceMeterColor} absolute left-0 top-0`}
              style={{
                width: shouldAnimate ? `${Math.min(100, Math.max(0, balancePosition))}%` : "0%",
                transition: shouldAnimate
                  ? "width 1s cubic-bezier(0.4, 0, 0.2, 1) 0s"
                  : "none",
              }}
            />
          )}

          {/* Expenses fill (lighter shade, stacked next to balance) */}
          {expenses > 0 && (
            <div
              className={`h-full ${expensesMeterColor} absolute left-0 top-0`}
              style={{
                width: shouldAnimate ? `${Math.min(100, Math.max(0, expensesPosition))}%` : "0%",
                left: shouldAnimate ? `${Math.min(100, Math.max(0, balancePosition))}%` : "0%",
                transition: shouldAnimate
                  ? "width 1s cubic-bezier(0.4, 0, 0.2, 1) 0.2s, left 1s cubic-bezier(0.4, 0, 0.2, 1) 0.2s"
                  : "none",
              }}
            />
          )}

          {/* Total value indicator */}
          {totalValue > 0 && (
            <div
              className="absolute top-0 bottom-0 w-1 bg-text-primary z-20 transform -translate-x-1/2 transition-all duration-1000 ease-out"
              style={{
                left: shouldAnimate ? `${Math.min(100, Math.max(0, totalPosition))}%` : "0%",
                transitionDelay: shouldAnimate ? "0.4s" : "0s",
              }}
            >
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                <span className={`text-xs font-semibold ${isOnTrack ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(totalValue)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Scale labels */}
        <div className="relative mt-8 text-xs text-text-secondary">
          <div className="flex justify-between">
            <span>{formatCurrency(minDisplay)}</span>
            {cumulativeTarget > 0 && (
              <span className="absolute left-1/2 transform -translate-x-1/2 text-primary font-medium">
                {formatCurrency(cumulativeTarget)}
              </span>
            )}
            <span>{formatCurrency(maxDisplay)}</span>
          </div>
        </div>
      </div>

      {/* Status indicator */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${isOnTrack ? "bg-green-600" : "bg-red-600"}`}
          />
          <span className="text-sm text-text-secondary">
            {isOnTrack ? "Total Above Target" : "Total Below Target"}
          </span>
        </div>
        <div className="text-sm text-text-secondary">
          {isOnTrack ? "✓ On Track" : "⚠ Needs Attention"}
        </div>
      </div>
      {loading && (
        <div className="mt-2 text-xs text-text-secondary text-center">Calculating...</div>
      )}
      </div>

      {/* Monthly Targets View Modal */}
      <Modal 
        isOpen={showTargetsModal} 
        onClose={() => setShowTargetsModal(false)}
        title={`Monthly Targets - ${walletName}`}
      >
        <div>
          <p className="text-sm text-text-secondary mb-4">
            View all monthly targets for this wallet
          </p>

          {fetchingTargets ? (
            <div className="text-center py-8">
              <p className="text-text-secondary">Loading targets...</p>
            </div>
          ) : targets.length === 0 ? (
            <div className="text-center py-8 bg-bg-secondary rounded-lg">
              <p className="text-text-secondary">No monthly targets set for this wallet</p>
            </div>
          ) : (
            <>
              <div className="space-y-2 max-h-[400px] overflow-y-auto mb-4">
                {targets.map((target, index) => (
                  <div
                    key={target._id || index}
                    className="p-4 bg-bg-secondary rounded-lg border border-border"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold text-text-primary">
                            {formatCurrency(target.amount)}
                          </span>
                        </div>
                        {target.description && (
                          <p className="text-sm text-text-secondary mt-1">
                            {target.description}
                          </p>
                        )}
                        {!target.description && (
                          <p className="text-xs text-text-secondary mt-1 italic">
                            No description
                          </p>
                        )}
                      </div>
                      <div className="text-xs text-text-secondary bg-primary/10 dark:bg-primary/20 px-2 py-1 rounded">
                        #{index + 1}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {cumulativeTargetFromList > 0 && (
                <div className="mb-4 p-4 bg-primary/10 dark:bg-primary/20 rounded-lg border border-primary/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-text-primary">
                      Cumulative Target:
                    </span>
                    <span className="text-xl font-semibold text-primary">
                      {formatCurrency(cumulativeTargetFromList)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-medium text-text-primary">
                      Average Target:
                    </span>
                    <span className="text-lg font-semibold text-primary">
                      {formatCurrency(cumulativeTargetFromList / targets.length)}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  className="add-btn add-btn-fill"
                  onClick={() => setShowTargetsModal(false)}
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
};

export default TargetMeter;

