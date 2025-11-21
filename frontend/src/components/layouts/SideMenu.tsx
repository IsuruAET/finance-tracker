import { useNavigate } from "react-router-dom";
import { SIDE_MENU_DATA } from "../../utils/data";
import CharAvatar from "../Cards/CharAvatar";
import { useUserContext } from "../../context/UserContext";

interface SideMenuProps {
  activeMenu: string;
  onClose?: () => void;
}

const SideMenu = ({ activeMenu, onClose }: SideMenuProps) => {
  const { user, clearUser } = useUserContext();
  const navigate = useNavigate();

  const handleClick = (route: string) => {
    if (route === "logout") {
      handleLogout();
      return;
    }
    navigate(route);
    onClose?.();
  };

  const handleLogout = () => {
    localStorage.clear();
    clearUser();
    navigate("/login");
  };

  const regularMenuItems = SIDE_MENU_DATA.filter((item) => item.path !== "logout");
  const logoutItem = SIDE_MENU_DATA.find((item) => item.path === "logout");

  return (
    <div className="w-64 h-full bg-bg-primary border-r border-border p-5 overflow-y-auto transition-colors">
      <div className="flex flex-col items-center justify-center gap-3 mt-3 mb-7">
        {user?.profileImageUrl ? (
          <img
            src={user.profileImageUrl}
            alt="Profile"
            className="w-20 h-20 bg-slate-400 rounded-full"
          />
        ) : (
          <CharAvatar
            fullName={user?.fullName || ""}
            width="w-20"
            height="h-20"
            style="text-xl"
          />
        )}

        <h5 className="text-text-primary font-medium leading-6 transition-colors">
          {user?.fullName || ""}
        </h5>
      </div>

      {regularMenuItems.map((item, index) => {
        const isActive = activeMenu === item.label;

        return (
          <button
            key={`menu_${index}`}
            className={`w-full flex items-center gap-4 text-[15px] py-3 px-6 rounded-lg mb-3 transition-colors cursor-pointer ${
              isActive
                ? "text-white bg-primary"
                : "text-text-primary hover:bg-hover"
            }`}
            onClick={() => handleClick(item.path)}
          >
            <item.icon className="text-xl" />
            <span>{item.label}</span>
          </button>
        );
      })}

      <div className="border-t border-border my-4"></div>

      {logoutItem && (
        <button
          className="w-full flex items-center gap-4 text-[15px] py-3 px-6 rounded-lg transition-colors cursor-pointer text-red-500 dark:text-red-400 border border-red-200 dark:border-red-800/50 hover:bg-red-50 dark:hover:bg-red-900/20"
          onClick={() => handleClick(logoutItem.path)}
        >
          <logoutItem.icon className="text-xl" />
          <span className="font-semibold">{logoutItem.label}</span>
        </button>
      )}
    </div>
  );
};

export default SideMenu;
