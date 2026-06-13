import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Package,
    MapPin,
    Tag,
    BookOpen,
    MessageSquare,
    Languages,
    LayoutGrid,
    Star,
    Camera,
    Settings,
    LogOut,
    Home,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const NAV = [
    { to: "/admin",              label: "Dashboard",   icon: LayoutDashboard, end: true },
    { to: "/admin/packages",     label: "Packages",    icon: Package },
    { to: "/admin/destinations", label: "Destinations",icon: MapPin },
    { to: "/admin/categories",   label: "Categories",  icon: Tag },
    { to: "/admin/blog",         label: "Blog",        icon: BookOpen },
    { to: "/admin/homepage",     label: "Homepage",    icon: LayoutGrid },
    { to: "/admin/queries",      label: "Queries",     icon: MessageSquare },
    { to: "/admin/reviews",      label: "Reviews",     icon: Star },
    { to: "/admin/journey",      label: "Journey",     icon: Camera },
    { to: "/admin/translations", label: "Translations",icon: Languages },
    { to: "/admin/settings",     label: "Settings",    icon: Settings },
];

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <div className="min-h-screen flex bg-muted/30">
            <aside className="w-64 bg-card border-r border-border flex flex-col">
                <div className="px-6 py-5 border-b border-border">
                    <p className="font-display text-lg font-bold">Magadh Admin</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>

                <nav className="flex-1 p-3 space-y-1">
                    {NAV.map(({ to, label, icon: Icon, end }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )
                            }
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-3 border-t border-border space-y-1">
                    <NavLink
                        to="/"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                        <Home className="w-4 h-4" />
                        View Site
                    </NavLink>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign out
                    </button>
                </div>
            </aside>

            <main className="flex-1 p-6 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
}
