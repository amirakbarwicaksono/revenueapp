import "../styles/globals.css";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./context/AuthContext";

export const metadata = {
    title: "Revenue App",
    description: "A Next.js app with login functionality",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className="bg-background text-foreground min-h-screen">
                <AuthProvider>
                    <Navbar />
                    <main className="container mx-auto px-4 py-6 bg-background">
                        {children}
                    </main>
                </AuthProvider>
            </body>
        </html>
    );
}
