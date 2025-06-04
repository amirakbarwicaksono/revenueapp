"use client";

import { useState } from "react";
import SubpageGuard from "../../components/SubpageGuard";
import ProtectedRoute from "../../components/ProtectedRoute";
import "../../../styles/globals.css"; // Import global CSS
import { FaFileDownload, FaPlay } from "react-icons/fa";

export default function DtkofPage() {
    const [vlookupMessage, setVlookupMessage] = useState("Initializing...");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDownloadEnabled, setIsDownloadEnabled] = useState(false);
    const [eventSource, setEventSource] = useState<EventSource | null>(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const handleVlookupProcess = async () => {
        if (!apiUrl) {
            setVlookupMessage("API URL is not configured.");
            return;
        }

        setVlookupMessage("Initializing VLOOKUP process...");
        setIsProcessing(true);
        setIsDownloadEnabled(false); // Disable download during processing

        try {
            const es = new EventSource(`${apiUrl}/lookupAndSave`);
            setEventSource(es);

            es.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.message) {
                        setVlookupMessage(data.message);
                    }
                } catch (error) {
                    console.error("Error parsing SSE message:", error, event.data);
                    setVlookupMessage("Error processing server message.");
                }
            };

            es.addEventListener("complete", () => {
                setVlookupMessage("VLOOKUP process completed successfully!");
                setIsProcessing(false);
                setIsDownloadEnabled(true); // Enable download after process completes
                es.close();
                setEventSource(null);
            });

            es.onerror = () => {
                setVlookupMessage("An error occurred during VLOOKUP. Retrying...");
                es.close();
                setEventSource(null);
                setTimeout(handleVlookupProcess, 5000); // Retry after 5 seconds
            };
        } catch (error) {
            console.error("VLOOKUP Error:", error);
            setVlookupMessage("An unexpected error occurred during VLOOKUP.");
            setIsProcessing(false);
            if (eventSource) {
                eventSource.close();
                setEventSource(null);
            }
        }
    };

    const handleDownload = async () => {
        if (!apiUrl) {
            setVlookupMessage("API URL is not configured.");
            return;
        }
        
        setIsDownloadEnabled(false); // Disable download immediately after clicking

        try {
            const response = await fetch(`${apiUrl}/exportCSV`);
            if (!response.ok) {
                setVlookupMessage("Failed to download CSV. Try again later.");
                return;
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = downloadUrl;
            a.download = "ORCDataProcess.csv";
            document.body.appendChild(a);
            a.click();
            a.remove();

            setVlookupMessage("CSV file downloaded successfully!");
        } catch (error) {
            console.error("Download Error:", error);
            setVlookupMessage("An error occurred while downloading the CSV file.");
        }
    };

    return (
        <ProtectedRoute>
            <SubpageGuard requiredAccess="dtorc">
                <div className="min-h-screen p-4 bg-background text-black">
                    <header className="mb-6">
                    <h1 className="text-xl font-bold mb-1">
                        Data Flown By Team Revenue
                    </h1>
                    <p className="font-mono text-xs mb-2">
                        Data Flown By Team Revenue Process and Export CSV:
                    </p>
                    <ol className="list-decimal list-inside text-xs font-mono space-y-1">
                        <li>Jika data Flown belum di-upload, silakan upload terlebih dahulu data Flown pada menu <strong>Upload</strong>.</li>
                        <li>
                        Data Flown di-upload secara bergantian dengan contoh urutan sebagai berikut:
                        <ul className="list-disc list-inside pl-4 space-y-1">
                            <li>Upload data Flown OD April 2025 melalui menu <strong>Upload</strong>.</li>
                            <li>Setelah proses upload selesai, masuk ke menu <strong>App</strong> lalu pilih <strong>DTORC</strong>.</li>
                            <li>Klik tombol <strong>Start Process</strong> untuk memulai proses perhitungan Commision pada data Flown.</li>
                            <li>Setelah proses selesai, tombol <strong>Download CSV</strong> akan aktif. Klik untuk melihat hasil proses.</li>
                            <li>Data yang sudah diproses juga akan disimpan di database dan bisa diakses melalui menu <strong>Home</strong>.</li>
                            <li>Ulangi proses ini untuk setiap partisi yang ada (OD / ID / SL).</li>
                        </ul>
                        </li>
                        <li>Urutan proses perhitugnan commision : Menu Upload {'>'} Menu App {'>'} Menu Home</li>
                    </ol>
                    </header>
                    <div className="flex flex-wrap gap-5 justify-center">
                        {/* VLOOKUP Process Section */}
                        <div className="p-4 bg-white rounded shadow text-center w-56 hover:shadow-lg transform hover:scale-105 transition">
                            <h2 className="text-sm font-semibold mb-3 text-black">
                                ORC Process By Team Revenue
                            </h2>
                            <button
                                onClick={handleVlookupProcess}
                                disabled={isProcessing}
                                className={`w-full px-3 py-1.5 text-xs font-semibold text-gray-100 rounded ${
                                    isProcessing
                                        ? "bg-red-400 cursor-not-allowed"
                                        : "bg-secondary hover:bg-secondary"
                                }`}
                            >
                                {isProcessing ? "Processing..." : <><FaPlay className="inline mr-1" /> Start Process</>}
                            </button>
                            <p className="mt-3 text-xs text-black">{vlookupMessage}</p>
                        </div>

                        {/* CSV Download Section */}
                        <div
                            className={`p-4 bg-white rounded shadow text-center w-56 ${
                                isDownloadEnabled
                                    ? "hover:shadow-lg transform hover:scale-105 transition"
                                    : "opacity-50 cursor-not-allowed"
                            }`}
                        >
                            <h2 className="text-sm font-semibold mb-3 text-black">
                                Download CSV ORC Process
                            </h2>
                            <button
                                onClick={handleDownload}
                                disabled={!isDownloadEnabled}
                                className={`w-full px-3 py-1.5 text-xs font-semibold text-gray-100 rounded ${
                                    isDownloadEnabled
                                        ? "bg-secondary hover:bg-secondary"
                                        : "bg-secondary cursor-not-allowed"
                                }`}
                            >
                                {isDownloadEnabled ? <><FaFileDownload className="inline mr-1" /> Download CSV</> : "Download Disabled"}
                            </button>
                        </div>
                    </div>
                </div>
            </SubpageGuard>
        </ProtectedRoute>
    );
}


