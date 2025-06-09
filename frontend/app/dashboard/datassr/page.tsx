"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import SubpageGuard from "../../components/SubpageGuard";
import "../../../styles/globals.css";
import { FaFileDownload, FaTimes } from "react-icons/fa";

// Define interface for API response
interface FilterOptionsResponse {
  issuedDates: string[];
  countries: string[];
  airlines: string[];
}

interface SSRData {
  StationOpenDate: string;
  StationCloseDate: string;
  StationNo: string;
  StationCode: string;
  StationCurr: string;
  CloseEmpNumber: string;
  TransCode: string;
  DocType: string;
  TktInd: string;
  TicketNumber: string;
  PaxName: string;
  RefundTicket: string;
  exchTicket: string;
  PreConjTicket: string;
  IssuedDate: string;
  PNRR: string;
  AgentDie: string;
  TourCode: string;
  FOP: string;
  Route1: string;
  Route2: string;
  Route3: string;
  Route4: string;
  Route5: string;
  dateofFlight1: string;
  dateofFlight2: string;
  dateofFlight3: string;
  dateofFlight4: string;
  code1: string;
  code2: string;
  code3: string;
  code4: string;
  EMDRemark1: string;
  EMDRemark2: string;
  EMDRemark3: string;
  EMDRemark4: string;
  TktBaseFare: string;
  TktPPN: string;
  D8: string;
  T6: string;
  TktFSurcharge: string;
  YR: string;
  tktadm: string;
  TktApoTax: string;
  CalcTotal: string;
  exbprasdesc: string;
  country: string;
  [key: string]: any;
}

export default function DataSSRPage() {
  const [data, setData] = useState<SSRData[]>([]);
  const [totalDocs, setTotalDocs] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    issuedDate: "",
    country: "",
    airline: "",
    searchTerm: "",
  });
  const [filterOptions, setFilterOptions] = useState({
    issuedDates: [] as string[],
    countries: [] as string[],
    airlines: [] as string[],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const pageSize = 10;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const formatDisplayDate = (issuedDate: string) => {
    if (!issuedDate) return "";
    try {
      const parsedDate = new Date(issuedDate.replace("-", " 1, "));
      if (isNaN(parsedDate.getTime())) {
        console.warn(`Invalid date format: ${issuedDate}`);
        return issuedDate;
      }
      return parsedDate.toLocaleString("en-US", { month: "long", year: "numeric" }).toUpperCase();
    } catch (err) {
      console.error(`Error parsing date ${issuedDate}:`, err);
      return issuedDate;
    }
  };

  useEffect(() => {
    const fetchFilterOptions = async () => {
      if (!apiUrl) {
        console.error("API URL is not configured.");
        setError("API URL is not configured.");
        return;
      }
      try {
        console.log("Fetching filter options from:", `${apiUrl}/getSSRFilterOptions`);
        const response = await fetch(`${apiUrl}/getSSRFilterOptions`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const options: FilterOptionsResponse = await response.json();
        console.log("Filter options response:", options);
        const issuedDates = Array.from(new Set(options.issuedDates || [])) as string[];
        setFilterOptions({
          issuedDates,
          countries: options.countries || [],
          airlines: options.airlines || [],
        });
        if (!issuedDates.length) {
          console.warn("No valid dates found in filter options.");
          setError("No valid dates available. Check data or backend logs.");
        }
      } catch (err) {
        console.error("Error fetching filter options:", err);
        setError("Failed to load filter options.");
      }
    };
    fetchFilterOptions();
  }, [apiUrl]);

  useEffect(() => {
    const fetchData = async () => {
      if (!apiUrl) {
        setError("API URL is not configured.");
        return;
      }
      setIsLoading(true);
      try {
        const queryParams: { [key: string]: string } = {
          page: currentPage.toString(),
          pageSize: pageSize.toString(),
          country: filters.country,
          airline: filters.airline,
          searchTerm: filters.searchTerm,
        };
        if (filters.issuedDate) {
          queryParams.issuedDate = filters.issuedDate;
        }
        const query = new URLSearchParams(queryParams).toString();
        console.log("Fetching data with query:", `${apiUrl}/getSSRData1?${query}`);
        const response = await fetch(`${apiUrl}/getSSRData1?${query}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        console.log("Data response:", result);
        setData(result.data || []);
        setTotalDocs(result.totalDocs || 0);
        if (!result.data || result.data.length === 0) {
          setError("No data found for the selected filters.");
        } else {
          setError("");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data.");
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [currentPage, filters, apiUrl]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setFilters((prev) => ({ ...prev, searchTerm: "" }));
    setCurrentPage(1);
  };

  const handleExport = async () => {
    if (!filters.issuedDate || !filters.country) {
      setShowPopup(true);
      return;
    }
    if (!apiUrl) {
      setError("API URL is not configured.");
      return;
    }
    try {
      const queryParams: { [key: string]: string } = {
        country: filters.country,
        airline: filters.airline,
        searchTerm: filters.searchTerm,
      };
      if (filters.issuedDate) {
        queryParams.issuedDate = filters.issuedDate;
      }
      const query = new URLSearchParams(queryParams).toString();
      console.log("Exporting CSV with query:", `${apiUrl}/exportFilteredCSV?${query}`);
      const response = await fetch(`${apiUrl}/exportFilteredCSV?${query}`);
      if (!response.ok) {
        const errorData = await response.json();
        setError(`Failed to export CSV: ${errorData.message || "Unknown error"}`);
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "FilteredSSRData.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setError("");
    } catch (err) {
      console.error("Export error:", err);
      setError("Error occurred while exporting the CSV.");
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const totalPages = Math.ceil(totalDocs / pageSize);
  const pageNumbers = [];
  for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
    pageNumbers.push(i);
  }

  return (
    <ProtectedRoute>
      <SubpageGuard requiredAccess="dtssr">
        <div className="min-h-screen p-4 sm:p-6 md:p-8 bg-background text-black">
          <header className="mb-6">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-1">SSR Data</h1>
            <p className="font-mono text-xs sm:text-sm mb-3">View and export processed SSR data</p>
          </header>

          <div className="mb-4 flex flex-col sm:flex-row sm:flex-wrap gap-4">
            <select
              name="issuedDate"
              value={filters.issuedDate}
              onChange={handleFilterChange}
              className="px-3 py-1.5 text-xs sm:text-sm border rounded w-full sm:w-auto"
              disabled={!filterOptions.issuedDates.length}
            >
              <option value="">All Dates</option>
              {filterOptions.issuedDates.map((date, index) => (
                <option key={`${date}-${index}`} value={date}>
                  {formatDisplayDate(date)}
                </option>
              ))}
            </select>
            <select
              name="country"
              value={filters.country}
              onChange={handleFilterChange}
              className="px-3 py-1.5 text-xs sm:text-sm border rounded w-full sm:w-auto"
            >
              <option value="">All Countries</option>
              {filterOptions.countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                name="searchTerm"
                value={filters.searchTerm}
                onChange={handleFilterChange}
                placeholder="Search PNRR or Ticket Number"
                className="px-3 py-1.5 text-xs sm:text-sm border rounded w-full"
              />
              {filters.searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  <FaTimes className="h-4 w-4" />
                </button>
              )}
            </div>
            <button
              onClick={handleExport}
              className="px-3 py-1.5 text-xs sm:text-sm font-semibold text-gray-100 bg-green-600 hover:bg-green-700 rounded w-full sm:w-auto"
            >
              <FaFileDownload className="inline mr-1 h-4 w-4" /> Export
            </button>
          </div>

          {showPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-3 rounded-md shadow-md max-w-xs w-full">
                <h2 className="text-base font-semibold mb-2">Export Unavailable</h2>
                <p className="text-xs mb-3">
                  Please select both Date and Country to use the Export feature.
                </p>
                <div className="flex justify-center">
                  <button
                    onClick={handleClosePopup}
                    className="text-xs px-3 py-1.5 bg-secondary text-white rounded hover:bg-gray-600"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}


          {error && <p className="text-red-500 text-xs sm:text-sm mb-4">{error}</p>}

          <div className="overflow-x-auto">
            {/* Desktop Table View */}
            <table className="min-w-full bg-white border text-xs sm:text-sm hidden sm:table">
              <thead>
                <tr className="bg-secondary text-gray-100">
                  <th className="py-2 px-4 border-b">StationOpenDate</th>
                  <th className="py-2 px-4 border-b">StationCloseDate</th>
                  <th className="py-2 px-4 border-b">StationNo</th>
                  <th className="py-2 px-4 border-b">StationCode</th>
                  <th className="py-2 px-4 border-b">StationCurr</th>
                  <th className="py-2 px-4 border-b">CloseEmpNumber</th>
                  <th className="py-2 px-4 border-b">TransCode</th>
                  <th className="py-2 px-4 border-b">DocType</th>
                  <th className="py-2 px-4 border-b">TktInd</th>
                  <th className="py-2 px-4 border-b">TicketNumber</th>
                  <th className="py-2 px-4 border-b">PaxName</th>
                  <th className="py-2 px-4 border-b">RefundTicket</th>
                  <th className="py-2 px-4 border-b">exchTicket</th>
                  <th className="py-2 px-4 border-b">PreConjTicket</th>
                  <th className="py-2 px-4 border-b">IssuedDate</th>
                  <th className="py-2 px-4 border-b">PNRR</th>
                  <th className="py-2 px-4 border-b">AgentDie</th>
                  <th className="py-2 px-4 border-b">TourCode</th>
                  <th className="py-2 px-4 border-b">FOP</th>
                  <th className="py-2 px-4 border-b">Route1</th>
                  <th className="py-2 px-4 border-b">Route2</th>
                  <th className="py-2 px-4 border-b">Route3</th>
                  <th className="py-2 px-4 border-b">Route4</th>
                  <th className="py-2 px-4 border-b">Route5</th>
                  <th className="py-2 px-4 border-b">dateofFlight1</th>
                  <th className="py-2 px-4 border-b">dateofFlight2</th>
                  <th className="py-2 px-4 border-b">dateofFlight3</th>
                  <th className="py-2 px-4 border-b">dateofFlight4</th>
                  <th className="py-2 px-4 border-b">code1</th>
                  <th className="py-2 px-4 border-b">code2</th>
                  <th className="py-2 px-4 border-b">code3</th>
                  <th className="py-2 px-4 border-b">code4</th>
                  <th className="py-2 px-4 border-b">EMDRemark1</th>
                  <th className="py-2 px-4 border-b">EMDRemark2</th>
                  <th className="py-2 px-4 border-b">EMDRemark3</th>
                  <th className="py-2 px-4 border-b">EMDRemark4</th>
                  <th className="py-2 px-4 border-b">TktBaseFare</th>
                  <th className="py-2 px-4 border-b">TktPPN</th>
                  <th className="py-2 px-4 border-b">D8</th>
                  <th className="py-2 px-4 border-b">T6</th>
                  <th className="py-2 px-4 border-b">TktFSurcharge</th>
                  <th className="py-2 px-4 border-b">YR</th>
                  <th className="py-2 px-4 border-b">tktadm</th>
                  <th className="py-2 px-4 border-b">TktApoTax</th>
                  <th className="py-2 px-4 border-b">CalcTotal</th>
                  <th className="py-2 px-4 border-b">exbprasdesc</th>
                  <th className="py-2 px-4 border-b">country</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={51} className="py-2 px-4 text-center">
                      Loading...
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={51} className="py-2 px-4 text-center">
                      No data available
                    </td>
                  </tr>
                ) : (
                  data.map((item, index) => (
                    <tr key={item.TicketNumber || `row-${index}`} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b">{item.StationOpenDate || ""}</td>
                      <td className="py-2 px-4 border-b">{item.StationCloseDate || ""}</td>
                      <td className="py-2 px-4 border-b">{item.StationNo || ""}</td>
                      <td className="py-2 px-4 border-b">{item.StationCode || ""}</td>
                      <td className="py-2 px-4 border-b">{item.StationCurr || ""}</td>
                      <td className="py-2 px-4 border-b">{item.CloseEmpNumber || ""}</td>
                      <td className="py-2 px-4 border-b">{item.TransCode || ""}</td>
                      <td className="py-2 px-4 border-b">{item.DocType || ""}</td>
                      <td className="py-2 px-4 border-b">{item.TktInd || ""}</td>
                      <td className="py-2 px-4 border-b">{item.TicketNumber || ""}</td>
                      <td className="py-2 px-4 border-b">{item.PaxName || ""}</td>
                      <td className="py-2 px-4 border-b">{item.RefundTicket || ""}</td>
                      <td className="py-2 px-4 border-b">{item.exchTicket || ""}</td>
                      <td className="py-2 px-4 border-b">{item.PreConjTicket || ""}</td>
                      <td className="py-2 px-4 border-b">{item.IssuedDate || ""}</td>
                      <td className="py-2 px-4 border-b">{item.PNRR || ""}</td>
                      <td className="py-2 px-4 border-b">{item.AgentDie || ""}</td>
                      <td className="py-2 px-4 border-b">{item.TourCode || ""}</td>
                      <td className="py-2 px-4 border-b">{item.FOP || ""}</td>
                      <td className="py-2 px-4 border-b">{item.Route1 || ""}</td>
                      <td className="py-2 px-4 border-b">{item.Route2 || ""}</td>
                      <td className="py-2 px-4 border-b">{item.Route3 || ""}</td>
                      <td className="py-2 px-4 border-b">{item.Route4 || ""}</td>
                      <td className="py-2 px-4 border-b">{item.Route5 || ""}</td>
                      <td className="py-2 px-4 border-b">{item.dateofFlight1 || ""}</td>
                      <td className="py-2 px-4 border-b">{item.dateofFlight2 || ""}</td>
                      <td className="py-2 px-4 border-b">{item.dateofFlight3 || ""}</td>
                      <td className="py-2 px-4 border-b">{item.dateofFlight4 || ""}</td>
                      <td className="py-2 px-4 border-b">{item.code1 || ""}</td>
                      <td className="py-2 px-4 border-b">{item.code2 || ""}</td>
                      <td className="py-2 px-4 border-b">{item.code3 || ""}</td>
                      <td className="py-2 px-4 border-b">{item.code4 || ""}</td>
                      <td className="py-2 px-4 border-b">{item.EMDRemark1 || ""}</td>
                      <td className="py-2 px-4 border-b">{item.EMDRemark2 || ""}</td>
                      <td className="py-2 px-4 border-b">{item.EMDRemark3 || ""}</td>
                      <td className="py-2 px-4 border-b">{item.EMDRemark4 || ""}</td>
                      <td className="py-2 px-4 border-b">{item.TktBaseFare || ""}</td>
                      <td className="py-2 px-4 border-b">{item.TktPPN || ""}</td>
                      <td className="py-2 px-4 border-b">{item.D8 || ""}</td>
                      <td className="py-2 px-4 border-b">{item.T6 || ""}</td>
                      <td className="py-2 px-4 border-b">{item.TktFSurcharge || ""}</td>
                      <td className="py-2 px-4 border-b">{item.YR || ""}</td>
                      <td className="py-2 px-4 border-b">{item.tktadm || ""}</td>
                      <td className="py-2 px-4 border-b">{item.TktApoTax || ""}</td>
                      <td className="py-2 px-4 border-b">{item.CalcTotal || ""}</td>
                      <td className="py-2 px-4 border-b">{item.exbprasdesc || ""}</td>
                      <td className="py-2 px-4 border-b">{item.country || ""}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Mobile Card View */}
            <div className="sm:hidden space-y-4">
              {isLoading ? (
                <div className="text-center text-xs sm:text-sm">Loading...</div>
              ) : data.length === 0 ? (
                <div className="text-center text-xs sm:text-sm">No data available</div>
              ) : (
                data.map((item, index) => (
                  <div
                    key={item.TicketNumber || `row-${index}`}
                    className="border rounded-lg p-4 bg-white shadow-sm"
                  >
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      <div><strong>Ticket Number:</strong> {item.TicketNumber || ""}</div>
                      <div><strong>PNRR:</strong> {item.PNRR || ""}</div>
                      <div><strong>Pax Name:</strong> {item.PaxName || ""}</div>
                      <div><strong>Issued Date:</strong> {item.IssuedDate || ""}</div>
                      <div><strong>Country:</strong> {item.country || ""}</div>
                      <div><strong>Station Code:</strong> {item.StationCode || ""}</div>
                      <div><strong>Station Open Date:</strong> {item.StationOpenDate || ""}</div>
                      <div><strong>Station Close Date:</strong> {item.StationCloseDate || ""}</div>
                      <div><strong>Station No:</strong> {item.StationNo || ""}</div>
                      <div><strong>Station Curr:</strong> {item.StationCurr || ""}</div>
                      <div><strong>Close Emp Number:</strong> {item.CloseEmpNumber || ""}</div>
                      <div><strong>Trans Code:</strong> {item.TransCode || ""}</div>
                      <div><strong>Doc Type:</strong> {item.DocType || ""}</div>
                      <div><strong>Tkt Ind:</strong> {item.TktInd || ""}</div>
                      <div><strong>Refund Ticket:</strong> {item.RefundTicket || ""}</div>
                      <div><strong>Exch Ticket:</strong> {item.exchTicket || ""}</div>
                      <div><strong>Pre Conj Ticket:</strong> {item.PreConjTicket || ""}</div>
                      <div><strong>Agent Die:</strong> {item.AgentDie || ""}</div>
                      <div><strong>Tour Code:</strong> {item.TourCode || ""}</div>
                      <div><strong>FOP:</strong> {item.FOP || ""}</div>
                      <div><strong>Route 1:</strong> {item.Route1 || ""}</div>
                      <div><strong>Route 2:</strong> {item.Route2 || ""}</div>
                      <div><strong>Route 3:</strong> {item.Route3 || ""}</div>
                      <div><strong>Route 4:</strong> {item.Route4 || ""}</div>
                      <div><strong>Route 5:</strong> {item.Route5 || ""}</div>
                      <div><strong>Date of Flight 1:</strong> {item.dateofFlight1 || ""}</div>
                      <div><strong>Date of Flight 2:</strong> {item.dateofFlight2 || ""}</div>
                      <div><strong>Date of Flight 3:</strong> {item.dateofFlight3 || ""}</div>
                      <div><strong>Date of Flight 4:</strong> {item.dateofFlight4 || ""}</div>
                      <div><strong>Code 1:</strong> {item.code1 || ""}</div>
                      <div><strong>Code 2:</strong> {item.code2 || ""}</div>
                      <div><strong>Code 3:</strong> {item.code3 || ""}</div>
                      <div><strong>Code 4:</strong> {item.code4 || ""}</div>
                      <div><strong>EMD Remark 1:</strong> {item.EMDRemark1 || ""}</div>
                      <div><strong>EMD Remark 2:</strong> {item.EMDRemark2 || ""}</div>
                      <div><strong>EMD Remark 3:</strong> {item.EMDRemark3 || ""}</div>
                      <div><strong>EMD Remark 4:</strong> {item.EMDRemark4 || ""}</div>
                      <div><strong>Tkt Base Fare:</strong> {item.TktBaseFare || ""}</div>
                      <div><strong>Tkt PPN:</strong> {item.TktPPN || ""}</div>
                      <div><strong>D8:</strong> {item.D8 || ""}</div>
                      <div><strong>T6:</strong> {item.T6 || ""}</div>
                      <div><strong>Tkt F Surcharge:</strong> {item.TktFSurcharge || ""}</div>
                      <div><strong>YR:</strong> {item.YR || ""}</div>
                      <div><strong>Tkt Adm:</strong> {item.tktadm || ""}</div>
                      <div><strong>Tkt Apo Tax:</strong> {item.TktApoTax || ""}</div>
                      <div><strong>Calc Total:</strong> {item.CalcTotal || ""}</div>
                      <div><strong>Exbpras Desc:</strong> {item.exbprasdesc || ""}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex flex-col sm:flex-row justify-center gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs bg-secondary text-gray-100 sm:text-sm border rounded disabled:opacity-50 w-full sm:w-auto"
              >
                First
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs bg-secondary text-gray-100 sm:text-sm border rounded disabled:opacity-50 w-full sm:w-auto"
              >
                Previous
              </button>
              {pageNumbers.map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1.5 text-xs sm:text-sm border rounded w-full sm:w-auto ${
                    page === currentPage ? "bg-secondary text-gray-100" : ""
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-xs bg-secondary text-gray-100 sm:text-sm border rounded disabled:opacity-50 w-full sm:w-auto"
              >
                Next
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-xs bg-secondary text-gray-100 sm:text-sm border rounded disabled:opacity-50 w-full sm:w-auto"
              >
                Last
              </button>
            </div>
          )}
        </div>
      </SubpageGuard>
    </ProtectedRoute>
  );
}