"use client";

import { useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";

// Collection Mapping
const collections = {
    datakof: "Data Konsolidator Outbound Fee",
    datakif: "Data Konsolidator Inbound Fee",
    datasof: "Data Subkonsolidator Outbound Fee",
    datasif: "Data Subkonsolidator Inbound Fee",
    datapof: "Data Pick Up Fee (PUF)",
    datafro: "Data Forward Origin Fee",
    datafrd: "Data Forward Destination Fee",
    mastermn_1: "Master Mitra Name",
    masteric_2: "Master IC",
    masterls_3: "Master Last Status",
    mastertbs_4: "TBS Konsolidator Outbound Fee",
    mastertbs_41: "TBS Konsolidator Inbound Fee",
    mastertbs_42: "TBS Subkonsolidator Outbound Fee",
    mastertbs_43: "TBS Subkonsolidator Inbound Fee",
    mastertbs_44: "TBS Pick Up Fee (PUF)",
    mastertbs_45: "TBS Forward Origin Fee",
    mastertbs_46: "TBS Forward Destination Fee",
    masterbc_5: "Master Berat Corp",
    masterrg_6: "Master Routing",
    masterrf_7: "Master Rate Forward",
    masterrt_8: "Master Rate Trucking",
    masterdl_9: "Master DTPL",
    mastermt_10: "Master MTUC",
};

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

        setLoading(true);
        const newMessages: string[] = [];

        for (const file of files) {
            const formData = new FormData();
            formData.append("file", file);

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

    return (
        <div
            className={`p-2 bg-gray-900 rounded-lg shadow-md text-center hover:shadow-lg transform ${
                hasAccess ? "hover:scale-105" : "opacity-50 cursor-not-allowed"
            } transition-all`}
        >
            <h4 className="text-sm font-medium mb-2 text-white">{collectionName}</h4>

            <button
                onClick={downloadHeaders}
                disabled={!hasAccess}
                className={`w-full px-2 py-1 mb-2 text-xs font-semibold text-white bg-blue-resistance rounded hover:bg-blue-resistance ${
                    !hasAccess && "opacity-50 cursor-not-allowed"
                }`}
            >
                Cek Header
            </button>

            <input
                type="file"
                accept=".csv"
                multiple
                onChange={handleFileChange}
                className="w-full text-xs mb-2 p-1 border rounded text-gray-300 file:bg-white file:text-black file:rounded"
                disabled={!hasAccess}
            />

            <button
                onClick={handleUpload}
                disabled={loading || !hasAccess}
                className={`w-full px-2 py-1 text-xs font-semibold text-white rounded ${
                    loading ? "bg-gray-500 cursor-not-allowed" : "bg-blue-resistance hover:bg-blue-resistance"
                }`}
            >
                {loading ? "Uploading..." : "Upload File"}
            </button>

            {messages.map((msg, index) => (
                <p key={index} className="mt-1 text-xs text-gray-400">
                    {msg}
                </p>
            ))}
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
                <div className="min-h-screen bg-black text-gray-200 flex items-center justify-center">
                    <p className="text-red-500">Access Restricted</p>
                </div>
            </ProtectedRoute>
        );
    }

    const dataCollections = Object.fromEntries(
        Object.entries(collections).filter(([key]) => key.startsWith("data"))
    );

    const tbsCollections = Object.fromEntries(
        Object.entries(collections).filter(([key]) => key.startsWith("mastertbs"))
    );

    const masterCollections = Object.fromEntries(
        Object.entries(collections).filter(([key]) => key.startsWith("master") && !key.startsWith("mastertbs"))
    );

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-black text-gray-200 p-4">
                {/* Teks Header */}
                <header className="mb-6">
                    <h1 className="text-xl font-bold mb-1">Upload CSV Files</h1>
                    <p className="font-mono text-xs text-white-100">Upload your files into the respective categories below.</p>
                </header>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Left Section */}
                    <section className="flex-1 border border-amber-300 rounded-lg p-4">
                        <h2 className="text-xl font-semibold mb-4 text-center">Data Collections</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(dataCollections).map(([key, name]) => (
                                <CollectionUploader key={key} collectionKey={key} collectionName={name} hasAccess={access.includes(key)} />
                            ))}
                        </div>
                    </section>

                    {/* Right Section */}
                    <div className="flex-1 flex flex-col gap-8">
                        <section className="border border-amber-300 rounded-lg p-4">
                            <h2 className="text-xl font-semibold mb-4 text-center">TBS Collections</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Object.entries(tbsCollections).map(([key, name]) => (
                                    <CollectionUploader key={key} collectionKey={key} collectionName={name} hasAccess={access.includes(key)} />
                                ))}
                            </div>
                        </section>

                        <section className="border border-amber-300 rounded-lg p-4">
                            <h2 className="text-xl font-semibold mb-4 text-center">Master Collections</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
