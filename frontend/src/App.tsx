import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import ToastContainer from "./components/ToastContainer";
import UserProvider from "./context/UserProvider";
import { DateRangeProvider } from "./context/DateRangeProvider";
import { ThemeProvider } from "./context/ThemeProvider";
import { ClientConfigProvider } from "./context/ClientConfigProvider";

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <ClientConfigProvider>
          <Router>
            <DateRangeProvider>
              <AppRoutes />
              <ToastContainer />
            </DateRangeProvider>
          </Router>
        </ClientConfigProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
