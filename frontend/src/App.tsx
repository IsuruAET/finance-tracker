import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import ToastContainer from "./components/ToastContainer";
import UserProvider from "./context/UserProvider";
import { DateRangeProvider } from "./context/DateRangeProvider";
import { ThemeProvider } from "./context/ThemeProvider";

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <Router>
          <DateRangeProvider>
            <AppRoutes />
            <ToastContainer />
          </DateRangeProvider>
        </Router>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
