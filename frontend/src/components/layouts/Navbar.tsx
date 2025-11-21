import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { MdLightMode, MdDarkMode, MdAdd } from "react-icons/md";
import SideMenu from "./SideMenu";
import { useTheme } from "../../hooks/useTheme";
import AddTransactionModal from "../Transactions/AddTransactionModal";
import logo from "../../assets/images/logo.svg";

interface NavbarProps {
  activeMenu: string;
}

const Navbar = ({ activeMenu }: NavbarProps) => {
  const [openSideMenu, setOpenSideMenu] = useState(false);
  const [openAddTransactionModal, setOpenAddTransactionModal] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (openSideMenu) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [openSideMenu]);

  return (
    <>
      <div className="flex items-center justify-between gap-2 sm:gap-5 bg-bg-primary border border-b border-border backdrop-blur-[2px] py-4 px-2 sm:px-7 sticky top-0 z-30 transition-colors">
        <div className="flex items-center gap-2 sm:gap-5 min-w-0 shrink">
          <button
            className="block lg:hidden text-text-primary shrink-0 transition-colors p-1 -ml-1"
            onClick={() => {
              setOpenSideMenu(!openSideMenu);
            }}
            aria-label="Toggle menu"
          >
            {openSideMenu ? (
              <HiOutlineX className="text-2xl" />
            ) : (
              <HiOutlineMenu className="text-2xl" />
            )}
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary rounded"
            aria-label="Finance Tracker - Go to dashboard"
          >
            <img
              src={logo}
              alt="Finance Tracker"
              className="h-6 sm:h-7 w-auto"
            />
            <span className="text-base sm:text-lg font-medium text-text-primary transition-colors">
              Finance Tracker
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 -mr-1">
          <button
            onClick={() => setOpenAddTransactionModal(true)}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-hover text-text-primary transition-colors"
            aria-label="Add transaction"
          >
            <MdAdd className="text-xl" />
          </button>

          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-hover text-text-primary transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <MdLightMode className="text-xl" />
            ) : (
              <MdDarkMode className="text-xl" />
            )}
          </button>
        </div>
      </div>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 dark:bg-black/75 z-40 transition-opacity duration-300 ${
          openSideMenu
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpenSideMenu(false)}
        style={{ top: "61px" }}
      />

      {/* Drawer */}
      <div
        className={`fixed top-[61px] left-0 h-[calc(100vh-61px)] z-50 transition-transform duration-300 ease-in-out ${
          openSideMenu ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SideMenu
          activeMenu={activeMenu}
          onClose={() => setOpenSideMenu(false)}
        />
      </div>

      <AddTransactionModal
        isOpen={openAddTransactionModal}
        onClose={() => setOpenAddTransactionModal(false)}
      />
    </>
  );
};

export default Navbar;
