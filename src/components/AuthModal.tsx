import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { authService } from "@/api/services/authService";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { PhoneInput } from "@/components/ui/phone-input";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    mode: "login" | "register";
    onSwitchMode?: (mode: "login" | "register") => void;
    /** Optional pre-filled values (e.g. after a guest booking) */
    initial?: { name?: string; email?: string; mobile?: string };
};

export default function AuthModal({ isOpen, onClose, mode, onSwitchMode, initial }: Props) {
    const isLogin = mode === "login";
    const { login } = useAuth();

    const [form, setForm] = useState({
        name: "",
        email: "",
        mobile: "",
        password: ""
    });

    const [errors, setErrors] = useState<any>({});

    useEffect(() => {
        if (isOpen) {
            setForm({
                name: initial?.name ?? "",
                email: initial?.email ?? "",
                mobile: initial?.mobile ?? "",
                password: ""
            });
            setErrors({});
        }
    }, [isOpen, mode, initial?.name, initial?.email, initial?.mobile]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const validate = () => {
        const newErrors: any = {};

        if (!isLogin && !form.name.trim()) {
            newErrors.name = "Name is required";
        }

        if (!form.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
            newErrors.email = "Invalid email";
        }

        if (!form.password) {
            newErrors.password = "Password is required";
        } else if (!isLogin) {
            // Strong validation ONLY for register
            if (
                !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/.test(form.password)
            ) {
                newErrors.password =
                    "Min. 6 chars with uppercase, lowercase, number & special character.";
            }
        }

        return newErrors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationErrors = validate();
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) return;

        try {
            if (isLogin) {
                const res = await authService.login({
                    email: form.email,
                    password: form.password,
                });

                login(res.token); // store in context
                onClose();
            } else {
                await authService.register({
                    name: form.name,
                    email: form.email,
                    mobile: form.mobile,
                    password: form.password,
                });

                // auto login after register
                const res = await authService.login({
                    email: form.email,
                    password: form.password,
                });

                login(res.token);
                onClose();
            }
        } catch (err: any) {
            console.error(err);
            alert(err.message || "Something went wrong");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">

            {/* Blur Background */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="relative z-10 w-full max-w-md rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl p-6 text-white">

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/70 hover:text-white"
                    >
                        <X size={20} />
                    </button>

                    {/* Title */}
                    <h2 className="text-2xl font-semibold mb-2 text-center">
                        {isLogin ? "Welcome Back" : "Create Account"}
                    </h2>

                    <p className="text-sm text-center mb-6 text-white/60">
                        {isLogin ? (
                            "Welcome back — continue your journey."
                        ) : (
                            <>
                                Make every journey unforgettable — Magadh Explora.                        </>
                        )}
                    </p>

                    {/* Form */}
                    <form className="space-y-4" onSubmit={handleSubmit}>

                        {!isLogin && (
                            <>
                                <input
                                    name="name"
                                    type="text"
                                    placeholder="Name"
                                    value={form.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                                {errors.name && <p className="text-red-400 text-xs">{errors.name}</p>}
                            </>
                        )}

                        <input
                            name="email"
                            type="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                        {errors.email && <p className="text-red-400 text-xs">{errors.email}</p>}

                        {!isLogin && (
                            <>
                                <PhoneInput
                                    name="mobile"
                                    placeholder="Mobile (optional)"
                                    value={form.mobile}
                                    onChange={(v) => setForm({ ...form, mobile: v })}
                                    className="bg-white/10 border-white/20 focus-within:ring-yellow-400 focus-within:ring-offset-0 text-white"
                                    inputClassName="text-white placeholder:text-white/60"
                                />
                                {errors.mobile && <p className="text-red-400 text-xs">{errors.mobile}</p>}
                            </>
                        )}

                        <input
                            name="password"
                            type="password"
                            placeholder="Password"
                            value={form.password}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                        {errors.password && <p className="text-red-400 text-xs">{errors.password}</p>}
                        {isLogin && (
                            <div className="mt-2 text-right">
                                <span className="text-xs text-white/40 mr-1">
                                    Can't remember your password?
                                </span>

                                <button
                                    type="button"
                                    onClick={() => console.log("Forgot password")}
                                    className="relative text-xs font-medium text-yellow-400 group"
                                >
                                    Reset

                                    {/* Glow effect */}
                                    <span className="absolute inset-0 blur-sm opacity-0 group-hover:opacity-100 bg-yellow-400/30 transition-all duration-300 rounded"></span>

                                    {/* Animated underline */}
                                    <span className="absolute left-0 -bottom-0.5 w-0 h-[1px] bg-yellow-400 transition-all duration-300 group-hover:w-full"></span>
                                </button>
                            </div>
                        )}
                        {/* Button */}
                        <button
                            type="submit"
                            className="w-full py-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 hover:opacity-90 transition font-semibold"
                        >
                            {isLogin ? "Login" : "Register"}
                        </button>
                    </form>

                    {/* Switch */}
                    <p className="text-center text-sm text-white/70 mt-6">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button
                            type="button"
                            onClick={() =>
                                onSwitchMode?.(isLogin ? "register" : "login")
                            }
                            className="ml-2 text-yellow-400 hover:underline"
                        >
                            {isLogin ? "Register" : "Login"}

                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}