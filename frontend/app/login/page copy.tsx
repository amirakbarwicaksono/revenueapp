// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { useAuth } from "../context/AuthContext";

// export default function LoginPage() {
//     const [username, setUsername] = useState("");
//     const [password, setPassword] = useState("");
//     const [error, setError] = useState("");
//     const router = useRouter();
//     const { login } = useAuth();

//     const handleLogin = async () => {
//         try {
//             const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ username, password }),
//             });

//             if (!response.ok) {
//                 throw new Error("Invalid username or password");
//             }

//             const data = await response.json();
//             localStorage.setItem("authToken", data.token); // Store auth token
//             login(data.access); // Pass access array to AuthContext
//             router.push("/dashboard"); // Redirect to dashboard
//         } catch (err) {
//             const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
//             setError(errorMessage);
//         }
//     };

//     return (
//         <div className="min-h-screen bg-black-900 text-white flex items-center justify-center">
//             <div className="bg-gray-900 p-6 rounded-lg shadow-lg max-w-sm w-full">
//                 <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>
//                 {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
//                 <div className="space-y-5">
//                     <input
//                         type="text"
//                         placeholder="Username"
//                         value={username}
//                         onChange={(e) => setUsername(e.target.value)}
//                         className="w-full p-3 border border-gray-600 rounded bg-gray-700 text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                     <input
//                         type="password"
//                         placeholder="Password"
//                         value={password}
//                         onChange={(e) => setPassword(e.target.value)}
//                         className="w-full p-3 border border-gray-600 rounded bg-gray-700 text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                 </div>
//                 <button
//                     onClick={handleLogin}
//                     className="w-full mt-6 bg-blue-700 text-white py-3 rounded hover:bg-blue-500 transition duration-800"
//                 >
//                     Login
//                 </button>
//             </div>
//         </div>
//     );
// }
//first 

// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { useAuth } from "../context/AuthContext";

// export default function LoginPage() {
//     const [username, setUsername] = useState("");
//     const [password, setPassword] = useState("");
//     const [error, setError] = useState("");
//     const router = useRouter();
//     const { login } = useAuth();

//     const handleLogin = async () => {
//         try {
//             const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ username, password }),
//             });

//             if (!response.ok) {
//                 throw new Error("Invalid username or password");
//             }

//             const data = await response.json();
//             localStorage.setItem("authToken", data.token); // Store auth token
//             login(data.access); // Pass access array to AuthContext
//             router.push("/dashboard"); // Redirect to dashboard
//         } catch (err) {
//             const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
//             setError(errorMessage);
//         }
//     };

//     return (
//         <div className="min-h-screen bg-black text-gray-200 p-4 flex flex-col justify-center items-center">
//             {/* Header Section */}
//             <header className="mb-8 text-center">
//                 <h1 className="text-3xl font-bold">Welcome to Our App!</h1>
//                 <p className="text-sm text-gray-400">
//                     Please login with your credentials or contact the Data Analyst team for access.
//                 </p>
//             </header>

//             {/* Login Form */}
//             <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-md">
//                 <h2 className="text-xl font-bold mb-4 text-center">Login</h2>
//                 {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
//                 <div className="space-y-5">
//                     <input
//                         type="text"
//                         placeholder="Username"
//                         value={username}
//                         onChange={(e) => setUsername(e.target.value)}
//                         className="w-full p-3 border border-gray-600 rounded bg-gray-800 text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                     <input
//                         type="password"
//                         placeholder="Password"
//                         value={password}
//                         onChange={(e) => setPassword(e.target.value)}
//                         className="w-full p-3 border border-gray-600 rounded bg-gray-800 text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                 </div>
//                 <button
//                     onClick={handleLogin}
//                     className="w-full mt-6 bg-blue-600 text-white py-3 rounded hover:bg-blue-500 transition-all"
//                 >
//                     Login
//                 </button>
//             </div>
//         </div>
//     );
// }
//iterasi 1

// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { useAuth } from "../context/AuthContext";

// export default function LoginPage() {
//     const [username, setUsername] = useState("");
//     const [password, setPassword] = useState("");
//     const [error, setError] = useState("");
//     const router = useRouter();
//     const { login } = useAuth();

//     const handleLogin = async () => {
//         try {
//             const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ username, password }),
//             });

//             if (!response.ok) {
//                 throw new Error("Invalid username or password");
//             }

//             const data = await response.json();
//             localStorage.setItem("authToken", data.token); // Store auth token
//             login(data.access); // Pass access array to AuthContext
//             router.push("/dashboard"); // Redirect to dashboard
//         } catch (err) {
//             const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
//             setError(errorMessage);
//         }
//     };

//     return (
//         <div className="min-h-screen bg-black text-gray-200 flex flex-col justify-center items-center pt-1 pb-36 px-4">
//             {/* Header Section */}
//             <header className="mb-12 text-center">
//                 <h1 className="text-2xl font-bold">Welcome to Our App!</h1>
//                 <p className="font-mono text-xs text-gray-100">
//                     Please login with your credentials / contact DA team for access.
//                 </p>
//             </header>

//             {/* Login Form */}
//             <div className="bg-gray-900 p-4 rounded-lg shadow-lg w-full max-w-sm">
//                 <h2 className="text-lg font-bold mb-4 text-center">Login</h2>
//                 {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
//                 <div className="space-y-4">
//                     <input
//                         type="text"
//                         placeholder="Username"
//                         value={username}
//                         onChange={(e) => setUsername(e.target.value)}
//                         className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-800"
//                     />
//                     <input
//                         type="password"
//                         placeholder="Password"
//                         value={password}
//                         onChange={(e) => setPassword(e.target.value)}
//                         className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-800"
//                     />
//                 </div>
//                 <button
//                     onClick={handleLogin}
//                     className="w-full mt-4 bg-blue-resistance text-gray-300 py-2 rounded hover:bg-blue-900 transition-all"
//                 >
//                     Login
//                 </button>
//             </div>
//         </div>
//     );
// }
//iterasi 2(OK)

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();
    const { login } = useAuth();

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

    return (
        <div className="min-h-screen bg-black text-gray-200 flex flex-col justify-center items-center pt-1 pb-36 px-4">
            <header className="mb-12 text-center">
                <h1 className="text-2xl font-bold">Welcome to Our App!</h1>
                <p className="font-mono text-xs text-gray-100">
                    Please login with your credentials / contact DA team for access.
                </p>
            </header>

            <div className="bg-gray-900 p-4 rounded-lg shadow-lg w-full max-w-sm">
                <h2 className="text-lg font-bold mb-4 text-center">Login</h2>
                {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-800"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-800"
                    />
                </div>
                <button
                    onClick={handleLogin}
                    className="w-full mt-4 bg-blue-resistance text-gray-300 py-2 rounded hover:bg-blue-900 transition-all"
                >
                    Login
                </button>
            </div>
        </div>
    );
}
