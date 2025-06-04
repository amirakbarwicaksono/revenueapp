"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isLoggedIn } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("authToken");

        if (!token) {
            router.push("/login");
        } else {
            setLoading(false); // Mark as done loading if token exists
        }
    }, [isLoggedIn, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-gray-200">
                <p>Loading...</p>
            </div>
        );
    }

    return <>{children}</>;
}
