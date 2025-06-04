"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import "../../styles/globals.css"; // Import global CSS
import { FaLock, FaUnlock } from "react-icons/fa"; // Import icons

export default function DashboardPage() {
    const [subpages, setSubpages] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const { access } = useAuth(); // Get access array from AuthContext

    useEffect(() => {
        const fetchSubpages = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subpages`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(access), // Send access array to backend
                });
                if (!response.ok) {
                    throw new Error("Failed to fetch subpages");
                }
                const data = await response.json();
                setSubpages(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An unknown error occurred");
            }
        };

        if (access.length > 0) {
            fetchSubpages();
        }
    }, [access]);

    const renderSubpages = () => {
        if (error) {
            return <p className="text-red-500 text-center">{error}</p>;
        }

        if (subpages.length === 0) {
            return <p className="text-lg text-white text-center">No subpages available.</p>;
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subpages.map((subpage) => {
                    const hasAccess = access.includes(subpage.nick); // Check if user has access to this subpage
                    return (
                        <div
                            key={subpage.nick}
                            className={`p-3 bg-primary rounded-xl hover:shadow-lg transition-transform transform ${
                                hasAccess
                                    ? "hover:scale-105 hover:bg-primary cursor-pointer"
                                    : "opacity-50 cursor-not-allowed"
                            }`}
                        >
                            {hasAccess ? (
                                <Link href={subpage.link}>
                                    <div className="flex items-center justify-center mb-2">
                                        <FaUnlock className="text-white mr-1 text-sm" />
                                        <h4 className="text-white text-lg font-bold text-center">{subpage.name}</h4>
                                    </div>
                                    <p className="text-xs font-bold text-white uppercase text-center">{subpage.nick}</p>
                                </Link>
                            ) : (
                                <div>
                                    <div className="flex items-center mb-2">
                                        <FaLock className="text-red-500 mr-1 text-sm" />
                                        <h4 className="text-sm font-medium">{subpage.name}</h4>
                                    </div>
                                    <p className="text-lg font-bold text-gray-500">{subpage.nick}</p>
                                    <p className="text-red-500 text-xs font-bold mt-1">Access Restricted</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen p-4 bg-background text-white">
                {/* Teks Header */}
                <header className="mb-6">
                    <h1 className="text-xl font-bold mb-1">App Menu</h1>
                    <p className="font-mono text-xs">Choose Fee to the respective collections below.</p>
                </header>

                {/* Dashboard Content */}
                <h2 className="text-xl font-semibold mb-4 text-center">Dashboard</h2>
                {renderSubpages()}
            </div>
        </ProtectedRoute>
    );
}
