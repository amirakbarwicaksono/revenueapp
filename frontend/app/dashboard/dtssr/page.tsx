//added button for dataSSR
"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import SubpageGuard from "../../components/SubpageGuard";
import ProtectedRoute from "../../components/ProtectedRoute";
import "../../../styles/globals.css";
import { FaFileDownload, FaPlay, FaStop, FaTable } from "react-icons/fa";

export default function DtkofPage() {
    const [vlookupMessage, setVlookupMessage] = useState("Ready to start...");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDownloadEnabled, setIsDownloadEnabled] = useState(false);
    const [eventSource, setEventSource] = useState<EventSource | null>(null);
    const [showStopButton, setShowStopButton] = useState(false);
    const [showStopExportButton, setShowStopExportButton] = useState(false);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const router = useRouter();
    const pathname = usePathname();

    // const startEventSource = () => {
    const startEventSource = (retryCount = 0) => {
        if (!apiUrl) {
            setVlookupMessage("API URL is not configured.");
            setIsProcessing(false);
            return;
        }
        //added retry logic
        const MAX_RETRIES = 5;
        const RETRY_DELAY_MS = 3000;
        
        const es = new EventSource(`${apiUrl}/lookupAndSave1`);
        setEventSource(es);

        es.onopen = () => {
            console.log("SSE connection opened.");
        };

        es.onmessage = (event) => {
            console.log("Raw SSE message:", event.data);
            try {
                const data = JSON.parse(event.data);
                if (data.message) {
                    setVlookupMessage(data.message);
                    if (data.message.includes("Another process is already running")) {
                        setShowStopButton(true);
                        setIsProcessing(false);
                        es.close();
                        setEventSource(null);
                    } else if (data.message.includes("Process aborted")) {
                        setIsProcessing(false);
                        es.close();
                        setEventSource(null);
                    }
                } else {
                    setVlookupMessage("Received unexpected message format.");
                }
            } catch (error) {
                console.error("Error parsing SSE message:", error, event.data);
                setVlookupMessage("Error processing server message.");
                setIsProcessing(false);
                setShowStopButton(false);
                es.close();
                setEventSource(null);
            }
        };

        es.addEventListener("complete", () => {
            setVlookupMessage("VLOOKUP process completed successfully!");
            setIsProcessing(false);
            setIsDownloadEnabled(true);
            setShowStopButton(false);
            es.close();
            setEventSource(null);
            console.log("SSE connection closed on completion.");
        });

        es.onerror = () => {
            console.error("SSE connection error.");
            // setVlookupMessage("Connection lost or server error. Please try again.");
            // setIsProcessing(false);
            // setShowStopButton(false);
            es.close();
            setEventSource(null);

            if (retryCount < MAX_RETRIES) {
                console.log(`Retrying SSE connection... attempt ${retryCount + 1}`);
                setTimeout(() => {
                    startEventSource(retryCount + 1);
                }, RETRY_DELAY_MS);
            } else {
                setVlookupMessage("Connection lost and retry limit reached. Please try again.");
                setIsProcessing(false);
                setShowStopButton(false);
            }
        };
    };

    const handleVlookupProcess = () => {
        if (isProcessing) return;

        setVlookupMessage("Initializing VLOOKUP process...");
        setIsProcessing(true);
        setIsDownloadEnabled(false);
        setShowStopButton(false);

        try {
            startEventSource();
        } catch (error) {
            console.error("VLOOKUP Error:", error);
            setVlookupMessage("Unexpected error during VLOOKUP.");
            setIsProcessing(false);
            setShowStopButton(false);
            if (eventSource) {
                eventSource.close();
                setEventSource(null);
            }
        }
    };

    const handleStopProcess = async () => {
        if (!apiUrl) {
            setVlookupMessage("API URL is not configured.");
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/stopProcess`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
            const data = await response.json();
            if (!response.ok) {
                setVlookupMessage(`Failed to stop process: ${data.message || "Unknown error"}`);
                return;
            }

            setVlookupMessage("Process stopped successfully. You can start a new process.");
            setShowStopButton(false);
            console.log("Process stopped successfully.");
        } catch (error) {
            console.error("Stop Process Error:", error);
            setVlookupMessage("Error occurred while stopping the process.");
        }
    };

    const handleStopExportProcess = async () => {
        if (!apiUrl) {
            setVlookupMessage("API URL is not configured.");
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/stopExportProcess`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
            const data = await response.json();
            if (!response.ok) {
                setVlookupMessage(`Failed to stop export process: ${data.message || "Unknown error"}`);
                return;
            }

            setVlookupMessage("Export process stopped successfully. You can try downloading again.");
            setShowStopExportButton(false);
            console.log("Export process stopped successfully.");
        } catch (error) {
            console.error("Stop Export Process Error:", error);
            setVlookupMessage("Error occurred while stopping export process.");
        }
    };

    const handleDownload = async () => {
        if (!apiUrl) {
            setVlookupMessage("API URL is not configured.");
            return;
        }

        setIsDownloadEnabled(false);

        try {
            const response = await fetch(`${apiUrl}/exportCSV1`);
            if (!response.ok) {
                const errorData = await response.json();
                if (errorData.message && errorData.message.includes("Another export process is already running")) {
                    setVlookupMessage(errorData.message);
                    setShowStopExportButton(true);
                    return;
                }
                setVlookupMessage(`Failed to download CSV: ${errorData.message || "Unknown error"}`);
                return;
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = downloadUrl;
            a.download = "SSRDataProcess.csv";
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(downloadUrl);

            setVlookupMessage("CSV file downloaded successfully!");
        } catch (error) {
            console.error("Download Error:", error);
            setVlookupMessage("Error occurred while downloading the CSV.");
        }
    };

    const handleViewDataSSR = () => {
        console.log("Current pathname:", pathname);
        router.push("/dashboard/datassr", { scroll: false });
    };

    useEffect(() => {
        console.log("DtkofPage mounted, current pathname:", pathname);
        return () => {
            if (eventSource) {
                eventSource.close();
                setEventSource(null);
            }
        };
    }, [eventSource]);

    return (
        <ProtectedRoute>
            <SubpageGuard requiredAccess="dtssr">
                <div className="min-h-screen p-4 bg-background text-black">
                    <header className="mb-6">
                        <div className="flex items-center gap-4">
                            <h1 className="text-xl font-bold">Data Offline By Team Revenue</h1>
                            <button
                                onClick={handleViewDataSSR}
                                className="px-3 py-1.5 text-xs font-semibold text-gray-100 bg-blue-600 hover:bg-blue-700 rounded flex items-center"
                            >
                                <FaTable className="inline mr-1" /> View DataSSR
                            </button>
                        </div>
                        <p className="font-mono text-xs mb-3">Data Offline Processing and CSV Export:</p>
                        <ol className="list-decimal list-inside text-xs space-y-1">
                            <li>Jika data Offline belum di-upload, silakan upload terlebih dahulu data Offline pada menu <em>Upload</em>.</li>
                            <li>
                                Data Offline di-upload secara bergantian dengan contoh urutan sebagai berikut:
                                <ul className="list-disc list-inside pl-4 space-y-1">
                                    <li>Upload data Offline OD April 2025 melalui menu <em>Upload</em>.</li>
                                    <li>
                                        Setelah proses upload selesai, Masuk ke menu <em>App</em> lalu pilih{" "}
                                        <em>DTSSR</em>.
                                    </li>
                                    <li>Klik <em>Start Process</em> untuk memulai proses eliminasi.</li>
                                    <li>
                                        Setelah proses selesai, tombol <strong>Download CSV</strong> akan aktif. Klik
                                        untuk melihat hasil proses.
                                    </li>
                                    <li>
                                        Data tersimpan di menu <em>DataSSR</em>. Klik <strong>View DataSSR</strong>{" "}
                                        untuk melihatnya.
                                    </li>
                                    <li>Ulangi untuk setiap partisi (OD / ID / SL).</li>
                                </ul>
                            </li>
                            <li>Urutan proses: Data Offline {'>'} App {'>'} DataSSR</li>
                        </ol>
                    </header>

                    <div className="flex flex-wrap gap-5 justify-center">
                        <div className="p-4 bg-white rounded shadow text-center w-56 hover:shadow-lg transform hover:scale-105 transition">
                            <h2 className="text-sm font-semibold mb-3 text-black">SSR Process By Team Revenue</h2>
                            <button
                                onClick={handleVlookupProcess}
                                disabled={isProcessing}
                                className={`w-full px-3 py-1.5 text-xs font-semibold text-gray-100 rounded mb-2 ${
                                    isProcessing ? "bg-red-400 cursor-not-allowed" : "bg-secondary hover:bg-secondary"
                                }`}
                            >
                                {isProcessing ? "Processing..." : (
                                    <>
                                        <FaPlay className="inline mr-1" /> Start Process
                                    </>
                                )}
                            </button>
                            {showStopButton && (
                                <button
                                    onClick={handleStopProcess}
                                    className="w-full px-3 py-1.5 text-xs font-semibold text-white rounded bg-secondary hover:bg-secondary mb-2"
                                >
                                    <FaStop className="inline mr-1" /> Stop Process
                                </button>
                            )}
                            <p className="mt-3 text-xs text-black">{vlookupMessage}</p>
                        </div>

                        <div
                            className={`p-4 bg-gray-50 rounded shadow text-center w-56 ${
                                isDownloadEnabled
                                    ? "hover:shadow-lg transform hover:scale-105 transition"
                                    : "opacity-50 cursor-not-allowed"
                            }`}
                        >
                            <h2 className="text-sm font-semibold mb-3 text-black">Download CSV SSR Process</h2>
                            <button
                                onClick={handleDownload}
                                disabled={!isDownloadEnabled}
                                className={`w-full px-3 py-1.5 text-xs font-semibold text-white rounded ${
                                    isDownloadEnabled
                                        ? "bg-secondary hover:bg-secondary"
                                        : "bg-gray-400 cursor-not-allowed"
                                }`}
                            >
                                {isDownloadEnabled ? (
                                    <>
                                        <FaFileDownload className="inline mr-1 text-gray-100" /> Download CSV
                                    </>
                                ) : (
                                    "Download Disabled"
                                )}
                            </button>
                            {showStopExportButton && (
                                <button
                                    onClick={handleStopExportProcess}
                                    className="mt-2 w-full px-3 py-1.5 text-xs font-semibold text-white rounded bg-secondary hover:bg-red-800"
                                >
                                    <FaStop className="inline mr-1" /> Stop Export
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </SubpageGuard>
        </ProtectedRoute>
    );
}

// "use client";

// import { useState, useEffect } from "react";
// import { useRouter, usePathname } from "next/navigation";
// import SubpageGuard from "../../components/SubpageGuard";
// import ProtectedRoute from "../../components/ProtectedRoute";
// import "../../../styles/globals.css";
// import { FaFileDownload, FaPlay, FaStop, FaTable } from "react-icons/fa";

// export default function DtkofPage() {
//     const [vlookupMessage, setVlookupMessage] = useState<string>("Ready to start...");
//     const [isProcessing, setIsProcessing] = useState<boolean>(false);
//     const [isDownloadEnabled, setIsDownloadEnabled] = useState<boolean>(false);
//     const [eventSource, setEventSource] = useState<EventSource | null>(null);
//     const [showStopButton, setShowStopButton] = useState<boolean>(false);
//     const [showStopExportButton, setShowStopExportButton] = useState<boolean>(false);

//     const apiUrl = process.env.NEXT_PUBLIC_API_URL;
//     const router = useRouter();
//     const pathname = usePathname();

//     const startEventSource = (retryCount: number = 0, maxRetries: number = 3) => {
//         if (!apiUrl) {
//             setVlookupMessage("API URL is not configured.");
//             setIsProcessing(false);
//             return;
//         }

//         if (eventSource) {
//             console.log("Closing existing EventSource.");
//             eventSource.close();
//         }

//         const es = new EventSource(`${apiUrl}/lookupAndSave1`);
//         setEventSource(es);

//         es.onopen = () => {
//             console.log("SSE connection opened.");
//             setVlookupMessage("Connected to server...");
//             retryCount = 0; // Reset retry count on successful connection
//         };

//         es.onmessage = (event: MessageEvent) => {
//             if (!event.data || event.data === ":\n\n") {
//                 console.log("Received keep-alive message.");
//                 return;
//             }
//             console.log("Raw SSE message:", event.data);
//             try {
//                 const data = JSON.parse(event.data) as { message?: string };
//                 if (data.message) {
//                     setVlookupMessage(data.message);
//                     if (data.message.includes("Another process is already running")) {
//                         setShowStopButton(true);
//                         setIsProcessing(false);
//                         es.close();
//                         setEventSource(null);
//                     } else if (data.message.includes("Process aborted")) {
//                         setIsProcessing(false);
//                         es.close();
//                         setEventSource(null);
//                     }
//                 } else {
//                     setVlookupMessage("Received unexpected message format.");
//                 }
//             } catch (error: unknown) {
//                 console.error("Error parsing SSE message:", error instanceof Error ? error.message : error, event.data);
//                 setVlookupMessage("Error processing server message.");
//                 setIsProcessing(false);
//                 setShowStopButton(false);
//                 es.close();
//                 setEventSource(null);
//             }
//         };

//         es.addEventListener("complete", () => {
//             setVlookupMessage("VLOOKUP process completed successfully!");
//             setIsProcessing(false);
//             setIsDownloadEnabled(true);
//             setShowStopButton(false);
//             es.close();
//             setEventSource(null);
//             console.log("SSE connection closed on completion.");
//         });

//         es.onerror = (error: unknown) => {
//             console.error("SSE error. Retry attempt:", retryCount + 1, error instanceof Error ? error.message : error);
//             setVlookupMessage(`Connection lost. ${retryCount < maxRetries ? `Reconnecting in ${2 ** retryCount} seconds...` : "Max retries reached."}`);
//             setIsProcessing(false);
//             setShowStopButton(false);
//             es.close();
//             setEventSource(null);

//             if (retryCount < maxRetries) {
//                 setTimeout(() => startEventSource(retryCount + 1, maxRetries), 1000 * 2 ** retryCount);
//             } else {
//                 setVlookupMessage("Failed to reconnect after multiple attempts. Please try again later.");
//             }
//         };
//     };

//     const handleVlookupProcess = async () => {
//         if (isProcessing) return;

//         setVlookupMessage("Checking for existing processes...");
//         try {
//             const response = await fetch(`${apiUrl}/checkProcess`, {
//                 method: "GET",
//             });
//             const data = await response.json() as { isRunning: boolean };
//             if (data.isRunning) {
//                 setVlookupMessage("Another process is running. Please stop it first.");
//                 setShowStopButton(true);
//                 return;
//             }

//             setVlookupMessage("Initializing VLOOKUP process...");
//             setIsProcessing(true);
//             setIsDownloadEnabled(false);
//             setShowStopButton(false);
//             startEventSource();
//         } catch (error: unknown) {
//             console.error("Process check error:", error instanceof Error ? error.message : error);
//             setVlookupMessage("Error checking process status.");
//             setIsProcessing(false);
//             setShowStopButton(false);
//             if (eventSource) {
//                 eventSource.close();
//                 setEventSource(null);
//             }
//         }
//     };

//     const handleStopProcess = async () => {
//         if (!apiUrl) {
//             setVlookupMessage("API URL is not configured.");
//             return;
//         }

//         try {
//             const response = await fetch(`${apiUrl}/stopProcess`, {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//             });
//             const data = await response.json() as { message?: string };
//             if (!response.ok) {
//                 setVlookupMessage(`Failed to stop process: ${data.message || "Unknown error"}`);
//                 return;
//             }

//             setVlookupMessage("Process stopped successfully. You can start a new process.");
//             setShowStopButton(false);
//             console.log("Process stopped successfully.");
//         } catch (error: unknown) {
//             console.error("Stop Process Error:", error instanceof Error ? error.message : error);
//             setVlookupMessage("Error occurred while stopping the process.");
//         }
//     };

//     const handleStopExportProcess = async () => {
//         if (!apiUrl) {
//             setVlookupMessage("API URL is not configured.");
//             return;
//         }

//         try {
//             const response = await fetch(`${apiUrl}/stopExportProcess`, {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//             });
//             const data = await response.json() as { message?: string };
//             if (!response.ok) {
//                 setVlookupMessage(`Failed to stop export process: ${data.message || "Unknown error"}`);
//                 return;
//             }

//             setVlookupMessage("Export process stopped successfully. You can try downloading again.");
//             setShowStopExportButton(false);
//             console.log("Export process stopped successfully.");
//         } catch (error: unknown) {
//             console.error("Stop Export Process Error:", error instanceof Error ? error.message : error);
//             setVlookupMessage("Error occurred while stopping export process.");
//         }
//     };

//     const handleDownload = async () => {
//         if (!apiUrl) {
//             setVlookupMessage("API URL is not configured.");
//             return;
//         }

//         setIsDownloadEnabled(false);

//         try {
//             const response = await fetch(`${apiUrl}/exportCSV1`);
//             if (!response.ok) {
//                 const errorData = await response.json() as { message?: string };
//                 if (errorData.message && errorData.message.includes("Another export process is already running")) {
//                     setVlookupMessage(errorData.message);
//                     setShowStopExportButton(true);
//                     return;
//                 }
//                 setVlookupMessage(`Failed to download CSV: ${errorData.message || "Unknown error"}`);
//                 return;
//             }

//             const blob = await response.blob();
//             const downloadUrl = window.URL.createObjectURL(blob);
//             const a = document.createElement("a");
//             a.href = downloadUrl;
//             a.download = "SSRDataProcess.csv";
//             document.body.appendChild(a);
//             a.click();
//             a.remove();
//             window.URL.revokeObjectURL(downloadUrl);

//             setVlookupMessage("CSV file downloaded successfully!");
//         } catch (error: unknown) {
//             console.error("Download Error:", error instanceof Error ? error.message : error);
//             setVlookupMessage("Error occurred while downloading the CSV.");
//         }
//     };

//     const handleViewDataSSR = () => {
//         console.log("Current pathname:", pathname);
//         router.push("/dashboard/datassr", { scroll: false });
//     };

//     useEffect(() => {
//         console.log("DtkofPage mounted, current pathname:", pathname);
//         return () => {
//             console.log("Cleaning up EventSource");
//             if (eventSource) {
//                 eventSource.close();
//                 setEventSource(null);
//             }
//         };
//     }, [eventSource, pathname]);

//     return (
//         <ProtectedRoute>
//             <SubpageGuard requiredAccess="dtssr">
//                 <div className="min-h-screen p-4 bg-background text-black">
//                     <header className="mb-6">
//                         <div className="flex items-center gap-4">
//                             <h1 className="text-xl font-bold">Data Offline By Team Revenue</h1>
//                             <button
//                                 onClick={handleViewDataSSR}
//                                 className="px-3 py-1.5 text-xs font-semibold text-gray-100 bg-blue-600 hover:bg-blue-700 rounded flex items-center"
//                             >
//                                 <FaTable className="inline mr-1" /> View DataSSR
//                             </button>
//                         </div>
//                         <p className="font-mono text-xs mb-3">Data Offline Processing and CSV Export:</p>
//                         <ol className="list-decimal list-inside text-xs space-y-1">
//                             <li>Jika data Offline belum di-upload, silakan upload terlebih dahulu data Offline pada menu <em>Upload</em>.</li>
//                             <li>
//                                 Data Offline di-upload secara bergantian dengan contoh urutan sebagai berikut:
//                                 <ul className="list-disc list-inside pl-4 space-y-1">
//                                     <li>Upload data Offline OD April 2025 melalui menu <em>Upload</em>.</li>
//                                     <li>
//                                         Setelah proses upload selesai, Masuk ke menu <em>App</em> lalu pilih{" "}
//                                         <em>DTSSR</em>.
//                                     </li>
//                                     <li>Klik <em>Start Process</em> untuk memulai proses eliminasi.</li>
//                                     <li>
//                                         Setelah proses selesai, tombol <strong>Download CSV</strong> akan aktif. Klik
//                                         untuk melihat hasil proses.
//                                     </li>
//                                     <li>
//                                         Data tersimpan di menu <em>DataSSR</em>. Klik <strong>View DataSSR</strong>{" "}
//                                         untuk melihatnya.
//                                     </li>
//                                     <li>Ulangi untuk setiap partisi (OD / ID / SL).</li>
//                                 </ul>
//                             </li>
//                             <li>Urutan proses: Data Offline {'>'} App {'>'} DataSSR</li>
//                         </ol>
//                     </header>

//                     <div className="flex flex-wrap gap-5 justify-center">
//                         <div className="p-4 bg-white rounded shadow text-center w-56 hover:shadow-lg transform hover:scale-105 transition">
//                             <h2 className="text-sm font-semibold mb-3 text-black">SSR Process By Team Revenue</h2>
//                             <button
//                                 onClick={handleVlookupProcess}
//                                 disabled={isProcessing}
//                                 className={`w-full px-3 py-1.5 text-xs font-semibold text-gray-100 rounded mb-2 ${
//                                     isProcessing ? "bg-red-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
//                                 }`}
//                             >
//                                 {isProcessing ? "Processing..." : (
//                                     <>
//                                         <FaPlay className="inline mr-1" /> Start Process
//                                     </>
//                                 )}
//                             </button>
//                             {showStopButton && (
//                                 <button
//                                     onClick={handleStopProcess}
//                                     className="w-full px-3 py-1.5 text-xs font-semibold text-white rounded bg-red-600 hover:bg-red-700 mb-2"
//                                 >
//                                     <FaStop className="inline mr-1" /> Stop Process
//                                 </button>
//                             )}
//                             <p className="mt-3 text-xs text-black">{vlookupMessage}</p>
//                         </div>

//                         <div
//                             className={`p-4 bg-gray-50 rounded shadow text-center w-56 ${
//                                 isDownloadEnabled
//                                     ? "hover:shadow-lg transform hover:scale-105 transition"
//                                     : "opacity-50 cursor-not-allowed"
//                             }`}
//                         >
//                             <h2 className="text-sm font-semibold mb-3 text-black">Download CSV SSR Process</h2>
//                             <button
//                                 onClick={handleDownload}
//                                 disabled={!isDownloadEnabled}
//                                 className={`w-full px-3 py-1.5 text-xs font-semibold text-white rounded ${
//                                     isDownloadEnabled
//                                         ? "bg-blue-600 hover:bg-blue-700"
//                                         : "bg-gray-400 cursor-not-allowed"
//                                 }`}
//                             >
//                                 {isDownloadEnabled ? (
//                                     <>
//                                         <FaFileDownload className="inline mr-1" /> Download CSV
//                                     </>
//                                 ) : (
//                                     "Download Disabled"
//                                 )}
//                             </button>
//                             {showStopExportButton && (
//                                 <button
//                                     onClick={handleStopExportProcess}
//                                     className="mt-2 w-full px-3 py-1.5 text-xs font-semibold text-white rounded bg-red-600 hover:bg-red-800"
//                                 >
//                                     <FaStop className="inline mr-1" /> Stop Export
//                                 </button>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             </SubpageGuard>
//         </ProtectedRoute>
//     );
// }