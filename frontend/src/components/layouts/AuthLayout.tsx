import { LuTrendingUpDown } from "react-icons/lu";
import loginCard from "../../assets/images/login-card.svg";
import logo from "../../assets/images/logo.svg";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex">
      <div className="w-screen h-screen md:w-[60vw] px-12 pt-8 pb-12 bg-bg-secondary transition-colors">
        <div className="flex items-center gap-2 mb-6">
          <img src={logo} alt="Finance Tracker" className="h-7 sm:h-8 w-auto" />
          <h2 className="text-lg font-medium text-text-primary transition-colors">
            Finance Tracker
          </h2>
        </div>
        {children}
      </div>

      <div className="hidden md:block w-[40vw] h-screen bg-violet-50 dark:bg-[#1a1a2e] bg-auth-bg-img bg-cover bg-no-repeat bg-center overflow-hidden p-8 relative transition-colors">
        <div className="w-48 h-48 rounded-[40px] bg-purple-600 dark:bg-purple-800 absolute -top-7 -left-5 transition-colors" />
        <div className="w-48 h-56 rounded-[40px] border-20 border-fuchsia-600 dark:border-fuchsia-800 absolute top-[30%] -right-10 transition-colors" />
        <div className="w-48 h-48 rounded-[40px] bg-violet-500 dark:bg-violet-700 absolute -bottom-7 -left-5 transition-colors" />

        <div className="grid grid-cols-1 z-20">
          <StatsInfoCard
            icon={<LuTrendingUpDown />}
            label="Track Your Income & Expenses"
            value="430,000"
            color="bg-primary"
          />
        </div>

        <img
          src={loginCard}
          className="w-64 lg:w-[90%] absolute bottom-10 shadow-lg shadow-blue-400/15"
        />
      </div>
    </div>
  );
};

export default AuthLayout;

const StatsInfoCard = ({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) => {
  return (
    <div className="flex gap-6 bg-bg-primary p-4 rounded-xl shadow-md shadow-purple-400/10 border border-border z-20 transition-colors">
      <div
        className={`w-12 h-12 flex items-center justify-center text-[26px] text-white ${color} rounded-full drop-shadow-xl`}
      >
        {icon}
      </div>
      <div>
        <h6 className="text-xs text-text-secondary mb-1 transition-colors">
          {label}
        </h6>
        <span className="text-[20px] text-text-primary transition-colors">
          AU${value}
        </span>
      </div>
    </div>
  );
};
