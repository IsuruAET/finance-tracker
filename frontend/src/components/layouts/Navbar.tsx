import { useState, useEffect } from "react";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import SideMenu from "./SideMenu";

interface NavbarProps {
  activeMenu: string;
}

const Navbar = ({ activeMenu }: NavbarProps) => {
  const [openSideMenu, setOpenSideMenu] = useState(false);

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
      <div className="flex items-center justify-between gap-2 sm:gap-5 bg-white border border-b border-gray-200/50 backdrop-blur-[2px] py-4 px-2 sm:px-7 sticky top-0 z-30">
        <div className="flex items-center gap-2 sm:gap-5 min-w-0 shrink">
          <button
            className="block lg:hidden text-black shrink-0"
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

          <h2 className="text-lg font-medium text-black">Finance Tracker</h2>
        </div>
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
