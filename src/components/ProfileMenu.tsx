import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { LogIn, UserPlus, User, LogOut, LayoutDashboard, Ticket, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

interface ProfileMenuProps {
    isScrolled?: boolean;
    onAuthOpen?: (mode: "login" | "register") => void;
}

export function ProfileMenu({ isScrolled, onAuthOpen }: ProfileMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    const { isAuthenticated, user, logout } = useAuth();

    // close on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                profileRef.current &&
                !profileRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={profileRef} className="relative">
            {/* Profile Icon */}
            <button
                onClick={() => setIsOpen((prev) => !prev)}
                className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition",
                    isScrolled
                        ? "bg-muted text-foreground"
                        : "bg-white/10 text-white hover:bg-white/20"
                )}
            >
                <User className="w-5 h-5" />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-xl shadow-lg overflow-hidden z-50">

                    {!isAuthenticated ? (
                        <>
                            {/* Login */}
                            <button
                                onClick={() => {
                                    onAuthOpen?.("login");
                                    setIsOpen(false);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-muted transition"
                            >
                                <LogIn className="w-4 h-4" />
                                Login
                            </button>

                            {/* Register */}
                            <button
                                onClick={() => {
                                    onAuthOpen?.("register");
                                    setIsOpen(false);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-muted transition"
                            >
                                <UserPlus className="w-4 h-4" />
                                Register
                            </button>
                        </>
                    ) : (
                        <>
                            {/* User Info */}
                            <div className="px-4 py-3 border-b border-border">
                                <p className="text-sm font-medium">
                                    {user?.name || "User"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {user?.email}
                                </p>
                            </div>

                            {/* My Bookings */}
                            <Link
                                to="/my-bookings"
                                onClick={() => setIsOpen(false)}
                                className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-muted transition"
                            >
                                <Briefcase className="w-4 h-4" />
                                My Bookings
                            </Link>

                            {/* Manage Booking */}
                            <Link
                                to="/manage-booking"
                                onClick={() => setIsOpen(false)}
                                className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-muted transition"
                            >
                                <Ticket className="w-4 h-4" />
                                Look Up Booking
                            </Link>

                            {/* Dashboard */}
                            <button
                                className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-muted transition"
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                Dashboard
                            </button>

                            {/* Logout */}
                            <button
                                onClick={() => {
                                    logout();
                                    setIsOpen(false);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-muted transition text-red-500"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}