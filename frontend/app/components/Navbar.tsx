"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import "../../styles/globals.css"; // Import global CSS

const Navbar = () => {
    const { isLoggedIn, logout } = useAuth();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

const [storedUsername, setStoredUsername] = useState("");
useEffect(() => {
    const storedUsernamex = localStorage.getItem("username");
    setStoredUsername(storedUsernamex||"");
});

    return (
        <nav className="p-4 shadow-md fixed top-0 left-0 w-full z-10" style={{ backgroundColor: 'var(--navbar-bg)', color: 'var(--navbar-text)' }}>
            <div className="container mx-auto flex justify-between items-center">
                {/* Logo Section */}
                <Link href="/" className="flex items-center space-x-2 text-lg font-bold hover:text-gray-600">
                    <img
                        src="/logo.webp" // Replace with your logo path
                        alt="Logo"
                        className="h-8 w-8 rounded-full border border-black"
                    />
                    <span>Revenue App</span>
                </Link>

                {/* Hamburger Icon */}
                <button
                    className="block md:hidden focus:outline-none"
                    onClick={toggleMenu}
                >
                    <svg
                        className="h-6 w-6"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 24 24"
                        stroke="currentColor"
                    >
                        {isMenuOpen ? (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        ) : (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16m-7 6h7"
                            />
                        )}
                    </svg>
                </button>

                {/* Desktop Menu */}
                <div className="hidden md:flex space-x-4">
                        {storedUsername && (
                            <div className="hover:text-gray-600 animate-bounce font-bold">
                                Howdy, {storedUsername === "admin" ? "DA Team?" : storedUsername === "nizar" ? "Nizar?" : storedUsername === "yerrisa" ? "Yerrisa?" : storedUsername  === "ryan" ? "Ryan?" : storedUsername === "christin" ? "Christin?" : storedUsername === "aurel" ? "Aurel?" : storedUsername  === "lingga" ? "Lingga?" : storedUsername === "alief" ? "Alief?" : storedUsername }
                            </div>
                        )}	 	
                    <Link href="/" className="hover:text-gray-600 font-bold">
                        Home
                    </Link>
                    {isLoggedIn && (
                        <>
                            <Link href="/dashboard" className="hover:text-gray-600 font-bold">
                                App
                            </Link>
                            <Link href="/upload" className="hover:text-gray-600 font-bold">
                                Upload
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="text-red-500 hover:text-gray-600 font-bold"
                            >
                                Logout
                            </button>
                        </>
                    )}
                    {!isLoggedIn && (
                        <Link href="/login" className="hover:text-gray-600 font-bold">
                            Login
                        </Link>
                    )}
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden mt-7 shadow-md rounded-lg pt-12" style={{ backgroundColor: 'var(--navbar-bg)', color: 'var(--navbar-text)' }}>
                    <Link
                        href="/"
                        className="block px-4 py-2 text-sm hover:bg-gray-600 font-bold"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Home
                    </Link>
                    {isLoggedIn && (
                        <>
                            <Link
                                href="/dashboard"
                                className="block px-4 py-2 text-sm hover:bg-gray-600 font-bold"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                App
                            </Link>
                            <Link
                                href="/upload"
                                className="block px-4 py-2 text-sm hover:bg-gray-600 font-bold"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Upload
                            </Link>
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setIsMenuOpen(false);
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-600 hover:text-white font-bold"
                            >
                                Logout
                            </button>
                        </>
                    )}
                    {!isLoggedIn && (
                        <Link
                            href="/login"
                            className="block px-4 py-2 text-sm hover:bg-gray-600 font-bold"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Login
                        </Link>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
