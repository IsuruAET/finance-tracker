import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useCallback, useEffect, useState, useRef } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

import { LuHandCoins, LuWalletMinimal, LuWallet } from "react-icons/lu";
import { IoMdCard } from "react-icons/io";
import InfoCard from "../../components/Cards/InfoCard";
import RecentTransactions from "../../components/Dashboard/RecentTransactions";
import FinanceOverview from "../../components/Dashboard/FinanceOverview";
import ExpenseTransactions from "../../components/Dashboard/ExpenseTransactions";
import Last30DaysExpenses from "../../components/Dashboard/Last30DaysExpenses";
// import RecentIncomeWithChart from "../../components/Dashboard/RecentIncomeWithChart";
import ClosingBalanceTrends from "../../components/Dashboard/ClosingBalanceTrends";
import type { DashboardDataResponse } from "../../types/dashboard";
import RecentIncome from "../../components/Dashboard/RecentIncome";
import { RiWallet3Fill } from "react-icons/ri";
import MonthYearPicker from "../../components/Inputs/MonthYearPicker";
import { useClientConfig } from "../../context/ClientConfigContext";
import { useMonthYearFilter } from "../../context/MonthYearFilterContext";
import { MdFilterList } from "react-icons/md";

const Home = () => {
  const navigate = useNavigate();
  const { config } = useClientConfig();
  const {
    selectedMonth,
    setSelectedMonth,
    getSelectedMonthLabel,
    getSelectedDateLabel,
  } = useMonthYearFilter();

  const [dashboardData, setDashboardData] =
    useState<DashboardDataResponse | null>(null);
  const loadingRef = useRef(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const accountStartMinDate = (() => {
    const iso =
      config?.earliestWalletDate || config?.walletInitializationDate || null;
    if (!iso) return null;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return null;
    return {
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    };
  })();

  const fetchDashboardData = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      const params: Record<string, number> = {};
      if (selectedMonth) {
        params.month = selectedMonth.month;
        params.year = selectedMonth.year;
      }

      const response = await axiosInstance.get(
        API_PATHS.DASHBOARD.GET_DASHBOARD_DATA,
        { params }
      );
      if (response.data) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error("Something went wrong. Please try again", error);
    } finally {
      loadingRef.current = false;
    }
  }, [selectedMonth]);

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

  // Listen for transaction added to refetch dashboard data
  useEffect(() => {
    const handleTransactionAdded = () => {
      fetchDashboardData();
    };

    window.addEventListener("transactionAdded", handleTransactionAdded);
    return () => {
      window.removeEventListener("transactionAdded", handleTransactionAdded);
    };
  }, [fetchDashboardData]);

  // Handle mobile filter toggle
  useEffect(() => {
    const handleToggleFilters = () => {
      setMobileFiltersOpen((prev) => !prev);
    };

    window.addEventListener("toggle-filters", handleToggleFilters);

    return () => {
      window.removeEventListener("toggle-filters", handleToggleFilters);
    };
  }, []);

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="my-5 mx-auto">
        <div
          className={`mb-3 sticky top-[56px] sm:top-[64px] z-20 ${
            mobileFiltersOpen ? "block" : "hidden"
          } sm:block`}
        >
          <div className="card px-3 py-2 sm:px-4 sm:py-3 border border-border/80 bg-bg-primary/90 dark:bg-bg-primary/90 backdrop-blur">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-2 sm:gap-2 w-full">
              <MdFilterList className="text-text-secondary text-base sm:text-lg shrink-0 transition-colors hidden md:block" />
              <div className="w-full sm:w-auto sm:min-w-[220px]">
                <MonthYearPicker
                  value={selectedMonth}
                  onChange={setSelectedMonth}
                  minDate={accountStartMinDate ?? undefined}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-6">
          <InfoCard
            icon={<IoMdCard />}
            label="Opening Balance"
            value={dashboardData?.broadForwardBalanceLastMonth || 0}
            desc={getSelectedMonthLabel()}
            color="bg-blue-500"
          />

          {(dashboardData?.thisMonthNewSavings ?? 0) > 0 && (
            <InfoCard
              icon={<RiWallet3Fill />}
              label="External Initial Deposit"
              value={dashboardData?.thisMonthNewSavings ?? 0}
              desc={getSelectedMonthLabel()}
              color="bg-orange-500"
            />
          )}

          <InfoCard
            icon={<LuWalletMinimal />}
            label="Total Income"
            value={dashboardData?.thisMonthTotalIncome || 0}
            desc={getSelectedMonthLabel()}
            color="bg-green-500"
            onNavigate={() => navigate("/income")}
          />

          <InfoCard
            icon={<LuHandCoins />}
            label="Total Expenses"
            value={dashboardData?.thisMonthTotalExpenses || 0}
            desc={getSelectedMonthLabel()}
            color="bg-red-500"
            onNavigate={() => navigate("/expense")}
          />

          <InfoCard
            icon={<LuWallet />}
            label="Total Balance"
            value={dashboardData?.thisMonthTotalBalance || 0}
            desc={getSelectedDateLabel()}
            color="bg-primary"
            onNavigate={() => navigate("/wallet")}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <RecentTransactions
            transactions={dashboardData?.recentTransactions}
            onSeeMore={() => navigate("/transaction")}
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

          {/* <RecentIncomeWithChart
            data={
              dashboardData?.last60DaysIncome?.transactions?.slice(0, 4) || []
            }
            totalIncome={dashboardData?.thisMonthTotalIncome || 0}
          /> */}

          <ClosingBalanceTrends
            closingBalanceHistory={dashboardData?.closingBalanceHistory || []}
          />

          <ExpenseTransactions
            transactions={dashboardData?.last30DaysExpenses?.transactions || []}
            onSeeMore={() => navigate("/expense")}
          />

          <Last30DaysExpenses
            Transactions={dashboardData?.last30DaysExpenses?.transactions || []}
            monthLabel={getSelectedMonthLabel()}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Home;
