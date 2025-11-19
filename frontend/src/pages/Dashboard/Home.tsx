import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useCallback, useEffect, useState, useRef } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

import { LuHandCoins, LuWalletMinimal, LuWallet } from "react-icons/lu";
import { IoMdCard } from "react-icons/io";
import { addThousandsSeparator, getCurrentMonthYear } from "../../utils/helper";
import InfoCard from "../../components/Cards/InfoCard";
import RecentTransactions from "../../components/Dashboard/RecentTransactions";
import FinanceOverview from "../../components/Dashboard/FinanceOverview";
import ExpenseTransactions from "../../components/Dashboard/ExpenseTransactions";
import Last30DaysExpenses from "../../components/Dashboard/Last30DaysExpenses";
import RecentIncomeWithChart from "../../components/Dashboard/RecentIncomeWithChart";
import type { DashboardDataResponse } from "../../types/dashboard";
import RecentIncome from "../../components/Dashboard/RecentIncome";
import { RiWallet3Fill } from "react-icons/ri";

const Home = () => {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] =
    useState<DashboardDataResponse | null>(null);
  const loadingRef = useRef(false);

  const fetchDashboardData = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      const response = await axiosInstance.get(
        API_PATHS.DASHBOARD.GET_DASHBOARD_DATA
      );
      if (response.data) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error("Something went wrong. Please try again", error);
    } finally {
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Listen for wallet initialization to refetch dashboard data
  useEffect(() => {
    const handleWalletsInitialized = () => {
      fetchDashboardData();
    };

    window.addEventListener("walletsInitialized", handleWalletsInitialized);
    return () => {
      window.removeEventListener(
        "walletsInitialized",
        handleWalletsInitialized
      );
    };
  }, [fetchDashboardData]);

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="my-5 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-6">
          <InfoCard
            icon={<IoMdCard />}
            label="Opening Balance"
            value={addThousandsSeparator(
              dashboardData?.broadForwardBalanceLastMonth || 0
            )}
            desc={getCurrentMonthYear()}
            color="bg-blue-500"
          />

          {(dashboardData?.thisMonthNewSavings ?? 0) > 0 && (
            <InfoCard
              icon={<RiWallet3Fill />}
              label="External Initial Deposit"
              value={addThousandsSeparator(
                dashboardData?.thisMonthNewSavings ?? 0
              )}
              desc={getCurrentMonthYear()}
              color="bg-orange-500"
            />
          )}

          <InfoCard
            icon={<LuWalletMinimal />}
            label="Total Income"
            value={addThousandsSeparator(
              dashboardData?.thisMonthTotalIncome || 0
            )}
            desc={getCurrentMonthYear()}
            color="bg-green-500"
          />

          <InfoCard
            icon={<LuHandCoins />}
            label="Total Expenses"
            value={addThousandsSeparator(
              dashboardData?.thisMonthTotalExpenses || 0
            )}
            desc={getCurrentMonthYear()}
            color="bg-red-500"
          />

          <InfoCard
            icon={<LuWallet />}
            label="Closing Balance"
            value={addThousandsSeparator(
              dashboardData?.thisMonthTotalBalance || 0
            )}
            desc={getCurrentMonthYear()}
            color="bg-primary"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <RecentTransactions
            transactions={dashboardData?.recentTransactions}
            onSeeMore={() => navigate("/expense")}
          />

          <FinanceOverview
            broadForwardBalance={
              dashboardData?.broadForwardBalanceLastMonth || 0
            }
            savings={dashboardData?.thisMonthNewSavings || 0}
            income={dashboardData?.thisMonthTotalIncome || 0}
            expenses={dashboardData?.thisMonthTotalExpenses || 0}
            totalBalance={dashboardData?.thisMonthTotalBalance || 0}
          />

          <RecentIncome
            transactions={dashboardData?.last60DaysIncome?.transactions || []}
            onSeeMore={() => navigate("/income")}
          />

          <RecentIncomeWithChart
            data={
              dashboardData?.last60DaysIncome?.transactions?.slice(0, 4) || []
            }
            totalIncome={dashboardData?.thisMonthTotalIncome || 0}
          />

          <ExpenseTransactions
            transactions={dashboardData?.last30DaysExpenses?.transactions || []}
            onSeeMore={() => navigate("/expense")}
          />

          <Last30DaysExpenses
            Transactions={dashboardData?.last30DaysExpenses?.transactions || []}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Home;
