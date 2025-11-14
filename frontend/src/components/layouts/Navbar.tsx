import { useState } from "react";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import SideMenu from "./SideMenu";
import DateRangePicker from "../DateRangePicker";

interface NavbarProps {
  activeMenu: string;
}

const Navbar = ({ activeMenu }: NavbarProps) => {
  const [openSideMenu, setOpenSideMenu] = useState(false);

  return (
    <div className="flex items-center justify-between gap-3 sm:gap-5 bg-white border border-b border-gray-200/50 backdrop-blur-[2px] py-4 px-4 sm:px-7 sticky top-0 z-30">
      <div className="flex items-center gap-3 sm:gap-5 min-w-0">
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

        <h2 className="text-base sm:text-lg font-medium text-black wrap-break-word">
          Finance Tracker
        </h2>
      </div>

      <div className="shrink-0">
        <DateRangePicker />
      </div>

      {openSideMenu && (
        <div className="fixed top-[61px] -ml-4 bg-white">
          <SideMenu activeMenu={activeMenu} />
        </div>
      )}
    </div>
  );
};

export default Navbar;
