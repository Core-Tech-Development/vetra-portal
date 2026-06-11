import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import { QueryProvider } from "./providers/QueryProvider";
import { ToastProvider } from "./components/ui/Toast";
import { AppRoutes } from "./routes/AppRoutes";

function App() {
  return (
    <AuthProvider>
      <QueryProvider>
        <ToastProvider>
          <BrowserRouter basename={import.meta.env.VITE_BASE_PATH || "/"}>
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </QueryProvider>
    </AuthProvider>
  );
}

export default App;
