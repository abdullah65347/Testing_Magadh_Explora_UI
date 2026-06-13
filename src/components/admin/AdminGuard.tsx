import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/" state={{ from: location, requireLogin: true }} replace />;
    }

    if (user?.role !== "ADMIN") {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 text-center">
                <div>
                    <h1 className="text-2xl font-semibold mb-2">Forbidden</h1>
                    <p className="text-muted-foreground">You need an admin account to view this page.</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
