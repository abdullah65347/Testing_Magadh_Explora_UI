import { NavLink, Outlet, useLocation, Navigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const TABS = [
    { to: "/admin/queries/contacts",  label: "Contacts" },
    { to: "/admin/queries/quotes",    label: "Quote Requests" },
    { to: "/admin/queries/bookings",  label: "Bookings" },
    { to: "/admin/queries/abandoned", label: "Abandoned Leads" },
];

export default function QueriesIndex() {
    const { pathname } = useLocation();

    // /admin/queries → redirect to contacts tab
    if (pathname === "/admin/queries" || pathname === "/admin/queries/") {
        return <Navigate to="/admin/queries/contacts" replace />;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Queries</h1>
                <p className="text-sm text-muted-foreground">
                    Manage incoming contact messages, quote requests, and bookings.
                </p>
            </div>

            <div className="border-b border-border">
                <nav className="flex gap-1">
                    {TABS.map((t) => (
                        <NavLink
                            key={t.to}
                            to={t.to}
                            className={({ isActive }) =>
                                cn(
                                    "px-4 py-2 -mb-px text-sm font-medium border-b-2 transition-colors",
                                    isActive
                                        ? "border-primary text-foreground"
                                        : "border-transparent text-muted-foreground hover:text-foreground"
                                )
                            }
                        >
                            {t.label}
                        </NavLink>
                    ))}
                </nav>
            </div>

            <Outlet />
        </div>
    );
}
