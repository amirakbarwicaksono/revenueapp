// "use client";

// import { createContext, useContext, useEffect, useState } from "react";

// type AuthContextType = {
//     isLoggedIn: boolean;
//     access: string[];
//     login: (access: string[]) => void;
//     logout: () => void;
// };

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//     const [isLoggedIn, setIsLoggedIn] = useState(false);
//     const [access, setAccess] = useState<string[]>([]);

//     // Initialize auth state from localStorage
//     useEffect(() => {
//         const token = localStorage.getItem("authToken");
//         const storedAccess = localStorage.getItem("access");

//         if (token) {
//             setIsLoggedIn(true);
//             setAccess(storedAccess ? JSON.parse(storedAccess) : []);
//         }
//     }, []);

//     const login = (userAccess: string[]) => {
//         setIsLoggedIn(true);
//         setAccess(userAccess);
//         localStorage.setItem("authToken", "dummy_token"); // Store token
//         localStorage.setItem("access", JSON.stringify(userAccess)); // Store access
//     };

//     const logout = () => {
//         localStorage.removeItem("authToken");
//         localStorage.removeItem("access");
//         setIsLoggedIn(false);
//         setAccess([]);
//     };

//     return (
//         <AuthContext.Provider value={{ isLoggedIn, access, login, logout }}>
//             {children}
//         </AuthContext.Provider>
//     );
// };

// export const useAuth = () => {
//     const context = useContext(AuthContext);
//     if (!context) {
//         throw new Error("useAuth must be used within an AuthProvider");
//     }
//     return context;
// };
//first iteration

"use client";

import { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
    isLoggedIn: boolean;
    access: string[];
    username: string | null;
    login: (access: string[], username: string) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [access, setAccess] = useState<string[]>([]);
    const [username, setUsername] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        const storedAccess = localStorage.getItem("access");
        const storedUsername = localStorage.getItem("username");

        if (token) {
            setIsLoggedIn(true);
            setAccess(storedAccess ? JSON.parse(storedAccess) : []);
            setUsername(storedUsername || null);
        }
    }, []);

    const login = (userAccess: string[], username: string) => {
        setIsLoggedIn(true);
        setAccess(userAccess);
        setUsername(username);
        localStorage.setItem("authToken", "dummy_token");
        localStorage.setItem("access", JSON.stringify(userAccess));
        localStorage.setItem("username", username);
    };

    const logout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("access");
        localStorage.removeItem("username");
        setIsLoggedIn(false);
        setAccess([]);
        setUsername(null);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, access, username, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
