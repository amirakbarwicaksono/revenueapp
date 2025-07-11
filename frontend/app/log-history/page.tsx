"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import { FaFileCsv, FaUser } from "react-icons/fa"; // Import icons

type UploadLog = {
    CollectionName: string;
    CSVTotalCount: number;
    RecordCount: number;
    UploadedAt: string;
    Status: string;
    ErrorMessage?: string;
    UploadedBy: string;
    DataBefore: number;
    DataAfter: number;
    DuplicateCount: number;
    Action: string;
    Month: string; // Add the month field
};

const collectionAliases: { [key: string]: string } = {
    datakof: "Data Konsolidator Outbound Fee",
    datakif: "Data Konsolidator Inbound Fee",
    datasof: "Data Subkonsolidator Outbound Fee",
    datasif: "Data Subkonsolidator Inbound Fee",
    datapof: "Data Pick Up Fee",
    datafro: "Data Forward Origin Fee",
    datafrd: "Data Forward Destination Fee",
    datadef: "Data Delivery Fee",
    datakpf: "Data KVP Pick Up Fee",
    datakdf: "Data KVP Delivery Fee",
    datatfs: "Data Trucking (STT) Fee",
    datatft: "Data Trucking (TUC) Fee",
    dataFpr: "Data Flown OD/ID/SL",
    dataFmr: "Data Offline OD/ID/SL",
    mastermn_1: "Master Mitra Name",
    masteric_2: "Master IC",
    masterls_3: "Master Last Status",
    mastertbs_4: "TBS Konsolidator Outbound Fee",
    mastertbs_41: "TBS Konsolidator Inbound Fee",
    mastertbs_42: "TBS Subkonsolidator Outbound Fee",
    mastertbs_43: "TBS Subkonsolidator Inbound Fee",
    mastertbs_44: "TBS Pick Up Fee",
    mastertbs_45: "TBS Forward Origin Fee",
    mastertbs_46: "TBS Forward Destination Fee",
    mastertbs_47: "TBS Delivery Fee",
    mastertbs_48: "TBS Trucking(STT) Fee",    
    mastertbs_49: "TBS Trucking(TUC) Fee",
    mastertbs_50: "TBS KVP Pick Up Fee",
    mastertbs_51: "TBS KVP Delivery Fee",
    masterbc_5: "Master Berat Corp",
    masterrg_6: "Master Routing",
    masterrf_7: "Master Rate Forward",
    masterrt_8: "Master Rate Trucking",
    masterdl_9: "Master DTPL",
    mastermt_10: "Master MTUC",
    masterTP_1: "Master STCODE & AGTCODE"
};

export default function LogHistoryPage() {
    const [logs, setLogs] = useState<UploadLog[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const logsPerPage = 8;

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/getUploadLogs`);
                if (!response.ok) throw new Error("Failed to fetch logs");
                const result = await response.json();
                setLogs(result);
                setError(null);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("An unknown error occurred.");
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const formatDate = (dateString: string) => {
        try {
            const options: Intl.DateTimeFormatOptions = {
                day: "2-digit",
                month: "short",
                year: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
            };
            return new Date(dateString).toLocaleString("id-ID", options).replace(',', '');
        } catch {
            return "Invalid Date";
        }
    };

    const formatMonthYear = (dateString: string) => {
        try {
            const options: Intl.DateTimeFormatOptions = {
                month: "short",
                year: "2-digit",
            };
            return new Date(dateString).toLocaleString("id-ID", options);
        } catch {
            return "Invalid Date";
        }
    };

    const headTbl = [
        "Tanggal dan Jam",
        "Nama Collection",
        "Action",
        "Jumlah Data Upload",
        "Data yang sudah ada",
        "Data Duplicate",
        "Data Diinsert",
        "Hasil Akhir",
        "Upload by User",
        "Status",
        "Error Message",
        "Month",
    ];

    // Sort and paginate logs
    const sortedLogs = [...logs].sort((a, b) => new Date(b.UploadedAt).getTime() - new Date(a.UploadedAt).getTime());
    const indexOfLastLog = currentPage * logsPerPage;
    const indexOfFirstLog = indexOfLastLog - logsPerPage;
    const currentLogs = sortedLogs.slice(indexOfFirstLog, indexOfLastLog);

    const totalPages = Math.ceil(logs.length / logsPerPage);
    const maxPageNumbersToShow = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxPageNumbersToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPageNumbersToShow - 1);
    const pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    return (
        <div className="min-h-screen bg-background text-black p-4">
            {/* Teks Header */}
            <header className="mb-4">
                <h1 className="text-xl font-bold mb-1 flex justify-between items-center">
                    Log History!
                    <button
                        onClick={async () => {
                            try {
                                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/exportCSVlogs`);
                                if (!response.ok) throw new Error('Export failed');
                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = 'log_history.csv';
                                document.body.appendChild(a);
                                a.click();
                                window.URL.revokeObjectURL(url);
                                a.remove();
                            } catch (error) {
                                console.error('Export failed:', error);
                                alert('Failed to export CSV');
                            }
                        }}
                        className="px-3 py-1 bg-secondary text-gray-100 font-mono rounded-md hover:bg-secondary transition"
                    >
                        <FaFileCsv className="inline mr-1" /> Export CSV
                    </button>
                </h1>
                <p className="font-mono text-xs text-black">Login for access menu function.</p>
            </header>

            {/* Content Layout */}
            <div className="flex flex-col md:flex-row gap-8">
                {/* Main Content */}
                <div className="flex-1 border border-black rounded-lg p-4">
                    <h2 className="text-xl font-bold mb-4 text-center">Data Upload Logs</h2>
                    {isLoading ? (
                        <p className="text-center text-foreground">Loading logs...</p>
                    ) : error ? (
                        <p className="text-center text-red-500">{error}</p>
                    ) : (
                        <div className="w-full overflow-x-auto">
                            <table className="w-full border-collapse text-xs font-medium bg-foreground">
                                <thead className="bg-primary text-white">
                                    <tr>
                                        {headTbl.map((head) => (
                                            <th key={head} className="py-2 px-2 text-center border border-black">
                                                {head}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentLogs.length > 0 ? (
                                        currentLogs.map((log, index) => (
                                            <tr key={index} className="odd:bg-gray-50 even:bg-gray-50 hover:bg-gray-300">
                                                <td className="py-px px-2 border text-xs text-center text-black border-gray-700">{formatDate(log.UploadedAt)}</td>
                                                <td className="py-px px-2 border text-xs text-center text-black border-gray-700">
                                                    {collectionAliases[log.CollectionName] || log.CollectionName}
                                                </td>
                                                <td className="py-px px-2 border text-xs text-center text-black border-gray-700">{log.Action || "Upload CSV"}</td>
                                                <td className="py-px px-2 border text-xs text-center text-black border-gray-700">{log.CSVTotalCount.toLocaleString()}</td>
                                                <td className="py-px px-2 border text-xs text-center text-black border-gray-700">{log.DataBefore.toLocaleString()}</td>
                                                <td className="py-px px-2 border text-xs text-center text-black border-gray-700">{log.DuplicateCount.toLocaleString()}</td>
                                                <td className="py-px px-2 border text-xs text-center text-black border-gray-700">{log.RecordCount.toLocaleString()}</td>
                                                <td className="py-px px-2 border text-xs text-center text-black border-gray-700">{log.DataAfter.toLocaleString()}</td>
                                                <td className="py-px px-2 border text-xs text-black border-gray-700">
                                                    <FaUser className="inline mr-1" /> {log.UploadedBy}
                                                </td>
                                                <td className="py-px px-2 border text-xs text-center text-black border-gray-700">{log.Status}</td>
                                                <td className="py-px px-2 border text-xs text-center text-black border-gray-700">{log.ErrorMessage || "N/A"}</td>  
                                                <td className="py-px px-2 border text-xs text-center text-black border-gray-700">{formatMonthYear(log.Month) || "N/A"}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={headTbl.length} className="text-center py-4 text-gray-900">
                                                No logs available.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            <div className="flex justify-center mt-4">
                                <button
                                    onClick={() => paginate(1)}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 mx-1 bg-secondary text-black rounded-md disabled:opacity-50"
                                >
                                    First
                                </button>
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 mx-1 bg-secondary text-black rounded-md disabled:opacity-50"
                                >
                                    Prev
                                </button>
                                {pageNumbers.map((number) => (
                                    <button
                                        key={number}
                                        onClick={() => paginate(number)}
                                        className={`px-3 py-1 mx-1 ${currentPage === number ? 'bg-black' : 'bg-secondary'} text-background rounded-md`}
                                    >
                                        {number}
                                    </button>
                                ))}
                                <button
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 mx-1 bg-secondary text-black rounded-md disabled:opacity-50"
                                >
                                    Next
                                </button>
                                <button
                                    onClick={() => paginate(totalPages)}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 mx-1 bg-secondary text-black rounded-md disabled:opacity-50"
                                >
                                    End
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
