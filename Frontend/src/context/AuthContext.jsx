import { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        checkUserLoggedIn();
    }, []);

    // Check if user is already logged in
    const checkUserLoggedIn = async () => {
        try {
            const res = await fetch("/api/auth/me", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include", // Ensure cookies are sent
            });
            const data = await res.json();
            if (res.ok) {
                setUser(data);
            } else {
                setUser(null);
            }
        } catch (err) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // Login
    const login = async (userData) => {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
            credentials: "include",
        });

        const data = await res.json();

        if (res.ok) {
            setUser(data.user);
            navigate("/"); // Redirect to home
        } else {
            throw new Error(data.error || "Login failed");
        }
    };

    // Register
    const register = async (userData) => {
        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
            credentials: "include",
        });

        const data = await res.json();

        if (res.ok) {
            setUser(data.user); // Auto login after register
            navigate("/");
        } else {
            throw new Error(data.error || "Registration failed");
        }
    };

    // Logout
    const logout = async () => {
        await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
        });
        setUser(null);
        navigate("/login");
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
