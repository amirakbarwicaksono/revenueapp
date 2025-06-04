//Added Rate Forward 
"use client";

import { useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import "../../styles/globals.css"; // Import global CSS
import { FaFileUpload, FaCheck, FaTimes, FaChevronDown, FaChevronUp } from "react-icons/fa";

// Collection Mapping
const collections = {
    dataFpr: "Flown OD/ID/SL",
    dataFmr: "Offline OD/ID/SL",
    //  
    masterTP_1: "Station Number & Agent Die",
    // masteric_2: "Master IC",
    // masterls_3: "Master Last Status",
    // mastertbs_4: "Konsolidator Outbound Fee",
    // mastertbs_41: "Konsolidator Inbound Fee",
    // mastertbs_42: "Subkonsolidator Outbound Fee",
    // mastertbs_43: "Subkonsolidator Inbound Fee",
    // mastertbs_44: "Pick Up Posactive Fee",
    // mastertbs_46: "Forward Destination Fee",
    // mastertbs_45: "ForwardOriginFee",
    // mastertbs_47: "Delivery Fee",
    // mastertbs_48: "Trucking Fee STT",
    // mastertbs_49: "Trucking Fee TUC",
    // mastertbs_50: "KVP Pick Up Fee",
    // mastertbs_51: "KVP Delivery Fee",
    // masterbc_5: "Master Berat Corp",
    // masterrg_6: "Master Routing",
    // masterrf_7: "MasterRateForward",
    // masterrt_8: "MasterRateTrucking",
    // masterdl_9: "Master DTPL",
    // mastermt_10: "Master MTUC",
};


// Add new DateRangeForm component
function DateRangeForm({
    onSubmit,
    isLoading
}: {
    onSubmit: (startDate: string, endDate: string) => void;
    isLoading: boolean;
}) {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(startDate, endDate);
    };

    return (
        <form onSubmit={handleSubmit} className="mb-4 p-2 bg-secondary rounded-lg shadow-md text-center hover:shadow-lg transform hover:scale-105 transition-all">
            <div className="flex flex-col space-y-2">
                <div>
                    <label className="block text-xs text-black mb-1">Start Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full p-1 rounded bg-primary text-white text-xs"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs text-black mb-1">End Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full p-1 rounded bg-primary text-white text-xs"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full px-2 py-1 text-xs text-black rounded ${
                        isLoading ? "bg-gray-300" : "bg-primary hover:bg-primary"
                    }`}
                >
                    {isLoading ? "Saving..." : "Save Date Range"}
                </button>
            </div>
        </form>
    );
}

// CollectionUploader Component
function CollectionUploader({
    collectionKey,
    collectionName,
    hasAccess,
}: {
    collectionKey: string;
    collectionName: string;
    hasAccess: boolean;
}) {
    const [files, setFiles] = useState<File[]>([]);
    const [messages, setMessages] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const { username } = useAuth();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string } | null>(null);
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [month, setMonth] = useState<string>("");

    // Calculate the minimum and maximum allowable dates for the month input
    const currentDate = new Date();
    const maxDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, 1).toISOString().split("T")[0].slice(0, 7); // Three months ago
    currentDate.setMonth(currentDate.getMonth() - 3);
    const minDate = currentDate.toISOString().split("T")[0].slice(0, 7); // Three months ago

    // Handles file selection
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFiles(Array.from(event.target.files));
            setMessages([]);
        }
    };

    // Handles file upload
    const handleUpload = async () => {
        if (!hasAccess || !username) {
            setMessages(["Access restricted or username missing."]);
            return;
        }
        if (files.length === 0) {
            setMessages(["Please select at least one CSV file first."]);
            return;
        }
        if (collectionKey === "masterrf_7" && !dateRange) {
            setMessages(["Please select a date range before uploading files."]);
            return;
        }
        if (!month) {
            setMessages(["Please select a month before uploading files."]);
            return;
        }

        setLoading(true);
        const newMessages: string[] = [];

        for (const file of files) {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("month", month);
            if (collectionKey === "masterrf_7" && dateRange) {
                formData.append("startDate", dateRange.startDate);
                formData.append("endDate", dateRange.endDate);
            }

            try {
                const response = await fetch(
                    `${apiUrl}/uploadData?collection=${encodeURIComponent(collectionKey)}&username=${encodeURIComponent(username)}`,
                    { method: "POST", body: formData }
                );

                if (!response.ok) {
                    const errorResponse = await response.json().catch(() => ({
                        error: "Unknown error",
                    }));
                    newMessages.push(
                        `Failed to upload ${file.name}: ${errorResponse.error || "Unknown error"}`
                    );
                } else {
                    const responseData = await response.json();
                    newMessages.push(
                        `${file.name} uploaded successfully to ${collectionName}: Total Csv Data: ${responseData.csvTotalCount}, Records Added: ${responseData.recordsAdded}, Before Count: ${responseData.beforeCount}, After Count: ${responseData.afterCount}, Duplicate: ${responseData.duplicateCount}`
                    );
                }
            } catch (error) {
                console.error(`Error uploading file ${file.name}:`, error);
                newMessages.push(`Error uploading ${file.name}. Please try again.`);
            }
        }

        setMessages(newMessages);
        setFiles([]);
        setLoading(false);
    };

    // Handles header download
    const downloadHeaders = async () => {
        if (!apiUrl) {
            setMessages(["Configuration error: API URL is missing."]);
            return;
        }

        try {
            const response = await fetch(
                `${apiUrl}/fetchHeadersAndExport?collection=${encodeURIComponent(collectionKey)}`
            );

            if (!response.ok) {
                setMessages(["Failed to download headers. Try again later."]);
                return;
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = downloadUrl;
            a.download = `${collectionKey}_headers.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setMessages(["Headers downloaded successfully."]);
        } catch (error) {
            setMessages(["Error downloading headers."]);
        }
    };

    // Add new function to handle date range submission
    const handleDateRangeSubmit = async (startDate: string, endDate: string) => {
        if (!hasAccess || !username) {
            setMessages(["Access restricted or username missing."]);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${apiUrl}/saveDateRange`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    collection: collectionKey,
                    startDate: new Date(startDate).toISOString().split('T')[0], // Ensure correct format
                    endDate: new Date(endDate).toISOString().split('T')[0],     // Ensure correct format
                    username,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to save date range");
            }

            setDateRange({ startDate, endDate });
            setMessages(["Date range saved successfully"]);
        } catch (error) {
            setMessages(["Failed to save date range"]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className={`p-2 bg-primary rounded-lg shadow-md text-center hover:shadow-lg transform text-black ${
                hasAccess ? "hover:scale-105" : "opacity-50 cursor-not-allowed"
            } transition-all`}
        >
            
            <h4 className="text-sm font-bold mb-2 text-black flex justify-between items-center">
                {collectionName}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-xs text-black"
                    >
                    {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                </button>
            </h4>
            {isExpanded && (
                <>            
                    {/* Add DateRangeForm for masterrf_7 */}
                    {collectionKey === "masterrf_7" && (
                        <DateRangeForm
                            onSubmit={handleDateRangeSubmit}
                            isLoading={loading}
                        />
                    )}

                    <button
                        onClick={downloadHeaders}
                        disabled={!hasAccess}
                        className={`w-full px-2 py-1 mb-2 text-xs text-gray-100 font-semibold bg-secondary rounded hover:bg-secondary border border-black ${
                            !hasAccess && "opacity-50 cursor-not-allowed"
                        }`}
                    >
                        <FaCheck className="inline mr-1" /> Cek Header
                    </button>

                    <input
                        type="file"
                        accept=".csv"
                        multiple
                        onChange={handleFileChange}
                        className="w-full text-xs mb-2 p-1 border border-black rounded text-black file:bg-background file:text-black file:rounded"
                        disabled={!hasAccess}
                    />

                    {/* Add month input for mastertbs_4* collections */}
                    {collectionKey.startsWith("mastertbs_") &&
                    !["mastertbs_45", "mastertbs_46"].includes(collectionKey) ? (
                        <div className="mb-2">
                            <label className="block text-xs text-black mb-1">Select Month</label>
                            <input
                                type="month"
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                className="w-full p-1 rounded bg-primary text-black text-xs border border-black" // Added border class
                                min={minDate}
                                max={maxDate}
                                required
                            />
                        </div>
                    ) : (
                        <div className="mb-2">
                            <label className="block text-xs text-black mb-1">Select Month</label>
                            <input
                                type="month"
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                className="w-full p-1 rounded bg-primary text-black text-xs border border-black" // Added border class
                                required
                            />
                        </div>
                    )}

                    <button
                        onClick={handleUpload}
                        disabled={loading || !hasAccess || (collectionKey === "masterrf_7" && !dateRange)}
                        className={`w-full px-2 py-1 text-xs font-semibold text-gray-100 rounded ${
                            loading ? "bg-gray-300 cursor-not-allowed" : "bg-secondary hover:bg-secondary"
                        }`}
                    >
                        {loading ? "Uploading..." : <><FaFileUpload className="inline mr-1" /> Upload File</>}
                    </button>

                    {messages.map((msg, index) => (
                        <p key={index} className="mt-1 text-xs text-gray-400">
                            {msg.includes("successfully") ? <FaCheck className="inline mr-1 text-green-500" /> : <FaTimes className="inline mr-1 text-red-500" />} {msg}
                        </p>
                    ))}
                </>
            )}
        </div>
    );
}

// Main UploadPage Component
export default function UploadPage() {
    const { access } = useAuth();
    const hasUploadAccess = access.includes("upload");

    if (!hasUploadAccess) {
        return (
            <ProtectedRoute>
                <div className="bg-background text-foreground min-h-screen flex items-center justify-center">
                    <p className="text-red-500">Access Restricted</p>
                </div>
            </ProtectedRoute>
        );
    }

    const dataCollections = Object.fromEntries(
        Object.entries(collections).filter(([key]) => key.startsWith("data"))
    );

    const tbsCollections = Object.fromEntries(
        Object.entries(collections).filter(([key]) => key.startsWith("master"))
    );

    const masterCollections = Object.fromEntries(
        Object.entries(collections).filter(([key]) => key.startsWith("mastertbs") && !key.startsWith("master"))
    );

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-background text-white p-4">
                {/* Teks Header */}
                <header className="mb-6">
                    <h1 className="text-xl font-bold mb-1">Upload CSV Files</h1>
                    <p className="font-mono text-xs text-white-100">Upload your files into the respective categories below.</p>
                </header>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Left Section */}
                    <section className="flex-1 border border-black rounded-lg p-4">
                        <h2 className="text-xl font-semibold mb-4 text-center mx-auto">Data Collections</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-background text-center mx-auto">
                            {Object.entries(dataCollections).map(([key, name]) => (
                                <CollectionUploader key={key} collectionKey={key} collectionName={name} hasAccess={access.includes(key)} />
                            ))}
                        </div>
                    </section>

                    {/* Right Section */}
                    <div className="flex-1 flex flex-col gap-8">
                        <section className="border border-black rounded-lg p-4">
                            <h2 className="text-xl font-semibold mb-4 text-center mx-auto">Master Collections</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-center mx-auto">
                                {Object.entries(tbsCollections).map(([key, name]) => (
                                    <CollectionUploader key={key} collectionKey={key} collectionName={name} hasAccess={access.includes(key)} />
                                ))}
                            </div>
                        </section>

                        <section className="border border-black rounded-lg p-4">
                            <h2 className="text-xl font-semibold mb-4 text-center mx-auto">Sample Data</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-center mx-auto">
                                {Object.entries(masterCollections).map(([key, name]) => (
                                    <CollectionUploader key={key} collectionKey={key} collectionName={name} hasAccess={access.includes(key)} />
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}

