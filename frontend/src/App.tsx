import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/AppRoutes";
import UserProvider from "./context/UserProvider";
import { DateRangeProvider } from "./context/DateRangeProvider";

function App() {
  return (
    <UserProvider>
      <Router>
        <DateRangeProvider>
          <AppRoutes />

          <Toaster
            toastOptions={{
              className: "",
              style: {
                fontSize: "13px",
              },
            }}
          />
        </DateRangeProvider>
      </Router>
    </UserProvider>
  );
}

export default App;
