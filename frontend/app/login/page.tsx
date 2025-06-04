"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import "../../styles/globals.css"; // Import global CSS
import { FaUser, FaLock } from "react-icons/fa"; // Import icons

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();
    const { login } = useAuth();

    useEffect(() => {
        console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);
    }, []);

    const handleLogin = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                throw new Error("Invalid username or password");
            }

            const data = await response.json();
            login(data.access, username); // Pass access and username
            router.push("/dashboard");
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
            setError(errorMessage);
        }
    };

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key === "Enter") {
                handleLogin();
            }
        };

        window.addEventListener("keydown", handleKeyPress);
        return () => {
            window.removeEventListener("keydown", handleKeyPress);
        };
    }, [username, password]);

    return (
        <div className="min-h-screen flex flex-col justify-center items-center pt-1 pb-36 px-4 bg-background text-white">
            <header className="mb-12 text-center">
                <h1 className="text-2xl font-bold">Welcome to Our App!</h1>
                <p className="font-mono text-xs">
                    Please login with your credentials / contact DA team for access.
                </p>
            </header>

            <div className="bg-primary p-4 rounded-lg shadow-lg w-full max-w-sm">
                <h2 className="text-lg font-bold mb-4 text-center text-white">Revenue App v1.0</h2>
                {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
                <div className="space-y-4">
                    <div className="flex items-center border border-primary-color rounded bg-background text-black">
                        <FaUser className="text-gray-400 ml-2" />
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-2 bg-background text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
                        />
                    </div>
                    <div className="flex items-center border border-primary-color rounded bg-background text-black">
                        <FaLock className="text-gray-400 ml-2" />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 bg-background text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
                        />
                    </div>
                </div>
                <button
                    onClick={handleLogin}
                    className="w-full mt-4 bg-secondary text-gray-100 py-2 rounded hover:bg-secondary transition-all"
                >
                    Login
                </button>
            </div>
        </div>
    );
}
