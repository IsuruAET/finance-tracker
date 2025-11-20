import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { MdLightMode, MdDarkMode } from "react-icons/md";
import SideMenu from "./SideMenu";
import { useTheme } from "../../hooks/useTheme";

interface NavbarProps {
  activeMenu: string;
}

const Navbar = ({ activeMenu }: NavbarProps) => {
  const [openSideMenu, setOpenSideMenu] = useState(false);
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
            className="block lg:hidden text-text-primary shrink-0 transition-colors"
            onClick={() => {
              setOpenSideMenu(!openSideMenu);
            }}
          >
            {openSideMenu ? (
              <HiOutlineX className="text-2xl" />
            ) : (
              <HiOutlineMenu className="text-2xl" />
            )}
          </button>

          <h2
            onClick={() => navigate("/dashboard")}
            className="text-lg font-medium text-text-primary transition-colors cursor-pointer hover:opacity-80"
          >
            Finance Tracker
          </h2>
        </div>

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

      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
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
    </>
  );
};

export default Navbar;
