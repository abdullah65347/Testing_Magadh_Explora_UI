import api from "../client";
import { ENDPOINTS } from "../endpoints";

// types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    mobile: string;
    password: string;
}

export interface LoginResponse {
    token: string;
}

export const authService = {
    login: async (data: LoginRequest): Promise<LoginResponse> => {
        const res = await api.post(ENDPOINTS.AUTH.LOGIN, data);

        // store token
        localStorage.setItem("access_token", res.data.token);

        return res.data;
    },

    register: async (data: RegisterRequest): Promise<string> => {
        const res = await api.post(ENDPOINTS.AUTH.REGISTER, data);
        return res.data;
    },

    logout: () => {
        localStorage.removeItem("access_token");
    },
};