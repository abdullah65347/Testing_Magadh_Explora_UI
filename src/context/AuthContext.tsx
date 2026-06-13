import { createContext, useContext, useEffect, useState } from "react";
import api from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

interface User {
    name: string;
    email: string;
    mobile: string;
    role: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    login: (token: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (token) {
            fetchUser();
        }
    }, []);

    const fetchUser = async () => {
        try {
            const res = await api.get(ENDPOINTS.AUTH.ME);
            setUser(res.data);
            setIsAuthenticated(true);
        } catch (error) {
            logout(); // token invalid / expired
        }
    };

    const login = async (token: string) => {
        localStorage.setItem("access_token", token);
        await fetchUser(); // get full user (name, email, role)
    };

    const logout = () => {
        localStorage.removeItem("access_token");
        setIsAuthenticated(false);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};