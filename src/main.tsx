import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.tsx";
import "./index.css";
import "flag-icons/css/flag-icons.min.css";
import { AuthProvider } from "./context/AuthContext.tsx";
import { CurrencyProvider } from "./context/CurrencyContext.tsx";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
    <QueryClientProvider client={queryClient}>
        <AuthProvider>
            <CurrencyProvider>
                <App />
            </CurrencyProvider>
        </AuthProvider>
    </QueryClientProvider>
);