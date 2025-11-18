import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useCallback, useEffect, useState, useRef } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

import { LuHandCoins, LuWalletMinimal, LuWallet } from "react-icons/lu";
import { IoMdCard } from "react-icons/io";
import { addThousandsSeparator } from "../../utils/helper";
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
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <InfoCard
            icon={<IoMdCard />}
            label="Broad Forward Balance"
            value={addThousandsSeparator(
              dashboardData?.broadForwardBalanceLastMonth || 0
            )}
            desc="Last Month"
            color="bg-blue-500"
          />

          <InfoCard
            icon={<RiWallet3Fill />}
            label="Total New Savings"
            value={addThousandsSeparator(
              dashboardData?.thisMonthNewSavings || 0
            )}
            desc="This Month"
            color="bg-orange-500"
          />

          <InfoCard
            icon={<LuWalletMinimal />}
            label="Total Income"
            value={addThousandsSeparator(
              dashboardData?.thisMonthTotalIncome || 0
            )}
            desc="This Month"
            color="bg-green-500"
          />

          <InfoCard
            icon={<LuHandCoins />}
            label="Total Expenses"
            value={addThousandsSeparator(
              dashboardData?.thisMonthTotalExpenses || 0
            )}
            desc="This Month"
            color="bg-red-500"
          />

          <InfoCard
            icon={<LuWallet />}
            label="Total Balance"
            value={addThousandsSeparator(
              dashboardData?.thisMonthTotalBalance || 0
            )}
            desc="This Month"
            color="bg-primary"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <RecentTransactions
            transactions={dashboardData?.recentTransactions}
            onSeeMore={() => navigate("/expense")}
          />

          <FinanceOverview
            totalBalance={dashboardData?.thisMonthTotalBalance || 0}
            totalIncome={dashboardData?.thisMonthTotalIncome || 0}
            totalExpense={dashboardData?.thisMonthTotalExpenses || 0}
          />

          <ExpenseTransactions
            transactions={dashboardData?.last30DaysExpenses?.transactions || []}
            onSeeMore={() => navigate("/expense")}
          />

          <Last30DaysExpenses
            Transactions={dashboardData?.last30DaysExpenses?.transactions || []}
          />

          <RecentIncomeWithChart
            data={
              dashboardData?.last60DaysIncome?.transactions?.slice(0, 4) || []
            }
            totalIncome={dashboardData?.thisMonthTotalIncome || 0}
          />

          <RecentIncome
            transactions={dashboardData?.last60DaysIncome?.transactions || []}
            onSeeMore={() => navigate("/income")}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Home;
