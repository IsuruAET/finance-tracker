import { Toaster } from "react-hot-toast";
import { useTheme } from "../hooks/useTheme";

const ToastContainer = () => {
  const { theme } = useTheme();

  return (
    <Toaster
      toastOptions={{
        className: "toast-notification",
        style: {
          fontSize: "13px",
          background: theme === "dark" ? "#242526" : "#ffffff",
          color: theme === "dark" ? "#e4e6eb" : "#050505",
          border: `1px solid ${theme === "dark" ? "#3a3b3c" : "#e4e6eb"}`,
        },
        success: {
          iconTheme: {
            primary: "#875cf5",
            secondary: theme === "dark" ? "#242526" : "#ffffff",
          },
        },
        error: {
          iconTheme: {
            primary: "#ef4444",
            secondary: theme === "dark" ? "#242526" : "#ffffff",
          },
        },
      }}
    />
  );
};

export default ToastContainer;
