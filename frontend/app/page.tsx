// // // // // "use client";

// // // // // import { useEffect, useState } from "react";
// // // // // import Link from "next/link";
// // // // // import ProtectedRoute from "./components/ProtectedRoute";
// // // // // // import "../../styles/globals.css";
// // // // // import { FaHistory } from "react-icons/fa";

// // // // // type DashboardRow = {
// // // // //   month: string;
// // // // //   country: string;
// // // // //   airlines: string;
// // // // //   district: string;
// // // // //   channel: string;
// // // // //   currency: string;
// // // // //   totalFare: number; // Sum of fareupdate from dashboard_orc via /api/dashboardSummary
// // // // //   count: number;
// // // // // };

// // // // // type Filters = {
// // // // //   [key: string]: string[];
// // // // // };

// // // // // type FilterKey = "month" | "country" | "airlines" | "district" | "channel" | "currency";

// // // // // type TotalByCurrency = {
// // // // //   currency: string;
// // // // //   totalFare: number;
// // // // //   totalCommission: number;
// // // // // };

// // // // // const filterKeyMap: Record<string, { key: FilterKey; field: string; label: string }> = {
// // // // //   monthFilter: { key: "month", field: "MonthFlown", label: "Month" },
// // // // //   countryFilter: { key: "country", field: "countryname", label: "Country" },
// // // // //   airlinesFilter: { key: "airlines", field: "AirlinesTKT", label: "AirlinesTKT" },
// // // // //   districtFilter: { key: "district", field: "city_code", label: "District" },
// // // // //   channelFilter: { key: "channel", field: "Channel", label: "Channel" },
// // // // //   currencyFilter: { key: "currency", field: "SalesCurrency", label: "Currency" },
// // // // // };

// // // // // export default function DashboardPage() {
// // // // //   const [data, setData] = useState<DashboardRow[]>([]);
// // // // //   const [filteredData, setFilteredData] = useState<DashboardRow[]>([]);
// // // // //   const [filters, setFilters] = useState<Filters>({});
// // // // //   const [filterValues, setFilterValues] = useState<Record<FilterKey, string>>({
// // // // //     month: "",
// // // // //     country: "",
// // // // //     airlines: "",
// // // // //     district: "",
// // // // //     channel: "",
// // // // //     currency: "",
// // // // //   });
// // // // //   const [error, setError] = useState<string | null>(null);

// // // // //   useEffect(() => {
// // // // //     const fetchData = async () => {
// // // // //       try {
// // // // //         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboardSummary`);
// // // // //         if (!response.ok) {
// // // // //           throw new Error(`HTTP error: ${response.status}`);
// // // // //         }
// // // // //         const result = await response.json();
// // // // //         if (!result.success) {
// // // // //           throw new Error(result.message);
// // // // //         }
// // // // //         console.log("API Data:", result.data);
// // // // //         // Validate data is an array
// // // // //         const validatedData = Array.isArray(result.data) ? result.data : [];
// // // // //         setData(validatedData);
// // // // //         setFilteredData(validatedData);
// // // // //         setFilters(result.filters || {});
// // // // //         setError(null);
// // // // //       } catch (err) {
// // // // //         console.error("Error fetching dashboard data:", err);
// // // // //         setError("Failed to load dashboard data. Please try again.");
// // // // //         setData([]);
// // // // //         setFilteredData([]);
// // // // //       }
// // // // //     };
// // // // //     fetchData();
// // // // //   }, []);

// // // // //   useEffect(() => {
// // // // //     const newFilteredData = data.filter((row) =>
// // // // //       (filterValues.month === "" || row.month === filterValues.month) &&
// // // // //       (filterValues.country === "" || row.country === filterValues.country) &&
// // // // //       (filterValues.airlines === "" || row.airlines === filterValues.airlines) &&
// // // // //       (filterValues.district === "" || row.district === filterValues.district) &&
// // // // //       (filterValues.channel === "" || row.channel === filterValues.channel) &&
// // // // //       (filterValues.currency === "" || row.currency === filterValues.currency)
// // // // //     );
// // // // //     setFilteredData(newFilteredData);
// // // // //   }, [data, filterValues]);

// // // // //   const handleFilterChange = (field: FilterKey, value: string) => {
// // // // //     setFilterValues((prev) => ({ ...prev, [field]: value }));
// // // // //   };

// // // // //   const computeTotals = (): TotalByCurrency[] => {
// // // // //     const totals = filteredData.reduce((acc, row) => {
// // // // //       const fare = typeof row.totalFare === "number" && !isNaN(row.totalFare) ? row.totalFare : 0;
// // // // //       const commission = fare * 0.02;
// // // // //       if (!acc[row.currency]) {
// // // // //         acc[row.currency] = { currency: row.currency, totalFare: 0, totalCommission: 0 };
// // // // //       }
// // // // //       acc[row.currency].totalFare += fare;
// // // // //       acc[row.currency].totalCommission += commission;
// // // // //       return acc;
// // // // //     }, {} as Record<string, TotalByCurrency>);
// // // // //     return Object.values(totals).sort((a, b) => a.currency.localeCompare(b.currency));
// // // // //   };

// // // // //   return (
// // // // //     <ProtectedRoute>
// // // // //       <div className="min-h-screen bg-background text-black p-4">
// // // // //         <header className="mb-4">
// // // // //           <h1 className="text-xl font-bold mb-1 flex justify-between items-center">
// // // // //             Airlines Dashboard
// // // // //             <Link
// // // // //               className="px-3 py-1 bg-secondary text-gray-100 font-mono rounded-md hover:bg-secondary transition"
// // // // //               href="/log-history"
// // // // //             >
// // // // //               <FaHistory className="inline mr-1" /> Log History
// // // // //             </Link>
// // // // //           </h1>
// // // // //           <p className="font-mono text-xs text-black-100">Summary of ticket data from dashboard_orc</p>
// // // // //         </header>

// // // // //         <div className="max-w-7xl mx-auto border border-black rounded-lg p-4 bg-background shadow-lg">
// // // // //           {error ? (
// // // // //             <p className="text-red-500 text-center">{error}</p>
// // // // //           ) : (
// // // // //             <>
// // // // //               <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
// // // // //                 {Object.entries(filterKeyMap).map(([id, { key, field, label }]) => (
// // // // //                   <div key={id}>
// // // // //                     <label htmlFor={id} className="block text-sm font-medium text-black">
// // // // //                       {label}
// // // // //                     </label>
// // // // //                     <select
// // // // //                       id={id}
// // // // //                       className="w-full p-2 border rounded-md"
// // // // //                       value={filterValues[key]}
// // // // //                       onChange={(e) => handleFilterChange(key, e.target.value)}
// // // // //                     >
// // // // //                       <option value="">All</option>
// // // // //                       {filters[field]?.sort().map((value: string) => (
// // // // //                         <option key={value} value={value}>
// // // // //                           {value}
// // // // //                         </option>
// // // // //                       ))}
// // // // //                     </select>
// // // // //                   </div>
// // // // //                 ))}
// // // // //               </div>

// // // // //               <div className="overflow-x-auto mb-6">
// // // // //                 <table className="w-full border-collapse">
// // // // //                   <thead>
// // // // //                     <tr className="bg-secondary text-gray-100">
// // // // //                       <th className="p-3 text-left text-sm font-semibold">Month</th>
// // // // //                       <th className="p-3 text-left text-sm font-semibold">Country</th>
// // // // //                       <th className="p-3 text-left text-sm font-semibold">AirlinesTKT</th>
// // // // //                       <th className="p-3 text-left text-sm font-semibold">District</th>
// // // // //                       <th className="p-3 text-left text-sm font-semibold">Channel</th>
// // // // //                       <th className="p-3 text-left text-sm font-semibold">Currency</th>
// // // // //                       <th className="p-3 text-right text-sm font-semibold">Fare</th>
// // // // //                       <th className="p-3 text-right text-sm font-semibold">Rate (2%) Commission</th>
// // // // //                     </tr>
// // // // //                   </thead>
// // // // //                   <tbody>
// // // // //                     {Array.isArray(filteredData) && filteredData.length > 0 ? (
// // // // //                       filteredData.map((row, index) => {
// // // // //                         const fare = typeof row.totalFare === "number" && !isNaN(row.totalFare) ? row.totalFare : 0;
// // // // //                         const commission = fare * 0.02;
// // // // //                         console.log(`Row ${index} totalFare:`, row.totalFare);
// // // // //                         return (
// // // // //                           <tr key={index} className={index % 2 === 0 ? "bg-background" : "bg-primary/10"}>
// // // // //                             <td className="p-3 text-sm">{row.month}</td>
// // // // //                             <td className="p-3 text-sm">{row.country}</td>
// // // // //                             <td className="p-3 text-sm">{row.airlines}</td>
// // // // //                             <td className="p-3 text-sm">{row.district}</td>
// // // // //                             <td className="p-3 text-sm">{row.channel}</td>
// // // // //                             <td className="p-3 text-sm">{row.currency}</td>
// // // // //                             <td className="p-3 text-right text-sm">{fare.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
// // // // //                             <td className="p-3 text-right text-sm">{commission.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
// // // // //                           </tr>
// // // // //                         );
// // // // //                       })
// // // // //                     ) : (
// // // // //                       <tr>
// // // // //                         <td colSpan={8} className="p-3 text-center text-gray-600">
// // // // //                           No data available
// // // // //                         </td>
// // // // //                       </tr>
// // // // //                     )}
// // // // //                   </tbody>
// // // // //                 </table>
// // // // //               </div>

// // // // //               {Array.isArray(filteredData) && filteredData.length > 0 && (
// // // // //                 <div className="overflow-x-auto">
// // // // //                   <table className="w-full border-collapse">
// // // // //                     <thead>
// // // // //                       <tr className="bg-secondary text-gray-100">
// // // // //                         <th className="p-3 text-left text-sm font-semibold">Total</th>
// // // // //                         <th colSpan={4} className="p-3"></th>
// // // // //                         <th className="p-3 text-left text-sm font-semibold">Currency</th>
// // // // //                         <th className="p-3 text-right text-sm font-semibold">Fare</th>
// // // // //                         <th className="p-3 text-right text-sm font-semibold">Rate (2%) Commission</th>
// // // // //                       </tr>
// // // // //                     </thead>
// // // // //                     <tbody>
// // // // //                       {computeTotals().map((total, index) => (
// // // // //                         <tr key={index} className={index % 2 === 0 ? "bg-background" : "bg-primary/10"}>
// // // // //                           <td className="p-3 text-sm font-bold">TOTAL {total.currency}</td>
// // // // //                           <td colSpan={4} className="p-3"></td>
// // // // //                           <td className="p-3 text-sm">{total.currency}</td>
// // // // //                           <td className="p-3 text-right text-sm">{total.totalFare.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
// // // // //                           <td className="p-3 text-right text-sm">{total.totalCommission.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
// // // // //                         </tr>
// // // // //                       ))}
// // // // //                     </tbody>
// // // // //                   </table>
// // // // //                 </div>
// // // // //               )}
// // // // //             </>
// // // // //           )}
// // // // //         </div>
// // // // //       </div>
// // // // //     </ProtectedRoute>
// // // // //   );
// // // // // }

// // // // "use client";

// // // // import { useEffect, useState } from "react";
// // // // import Link from "next/link";
// // // // import ProtectedRoute from "./components/ProtectedRoute";
// // // // // import "../../styles/globals.css";
// // // // import { FaHistory, FaSync } from "react-icons/fa";

// // // // type DashboardRow = {
// // // //   month: string;
// // // //   country: string;
// // // //   airlines: string;
// // // //   district: string;
// // // //   channel: string;
// // // //   currency: string;
// // // //   totalFare: number; // Sum of fareupdate from dashboard_orc via /api/dashboardSummary
// // // //   count: number;
// // // // };

// // // // type Filters = {
// // // //   [key: string]: string[];
// // // // };

// // // // type FilterKey = "month" | "country" | "airlines" | "district" | "channel" | "currency";

// // // // type TotalByCurrency = {
// // // //   currency: string;
// // // //   totalFare: number;
// // // //   totalCommission: number;
// // // // };

// // // // const filterKeyMap: Record<string, { key: FilterKey; field: string; label: string }> = {
// // // //   monthFilter: { key: "month", field: "MonthFlown", label: "Month" },
// // // //   countryFilter: { key: "country", field: "countryname", label: "Country" },
// // // //   airlinesFilter: { key: "airlines", field: "AirlinesTKT", label: "AirlinesTKT" },
// // // //   districtFilter: { key: "district", field: "city_code", label: "District" },
// // // //   channelFilter: { key: "channel", field: "Channel", label: "Channel" },
// // // //   currencyFilter: { key: "currency", field: "SalesCurrency", label: "Currency" },
// // // // };

// // // // export default function DashboardPage() {
// // // //   const [data, setData] = useState<DashboardRow[]>([]);
// // // //   const [filteredData, setFilteredData] = useState<DashboardRow[]>([]);
// // // //   const [filters, setFilters] = useState<Filters>({});
// // // //   const [filterValues, setFilterValues] = useState<Record<FilterKey, string>>({
// // // //     month: "",
// // // //     country: "",
// // // //     airlines: "",
// // // //     district: "",
// // // //     channel: "",
// // // //     currency: "",
// // // //   });
// // // //   const [error, setError] = useState<string | null>(null);
// // // //   const [isLoading, setIsLoading] = useState(false);

// // // //   const fetchData = async () => {
// // // //     setIsLoading(true);
// // // //     try {
// // // //       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboardSummary`);
// // // //       if (!response.ok) {
// // // //         throw new Error(`HTTP error: ${response.status}`);
// // // //       }
// // // //       const result = await response.json();
// // // //       if (!result.success) {
// // // //         throw new Error(result.message || "Failed to fetch dashboard summary");
// // // //       }
// // // //       console.log("API Data:", result.data);
// // // //       const validatedData = Array.isArray(result.data) ? result.data : [];
// // // //       setData(validatedData);
// // // //       setFilteredData(validatedData);
// // // //       setFilters(result.filters || {});
// // // //       setError(null);
// // // //     } catch (err) {
// // // //       console.error("Error fetching dashboard data:", err);
// // // //       setError(`Failed to load dashboard data: ${err.message}. Please try again.`);
// // // //       setData([]);
// // // //       setFilteredData([]);
// // // //     } finally {
// // // //       setIsLoading(false);
// // // //     }
// // // //   };

// // // //   useEffect(() => {
// // // //     fetchData();
// // // //   }, []);

// // // //   useEffect(() => {
// // // //     const newFilteredData = data.filter((row) =>
// // // //       (filterValues.month === "" || row.month === filterValues.month) &&
// // // //       (filterValues.country === "" || row.country === filterValues.country) &&
// // // //       (filterValues.airlines === "" || row.airlines === filterValues.airlines) &&
// // // //       (filterValues.district === "" || row.district === filterValues.district) &&
// // // //       (filterValues.channel === "" || row.channel === filterValues.channel) &&
// // // //       (filterValues.currency === "" || row.currency === filterValues.currency)
// // // //     );
// // // //     console.log("Applied Filters:", filterValues, "Filtered Data Length:", newFilteredData.length);
// // // //     setFilteredData(newFilteredData);
// // // //   }, [data, filterValues]);

// // // //   const handleFilterChange = (field: FilterKey, value: string) => {
// // // //     setFilterValues((prev) => ({ ...prev, [field]: value }));
// // // //   };

// // // //   const computeTotals = (): TotalByCurrency[] => {
// // // //     const totals = filteredData.reduce((acc, row) => {
// // // //       const fare = typeof row.totalFare === "number" && !isNaN(row.totalFare) ? row.totalFare : 0;
// // // //       const commission = fare * 0.02;
// // // //       if (!acc[row.currency]) {
// // // //         acc[row.currency] = { currency: row.currency, totalFare: 0, totalCommission: 0 };
// // // //       }
// // // //       acc[row.currency].totalFare += fare;
// // // //       acc[row.currency].totalCommission += commission;
// // // //       return acc;
// // // //     }, {} as Record<string, TotalByCurrency>);
// // // //     return Object.values(totals).sort((a, b) => a.currency.localeCompare(b.currency));
// // // //   };

// // // //   return (
// // // //     <ProtectedRoute>
// // // //       <div className="min-h-screen bg-background text-black p-4">
// // // //         <header className="mb-4">
// // // //           <h1 className="text-xl font-bold mb-1 flex justify-between items-center">
// // // //             Airlines Dashboard
// // // //             <div>
// // // //               <button
// // // //                 onClick={fetchData}
// // // //                 disabled={isLoading}
// // // //                 className="px-3 py-1 bg-blue-500 text-gray-100 font-mono rounded-md hover:bg-blue-600 transition mr-2 disabled:opacity-50"
// // // //               >
// // // //                 <FaSync className={`inline mr-1 ${isLoading ? "animate-spin" : ""}`} /> Refresh
// // // //               </button>
// // // //               <Link
// // // //                 className="px-3 py-1 bg-secondary text-gray-100 font-mono rounded-md hover:bg-secondary transition"
// // // //                 href="/log-history"
// // // //               >
// // // //                 <FaHistory className="inline mr-1" /> Log History
// // // //               </Link>
// // // //             </div>
// // // //           </h1>
// // // //           <p className="font-mono text-xs text-black-100">Summary of ticket data from dashboard_orc</p>
// // // //         </header>

// // // //         <div className="max-w-7xl mx-auto border border-black rounded-lg p-4 bg-background shadow-lg">
// // // //           {error ? (
// // // //             <div className="text-red-500 text-center p-4 bg-red-100 rounded-md">
// // // //               <p>{error}</p>
// // // //               <button
// // // //                 onClick={fetchData}
// // // //                 disabled={isLoading}
// // // //                 className="mt-2 px-3 py-1 bg-blue-500 text-gray-100 font-mono rounded-md hover:bg-blue-600 transition disabled:opacity-50"
// // // //               >
// // // //                 <FaSync className={`inline mr-1 ${isLoading ? "animate-spin" : ""}`} /> Try Again
// // // //               </button>
// // // //             </div>
// // // //           ) : (
// // // //             <>
// // // //               <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
// // // //                 {Object.entries(filterKeyMap).map(([id, { key, field, label }]) => (
// // // //                   <div key={id}>
// // // //                     <label htmlFor={id} className="block text-sm font-medium text-black">
// // // //                       {label}
// // // //                     </label>
// // // //                     <select
// // // //                       id={id}
// // // //                       className="w-full p-2 border rounded-md"
// // // //                       value={filterValues[key]}
// // // //                       onChange={(e) => handleFilterChange(key, e.target.value)}
// // // //                     >
// // // //                       <option value="">All</option>
// // // //                       {filters[field]?.sort().map((value: string) => (
// // // //                         <option key={value} value={value}>
// // // //                           {value}
// // // //                         </option>
// // // //                       ))}
// // // //                     </select>
// // // //                   </div>
// // // //                 ))}
// // // //               </div>

// // // //               <div className="overflow-x-auto mb-6">
// // // //                 <table className="w-full border-collapse">
// // // //                   <thead>
// // // //                     <tr className="bg-secondary text-gray-100">
// // // //                       <th className="p-3 text-left text-sm font-semibold">Month</th>
// // // //                       <th className="p-3 text-left text-sm font-semibold">Country</th>
// // // //                       <th className="p-3 text-left text-sm font-semibold">AirlinesTKT</th>
// // // //                       <th className="p-3 text-left text-sm font-semibold">District</th>
// // // //                       <th className="p-3 text-left text-sm font-semibold">Channel</th>
// // // //                       <th className="p-3 text-left text-sm font-semibold">Currency</th>
// // // //                       <th className="p-3 text-right text-sm font-semibold">Fare</th>
// // // //                       <th className="p-3 text-right text-sm font-semibold">Rate (2%) Commission</th>
// // // //                     </tr>
// // // //                   </thead>
// // // //                   <tbody>
// // // //                     {Array.isArray(filteredData) && filteredData.length > 0 ? (
// // // //                       filteredData.map((row, index) => {
// // // //                         const fare = typeof row.totalFare === "number" && !isNaN(row.totalFare) ? row.totalFare : 0;
// // // //                         const commission = fare * 0.02;
// // // //                         console.log(`Row ${index} totalFare:`, row.totalFare);
// // // //                         return (
// // // //                           <tr key={index} className={index % 2 === 0 ? "bg-background" : "bg-primary/10"}>
// // // //                             <td className="p-3 text-sm">{row.month}</td>
// // // //                             <td className="p-3 text-sm">{row.country}</td>
// // // //                             <td className="p-3 text-sm">{row.airlines}</td>
// // // //                             <td className="p-3 text-sm">{row.district}</td>
// // // //                             <td className="p-3 text-sm">{row.channel}</td>
// // // //                             <td className="p-3 text-sm">{row.currency}</td>
// // // //                             <td className="p-3 text-right text-sm">{fare.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
// // // //                             <td className="p-3 text-right text-sm">{commission.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
// // // //                           </tr>
// // // //                         );
// // // //                       })
// // // //                     ) : (
// // // //                       <tr>
// // // //                         <td colSpan={8} className="p-3 text-center text-gray-600">
// // // //                           No data available. Try adjusting filters or refreshing the data.
// // // //                         </td>
// // // //                       </tr>
// // // //                     )}
// // // //                   </tbody>
// // // //                 </table>
// // // //               </div>

// // // //               {Array.isArray(filteredData) && filteredData.length > 0 && (
// // // //                 <div className="overflow-x-auto">
// // // //                   <table className="w-full border-collapse">
// // // //                     <thead>
// // // //                       <tr className="bg-secondary text-gray-100">
// // // //                         <th className="p-3 text-left text-sm font-semibold">Total</th>
// // // //                         <th colSpan={4} className="p-3"></th>
// // // //                         <th className="p-3 text-left text-sm font-semibold">Currency</th>
// // // //                         <th className="p-3 text-right text-sm font-semibold">Fare</th>
// // // //                         <th className="p-3 text-right text-sm font-semibold">Rate (2%) Commission</th>
// // // //                       </tr>
// // // //                     </thead>
// // // //                     <tbody>
// // // //                       {computeTotals().map((total, index) => (
// // // //                         <tr key={index} className={index % 2 === 0 ? "bg-background" : "bg-primary/10"}>
// // // //                           <td className="p-3 text-sm font-bold">TOTAL {total.currency}</td>
// // // //                           <td colSpan={4} className="p-3"></td>
// // // //                           <td className="p-3 text-sm">{total.currency}</td>
// // // //                           <td className="p-3 text-right text-sm">{total.totalFare.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
// // // //                           <td className="p-3 text-right text-sm">{total.totalCommission.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
// // // //                         </tr>
// // // //                       ))}
// // // //                     </tbody>
// // // //                   </table>
// // // //                 </div>
// // // //               )}
// // // //             </>
// // // //           )}
// // // //         </div>
// // // //       </div>
// // // //     </ProtectedRoute>
// // // //   );
// // // // }

// // // // "use client";

// // // // import { useEffect, useState } from "react";
// // // // import Link from "next/link";
// // // // import ProtectedRoute from "./components/ProtectedRoute";
// // // // // import "../../styles/globals.css";
// // // // import { FaHistory, FaSync } from "react-icons/fa";

// // // // type DashboardRow = {
// // // //   month: string;
// // // //   country: string;
// // // //   airlines: string;
// // // //   district: string;
// // // //   channel: string;
// // // //   currency: string;
// // // //   totalFare: number; // Sum of fareupdate from dashboard_orc via /api/dashboardSummary
// // // //   count: number;
// // // // };

// // // // type Filters = {
// // // //   [key: string]: string[];
// // // // };

// // // // type FilterKey = "month" | "country" | "airlines" | "district" | "channel" | "currency";

// // // // type TotalByCurrency = {
// // // //   currency: string;
// // // //   totalFare: number;
// // // //   totalCommission: number;
// // // // };

// // // // const filterKeyMap: Record<string, { key: FilterKey; field: string; label: string }> = {
// // // //   monthFilter: { key: "month", field: "MonthFlown", label: "Month" },
// // // //   countryFilter: { key: "country", field: "countryname", label: "Country" },
// // // //   airlinesFilter: { key: "airlines", field: "AirlinesTKT", label: "AirlinesTKT" },
// // // //   districtFilter: { key: "district", field: "city_code", label: "District" },
// // // //   channelFilter: { key: "channel", field: "Channel", label: "Channel" },
// // // //   currencyFilter: { key: "currency", field: "SalesCurrency", label: "Currency" },
// // // // };

// // // // export default function DashboardPage() {
// // // //   const [data, setData] = useState<DashboardRow[]>([]);
// // // //   const [filteredData, setFilteredData] = useState<DashboardRow[]>([]);
// // // //   const [filters, setFilters] = useState<Filters>({});
// // // //   const [filterValues, setFilterValues] = useState<Record<FilterKey, string>>({
// // // //     month: "",
// // // //     country: "",
// // // //     airlines: "",
// // // //     district: "",
// // // //     channel: "",
// // // //     currency: "",
// // // //   });
// // // //   const [error, setError] = useState<string | null>(null);
// // // //   const [isLoading, setIsLoading] = useState(false);

// // // //   const fetchData = async () => {
// // // //     setIsLoading(true);
// // // //     try {
// // // //       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboardSummary`);
// // // //       if (!response.ok) {
// // // //         throw new Error(`HTTP error: ${response.status}`);
// // // //       }
// // // //       const result = await response.json();
// // // //       if (!result.success) {
// // // //         throw new Error(result.message || "Failed to fetch dashboard summary");
// // // //       }
// // // //       console.log("API Data:", result.data);
// // // //       const validatedData = Array.isArray(result.data) ? result.data : [];
// // // //       setData(validatedData);
// // // //       setFilteredData(validatedData);
// // // //       setFilters(result.filters || {});
// // // //       setError(null);
// // // //     } catch (err) {
// // // //       console.error("Error fetching dashboard data:", err);
// // // //       // Cast or narrow err to Error
// // // //       const errorMessage = err instanceof Error ? err.message : String(err);
// // // //       setError(`Failed to load dashboard data: ${errorMessage}. Please try again.`);
// // // //       setData([]);
// // // //       setFilteredData([]);
// // // //     } finally {
// // // //       setIsLoading(false);
// // // //     }
// // // //   };

// // // //   useEffect(() => {
// // // //     fetchData();
// // // //   }, []);

// // // //   useEffect(() => {
// // // //     const newFilteredData = data.filter((row) =>
// // // //       (filterValues.month === "" || row.month === filterValues.month) &&
// // // //       (filterValues.country === "" || row.country === filterValues.country) &&
// // // //       (filterValues.airlines === "" || row.airlines === filterValues.airlines) &&
// // // //       (filterValues.district === "" || row.district === filterValues.district) &&
// // // //       (filterValues.channel === "" || row.channel === filterValues.channel) &&
// // // //       (filterValues.currency === "" || row.currency === filterValues.currency)
// // // //     );
// // // //     console.log("Applied Filters:", filterValues, "Filtered Data Length:", newFilteredData.length);
// // // //     setFilteredData(newFilteredData);
// // // //   }, [data, filterValues]);

// // // //   const handleFilterChange = (field: FilterKey, value: string) => {
// // // //     setFilterValues((prev) => ({ ...prev, [field]: value }));
// // // //   };

// // // //   const computeTotals = (): TotalByCurrency[] => {
// // // //     const totals = filteredData.reduce((acc, row) => {
// // // //       const fare = typeof row.totalFare === "number" && !isNaN(row.totalFare) ? row.totalFare : 0;
// // // //       const commission = fare * 0.02;
// // // //       if (!acc[row.currency]) {
// // // //         acc[row.currency] = { currency: row.currency, totalFare: 0, totalCommission: 0 };
// // // //       }
// // // //       acc[row.currency].totalFare += fare;
// // // //       acc[row.currency].totalCommission += commission;
// // // //       return acc;
// // // //     }, {} as Record<string, TotalByCurrency>);
// // // //     return Object.values(totals).sort((a, b) => a.currency.localeCompare(b.currency));
// // // //   };

// // // //   return (
// // // //     <ProtectedRoute>
// // // //       <div className="min-h-screen bg-background text-black p-4">
// // // //         <header className="mb-4">
// // // //           <h1 className="text-xl font-bold mb-1 flex justify-between items-center">
// // // //             Airlines Dashboard
// // // //             <div>
// // // //               <button
// // // //                 onClick={fetchData}
// // // //                 disabled={isLoading}
// // // //                 className="px-3 py-1 bg-blue-800 text-gray-100 font-mono rounded-md hover:bg-blue-900 transition mr-2 disabled:opacity-50"
// // // //               >
// // // //                 <FaSync className={`inline mr-1 ${isLoading ? "animate-spin" : ""}`} /> Refresh
// // // //               </button>
// // // //               <Link
// // // //                 className="px-3 py-1 bg-secondary text-gray-100 font-mono rounded-md hover:bg-secondary transition"
// // // //                 href="/log-history"
// // // //               >
// // // //                 <FaHistory className="inline mr-1" /> Log History
// // // //               </Link>
// // // //             </div>
// // // //           </h1>
// // // //           <p className="font-mono text-xs text-black-100">Summary of ticket data from dashboard_orc</p>
// // // //         </header>

// // // //         <div className="max-w-7xl mx-auto border border-black rounded-lg p-4 bg-background shadow-lg">
// // // //           {error ? (
// // // //             <div className="text-red-500 text-center p-4 bg-red-100 rounded-md">
// // // //               <p>{error}</p>
// // // //               <button
// // // //                 onClick={fetchData}
// // // //                 disabled={isLoading}
// // // //                 className="mt-2 px-3 py-1 bg-blue-500 text-gray-100 font-mono rounded-md hover:bg-blue-600 transition disabled:opacity-50"
// // // //               >
// // // //                 <FaSync className={`inline mr-1 ${isLoading ? "animate-spin" : ""}`} /> Try Again
// // // //               </button>
// // // //             </div>
// // // //           ) : (
// // // //             <>
// // // //               <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
// // // //                 {Object.entries(filterKeyMap).map(([id, { key, field, label }]) => (
// // // //                   <div key={id}>
// // // //                     <label htmlFor={id} className="block text-sm font-medium text-black">
// // // //                       {label}
// // // //                     </label>
// // // //                     <select
// // // //                       id={id}
// // // //                       className="w-full p-2 border rounded-md"
// // // //                       value={filterValues[key]}
// // // //                       onChange={(e) => handleFilterChange(key, e.target.value)}
// // // //                     >
// // // //                       <option value="">All</option>
// // // //                       {filters[field]?.sort().map((value: string) => (
// // // //                         <option key={value} value={value}>
// // // //                           {value}
// // // //                         </option>
// // // //                       ))}
// // // //                     </select>
// // // //                   </div>
// // // //                 ))}
// // // //               </div>

// // // //               <div className="overflow-x-auto mb-6">
// // // //                 <table className="w-full border-collapse">
// // // //                   <thead>
// // // //                     <tr className="bg-secondary text-gray-100">
// // // //                       <th className="p-3 text-left text-sm font-semibold">Month</th>
// // // //                       <th className="p-3 text-left text-sm font-semibold">Country</th>
// // // //                       <th className="p-3 text-left text-sm font-semibold">AirlinesTKT</th>
// // // //                       <th className="p-3 text-left text-sm font-semibold">District</th>
// // // //                       <th className="p-3 text-left text-sm font-semibold">Channel</th>
// // // //                       <th className="p-3 text-left text-sm font-semibold">Currency</th>
// // // //                       <th className="p-3 text-right text-sm font-semibold">Fare</th>
// // // //                       <th className="p-3 text-right text-sm font-semibold">Rate (2%) Commission</th>
// // // //                     </tr>
// // // //                   </thead>
// // // //                   <tbody>
// // // //                     {Array.isArray(filteredData) && filteredData.length > 0 ? (
// // // //                       filteredData.map((row, index) => {
// // // //                         const fare = typeof row.totalFare === "number" && !isNaN(row.totalFare) ? row.totalFare : 0;
// // // //                         const commission = fare * 0.02;
// // // //                         console.log(`Row ${index} totalFare:`, row.totalFare);
// // // //                         return (
// // // //                           <tr key={index} className={index % 2 === 0 ? "bg-background" : "bg-primary/10"}>
// // // //                             <td className="p-3 text-sm">{row.month}</td>
// // // //                             <td className="p-3 text-sm">{row.country}</td>
// // // //                             <td className="p-3 text-sm">{row.airlines}</td>
// // // //                             <td className="p-3 text-sm">{row.district}</td>
// // // //                             <td className="p-3 text-sm">{row.channel}</td>
// // // //                             <td className="p-3 text-sm">{row.currency}</td>
// // // //                             <td className="p-3 text-right text-sm">{fare.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
// // // //                             <td className="p-3 text-right text-sm">{commission.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
// // // //                           </tr>
// // // //                         );
// // // //                       })
// // // //                     ) : (
// // // //                       <tr>
// // // //                         <td colSpan={8} className="p-3 text-center text-gray-600">
// // // //                           No data available. Try adjusting filters or refreshing the data.
// // // //                         </td>
// // // //                       </tr>
// // // //                     )}
// // // //                   </tbody>
// // // //                 </table>
// // // //               </div>

// // // //               {Array.isArray(filteredData) && filteredData.length > 0 && (
// // // //                 <div className="overflow-x-auto">
// // // //                   <table className="w-full border-collapse">
// // // //                     <thead>
// // // //                       <tr className="bg-secondary text-gray-100">
// // // //                         <th className="p-3 text-left text-sm font-semibold">Total</th>
// // // //                         <th colSpan={4} className="p-3"></th>
// // // //                         <th className="p-3 text-left text-sm font-semibold">Currency</th>
// // // //                         <th className="p-3 text-right text-sm font-semibold">Fare</th>
// // // //                         <th className="p-3 text-right text-sm font-semibold">Rate (2%) Commission</th>
// // // //                       </tr>
// // // //                     </thead>
// // // //                     <tbody>
// // // //                       {computeTotals().map((total, index) => (
// // // //                         <tr key={index} className={index % 2 === 0 ? "bg-background" : "bg-primary/10"}>
// // // //                           <td className="p-3 text-sm font-bold">TOTAL {total.currency}</td>
// // // //                           <td colSpan={4} className="p-3"></td>
// // // //                           <td className="p-3 text-sm">{total.currency}</td>
// // // //                           <td className="p-3 text-right text-sm">{total.totalFare.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
// // // //                           <td className="p-3 text-right text-sm">{total.totalCommission.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
// // // //                         </tr>
// // // //                       ))}
// // // //                     </tbody>
// // // //                   </table>
// // // //                 </div>
// // // //               )}
// // // //             </>
// // // //           )}
// // // //         </div>
// // // //       </div>
// // // //     </ProtectedRoute>
// // // //   );
// // // // }

// // // // //last iteration working.
// // // // "use client";

// // // // import { useEffect, useState } from "react";
// // // // import Link from "next/link";
// // // // import ProtectedRoute from "./components/ProtectedRoute";
// // // // // import "../../styles/globals.css"; // Uncommented to ensure styling
// // // // import { FaHistory, FaSync } from "react-icons/fa";

// // // // type DashboardRow = {
// // // //   month: string; // Now "MonthFlown YearFlown", e.g., "April 2024"
// // // //   country: string;
// // // //   airlines: string;
// // // //   district: string;
// // // //   channel: string;
// // // //   currency: string;
// // // //   totalFare: number;
// // // //   count: number;
// // // // };

// // // // type Filters = {
// // // //   [key: string]: string[];
// // // // };

// // // // type FilterKey = "month" | "country" | "airlines" | "district" | "channel" | "currency";

// // // // type TotalByCurrency = {
// // // //   currency: string;
// // // //   totalFare: number;
// // // //   totalCommission: number;
// // // // };

// // // // const filterKeyMap: Record<string, { key: FilterKey; field: string; label: string }> = {
// // // //   monthFilter: { key: "month", field: "MonthFlown", label: "Month-Year" }, // Updated label
// // // //   countryFilter: { key: "country", field: "countryname", label: "Country" },
// // // //   airlinesFilter: { key: "airlines", field: "AirlinesTKT", label: "AirlinesTKT" },
// // // //   districtFilter: { key: "district", field: "city_code", label: "District" },
// // // //   channelFilter: { key: "channel", field: "Channel", label: "Channel" },
// // // //   currencyFilter: { key: "currency", field: "SalesCurrency", label: "Currency" },
// // // // };

// // // // export default function DashboardPage() {
// // // //   const [data, setData] = useState<DashboardRow[]>([]);
// // // //   const [filteredData, setFilteredData] = useState<DashboardRow[]>([]);
// // // //   const [filters, setFilters] = useState<Filters>({});
// // // //   const [filterValues, setFilterValues] = useState<Record<FilterKey, string>>({
// // // //     month: "",
// // // //     country: "",
// // // //     airlines: "",
// // // //     district: "",
// // // //     channel: "",
// // // //     currency: "",
// // // //   });
// // // //   const [error, setError] = useState<string | null>(null);
// // // //   const [isLoading, setIsLoading] = useState(false);

// // // //   const fetchData = async () => {
// // // //     setIsLoading(true);
// // // //     try {
// // // //       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboardSummary`);
// // // //       if (!response.ok) {
// // // //         throw new Error(`HTTP error: ${response.status}`);
// // // //       }
// // // //       const result = await response.json();
// // // //       if (!result.success) {
// // // //         throw new Error(result.message || "Failed to fetch dashboard summary");
// // // //       }
// // // //       console.log("API Data:", result.data);
// // // //       const validatedData = Array.isArray(result.data) ? result.data : [];
// // // //       setData(validatedData);
// // // //       setFilteredData(validatedData);
// // // //       setFilters(result.filters || {});
// // // //       setError(null);
// // // //     } catch (err) {
// // // //       console.error("Error fetching dashboard data:", err);
// // // //       const errorMessage = err instanceof Error ? err.message : String(err);
// // // //       setError(`Failed to load dashboard data: ${errorMessage}. Please try again.`);
// // // //       setData([]);
// // // //       setFilteredData([]);
// // // //     } finally {
// // // //       setIsLoading(false);
// // // //     }
// // // //   };

// // // //   useEffect(() => {
// // // //     fetchData();
// // // //   }, []);

// // // //   useEffect(() => {
// // // //     const newFilteredData = data.filter((row) =>
// // // //       (filterValues.month === "" || row.month === filterValues.month) &&
// // // //       (filterValues.country === "" || row.country === filterValues.country) &&
// // // //       (filterValues.airlines === "" || row.airlines === filterValues.airlines) &&
// // // //       (filterValues.district === "" || row.district === filterValues.district) &&
// // // //       (filterValues.channel === "" || row.channel === filterValues.channel) &&
// // // //       (filterValues.currency === "" || row.currency === filterValues.currency)
// // // //     );
// // // //     console.log("Applied Filters:", filterValues, "Filtered Data Length:", newFilteredData.length);
// // // //     setFilteredData(newFilteredData);
// // // //   }, [data, filterValues]);

// // // //   const handleFilterChange = (field: FilterKey, value: string) => {
// // // //     setFilterValues((prev) => ({ ...prev, [field]: value }));
// // // //   };

// // // //   const computeTotals = (): TotalByCurrency[] => {
// // // //     const totals = filteredData.reduce((acc, row) => {
// // // //       const fare = typeof row.totalFare === "number" && !isNaN(row.totalFare) ? row.totalFare : 0;
// // // //       const commission = fare * 0.02;
// // // //       if (!acc[row.currency]) {
// // // //         acc[row.currency] = { currency: row.currency, totalFare: 0, totalCommission: 0 };
// // // //       }
// // // //       acc[row.currency].totalFare += fare;
// // // //       acc[row.currency].totalCommission += commission;
// // // //       return acc;
// // // //     }, {} as Record<string, TotalByCurrency>);
// // // //     return Object.values(totals).sort((a, b) => a.currency.localeCompare(b.currency));
// // // //   };

// // // //   return (
// // // //     <ProtectedRoute>
// // // //       <div className="min-h-screen bg-background text-black p-4">
// // // //         <header className="mb-4">
// // // //           <h1 className="text-xl font-bold mb-1 flex justify-between items-center">
// // // //             Airlines Dashboard
// // // //             <div>
// // // //               <button
// // // //                 onClick={fetchData}
// // // //                 disabled={isLoading}
// // // //                 className="px-3 py-1 bg-blue-800 text-gray-100 font-mono rounded-md hover:bg-blue-900 transition mr-2 disabled:opacity-50"
// // // //               >
// // // //                 <FaSync className={`inline mr-1 ${isLoading ? "animate-spin" : ""}`} /> Refresh
// // // //               </button>
// // // //               <Link
// // // //                 className="px-3 py-1 bg-secondary text-gray-100 font-mono rounded-md hover:bg-secondary transition"
// // // //                 href="/log-history"
// // // //               >
// // // //                 <FaHistory className="inline mr-1" /> Log History
// // // //               </Link>
// // // //             </div>
// // // //           </h1>
// // // //           <p className="font-mono text-xs text-black-100">Summary of ticket data from dashboard_orc</p>
// // // //         </header>

// // // //         <div className="max-w-7xl mx-auto border border-black rounded-lg p-4 bg-background shadow-lg">
// // // //           {error ? (
// // // //             <div className="text-red-500 text-center p-4 bg-red-100 rounded-md">
// // // //               <p>{error}</p>
// // // //               <button
// // // //                 onClick={fetchData}
// // // //                 disabled={isLoading}
// // // //                 className="mt-2 px-3 py-1 bg-blue-500 text-gray-100 font-mono rounded-md hover:bg-blue-600 transition disabled:opacity-50"
// // // //               >
// // // //                 <FaSync className={`inline mr-1 ${isLoading ? "animate-spin" : ""}`} /> Try Again
// // // //               </button>
// // // //             </div>
// // // //           ) : (
// // // //             <>
// // // //               <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
// // // //                 {Object.entries(filterKeyMap).map(([id, { key, field, label }]) => (
// // // //                   <div key={id}>
// // // //                     <label htmlFor={id} className="block text-sm font-medium text-black">
// // // //                       {label}
// // // //                     </label>
// // // //                     <select
// // // //                       id={id}
// // // //                       className="w-full p-2 border rounded-md"
// // // //                       value={filterValues[key]}
// // // //                       onChange={(e) => handleFilterChange(key, e.target.value)}
// // // //                     >
// // // //                       <option value="">All</option>
// // // //                       {filters[field]?.sort().map((value: string) => (
// // // //                         <option key={value} value={value}>
// // // //                           {value}
// // // //                         </option>
// // // //                       ))}
// // // //                     </select>
// // // //                   </div>
// // // //                 ))}
// // // //               </div>

// // // //               <div className="overflow-x-auto mb-6">
// // // //                 <table className="w-full border-collapse">
// // // //                   <thead>
// // // //                     <tr className="bg-secondary text-gray-100">
// // // //                       <th className="p-3 text-left text-sm font-semibold">Month-Year</th>
// // // //                       <th className="p-3 text-left text-sm font-semibold">Country</th>
// // // //                       <th className="p-3 text-left text-sm font-semibold">AirlinesTKT</th>
// // // //                       <th className="p-3 text-left text-sm font-semibold">District</th>
// // // //                       <th className="p-3 text-left text-sm font-semibold">Channel</th>
// // // //                       <th className="p-3 text-left text-sm font-semibold">Currency</th>
// // // //                       <th className="p-3 text-right text-sm font-semibold">Fare</th>
// // // //                       <th className="p-3 text-right text-sm font-semibold">Rate (2%) Commission</th>
// // // //                     </tr>
// // // //                   </thead>
// // // //                   <tbody>
// // // //                     {Array.isArray(filteredData) && filteredData.length > 0 ? (
// // // //                       filteredData.map((row, index) => {
// // // //                         const fare = typeof row.totalFare === "number" && !isNaN(row.totalFare) ? row.totalFare : 0;
// // // //                         const commission = fare * 0.02;
// // // //                         console.log(`Row ${index} totalFare:`, row.totalFare);
// // // //                         return (
// // // //                           <tr key={index} className={index % 2 === 0 ? "bg-background" : "bg-primary/10"}>
// // // //                             <td className="p-3 text-sm">{row.month}</td>
// // // //                             <td className="p-3 text-sm">{row.country}</td>
// // // //                             <td className="p-3 text-sm">{row.airlines}</td>
// // // //                             <td className="p-3 text-sm">{row.district}</td>
// // // //                             <td className="p-3 text-sm">{row.channel}</td>
// // // //                             <td className="p-3 text-sm">{row.currency}</td>
// // // //                             <td className="p-3 text-right text-sm">{fare.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
// // // //                             <td className="p-3 text-right text-sm">{commission.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
// // // //                           </tr>
// // // //                         );
// // // //                       })
// // // //                     ) : (
// // // //                       <tr>
// // // //                         <td colSpan={8} className="p-3 text-center text-gray-600">
// // // //                           No data available. Try adjusting filters or refreshing the data.
// // // //                         </td>
// // // //                       </tr>
// // // //                     )}
// // // //                   </tbody>
// // // //                 </table>
// // // //               </div>

// // // //               {Array.isArray(filteredData) && filteredData.length > 0 && (
// // // //                 <div className="overflow-x-auto">
// // // //                   <table className="w-full border-collapse">
// // // //                     <thead>
// // // //                       <tr className="bg-secondary text-gray-100">
// // // //                         <th className="p-3 text-left text-sm font-semibold">Total</th>
// // // //                         <th colSpan={4} className="p-3"></th>
// // // //                         <th className="p-3 text-left text-sm font-semibold">Currency</th>
// // // //                         <th className="p-3 text-right text-sm font-semibold">Fare</th>
// // // //                         <th className="p-3 text-right text-sm font-semibold">Rate (2%) Commission</th>
// // // //                       </tr>
// // // //                     </thead>
// // // //                     <tbody>
// // // //                       {computeTotals().map((total, index) => (
// // // //                         <tr key={index} className={index % 2 === 0 ? "bg-background" : "bg-primary/10"}>
// // // //                           <td className="p-3 text-sm font-bold">TOTAL {total.currency}</td>
// // // //                           <td colSpan={4} className="p-3"></td>
// // // //                           <td className="p-3 text-sm">{total.currency}</td>
// // // //                           <td className="p-3 text-right text-sm">{total.totalFare.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
// // // //                           <td className="p-3 text-right text-sm">{total.totalCommission.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
// // // //                         </tr>
// // // //                       ))}
// // // //                     </tbody>
// // // //                   </table>
// // // //                 </div>
// // // //               )}
// // // //             </>
// // // //           )}
// // // //         </div>
// // // //       </div>
// // // //     </ProtectedRoute>
// // // //   );
// // // // }
// // // // // iterasion 2 added check box for airlines and channel
// // // // "use client";

// // // // import { useEffect, useState } from "react";
// // // // import Link from "next/link";
// // // // import ProtectedRoute from "./components/ProtectedRoute";
// // // // // import "../../styles/globals.css"; // Uncommented to ensure styling
// // // // import { FaHistory, FaSync } from "react-icons/fa";

// // // // type DashboardRow = {
// // // //   month: string; // Now "MonthFlown YearFlown", e.g., "April 2024"
// // // //   country: string;
// // // //   airlines: string;
// // // //   district: string;
// // // //   channel: string;
// // // //   currency: string;
// // // //   totalFare: number;
// // // //   count: number;
// // // // };

// // // // type Filters = {
// // // //   [key: string]: string[];
// // // // };

// // // // type FilterKey = "month" | "country" | "airlines" | "district" | "channel" | "currency";

// // // // type TotalByCurrency = {
// // // //   currency: string;
// // // //   totalFare: number;
// // // //   totalCommission: number;
// // // // };

// // // // const filterKeyMap: Record<string, { key: FilterKey; field: string; label: string }> = {
// // // //   monthFilter: { key: "month", field: "MonthFlown", label: "Month-Year" },
// // // //   countryFilter: { key: "country", field: "countryname", label: "Country" },
// // // //   airlinesFilter: { key: "airlines", field: "AirlinesTKT", label: "AirlinesTKT" },
// // // //   districtFilter: { key: "district", field: "city_code", label: "District" },
// // // //   channelFilter: { key: "channel", field: "Channel", label: "Channel" },
// // // //   currencyFilter: { key: "currency", field: "SalesCurrency", label: "Currency" },
// // // // };

// // // // export default function DashboardPage() {
// // // //   const [data, setData] = useState<DashboardRow[]>([]);
// // // //   const [filteredData, setFilteredData] = useState<DashboardRow[]>([]);
// // // //   const [filters, setFilters] = useState<Filters>({});
// // // //   const [filterValues, setFilterValues] = useState<{
// // // //     month: string;
// // // //     country: string;
// // // //     airlines: string[]; // Changed to string array
// // // //     district: string;
// // // //     channel: string[]; // Changed to string array
// // // //     currency: string;
// // // //   }>({
// // // //     month: "",
// // // //     country: "",
// // // //     airlines: [],
// // // //     district: "",
// // // //     channel: [],
// // // //     currency: "",
// // // //   });
// // // //   const [error, setError] = useState<string | null>(null);
// // // //   const [isLoading, setIsLoading] = useState(false);

// // // //   const fetchData = async () => {
// // // //     setIsLoading(true);
// // // //     try {
// // // //       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboardSummary`);
// // // //       if (!response.ok) {
// // // //         throw new Error(`HTTP error: ${response.status}`);
// // // //       }
// // // //       const result = await response.json();
// // // //       if (!result.success) {
// // // //         throw new Error(result.message || "Failed to fetch dashboard summary");
// // // //       }
// // // //       console.log("API Data:", result.data);
// // // //       const validatedData = Array.isArray(result.data) ? result.data : [];
// // // //       setData(validatedData);
// // // //       setFilteredData(validatedData);
// // // //       setFilters(result.filters || {});
// // // //       setError(null);
// // // //     } catch (err) {
// // // //       console.error("Error fetching dashboard data:", err);
// // // //       const errorMessage = err instanceof Error ? err.message : String(err);
// // // //       setError(`Failed to load dashboard data: ${errorMessage}. Please try again.`);
// // // //       setData([]);
// // // //       setFilteredData([]);
// // // //     } finally {
// // // //       setIsLoading(false);
// // // //     }
// // // //   };

// // // //   useEffect(() => {
// // // //     fetchData();
// // // //   }, []);

// // // //   useEffect(() => {
// // // //     const newFilteredData = data.filter((row) =>
// // // //       (filterValues.month === "" || row.month === filterValues.month) &&
// // // //       (filterValues.country === "" || row.country === filterValues.country) &&
// // // //       (filterValues.airlines.length === 0 || filterValues.airlines.includes(row.airlines)) &&
// // // //       (filterValues.district === "" || row.district === filterValues.district) &&
// // // //       (filterValues.channel.length === 0 || filterValues.channel.includes(row.channel)) &&
// // // //       (filterValues.currency === "" || row.currency === filterValues.currency)
// // // //     );
// // // //     console.log("Applied Filters:", filterValues, "Filtered Data Length:", newFilteredData.length);
// // // //     setFilteredData(newFilteredData);
// // // //   }, [data, filterValues]);

// // // //   const handleFilterChange = (field: FilterKey, value: string) => {
// // // //     setFilterValues((prev) => ({ ...prev, [field]: value }));
// // // //   };

// // // //   const handleCheckboxChange = (field: "airlines" | "channel", value: string) => {
// // // //     setFilterValues((prev) => {
// // // //       const currentValues = prev[field];
// // // //       const newValues = currentValues.includes(value)
// // // //         ? currentValues.filter((v) => v !== value)
// // // //         : [...currentValues, value];
// // // //       return { ...prev, [field]: newValues };
// // // //     });
// // // //   };

// // // //   const handleSelectAll = (field: "airlines" | "channel") => {
// // // //     setFilterValues((prev) => ({
// // // //       ...prev,
// // // //       [field]: filters[field === "airlines" ? "AirlinesTKT" : "Channel"] || [],
// // // //     }));
// // // //   };

// // // //   const handleClear = (field: "airlines" | "channel") => {
// // // //     setFilterValues((prev) => ({ ...prev, [field]: [] }));
// // // //   };

// // // //   const computeTotals = (): TotalByCurrency[] => {
// // // //     const totals = filteredData.reduce((acc, row) => {
// // // //       const fare = typeof row.totalFare === "number" && !isNaN(row.totalFare) ? row.totalFare : 0;
// // // //       const commission = fare * 0.02;
// // // //       if (!acc[row.currency]) {
// // // //         acc[row.currency] = { currency: row.currency, totalFare: 0, totalCommission: 0 };
// // // //       }
// // // //       acc[row.currency].totalFare += fare;
// // // //       acc[row.currency].totalCommission += commission;
// // // //       return acc;
// // // //     }, {} as Record<string, TotalByCurrency>);
// // // //     return Object.values(totals).sort((a, b) => a.currency.localeCompare(b.currency));
// // // //   };

// // // //   return (
// // // //     <ProtectedRoute>
// // // //       <div className="min-h-screen bg-background text-black p-4">
// // // //         <header className="mb-4">
// // // //           <h1 className="text-xl font-bold mb-1 flex justify-between items-center">
// // // //             Airlines Dashboard
// // // //             <div>
// // // //               <button
// // // //                 onClick={fetchData}
// // // //                 disabled={isLoading}
// // // //                 className="px-3 py-1 bg-blue-800 text-gray-100 font-mono rounded-md hover:bg-blue-900 transition mr-2 disabled:opacity-50"
// // // //               >
// // // //                 <FaSync className={`inline mr-1 ${isLoading ? "animate-spin" : ""}`} /> Refresh
// // // //               </button>
// // // //               <Link
// // // //                 className="px-3 py-1 bg-secondary text-gray-100 font-mono rounded-md hover:bg-secondary transition"
// // // //                 href="/log-history"
// // // //               >
// // // //                 <FaHistory className="inline mr-1" /> Log History
// // // //               </Link>
// // // //             </div>
// // // //           </h1>
// // // //           <p className="font-mono text-xs text-black-100">Summary of ticket data from dashboard_orc</p>
// // // //         </header>

// // // //         <div className="max-w-7xl mx-auto border border-black rounded-lg p-4 bg-background shadow-lg">
// // // //           {error ? (
// // // //             <div className="text-red-500 text-center p-4 bg-red-100 rounded-md">
// // // //               <p>{error}</p>
// // // //               <button
// // // //                 onClick={fetchData}
// // // //                 disabled={isLoading}
// // // //                 className="mt-2 px-3 py-1 bg-blue-500 text-gray-100 font-mono rounded-md hover:bg-blue-600 transition disabled:opacity-50"
// // // //               >
// // // //                 <FaSync className={`inline mr-1 ${isLoading ? "animate-spin" : ""}`} /> Try Again
// // // //               </button>
// // // //             </div>
// // // //           ) : (
// // // //             <>
// // // //               <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
// // // //                 {Object.entries(filterKeyMap).map(([id, { key, field, label }]) => (
// // // //                   <div key={id}>
// // // //                     <label className="block text-sm font-medium text-black mb-1">{label}</label>
// // // //                     {["airlinesFilter", "channelFilter"].includes(id) ? (
// // // //                       <div className="border rounded-md p-2 bg-white max-h-40 overflow-y-auto">
// // // //                         <div className="flex justify-between mb-2">
// // // //                           <button
// // // //                             type="button"
// // // //                             onClick={() => handleSelectAll(key as "airlines" | "channel")}
// // // //                             className="text-xs text-blue-600 hover:underline"
// // // //                           >
// // // //                             Select All
// // // //                           </button>
// // // //                           <button
// // // //                             type="button"
// // // //                             onClick={() => handleClear(key as "airlines" | "channel")}
// // // //                             className="text-xs text-blue-600 hover:underline"
// // // //                           >
// // // //                             Clear
// // // //                           </button>
// // // //                         </div>
// // // //                         {filters[field]?.sort().map((value: string) => (
// // // //                           <div key={value} className="flex items-center">
// // // //                             <input
// // // //                               type="checkbox"
// // // //                               id={`${id}-${value}`}
// // // //                               checked={(filterValues[key] as string[]).includes(value)}
// // // //                               onChange={() => handleCheckboxChange(key as "airlines" | "channel", value)}
// // // //                               className="mr-2"
// // // //                             />
// // // //                             <label htmlFor={`${id}-${value}`} className="text-sm text-black">
// // // //                               {value}
// // // //                             </label>
// // // //                           </div>
// // // //                         ))}
// // // //                       </div>
// // // //                     ) : (
// // // //                       <select
// // // //                         id={id}
// // // //                         className="w-full p-2 border rounded-md"
// // // //                         value={filterValues[key] as string}
// // // //                         onChange={(e) => handleFilterChange(key, e.target.value)}
// // // //                       >
// // // //                         <option value="">All</option>
// // // //                         {filters[field]?.sort().map((value: string) => (
// // // //                           <option key={value} value={value}>
// // // //                             {value}
// // // //                           </option>
// // // //                         ))}
// // // //                       </select>
// // // //                     )}
// // // //                   </div>
// // // //                 ))}
// // // //               </div>

// // // //               <div className="overflow-x-auto mb-6">
// // // //                 <table className="w-full border-collapse">
// // // //                   <thead>
// // // //                     <tr className="bg-secondary text-gray-100">
// // // //                       <th className="p-3 text-left text-sm font-semibold">Month-Year</th>
// // // //                       <th className="p-3 text-left text-sm font-semibold">Country</th>
// // // //                       <th className="p-3 text-left text-sm font-semibold">AirlinesTKT</th>
// // // //                       <th className="p-3 text-left text-sm font-semibold">District</th>
// // // //                       <th className="p-3 text-left text-sm font-semibold">Channel</th>
// // // //                       <th className="p-3 text-left text-sm font-semibold">Currency</th>
// // // //                       <th className="p-3 text-right text-sm font-semibold">Fare</th>
// // // //                       <th className="p-3 text-right text-sm font-semibold">Rate (2%) Commission</th>
// // // //                     </tr>
// // // //                   </thead>
// // // //                   <tbody>
// // // //                     {Array.isArray(filteredData) && filteredData.length > 0 ? (
// // // //                       filteredData.map((row, index) => {
// // // //                         const fare = typeof row.totalFare === "number" && !isNaN(row.totalFare) ? row.totalFare : 0;
// // // //                         const commission = fare * 0.02;
// // // //                         console.log(`Row ${index} totalFare:`, row.totalFare);
// // // //                         return (
// // // //                           <tr key={index} className={index % 2 === 0 ? "bg-background" : "bg-primary/10"}>
// // // //                             <td className="p-3 text-sm">{row.month}</td>
// // // //                             <td className="p-3 text-sm">{row.country}</td>
// // // //                             <td className="p-3 text-sm">{row.airlines}</td>
// // // //                             <td className="p-3 text-sm">{row.district}</td>
// // // //                             <td className="p-3 text-sm">{row.channel}</td>
// // // //                             <td className="p-3 text-sm">{row.currency}</td>
// // // //                             <td className="p-3 text-right text-sm">{fare.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
// // // //                             <td className="p-3 text-right text-sm">{commission.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
// // // //                           </tr>
// // // //                         );
// // // //                       })
// // // //                     ) : (
// // // //                       <tr>
// // // //                         <td colSpan={8} className="p-3 text-center text-gray-600">
// // // //                           No data available. Try adjusting filters or refreshing the data.
// // // //                         </td>
// // // //                       </tr>
// // // //                     )}
// // // //                   </tbody>
// // // //                 </table>
// // // //               </div>

// // // //               {Array.isArray(filteredData) && filteredData.length > 0 && (
// // // //                 <div className="overflow-x-auto">
// // // //                   <table className="w-full border-collapse">
// // // //                     <thead>
// // // //                       <tr className="bg-secondary text-gray-100">
// // // //                         <th className="p-3 text-left text-sm font-semibold">Total</th>
// // // //                         <th colSpan={4} className="p-3"></th>
// // // //                         <th className="p-3 text-left text-sm font-semibold">Currency</th>
// // // //                         <th className="p-3 text-right text-sm font-semibold">Fare</th>
// // // //                         <th className="p-3 text-right text-sm font-semibold">Rate (2%) Commission</th>
// // // //                       </tr>
// // // //                     </thead>
// // // //                     <tbody>
// // // //                       {computeTotals().map((total, index) => (
// // // //                         <tr key={index} className={index % 2 === 0 ? "bg-background" : "bg-primary/10"}>
// // // //                           <td className="p-3 text-sm font-bold">TOTAL {total.currency}</td>
// // // //                           <td colSpan={4} className="p-3"></td>
// // // //                           <td className="p-3 text-sm">{total.currency}</td>
// // // //                           <td className="p-3 text-right text-sm">{total.totalFare.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
// // // //                           <td className="p-3 text-right text-sm">{total.totalCommission.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
// // // //                         </tr>
// // // //                       ))}
// // // //                     </tbody>
// // // //                   </table>
// // // //                 </div>
// // // //               )}
// // // //             </>
// // // //           )}
// // // //         </div>
// // // //       </div>
// // // //     </ProtectedRoute>
// // // //   );
// // // // }

// // // // // last iteration working.
// // // // // iteration district
// // // // "use client";

// // // // import { useEffect, useState } from "react";
// // // // import Link from "next/link";
// // // // import ProtectedRoute from "./components/ProtectedRoute";
// // // // // import "../../styles/globals.css"; // Uncommented to ensure styling
// // // // import { FaHistory, FaSync } from "react-icons/fa";

// // // // type DashboardRow = {
// // // //   month: string; // Now "MonthFlown YearFlown", e.g., "April 2024"
// // // //   country: string;
// // // //   airlines: string;
// // // //   district: string;
// // // //   channel: string;
// // // //   currency: string;
// // // //   totalFare: number;
// // // //   count: number;
// // // // };

// // // // type Filters = {
// // // //   MonthFlown: string[];
// // // //   countryname: string[];
// // // //   AirlinesTKT: string[];
// // // //   Channel: string[];
// // // //   SalesCurrency: string[];
// // // //   countryDistrictMap: { [country: string]: string[] };
// // // // };

// // // // type FilterKey = "month" | "country" | "airlines" | "district" | "channel" | "currency";

// // // // type FilterField = keyof Omit<Filters, "countryDistrictMap">; // Exclude countryDistrictMap

// // // // type TotalByCurrency = {
// // // //   currency: string;
// // // //   totalFare: number;
// // // //   totalCommission: number;
// // // // };

// // // // const filterKeyMap: Record<string, { key: FilterKey; field: FilterField | "city_code"; label: string }> = {
// // // //   monthFilter: { key: "month", field: "MonthFlown", label: "Month-Year" },
// // // //   countryFilter: { key: "country", field: "countryname", label: "Country" },
// // // //   airlinesFilter: { key: "airlines", field: "AirlinesTKT", label: "AirlinesTKT" },
// // // //   districtFilter: { key: "district", field: "city_code", label: "District" },
// // // //   channelFilter: { key: "channel", field: "Channel", label: "Channel" },
// // // //   currencyFilter: { key: "currency", field: "SalesCurrency", label: "Currency" },
// // // // };

// // // // export default function DashboardPage() {
// // // //   const [data, setData] = useState<DashboardRow[]>([]);
// // // //   const [filteredData, setFilteredData] = useState<DashboardRow[]>([]);
// // // //   const [filters, setFilters] = useState<Filters>({
// // // //     MonthFlown: [],
// // // //     countryname: [],
// // // //     AirlinesTKT: [],
// // // //     Channel: [],
// // // //     SalesCurrency: [],
// // // //     countryDistrictMap: {},
// // // //   });
// // // //   const [filterValues, setFilterValues] = useState<{
// // // //     month: string;
// // // //     country: string;
// // // //     airlines: string[];
// // // //     district: string;
// // // //     channel: string[];
// // // //     currency: string;
// // // //   }>({
// // // //     month: "",
// // // //     country: "",
// // // //     airlines: [],
// // // //     district: "",
// // // //     channel: [],
// // // //     currency: "",
// // // //   });
// // // //   const [error, setError] = useState<string | null>(null);
// // // //   const [isLoading, setIsLoading] = useState(false);

// // // //   const fetchData = async () => {
// // // //     setIsLoading(true);
// // // //     try {
// // // //       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboardSummary`);
// // // //       if (!response.ok) {
// // // //         throw new Error(`HTTP error: ${response.status}`);
// // // //       }
// // // //       const result = await response.json();
// // // //       if (!result.success) {
// // // //         throw new Error(result.message || "Failed to fetch dashboard summary");
// // // //       }
// // // //       console.log("API Data:", result.data);
// // // //       const validatedData = Array.isArray(result.data) ? result.data : [];
// // // //       setData(validatedData);
// // // //       setFilteredData(validatedData);
// // // //       setFilters({
// // // //         MonthFlown: result.filters.MonthFlown || [],
// // // //         countryname: result.filters.countryname || [],
// // // //         AirlinesTKT: result.filters.AirlinesTKT || [],
// // // //         Channel: result.filters.Channel || [],
// // // //         SalesCurrency: result.filters.SalesCurrency || [],
// // // //         countryDistrictMap: result.filters.countryDistrictMap || {},
// // // //       });
// // // //       setError(null);
// // // //     } catch (err) {
// // // //       console.error("Error fetching dashboard data:", err);
// // // //       const errorMessage = err instanceof Error ? err.message : String(err);
// // // //       setError(`Failed to load dashboard data: ${errorMessage}. Please try again.`);
// // // //       setData([]);
// // // //       setFilteredData([]);
// // // //     } finally {
// // // //       setIsLoading(false);
// // // //     }
// // // //   };

// // // //   useEffect(() => {
// // // //     fetchData();
// // // //   }, []);

// // // //   useEffect(() => {
// // // //     const newFilteredData = data.filter((row) =>
// // // //       (filterValues.month === "" || row.month === filterValues.month) &&
// // // //       (filterValues.country === "" || row.country === filterValues.country) &&
// // // //       (filterValues.airlines.length === 0 || filterValues.airlines.includes(row.airlines)) &&
// // // //       (filterValues.district === "" || row.district === filterValues.district) &&
// // // //       (filterValues.channel.length === 0 || filterValues.channel.includes(row.channel)) &&
// // // //       (filterValues.currency === "" || row.currency === filterValues.currency)
// // // //     );
// // // //     console.log("Applied Filters:", filterValues, "Filtered Data Length:", newFilteredData.length);
// // // //     setFilteredData(newFilteredData);
// // // //   }, [data, filterValues]);

// // // //   const handleFilterChange = (field: FilterKey, value: string) => {
// // // //     setFilterValues((prev) => {
// // // //       const newValues = { ...prev, [field]: value };
// // // //       // Reset district when country changes
// // // //       if (field === "country") {
// // // //         newValues.district = "";
// // // //       }
// // // //       return newValues;
// // // //     });
// // // //   };

// // // //   const handleCheckboxChange = (field: "airlines" | "channel", value: string) => {
// // // //     setFilterValues((prev) => {
// // // //       const currentValues = prev[field];
// // // //       const newValues = currentValues.includes(value)
// // // //         ? currentValues.filter((v) => v !== value)
// // // //         : [...currentValues, value];
// // // //       return { ...prev, [field]: newValues };
// // // //     });
// // // //   };

// // // //   const handleSelectAll = (field: "airlines" | "channel") => {
// // // //     setFilterValues((prev) => ({
// // // //       ...prev,
// // // //       [field]: filters[field === "airlines" ? "AirlinesTKT" : "Channel"] || [],
// // // //     }));
// // // //   };

// // // //   const handleClear = (field: "airlines" | "channel") => {
// // // //     setFilterValues((prev) => ({ ...prev, [field]: [] }));
// // // //   };

// // // //   // Get district options based on selected country
// // // //   const getDistrictOptions = () => {
// // // //     if (!filters.countryDistrictMap) return [];
// // // //     if (filterValues.country === "") {
// // // //       // Return all districts if no country selected
// // // //       return Array.from(new Set(Object.values(filters.countryDistrictMap).flat())).sort();
// // // //     }
// // // //     return (filters.countryDistrictMap[filterValues.country] || []).sort();
// // // //   };

// // // //   const computeTotals = (): TotalByCurrency[] => {
// // // //     const totals = filteredData.reduce((acc, row) => {
// // // //       const fare = typeof row.totalFare === "number" && !isNaN(row.totalFare) ? row.totalFare : 0;
// // // //       const commission = fare * 0.02;
// // // //       if (!acc[row.currency]) {
// // // //         acc[row.currency] = { currency: row.currency, totalFare: 0, totalCommission: 0 };
// // // //       }
// // // //       acc[row.currency].totalFare += fare;
// // // //       acc[row.currency].totalCommission += commission;
// // // //       return acc;
// // // //     }, {} as Record<string, TotalByCurrency>);
// // // //     return Object.values(totals).sort((a, b) => a.currency.localeCompare(b.currency));
// // // //   };

// // // //   return (
// // // //     <ProtectedRoute>
// // // //       <div className="min-h-screen bg-background text-black p-4">
// // // //         <header className="mb-4">
// // // //           <h1 className="text-xl font-bold mb-1 flex justify-between items-center">
// // // //             Airlines Dashboard
// // // //             <div>
// // // //               <button
// // // //                 onClick={fetchData}
// // // //                 disabled={isLoading}
// // // //                 className="px-3 py-1 bg-blue-800 text-gray-100 font-mono rounded-md hover:bg-blue-900 transition mr-2 disabled:opacity-50"
// // // //               >
// // // //                 <FaSync className={`inline mr-1 ${isLoading ? "animate-spin" : ""}`} /> Refresh
// // // //               </button>
// // // //               <Link
// // // //                 className="px-3 py-1 bg-secondary text-gray-100 font-mono rounded-md hover:bg-secondary transition"
// // // //                 href="/log-history"
// // // //               >
// // // //                 <FaHistory className="inline mr-1" /> Log History
// // // //               </Link>
// // // //             </div>
// // // //           </h1>
// // // //           <p className="font-mono text-xs text-black-100">Summary of ticket data from dashboard_orc</p>
// // // //         </header>

// // // //         <div className="max-w-7xl mx-auto border border-black rounded-lg p-4 bg-background shadow-lg">
// // // //           {error ? (
// // // //             <div className="text-red-500 text-center p-4 bg-red-100 rounded-md">
// // // //               <p>{error}</p>
// // // //               <button
// // // //                 onClick={fetchData}
// // // //                 disabled={isLoading}
// // // //                 className="mt-2 px-3 py-1 bg-blue-500 text-gray-100 font-mono rounded-md hover:bg-blue-600 transition disabled:opacity-50"
// // // //               >
// // // //                 <FaSync className={`inline mr-1 ${isLoading ? "animate-spin" : ""}`} /> Try Again
// // // //               </button>
// // // //             </div>
// // // //           ) : (
// // // //             <>
// // // //               <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
// // // //                 {Object.entries(filterKeyMap).map(([id, { key, field, label }]) => (
// // // //                   <div key={id}>
// // // //                     <label className="block text-sm font-medium text-black mb-1">{label}</label>
// // // //                     {["airlinesFilter", "channelFilter"].includes(id) ? (
// // // //                       <div className="border rounded-md p-2 bg-white max-h-40 overflow-y-auto">
// // // //                         <div className="flex justify-between mb-2">
// // // //                           <button
// // // //                             type="button"
// // // //                             onClick={() => handleSelectAll(key as "airlines" | "channel")}
// // // //                             className="text-xs text-blue-600 hover:underline"
// // // //                           >
// // // //                             Select All
// // // //                           </button>
// // // //                           <button
// // // //                             type="button"
// // // //                             onClick={() => handleClear(key as "airlines" | "channel")}
// // // //                             className="text-xs text-blue-600 hover:underline"
// // // //                           >
// // // //                             Clear
// // // //                           </button>
// // // //                         </div>
// // // //                         {field !== "city_code" && filters[field]?.sort().map((value: string) => (
// // // //                           <div key={value} className="flex items-center">
// // // //                             <input
// // // //                               type="checkbox"
// // // //                               id={`${id}-${value}`}
// // // //                               checked={(filterValues[key] as string[]).includes(value)}
// // // //                               onChange={() => handleCheckboxChange(key as "airlines" | "channel", value)}
// // // //                               className="mr-2"
// // // //                             />
// // // //                             <label htmlFor={`${id}-${value}`} className="text-sm text-black">
// // // //                               {value}
// // // //                             </label>
// // // //                           </div>
// // // //                         ))}
// // // //                       </div>
// // // //                     ) : (
// // // //                       <select
// // // //                         id={id}
// // // //                         className="w-full p-2 border rounded-md"
// // // //                         value={filterValues[key] as string}
// // // //                         onChange={(e) => handleFilterChange(key, e.target.value)}
// // // //                       >
// // // //                         <option value="">All</option>
// // // //                         {key === "district" ? (
// // // //                           getDistrictOptions().length > 0 ? (
// // // //                             getDistrictOptions().map((value) => (
// // // //                               <option key={value} value={value}>
// // // //                                 {value}
// // // //                               </option>
// // // //                             ))
// // // //                           ) : (
// // // //                             <option disabled>No districts available</option>
// // // //                           )
// // // //                         ) : (
// // // //                           field !== "city_code" && filters[field]?.sort().map((value: string) => (
// // // //                             <option key={value} value={value}>
// // // //                               {value}
// // // //                             </option>
// // // //                           ))
// // // //                         )}
// // // //                       </select>
// // // //                     )}
// // // //                   </div>
// // // //                 ))}
// // // //               </div>

// // // //               <div className="overflow-x-auto mb-6">
// // // //                 <table className="w-full border-collapse">
// // // //                   <thead>
// // // //                     <tr className="bg-secondary text-gray-100">
// // // //                       <th className="p-3 text-left text-sm font-semibold">Month-Year</th>
// // // //                       <th className="p-3 text-left text-sm font-semibold">Country</th>
// // // //                       <th className="p-3 text-left text-sm font-semibold">AirlinesTKT</th>
// // // //                       <th className="p-3 text-left text-sm font-semibold">District</th>
// // // //                       <th className="p-3 text-left text-sm font-semibold">Channel</th>
// // // //                       <th className="p-3 text-left text-sm font-semibold">Currency</th>
// // // //                       <th className="p-3 text-right text-sm font-semibold">Fare</th>
// // // //                       <th className="p-3 text-right text-sm font-semibold">Rate (2%) Commission</th>
// // // //                     </tr>
// // // //                   </thead>
// // // //                   <tbody>
// // // //                     {Array.isArray(filteredData) && filteredData.length > 0 ? (
// // // //                       filteredData.map((row, index) => {
// // // //                         const fare = typeof row.totalFare === "number" && !isNaN(row.totalFare) ? row.totalFare : 0;
// // // //                         const commission = fare * 0.02;
// // // //                         console.log(`Row ${index} totalFare:`, row.totalFare);
// // // //                         return (
// // // //                           <tr key={index} className={index % 2 === 0 ? "bg-background" : "bg-primary/10"}>
// // // //                             <td className="p-3 text-sm">{row.month}</td>
// // // //                             <td className="p-3 text-sm">{row.country}</td>
// // // //                             <td className="p-3 text-sm">{row.airlines}</td>
// // // //                             <td className="p-3 text-sm">{row.district}</td>
// // // //                             <td className="p-3 text-sm">{row.channel}</td>
// // // //                             <td className="p-3 text-sm">{row.currency}</td>
// // // //                             <td className="p-3 text-right text-sm">{fare.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
// // // //                             <td className="p-3 text-right text-sm">{commission.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
// // // //                           </tr>
// // // //                         );
// // // //                       })
// // // //                     ) : (
// // // //                       <tr>
// // // //                         <td colSpan={8} className="p-3 text-center text-gray-600">
// // // //                           No data available. Try adjusting filters or refreshing the data.
// // // //                         </td>
// // // //                       </tr>
// // // //                     )}
// // // //                   </tbody>
// // // //                 </table>
// // // //               </div>

// // // //               {Array.isArray(filteredData) && filteredData.length > 0 && (
// // // //                 <div className="overflow-x-auto">
// // // //                   <table className="w-full border-collapse">
// // // //                     <thead>
// // // //                       <tr className="bg-secondary text-gray-100">
// // // //                         <th className="p-3 text-left text-sm font-semibold">Total</th>
// // // //                         <th colSpan={4} className="p-3"></th>
// // // //                         <th className="p-3 text-left text-sm font-semibold">Currency</th>
// // // //                         <th className="p-3 text-right text-sm font-semibold">Fare</th>
// // // //                         <th className="p-3 text-right text-sm font-semibold">Rate (2%) Commission</th>
// // // //                       </tr>
// // // //                     </thead>
// // // //                     <tbody>
// // // //                       {computeTotals().map((total, index) => (
// // // //                         <tr key={index} className={index % 2 === 0 ? "bg-background" : "bg-primary/10"}>
// // // //                           <td className="p-3 text-sm font-bold">TOTAL {total.currency}</td>
// // // //                           <td colSpan={4} className="p-3"></td>
// // // //                           <td className="p-3 text-sm">{total.currency}</td>
// // // //                           <td className="p-3 text-right text-sm">{total.totalFare.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
// // // //                           <td className="p-3 text-right text-sm">{total.totalCommission.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
// // // //                         </tr>
// // // //                       ))}
// // // //                     </tbody>
// // // //                   </table>
// // // //                 </div>
// // // //               )}
// // // //             </>
// // // //           )}
// // // //         </div>
// // // //       </div>
// // // //     </ProtectedRoute>
// // // //   );
// // // // }

// // // // last iteration working. currency

// // // // "use client";

// // // // import { useEffect, useState, useMemo } from "react";
// // // // import Link from "next/link";
// // // // import ProtectedRoute from "./components/ProtectedRoute";
// // // // // import "../../styles/globals.css";
// // // // import { FaHistory, FaSync } from "react-icons/fa";

// // // // type DashboardRow = {
// // // //   month: string;
// // // //   country: string;
// // // //   airlines: string;
// // // //   district: string;
// // // //   channel: string;
// // // //   currency: string;
// // // //   totalFare: number;
// // // //   count: number;
// // // // };

// // // // type Filters = {
// // // //   MonthFlown: string[];
// // // //   countryname: string[];
// // // //   AirlinesTKT: string[];
// // // //   Channel: string[];
// // // //   SalesCurrency: string[];
// // // //   countryDistrictMap: { [country: string]: string[] };
// // // //   countryCurrencyMap: { [country: string]: string[] };
// // // // };

// // // // type FilterKey = "month" | "country" | "airlines" | "district" | "channel" | "currency";

// // // // type FilterField = keyof Omit<Filters, "countryDistrictMap" | "countryCurrencyMap">;

// // // // type TotalByCurrency = {
// // // //   currency: string;
// // // //   totalFare: number;
// // // //   totalCommission: number;
// // // // };

// // // // const filterKeyMap: Record<string, { key: FilterKey; field: FilterField | "city_code"; label: string }> = {
// // // //   monthFilter: { key: "month", field: "MonthFlown", label: "Month-Year" },
// // // //   countryFilter: { key: "country", field: "countryname", label: "Country" },
// // // //   airlinesFilter: { key: "airlines", field: "AirlinesTKT", label: "AirlinesTKT" },
// // // //   districtFilter: { key: "district", field: "city_code", label: "District" },
// // // //   channelFilter: { key: "channel", field: "Channel", label: "Channel" },
// // // //   currencyFilter: { key: "currency", field: "SalesCurrency", label: "Currency" },
// // // // };

// // // // // Error Boundary Component
// // // // const ErrorBoundary: React.FC<{ children: React.ReactNode; fallback: React.ReactNode }> = ({ children, fallback }) => {
// // // //   const [hasError, setHasError] = useState(false);

// // // //   useEffect(() => {
// // // //     setHasError(false);
// // // //   }, [children]);

// // // //   if (hasError) return <>{fallback}</>;

// // // //   try {
// // // //     return <>{children}</>;
// // // //   } catch {
// // // //     setHasError(true);
// // // //     return <>{fallback}</>;
// // // //   }
// // // // };

// // // // export default function DashboardPage() {
// // // //   const [data, setData] = useState<DashboardRow[]>([]);
// // // //   const [filteredData, setFilteredData] = useState<DashboardRow[]>([]);
// // // //   const [filters, setFilters] = useState<Filters>({
// // // //     MonthFlown: [],
// // // //     countryname: [],
// // // //     AirlinesTKT: [],
// // // //     Channel: [],
// // // //     SalesCurrency: [],
// // // //     countryDistrictMap: {},
// // // //     countryCurrencyMap: {},
// // // //   });
// // // //   const [filterValues, setFilterValues] = useState<{
// // // //     month: string;
// // // //     country: string;
// // // //     airlines: string[];
// // // //     district: string;
// // // //     channel: string[];
// // // //     currency: string;
// // // //   }>({
// // // //     month: "",
// // // //     country: "",
// // // //     airlines: [],
// // // //     district: "",
// // // //     channel: [],
// // // //     currency: "",
// // // //   });
// // // //   const [error, setError] = useState<string | null>(null);
// // // //   const [isLoading, setIsLoading] = useState(false);

// // // //   const fetchData = async () => {
// // // //     setIsLoading(true);
// // // //     try {
// // // //       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboardSummary`);
// // // //       if (!response.ok) {
// // // //         throw new Error(`HTTP error: ${response.status}`);
// // // //       }
// // // //       const result = await response.json();
// // // //       if (!result.success) {
// // // //         throw new Error(result.message || "Failed to fetch dashboard summary");
// // // //       }
// // // //       console.log("API Data:", result.data);
// // // //       console.log("Filters:", result.filters);
// // // //       const validatedData = Array.isArray(result.data) ? result.data : [];
// // // //       setData(validatedData);
// // // //       setFilteredData(validatedData);
// // // //       setFilters({
// // // //         MonthFlown: result.filters.MonthFlown || [],
// // // //         countryname: result.filters.countryname || [],
// // // //         AirlinesTKT: result.filters.AirlinesTKT || [],
// // // //         Channel: result.filters.Channel || [],
// // // //         SalesCurrency: result.filters.SalesCurrency || [],
// // // //         countryDistrictMap: result.filters.countryDistrictMap || {},
// // // //         countryCurrencyMap: result.filters.countryCurrencyMap || {},
// // // //       });
// // // //       setError(null);
// // // //     } catch (err) {
// // // //       console.error("Error fetching dashboard data:", err);
// // // //       const errorMessage = err instanceof Error ? err.message : String(err);
// // // //       setError(`Failed to load dashboard data: ${errorMessage}. Please try again.`);
// // // //       setData([]);
// // // //       setFilteredData([]);
// // // //     } finally {
// // // //       setIsLoading(false);
// // // //     }
// // // //   };

// // // //   useEffect(() => {
// // // //     fetchData();
// // // //   }, []);

// // // //   useEffect(() => {
// // // //     const newFilteredData = data.filter((row) =>
// // // //       (filterValues.month === "" || row.month === filterValues.month) &&
// // // //       (filterValues.country === "" || row.country === filterValues.country) &&
// // // //       (filterValues.airlines.length === 0 || filterValues.airlines.includes(row.airlines)) &&
// // // //       (filterValues.district === "" || row.district === filterValues.district) &&
// // // //       (filterValues.channel.length === 0 || filterValues.channel.includes(row.channel)) &&
// // // //       (filterValues.currency === "" || row.currency === filterValues.currency)
// // // //     );
// // // //     console.log("Applied Filters:", filterValues, "Filtered Data Length:", newFilteredData.length);
// // // //     setFilteredData(newFilteredData);
// // // //   }, [data, filterValues]);

// // // //   const handleFilterChange = (field: FilterKey, value: string) => {
// // // //     setFilterValues((prev) => {
// // // //       const newValues = { ...prev, [field]: value };
// // // //       if (field === "country") {
// // // //         newValues.district = "";
// // // //         newValues.currency = "";
// // // //       }
// // // //       return newValues;
// // // //     });
// // // //   };

// // // //   const handleCheckboxChange = (field: "airlines" | "channel", value: string) => {
// // // //     setFilterValues((prev) => {
// // // //       const currentValues = prev[field];
// // // //       const newValues = currentValues.includes(value)
// // // //         ? currentValues.filter((v) => v !== value)
// // // //         : [...currentValues, value];
// // // //       return { ...prev, [field]: newValues };
// // // //     });
// // // //   };

// // // //   const handleSelectAll = (field: "airlines" | "channel") => {
// // // //     setFilterValues((prev) => ({
// // // //       ...prev,
// // // //       [field]: filters[field === "airlines" ? "AirlinesTKT" : "Channel"] || [],
// // // //     }));
// // // //   };

// // // //   const handleClear = (field: "airlines" | "channel") => {
// // // //     setFilterValues((prev) => ({ ...prev, [field]: [] }));
// // // //   };

// // // //   const getDistrictOptions = useMemo(() => {
// // // //     if (!filters.countryDistrictMap) return [];
// // // //     if (filterValues.country === "") {
// // // //       return Array.from(new Set(Object.values(filters.countryDistrictMap).flat())).sort();
// // // //     }
// // // //     return (filters.countryDistrictMap[filterValues.country] || []).sort();
// // // //   }, [filters.countryDistrictMap, filterValues.country]);

// // // //   const getCurrencyOptions = useMemo(() => {
// // // //     console.log("CountryCurrencyMap:", filters.countryCurrencyMap);
// // // //     console.log("SalesCurrency:", filters.SalesCurrency);
// // // //     if (filterValues.country === "") {
// // // //       // When no country is selected, return all currencies from countryCurrencyMap or SalesCurrency
// // // //       const allCurrencies = filters.countryCurrencyMap
// // // //         ? Array.from(new Set(Object.values(filters.countryCurrencyMap).flat()))
// // // //         : filters.SalesCurrency || [];
// // // //       return allCurrencies.sort();
// // // //     }
// // // //     // When a country is selected, return its currencies or fallback to SalesCurrency
// // // //     return (filters.countryCurrencyMap?.[filterValues.country] || filters.SalesCurrency || []).sort();
// // // //   }, [filters.countryCurrencyMap, filterValues.country, filters.SalesCurrency]);

// // // //   const computeTotals = (): TotalByCurrency[] => {
// // // //     const totals = filteredData.reduce((acc, row) => {
// // // //       const fare = typeof row.totalFare === "number" && !isNaN(row.totalFare) ? row.totalFare : 0;
// // // //       const commission = fare * 0.02;
// // // //       if (!acc[row.currency]) {
// // // //         acc[row.currency] = { currency: row.currency, totalFare: 0, totalCommission: 0 };
// // // //       }
// // // //       acc[row.currency].totalFare += fare;
// // // //       acc[row.currency].totalCommission += commission;
// // // //       return acc;
// // // //     }, {} as Record<string, TotalByCurrency>);
// // // //     return Object.values(totals).sort((a, b) => a.currency.localeCompare(b.currency));
// // // //   };

// // // //   return (
// // // //     <ProtectedRoute>
// // // //       <div className="min-h-screen bg-background text-black p-4">
// // // //         <header className="mb-4">
// // // //           <h1 className="text-xl font-bold mb-1 flex justify-between items-center">
// // // //             Airlines Dashboard
// // // //             <div>
// // // //               <button
// // // //                 onClick={fetchData}
// // // //                 disabled={isLoading}
// // // //                 className="px-3 py-1 bg-blue-800 text-gray-100 font-mono rounded-md hover:bg-blue-900 transition mr-2 disabled:opacity-50"
// // // //               >
// // // //                 <FaSync className={`inline mr-1 ${isLoading ? "animate-spin" : ""}`} /> Refresh
// // // //               </button>
// // // //               <Link
// // // //                 className="px-3 py-1 bg-secondary text-gray-100 font-mono rounded-md hover:bg-secondary transition"
// // // //                 href="/log-history"
// // // //               >
// // // //                 <FaHistory className="inline mr-1" /> Log History
// // // //               </Link>
// // // //             </div>
// // // //           </h1>
// // // //           <p className="font-mono text-xs text-black-100">Summary of ticket data from dashboard_orc</p>
// // // //         </header>

// // // //         <ErrorBoundary
// // // //           fallback={
// // // //             <div className="text-red-500 text-center p-4 bg-red-100 rounded-md">
// // // //               <p>An unexpected error occurred. Please try again.</p>
// // // //               <button
// // // //                 onClick={fetchData}
// // // //                 disabled={isLoading}
// // // //                 className="mt-2 px-3 py-1 bg-blue-500 text-gray-100 font-mono rounded-md hover:bg-blue-600 transition disabled:opacity-50"
// // // //               >
// // // //                 <FaSync className={`inline mr-1 ${isLoading ? "animate-spin" : ""}`} /> Try Again
// // // //               </button>
// // // //             </div>
// // // //           }
// // // //         >
// // // //           <div className="max-w-7xl mx-auto border border-black rounded-lg p-4 bg-background shadow-lg">
// // // //             {error ? (
// // // //               <div className="text-red-500 text-center p-4 bg-red-100 rounded-md">
// // // //                 <p>{error}</p>
// // // //                 <button
// // // //                   onClick={fetchData}
// // // //                   disabled={isLoading}
// // // //                   className="mt-2 px-3 py-1 bg-blue-500 text-gray-100 font-mono rounded-md hover:bg-blue-600 transition disabled:opacity-50"
// // // //                 >
// // // //                   <FaSync className={`inline mr-1 ${isLoading ? "animate-spin" : ""}`} /> Try Again
// // // //                 </button>
// // // //               </div>
// // // //             ) : (
// // // //               <>
// // // //                 <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
// // // //                   {Object.entries(filterKeyMap).map(([id, { key, field, label }]) => (
// // // //                     <div key={id}>
// // // //                       <label className="block text-sm font-medium text-black mb-1">{label}</label>
// // // //                       {["airlinesFilter", "channelFilter"].includes(id) ? (
// // // //                         <div className="border rounded-md p-2 bg-white max-h-40 overflow-y-auto">
// // // //                           <div className="flex justify-between mb-2">
// // // //                             <button
// // // //                               type="button"
// // // //                               onClick={() => handleSelectAll(key as "airlines" | "channel")}
// // // //                               className="text-xs text-blue-600 hover:underline"
// // // //                             >
// // // //                               Select All
// // // //                             </button>
// // // //                             <button
// // // //                               type="button"
// // // //                               onClick={() => handleClear(key as "airlines" | "channel")}
// // // //                               className="text-xs text-blue-600 hover:underline"
// // // //                             >
// // // //                               Clear
// // // //                             </button>
// // // //                           </div>
// // // //                           {field !== "city_code" && filters[field]?.length > 0 ? (
// // // //                             filters[field].sort().map((value: string) => (
// // // //                               <div key={value} className="flex items-center">
// // // //                                 <input
// // // //                                   type="checkbox"
// // // //                                   id={`${id}-${value}`}
// // // //                                   checked={(filterValues[key] as string[]).includes(value)}
// // // //                                   onChange={() => handleCheckboxChange(key as "airlines" | "channel", value)}
// // // //                                   className="mr-2"
// // // //                                 />
// // // //                                 <label htmlFor={`${id}-${value}`} className="text-sm text-black">
// // // //                                   {value}
// // // //                                 </label>
// // // //                               </div>
// // // //                             ))
// // // //                           ) : (
// // // //                             <p className="text-sm text-gray-500">No options available</p>
// // // //                           )}
// // // //                         </div>
// // // //                       ) : (
// // // //                         <select
// // // //                           id={id}
// // // //                           className="w-full p-2 border rounded-md"
// // // //                           value={filterValues[key] as string}
// // // //                           onChange={(e) => handleFilterChange(key, e.target.value)}
// // // //                         >
// // // //                           <option value="">All</option>
// // // //                           {key === "district" ? (
// // // //                             getDistrictOptions.length > 0 ? (
// // // //                               getDistrictOptions.map((value) => (
// // // //                                 <option key={value} value={value}>
// // // //                                   {value}
// // // //                                 </option>
// // // //                               ))
// // // //                             ) : (
// // // //                               <option disabled>No districts available</option>
// // // //                             )
// // // //                           ) : key === "currency" ? (
// // // //                             getCurrencyOptions.length > 0 ? (
// // // //                               getCurrencyOptions.map((value) => (
// // // //                                 <option key={value} value={value}>
// // // //                                   {value}
// // // //                                 </option>
// // // //                               ))
// // // //                             ) : (
// // // //                               <option disabled>No currencies available</option>
// // // //                             )
// // // //                           ) : field !== "city_code" && filters[field]?.length > 0 ? (
// // // //                             filters[field].sort().map((value: string) => (
// // // //                               <option key={value} value={value}>
// // // //                                 {value}
// // // //                               </option>
// // // //                             ))
// // // //                           ) : (
// // // //                             <option disabled>No options available</option>
// // // //                           )}
// // // //                         </select>
// // // //                       )}
// // // //                     </div>
// // // //                   ))}
// // // //                 </div>

// // // //                 <div className="overflow-x-auto mb-6">
// // // //                   <table className="w-full border-collapse">
// // // //                     <thead>
// // // //                       <tr className="bg-secondary text-gray-100">
// // // //                         <th className="p-3 text-left text-sm font-semibold">Month-Year</th>
// // // //                         <th className="p-3 text-left text-sm font-semibold">Country</th>
// // // //                         <th className="p-3 text-left text-sm font-semibold">AirlinesTKT</th>
// // // //                         <th className="p-3 text-left text-sm font-semibold">District</th>
// // // //                         <th className="p-3 text-left text-sm font-semibold">Channel</th>
// // // //                         <th className="p-3 text-left text-sm font-semibold">Currency</th>
// // // //                         <th className="p-3 text-right text-sm font-semibold">Fare</th>
// // // //                         <th className="p-3 text-right text-sm font-semibold">Rate (2%) Commission</th>
// // // //                       </tr>
// // // //                     </thead>
// // // //                     <tbody>
// // // //                       {Array.isArray(filteredData) && filteredData.length > 0 ? (
// // // //                         filteredData.map((row, index) => {
// // // //                           const fare = typeof row.totalFare === "number" && !isNaN(row.totalFare) ? row.totalFare : 0;
// // // //                           const commission = fare * 0.02;
// // // //                           console.log(`Row ${index} totalFare:`, row.totalFare);
// // // //                           return (
// // // //                             <tr key={index} className={index % 2 === 0 ? "bg-background" : "bg-primary/10"}>
// // // //                               <td className="p-3 text-sm">{row.month}</td>
// // // //                               <td className="p-3 text-sm">{row.country}</td>
// // // //                               <td className="p-3 text-sm">{row.airlines}</td>
// // // //                               <td className="p-3 text-sm">{row.district}</td>
// // // //                               <td className="p-3 text-sm">{row.channel}</td>
// // // //                               <td className="p-3 text-sm">{row.currency}</td>
// // // //                               <td className="p-3 text-right text-sm">
// // // //                                 {fare.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
// // // //                               </td>
// // // //                               <td className="p-3 text-right text-sm">
// // // //                                 {commission.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
// // // //                               </td>
// // // //                             </tr>
// // // //                           );
// // // //                         })
// // // //                       ) : (
// // // //                         <tr>
// // // //                           <td colSpan={8} className="p-3 text-center text-gray-600">
// // // //                             No data available. Try adjusting filters or refreshing the data.
// // // //                           </td>
// // // //                         </tr>
// // // //                       )}
// // // //                     </tbody>
// // // //                   </table>
// // // //                 </div>

// // // //                 {Array.isArray(filteredData) && filteredData.length > 0 && (
// // // //                   <div className="overflow-x-auto">
// // // //                     <table className="w-full border-collapse">
// // // //                       <thead>
// // // //                         <tr className="bg-secondary text-gray-100">
// // // //                           <th className="p-3 text-left text-sm font-semibold">Total</th>
// // // //                           <th colSpan={4} className="p-3"></th>
// // // //                           <th className="p-3 text-left text-sm font-semibold">Currency</th>
// // // //                           <th className="p-3 text-right text-sm font-semibold">Fare</th>
// // // //                           <th className="p-3 text-right text-sm font-semibold">Rate (2%) Commission</th>
// // // //                         </tr>
// // // //                       </thead>
// // // //                       <tbody>
// // // //                         {computeTotals().map((total, index) => (
// // // //                           <tr key={index} className={index % 2 === 0 ? "bg-background" : "bg-primary/10"}>
// // // //                             <td className="p-3 text-sm font-bold">TOTAL {total.currency}</td>
// // // //                             <td colSpan={4} className="p-3"></td>
// // // //                             <td className="p-3 text-sm">{total.currency}</td>
// // // //                             <td className="p-3 text-right text-sm">
// // // //                               {total.totalFare.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
// // // //                             </td>
// // // //                             <td className="p-3 text-right text-sm">
// // // //                               {total.totalCommission.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
// // // //                             </td>
// // // //                           </tr>
// // // //                         ))}
// // // //                       </tbody>
// // // //                     </table>
// // // //                   </div>
// // // //                 )}
// // // //               </>
// // // //             )}
// // // //           </div>
// // // //         </ErrorBoundary>
// // // //       </div>
// // // //     </ProtectedRoute>
// // // //   );
// // // // }

// // // // // iterasi sebelum ditambahkan fare rate 
// // // // "use client";

// // // // import { useEffect, useState, useMemo, useRef } from "react";
// // // // import Link from "next/link";
// // // // import ProtectedRoute from "./components/ProtectedRoute";
// // // // import { FaHistory, FaSync, FaTimes } from "react-icons/fa";

// // // // type DashboardRow = {
// // // //   month: string;
// // // //   country: string;
// // // //   airlines: string;
// // // //   district: string;
// // // //   channel: string;
// // // //   currency: string;
// // // //   totalFare: number;
// // // //   count: number;
// // // // };

// // // // type Filters = {
// // // //   MonthFlown: string[];
// // // //   countryname: string[];
// // // //   AirlinesTKT: string[];
// // // //   Channel: string[];
// // // //   SalesCurrency: string[];
// // // //   countryDistrictMap: { [country: string]: string[] };
// // // //   countryCurrencyMap: { [country: string]: string[] };
// // // // };

// // // // type FilterKey = "month" | "country" | "airlines" | "district" | "channel" | "currency";

// // // // type FilterField = keyof Omit<Filters, "countryDistrictMap" | "countryCurrencyMap">;

// // // // type TotalByCurrency = {
// // // //   currency: string;
// // // //   totalFare: number;
// // // //   totalCommission: number;
// // // // };

// // // // const filterKeyMap: Record<string, { key: FilterKey; field?: FilterField; label: string }> = {
// // // //   monthFilter: { key: "month", field: "MonthFlown", label: "Month-Year" },
// // // //   countryFilter: { key: "country", field: "countryname", label: "Country" },
// // // //   airlinesFilter: { key: "airlines", field: "AirlinesTKT", label: "AirlinesTKT" },
// // // //   districtFilter: { key: "district", label: "District" },
// // // //   channelFilter: { key: "channel", field: "Channel", label: "Channel" },
// // // //   currencyFilter: { key: "currency", field: "SalesCurrency", label: "Currency" },
// // // // };

// // // // // Error Boundary Component
// // // // const ErrorBoundary: React.FC<{ children: React.ReactNode; fallback: React.ReactNode }> = ({ children, fallback }) => {
// // // //   const [hasError, setHasError] = useState(false);

// // // //   useEffect(() => {
// // // //     setHasError(false);
// // // //   }, [children]);

// // // //   if (hasError) return <>{fallback}</>;

// // // //   try {
// // // //     return <>{children}</>;
// // // //   } catch {
// // // //     setHasError(true);
// // // //     return <>{fallback}</>;
// // // //   }
// // // // };

// // // // // MultiSelect Component
// // // // interface MultiSelectProps {
// // // //   options: string[];
// // // //   selected: string[];
// // // //   onChange: (value: string) => void;
// // // //   onSelectAll: () => void;
// // // //   onClear: () => void;
// // // //   placeholder: string;
// // // //   id: string;
// // // // }

// // // // const MultiSelect: React.FC<MultiSelectProps> = ({
// // // //   options,
// // // //   selected,
// // // //   onChange,
// // // //   onSelectAll,
// // // //   onClear,
// // // //   placeholder,
// // // //   id,
// // // // }) => {
// // // //   const [isOpen, setIsOpen] = useState(false);
// // // //   const [search, setSearch] = useState("");
// // // //   const dropdownRef = useRef<HTMLDivElement>(null);

// // // //   useEffect(() => {
// // // //     const handleClickOutside = (event: MouseEvent) => {
// // // //       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
// // // //         setIsOpen(false);
// // // //       }
// // // //     };
// // // //     document.addEventListener("mousedown", handleClickOutside);
// // // //     return () => document.removeEventListener("mousedown", handleClickOutside);
// // // //   }, []);

// // // //   const filteredOptions = options.filter((option) =>
// // // //     option.toLowerCase().includes(search.toLowerCase())
// // // //   );

// // // //   return (
// // // //     <div className="relative w-full" ref={dropdownRef}>
// // // //       <div
// // // //         className="w-full p-2 border rounded-md bg-white cursor-pointer flex items-center justify-between"
// // // //         onClick={() => setIsOpen(!isOpen)}
// // // //       >
// // // //         <span className="text-sm text-gray-600 truncate">
// // // //           {selected.length > 0 ? selected.join(", ") : placeholder}
// // // //         </span>
// // // //         <svg
// // // //           className={`w-4 h-4 transform ${isOpen ? "rotate-180" : ""}`}
// // // //           fill="none"
// // // //           stroke="currentColor"
// // // //           viewBox="0 24 24"
// // // //         >
// // // //           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
// // // //         </svg>
// // // //       </div>
// // // //       {isOpen && (
// // // //         <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
// // // //           <div className="p-2">
// // // //             <input
// // // //               type="text"
// // // //               className="w-full p-2 border rounded-md text-sm"
// // // //               placeholder="Search..."
// // // //               value={search}
// // // //               onChange={(e) => setSearch(e.target.value)}
// // // //               autoFocus
// // // //             />
// // // //           </div>
// // // //           <div className="flex justify-between p-2 border-b">
// // // //             <button
// // // //               type="button"
// // // //               onClick={() => {
// // // //                 onSelectAll();
// // // //                 setSearch("");
// // // //               }}
// // // //               className="text-xs text-blue-600 hover:underline"
// // // //             >
// // // //               Select All
// // // //             </button>
// // // //             <button
// // // //               type="button"
// // // //               onClick={() => {
// // // //                 onClear();
// // // //                 setSearch("");
// // // //               }}
// // // //               className="text-xs text-blue-600 hover:underline"
// // // //             >
// // // //               Clear
// // // //             </button>
// // // //           </div>
// // // //           {filteredOptions.length > 0 ? (
// // // //             filteredOptions.map((option) => (
// // // //               <div
// // // //                 key={option}
// // // //                 className={`p-2 flex items-center cursor-pointer hover:bg-gray-100 ${
// // // //                   selected.includes(option) ? "bg-blue-50" : ""
// // // //                 }`}
// // // //                 onClick={() => {
// // // //                   onChange(option);
// // // //                   setSearch("");
// // // //                 }}
// // // //               >
// // // //                 <input
// // // //                   type="checkbox"
// // // //                   checked={selected.includes(option)}
// // // //                   onChange={() => onChange(option)}
// // // //                   className="mr-2"
// // // //                   id={`${id}-${option}`}
// // // //                 />
// // // //                 <label htmlFor={`${id}-${option}`} className="text-sm text-gray-800">
// // // //                   {option}
// // // //                 </label>
// // // //               </div>
// // // //             ))
// // // //           ) : (
// // // //             <p className="p-2 text-sm text-gray-500">No options found</p>
// // // //           )}
// // // //         </div>
// // // //       )}
// // // //       {selected.length > 0 && (
// // // //         <div className="mt-2 flex flex-wrap gap-2">
// // // //           {selected.map((value) => (
// // // //             <span
// // // //               key={value}
// // // //               className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
// // // //             >
// // // //               {value}
// // // //               <button
// // // //                 type="button"
// // // //                 onClick={() => onChange(value)}
// // // //                 className="ml-1 focus:outline-none"
// // // //               >
// // // //                 <FaTimes className="w-3 h-3" />
// // // //               </button>
// // // //             </span>
// // // //           ))}
// // // //         </div>
// // // //       )}
// // // //     </div>
// // // //   );
// // // // };

// // // // export default function DashboardPage() {
// // // //   const [data, setData] = useState<DashboardRow[]>([]);
// // // //   const [filteredData, setFilteredData] = useState<DashboardRow[]>([]);
// // // //   const [filters, setFilters] = useState<Filters>({
// // // //     MonthFlown: [],
// // // //     countryname: [],
// // // //     AirlinesTKT: [],
// // // //     Channel: [],
// // // //     SalesCurrency: [],
// // // //     countryDistrictMap: {},
// // // //     countryCurrencyMap: {},
// // // //   });
// // // //   const [filterValues, setFilterValues] = useState<{
// // // //     month: string;
// // // //     country: string;
// // // //     airlines: string[];
// // // //     district: string;
// // // //     channel: string[];
// // // //     currency: string;
// // // //   }>({
// // // //     month: "",
// // // //     country: "",
// // // //     airlines: [],
// // // //     district: "",
// // // //     channel: [],
// // // //     currency: "",
// // // //   });
// // // //   const [error, setError] = useState<string | null>(null);
// // // //   const [isLoading, setIsLoading] = useState(false);

// // // //   const fetchData = async () => {
// // // //     setIsLoading(true);
// // // //     try {
// // // //       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboardSummary`);
// // // //       if (!response.ok) {
// // // //         throw new Error(`HTTP error: ${response.status}`);
// // // //       }
// // // //       const result = await response.json();
// // // //       if (!result.success) {
// // // //         throw new Error(result.message || "Failed to fetch dashboard summary");
// // // //       }
// // // //       console.log("API Data:", result.data);
// // // //       console.log("Filters:", result.filters);
// // // //       const validatedData = Array.isArray(result.data) ? result.data : [];
// // // //       setData(validatedData);
// // // //       setFilteredData(validatedData);
// // // //       setFilters({
// // // //         MonthFlown: result.filters.MonthFlown || [],
// // // //         countryname: result.filters.countryname || [],
// // // //         AirlinesTKT: result.filters.AirlinesTKT || [],
// // // //         Channel: result.filters.Channel || [],
// // // //         SalesCurrency: result.filters.SalesCurrency || [],
// // // //         countryDistrictMap: result.filters.countryDistrictMap || {},
// // // //         countryCurrencyMap: result.filters.countryCurrencyMap || {},
// // // //       });
// // // //       setError(null);
// // // //     } catch (err) {
// // // //       console.error("Error fetching dashboard data:", err);
// // // //       const errorMessage = err instanceof Error ? err.message : String(err);
// // // //       setError(`Failed to load dashboard data: ${errorMessage}. Please try again.`);
// // // //       setData([]);
// // // //       setFilteredData([]);
// // // //     } finally {
// // // //       setIsLoading(false);
// // // //     }
// // // //   };

// // // //   useEffect(() => {
// // // //     fetchData();
// // // //   }, []);

// // // //   useEffect(() => {
// // // //     const newFilteredData = data.filter((row) =>
// // // //       (filterValues.month === "" || row.month === filterValues.month) &&
// // // //       (filterValues.country === "" || row.country === filterValues.country) &&
// // // //       (filterValues.airlines.length === 0 || filterValues.airlines.includes(row.airlines)) &&
// // // //       (filterValues.district === "" || row.district === filterValues.district) &&
// // // //       (filterValues.channel.length === 0 || filterValues.channel.includes(row.channel)) &&
// // // //       (filterValues.currency === "" || row.currency === filterValues.currency)
// // // //     );
// // // //     console.log("Applied Filters:", filterValues, "Filtered Data Length:", newFilteredData.length);
// // // //     setFilteredData(newFilteredData);
// // // //   }, [data, filterValues]);

// // // //   const handleFilterChange = (field: FilterKey, value: string) => {
// // // //     setFilterValues((prev) => {
// // // //       const newValues = { ...prev, [field]: value };
// // // //       if (field === "country") {
// // // //         newValues.district = "";
// // // //         newValues.currency = "";
// // // //       }
// // // //       return newValues;
// // // //     });
// // // //   };

// // // //   const handleCheckboxChange = (field: "airlines" | "channel", value: string) => {
// // // //     setFilterValues((prev) => {
// // // //       const currentValues = prev[field];
// // // //       const newValues = currentValues.includes(value)
// // // //         ? currentValues.filter((v) => v !== value)
// // // //         : [...currentValues, value];
// // // //       return { ...prev, [field]: newValues };
// // // //     });
// // // //   };

// // // //   const handleSelectAll = (field: "airlines" | "channel") => {
// // // //     setFilterValues((prev) => ({
// // // //       ...prev,
// // // //       [field]: filters[field === "airlines" ? "AirlinesTKT" : "Channel"] || [],
// // // //     }));
// // // //   };

// // // //   const handleClear = (field: "airlines" | "channel") => {
// // // //     setFilterValues((prev) => ({ ...prev, [field]: [] }));
// // // //   };

// // // //   const getDistrictOptions = useMemo(() => {
// // // //     if (!filters.countryDistrictMap) return [];
// // // //     if (filterValues.country === "") {
// // // //       return Array.from(new Set(Object.values(filters.countryDistrictMap).flat())).sort();
// // // //     }
// // // //     return (filters.countryDistrictMap[filterValues.country] || []).sort();
// // // //   }, [filters.countryDistrictMap, filterValues.country]);

// // // //   const getCurrencyOptions = useMemo(() => {
// // // //     console.log("CountryCurrencyMap:", filters.countryCurrencyMap);
// // // //     console.log("SalesCurrency:", filters.SalesCurrency);
// // // //     if (filterValues.country === "") {
// // // //       const allCurrencies = filters.countryCurrencyMap
// // // //         ? Array.from(new Set(Object.values(filters.countryCurrencyMap).flat()))
// // // //         : filters.SalesCurrency || [];
// // // //       return allCurrencies.sort();
// // // //     }
// // // //     return (filters.countryCurrencyMap?.[filterValues.country] || filters.SalesCurrency || []).sort();
// // // //   }, [filters.countryCurrencyMap, filterValues.country, filters.SalesCurrency]);

// // // //   const computeTotals = (): TotalByCurrency[] => {
// // // //     const totals = filteredData.reduce((acc, row) => {
// // // //       const fare = typeof row.totalFare === "number" && !isNaN(row.totalFare) ? row.totalFare : 0;
// // // //       const commission = fare * 0.02;
// // // //       if (!acc[row.currency]) {
// // // //         acc[row.currency] = { currency: row.currency, totalFare: 0, totalCommission: 0 };
// // // //       }
// // // //       acc[row.currency].totalFare += fare;
// // // //       acc[row.currency].totalCommission += commission;
// // // //       return acc;
// // // //     }, {} as Record<string, TotalByCurrency>);
// // // //     return Object.values(totals).sort((a, b) => a.currency.localeCompare(b.currency));
// // // //   };

// // // //   return (
// // // //     <ProtectedRoute>
// // // //       <div className="min-h-screen bg-gray-100 text-gray-900 p-4">
// // // //         <header className="mb-4">
// // // //           <h1 className="text-2xl font-bold mb-1 flex justify-between items-center">
// // // //             Airlines Dashboard
// // // //             <div className="flex gap-2">
// // // //               <button
// // // //                 onClick={fetchData}
// // // //                 disabled={isLoading}
// // // //                 className="flex items-center px-3 py-1 bg-blue-600 text-gray-100 font-mono rounded-md hover:bg-blue-700 transition disabled:opacity-50"
// // // //               >
// // // //                 <FaSync className={`inline mr-1 ${isLoading ? "animate-spin" : ""}`} /> Refresh
// // // //               </button>
// // // //               <Link
// // // //                 href="/log-history"
// // // //                 className="flex items-center px-3 py-1 bg-secondary text-gray-100 font-mono rounded-md hover:bg-gray-700 transition"
// // // //               >
// // // //                 <FaHistory className="inline mr-1" /> Log History
// // // //               </Link>
// // // //             </div>
// // // //           </h1>
// // // //           <p className="font-mono text-sm text-gray-700">Summary of ticket data from dashboard_orc</p>
// // // //         </header>
// // // //         <ErrorBoundary
// // // //           fallback={
// // // //             <div className="text-red-500 text-center p-4 bg-red-100 rounded-md">
// // // //               <p>An unexpected error occurred. Please try again.</p>
// // // //               <button
// // // //                 onClick={fetchData}
// // // //                 disabled={isLoading}
// // // //                 className="mt-2 px-3 py-1 bg-blue-500 text-white font-mono rounded-md hover:bg-blue-600 transition disabled:opacity-50"
// // // //               >
// // // //                 <FaSync className={`inline mr-1 ${isLoading ? "animate-spin" : ""}`} /> Try Again
// // // //               </button>
// // // //             </div>
// // // //           }
// // // //         >
// // // //           <div className="max-w-7xl mx-auto border border-gray-300 rounded-lg p-4 bg-white shadow-lg">
// // // //             {error ? (
// // // //               <div className="text-red-500 text-center p-4 bg-red-100 rounded-md">
// // // //                 <p>{error}</p>
// // // //                 <button
// // // //                   onClick={fetchData}
// // // //                   disabled={isLoading}
// // // //                   className="mt-2 px-3 py-1 bg-blue-500 text-white font-mono rounded-md hover:bg-blue-600 transition disabled:opacity-50"
// // // //                 >
// // // //                   <FaSync className={`inline mr-1 ${isLoading ? "animate-spin" : ""}`} /> Try Again
// // // //                 </button>
// // // //               </div>
// // // //             ) : (
// // // //               <>
// // // //                 <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
// // // //                   {Object.entries(filterKeyMap).map(([id, { key, field, label }]) => (
// // // //                     <div key={id}>
// // // //                       <label className="block text-sm font-medium text-gray-900 mb-1">{label}</label>
// // // //                       {key === "airlines" || key === "channel" ? (
// // // //                         <MultiSelect
// // // //                           options={field ? filters[field] || [] : []}
// // // //                           selected={filterValues[key] as string[]}
// // // //                           onChange={(value) => handleCheckboxChange(key as "airlines" | "channel", value)}
// // // //                           onSelectAll={() => handleSelectAll(key as "airlines" | "channel")}
// // // //                           onClear={() => handleClear(key as "airlines" | "channel")}
// // // //                           placeholder={`Select ${label}`}
// // // //                           id={id}
// // // //                         />
// // // //                       ) : (
// // // //                         <select
// // // //                           id={id}
// // // //                           className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
// // // //                           value={filterValues[key] as string}
// // // //                           onChange={(e) => handleFilterChange(key, e.target.value)}
// // // //                         >
// // // //                           <option value="">All</option>
// // // //                           {key === "district" ? (
// // // //                             getDistrictOptions.length > 0 ? (
// // // //                               getDistrictOptions.map((value) => (
// // // //                                 <option key={value} value={value}>
// // // //                                   {value}
// // // //                                 </option>
// // // //                               ))
// // // //                             ) : (
// // // //                               <option disabled>No districts available</option>
// // // //                             )
// // // //                           ) : key === "currency" ? (
// // // //                             getCurrencyOptions.length > 0 ? (
// // // //                               getCurrencyOptions.map((value) => (
// // // //                                 <option key={value} value={value}>
// // // //                                   {value}
// // // //                                 </option>
// // // //                               ))
// // // //                             ) : (
// // // //                               <option disabled>No currencies available</option>
// // // //                             )
// // // //                           ) : field && filters[field]?.length > 0 ? (
// // // //                             filters[field].sort().map((value: string) => (
// // // //                               <option key={value} value={value}>
// // // //                                 {value}
// // // //                               </option>
// // // //                             ))
// // // //                           ) : (
// // // //                             <option disabled>No options available</option>
// // // //                           )}
// // // //                         </select>
// // // //                       )}
// // // //                     </div>
// // // //                   ))}
// // // //                 </div>

// // // //                 <div className="overflow-x-auto mb-6">
// // // //                   <table className="w-full border-collapse">
// // // //                     <thead>
// // // //                       <tr className="bg-secondary text-gray-100">
// // // //                         <th className="p-3 text-left text-sm font-semibold">Month-Year</th>
// // // //                         <th className="p-3 text-left text-sm font-semibold">Country</th>
// // // //                         <th className="p-3 text-left text-sm font-semibold">AirlinesTKT</th>
// // // //                         <th className="p-3 text-left text-sm font-semibold">District</th>
// // // //                         <th className="p-3 text-left text-sm font-semibold">Channel</th>
// // // //                         <th className="p-3 text-left text-sm font-semibold">Currency</th>
// // // //                         <th className="p-3 text-right text-sm font-semibold">Fare</th>
// // // //                         <th className="p-3 text-right text-sm font-semibold">Rate (2%) Commission</th>
// // // //                       </tr>
// // // //                     </thead>
// // // //                     <tbody>
// // // //                       {Array.isArray(filteredData) && filteredData.length > 0 ? (
// // // //                         filteredData.map((row, index) => {
// // // //                           const fare = typeof row.totalFare === "number" && !isNaN(row.totalFare) ? row.totalFare : 0;
// // // //                           const commission = fare * 0.02;
// // // //                           console.log(`Row ${index} totalFare:`, row.totalFare);
// // // //                           return (
// // // //                             <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
// // // //                               <td className="p-3 text-sm">{row.month}</td>
// // // //                               <td className="p-3 text-sm">{row.country}</td>
// // // //                               <td className="p-3 text-sm">{row.airlines}</td>
// // // //                               <td className="p-3 text-sm">{row.district}</td>
// // // //                               <td className="p-3 text-sm">{row.channel}</td>
// // // //                               <td className="p-3 text-sm">{row.currency}</td>
// // // //                               <td className="p-3 text-right text-sm">
// // // //                                 {fare.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
// // // //                               </td>
// // // //                               <td className="p-3 text-right text-sm">
// // // //                                 {commission.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
// // // //                               </td>
// // // //                             </tr>
// // // //                           );
// // // //                         })
// // // //                       ) : (
// // // //                         <tr>
// // // //                           <td colSpan={8} className="p-3 text-center text-gray-600">
// // // //                             No data available. Try adjusting filters or refreshing the data.
// // // //                           </td>
// // // //                         </tr>
// // // //                       )}
// // // //                     </tbody>
// // // //                   </table>
// // // //                 </div>

// // // //                 {Array.isArray(filteredData) && filteredData.length > 0 && (
// // // //                   <div className="overflow-x-auto">
// // // //                     <table className="w-full border-collapse">
// // // //                       <thead>
// // // //                         <tr className="bg-secondary text-gray-100">
// // // //                           <th className="p-3 text-left text-sm font-semibold">Total</th>
// // // //                           <th colSpan={4} className="p-3"></th>
// // // //                           <th className="p-3 text-left text-sm font-semibold">Currency</th>
// // // //                           <th className="p-3 text-right text-sm font-semibold">Fare</th>
// // // //                           <th className="p-3 text-right text-sm font-semibold">Rate (2%) Commission</th>
// // // //                         </tr>
// // // //                       </thead>
// // // //                       <tbody>
// // // //                         {computeTotals().map((total, index) => (
// // // //                           <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
// // // //                             <td className="p-3 text-sm font-bold">TOTAL {total.currency}</td>
// // // //                             <td colSpan={4} className="p-3"></td>
// // // //                             <td className="p-3 text-sm">{total.currency}</td>
// // // //                             <td className="p-3 text-right text-sm">
// // // //                               {total.totalFare.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
// // // //                             </td>
// // // //                             <td className="p-3 text-right text-sm">
// // // //                               {total.totalCommission.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
// // // //                             </td>
// // // //                           </tr>
// // // //                         ))}
// // // //                       </tbody>
// // // //                     </table>
// // // //                   </div>
// // // //                 )}
// // // //               </>
// // // //             )}
// // // //           </div>
// // // //         </ErrorBoundary>
// // // //       </div>
// // // //     </ProtectedRoute>
// // // //   );
// // // // }


// // // // "use client";

// // // // import { useEffect, useState, useMemo, useRef } from "react";
// // // // import Link from "next/link";
// // // // import ProtectedRoute from "./components/ProtectedRoute";
// // // // import { FaHistory, FaSync, FaTimes } from "react-icons/fa";

// // // // type DashboardRow = {
// // // //   month: string;
// // // //   country: string;
// // // //   airlines: string;
// // // //   district: string;
// // // //   channel: string;
// // // //   currency: string;
// // // //   totalFare: number;
// // // //   count: number;
// // // // };

// // // // type Filters = {
// // // //   MonthFlown: string[];
// // // //   countryname: string[];
// // // //   AirlinesTKT: string[];
// // // //   Channel: string[];
// // // //   SalesCurrency: string[];
// // // //   countryDistrictMap: { [country: string]: string[] };
// // // //   countryCurrencyMap: { [country: string]: string[] };
// // // // };

// // // // type FilterKey = "month" | "country" | "airlines" | "district" | "channel" | "currency";

// // // // type FilterField = keyof Omit<Filters, "countryDistrictMap" | "countryCurrencyMap">;

// // // // type TotalByCurrency = {
// // // //   currency: string;
// // // //   totalFare: number;
// // // //   totalCommission: number;
// // // //   commissionRate: number; // Percentage (e.g., 2 for 2%)
// // // // };

// // // // const filterKeyMap: Record<string, { key: FilterKey; field?: FilterField; label: string }> = {
// // // //   monthFilter: { key: "month", field: "MonthFlown", label: "Month-Year" },
// // // //   countryFilter: { key: "country", field: "countryname", label: "Country" },
// // // //   airlinesFilter: { key: "airlines", field: "AirlinesTKT", label: "AirlinesTKT" },
// // // //   districtFilter: { key: "district", label: "District" },
// // // //   channelFilter: { key: "channel", field: "Channel", label: "Channel" },
// // // //   currencyFilter: { key: "currency", field: "SalesCurrency", label: "Currency" },
// // // // };

// // // // // Error Boundary Component
// // // // const ErrorBoundary: React.FC<{ children: React.ReactNode; fallback: React.ReactNode }> = ({ children, fallback }) => {
// // // //   const [hasError, setHasError] = useState(false);

// // // //   useEffect(() => {
// // // //     setHasError(false);
// // // //   }, [children]);

// // // //   if (hasError) return <>{fallback}</>;

// // // //   try {
// // // //     return <>{children}</>;
// // // //   } catch {
// // // //     setHasError(true);
// // // //     return <>{fallback}</>;
// // // //   }
// // // // };

// // // // // MultiSelect Component
// // // // interface MultiSelectProps {
// // // //   options: string[];
// // // //   selected: string[];
// // // //   onChange: (value: string) => void;
// // // //   onSelectAll: () => void;
// // // //   onClear: () => void;
// // // //   placeholder: string;
// // // //   id: string;
// // // // }

// // // // const MultiSelect: React.FC<MultiSelectProps> = ({
// // // //   options,
// // // //   selected,
// // // //   onChange,
// // // //   onSelectAll,
// // // //   onClear,
// // // //   placeholder,
// // // //   id,
// // // // }) => {
// // // //   const [isOpen, setIsOpen] = useState(false);
// // // //   const [search, setSearch] = useState("");
// // // //   const dropdownRef = useRef<HTMLDivElement>(null);

// // // //   useEffect(() => {
// // // //     const handleClickOutside = (event: MouseEvent) => {
// // // //       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
// // // //         setIsOpen(false);
// // // //       }
// // // //     };
// // // //     document.addEventListener("mousedown", handleClickOutside);
// // // //     return () => document.removeEventListener("mousedown", handleClickOutside);
// // // //   }, []);

// // // //   const filteredOptions = options.filter((option) =>
// // // //     option.toLowerCase().includes(search.toLowerCase())
// // // //   );

// // // //   return (
// // // //     <div className="relative w-full" ref={dropdownRef}>
// // // //       <div
// // // //         className="w-full p-2 border rounded-md bg-white cursor-pointer flex items-center justify-between"
// // // //         onClick={() => setIsOpen(!isOpen)}
// // // //       >
// // // //         <span className="text-sm text-gray-600 truncate">
// // // //           {selected.length > 0 ? selected.join(", ") : placeholder}
// // // //         </span>
// // // //         <svg
// // // //           className={`w-4 h-4 transform ${isOpen ? "rotate-180" : ""}`}
// // // //           fill="none"
// // // //           stroke="currentColor"
// // // //           viewBox="0 0 24 24"
// // // //         >
// // // //           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
// // // //         </svg>
// // // //       </div>
// // // //       {isOpen && (
// // // //         <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
// // // //           <div className="p-2">
// // // //             <input
// // // //               type="text"
// // // //               className="w-full p-2 border rounded-md text-sm"
// // // //               placeholder="Search..."
// // // //               value={search}
// // // //               onChange={(e) => setSearch(e.target.value)}
// // // //               autoFocus
// // // //             />
// // // //           </div>
// // // //           <div className="flex justify-between p-2 border-b">
// // // //             <button
// // // //               type="button"
// // // //               onClick={() => {
// // // //                 onSelectAll();
// // // //                 setSearch("");
// // // //               }}
// // // //               className="text-xs text-blue-600 hover:underline"
// // // //             >
// // // //               Select All
// // // //             </button>
// // // //             <button
// // // //               type="button"
// // // //               onClick={() => {
// // // //                 onClear();
// // // //                 setSearch("");
// // // //               }}
// // // //               className="text-xs text-blue-600 hover:underline"
// // // //             >
// // // //               Clear
// // // //             </button>
// // // //           </div>
// // // //           {filteredOptions.length > 0 ? (
// // // //             filteredOptions.map((option) => (
// // // //               <div
// // // //                 key={option}
// // // //                 className={`p-2 flex items-center cursor-pointer hover:bg-gray-100 ${
// // // //                   selected.includes(option) ? "bg-blue-50" : ""
// // // //                 }`}
// // // //                 onClick={() => {
// // // //                   onChange(option);
// // // //                   setSearch("");
// // // //                 }}
// // // //               >
// // // //                 <input
// // // //                   type="checkbox"
// // // //                   checked={selected.includes(option)}
// // // //                   onChange={() => onChange(option)}
// // // //                   className="mr-2"
// // // //                   id={`${id}-${option}`}
// // // //                 />
// // // //                 <label htmlFor={`${id}-${option}`} className="text-sm text-gray-800">
// // // //                   {option}
// // // //                 </label>
// // // //               </div>
// // // //             ))
// // // //           ) : (
// // // //             <p className="p-2 text-sm text-gray-500">No options found</p>
// // // //           )}
// // // //         </div>
// // // //       )}
// // // //       {selected.length > 0 && (
// // // //         <div className="mt-2 flex flex-wrap gap-2">
// // // //           {selected.map((value) => (
// // // //             <span
// // // //               key={value}
// // // //               className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
// // // //             >
// // // //               {value}
// // // //               <button
// // // //                 type="button"
// // // //                 onClick={() => onChange(value)}
// // // //                 className="ml-1 focus:outline-none"
// // // //               >
// // // //                 <FaTimes className="w-3 h-3" />
// // // //               </button>
// // // //             </span>
// // // //           ))}
// // // //         </div>
// // // //       )}
// // // //     </div>
// // // //   );
// // // // };

// // // // export default function DashboardPage() {
// // // //   const [data, setData] = useState<DashboardRow[]>([]);
// // // //   const [filteredData, setFilteredData] = useState<DashboardRow[]>([]);
// // // //   const [filters, setFilters] = useState<Filters>({
// // // //     MonthFlown: [],
// // // //     countryname: [],
// // // //     AirlinesTKT: [],
// // // //     Channel: [],
// // // //     SalesCurrency: [],
// // // //     countryDistrictMap: {},
// // // //     countryCurrencyMap: {},
// // // //   });
// // // //   const [filterValues, setFilterValues] = useState<{
// // // //     month: string;
// // // //     country: string;
// // // //     airlines: string[];
// // // //     district: string;
// // // //     channel: string[];
// // // //     currency: string;
// // // //   }>({
// // // //     month: "",
// // // //     country: "",
// // // //     airlines: [],
// // // //     district: "",
// // // //     channel: [],
// // // //     currency: "",
// // // //   });
// // // //   const [error, setError] = useState<string | null>(null);
// // // //   const [isLoading, setIsLoading] = useState(false);

// // // //   const fetchData = async () => {
// // // //     setIsLoading(true);
// // // //     try {
// // // //       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboardSummary`);
// // // //       if (!response.ok) {
// // // //         throw new Error(`HTTP error: ${response.status}`);
// // // //       }
// // // //       const result = await response.json();
// // // //       if (!result.success) {
// // // //         throw new Error(result.message || "Failed to fetch dashboard summary");
// // // //       }
// // // //       console.log("API Data:", result.data);
// // // //       console.log("Filters:", result.filters);
// // // //       const validatedData = Array.isArray(result.data) ? result.data : [];
// // // //       setData(validatedData);
// // // //       setFilteredData(validatedData);
// // // //       setFilters({
// // // //         MonthFlown: result.filters.MonthFlown || [],
// // // //         countryname: result.filters.countryname || [],
// // // //         AirlinesTKT: result.filters.AirlinesTKT || [],
// // // //         Channel: result.filters.Channel || [],
// // // //         SalesCurrency: result.filters.SalesCurrency || [],
// // // //         countryDistrictMap: result.filters.countryDistrictMap || {},
// // // //         countryCurrencyMap: result.filters.countryCurrencyMap || {},
// // // //       });
// // // //       setError(null);
// // // //     } catch (err) {
// // // //       console.error("Error fetching dashboard data:", err);
// // // //       const errorMessage = err instanceof Error ? err.message : String(err);
// // // //       setError(`Failed to load dashboard data: ${errorMessage}. Please try again.`);
// // // //       setData([]);
// // // //       setFilteredData([]);
// // // //     } finally {
// // // //       setIsLoading(false);
// // // //     }
// // // //   };

// // // //   useEffect(() => {
// // // //     fetchData();
// // // //   }, []);

// // // //   useEffect(() => {
// // // //     const newFilteredData = data.filter((row) =>
// // // //       (filterValues.month === "" || row.month === filterValues.month) &&
// // // //       (filterValues.country === "" || row.country === filterValues.country) &&
// // // //       (filterValues.airlines.length === 0 || filterValues.airlines.includes(row.airlines)) &&
// // // //       (filterValues.district === "" || row.district === filterValues.district) &&
// // // //       (filterValues.channel.length === 0 || filterValues.channel.includes(row.channel)) &&
// // // //       (filterValues.currency === "" || row.currency === filterValues.currency)
// // // //     );
// // // //     console.log("Applied Filters:", filterValues, "Filtered Data Length:", newFilteredData.length);
// // // //     setFilteredData(newFilteredData);
// // // //   }, [data, filterValues]);

// // // //   const handleFilterChange = (field: FilterKey, value: string) => {
// // // //     setFilterValues((prev) => {
// // // //       const newValues = { ...prev, [field]: value };
// // // //       if (field === "country") {
// // // //         newValues.district = "";
// // // //         newValues.currency = "";
// // // //       }
// // // //       return newValues;
// // // //     });
// // // //   };

// // // //   const handleCheckboxChange = (field: "airlines" | "channel", value: string) => {
// // // //     setFilterValues((prev) => {
// // // //       const currentValues = prev[field];
// // // //       const newValues = currentValues.includes(value)
// // // //         ? currentValues.filter((v) => v !== value)
// // // //         : [...currentValues, value];
// // // //       return { ...prev, [field]: newValues };
// // // //     });
// // // //   };

// // // //   const handleSelectAll = (field: "airlines" | "channel") => {
// // // //     setFilterValues((prev) => ({
// // // //       ...prev,
// // // //       [field]: filters[field === "airlines" ? "AirlinesTKT" : "Channel"] || [],
// // // //     }));
// // // //   };

// // // //   const handleClear = (field: "airlines" | "channel") => {
// // // //     setFilterValues((prev) => ({ ...prev, [field]: [] }));
// // // //   };

// // // //   const getDistrictOptions = useMemo(() => {
// // // //     if (!filters.countryDistrictMap) return [];
// // // //     if (filterValues.country === "") {
// // // //       return Array.from(new Set(Object.values(filters.countryDistrictMap).flat())).sort();
// // // //     }
// // // //     return (filters.countryDistrictMap[filterValues.country] || []).sort();
// // // //   }, [filters.countryDistrictMap, filterValues.country]);

// // // //   const getCurrencyOptions = useMemo(() => {
// // // //     console.log("CountryCurrencyMap:", filters.countryCurrencyMap);
// // // //     console.log("SalesCurrency:", filters.SalesCurrency);
// // // //     if (filterValues.country === "") {
// // // //       const allCurrencies = filters.countryCurrencyMap
// // // //         ? Array.from(new Set(Object.values(filters.countryCurrencyMap).flat()))
// // // //         : filters.SalesCurrency || [];
// // // //       return allCurrencies.sort();
// // // //     }
// // // //     return (filters.countryCurrencyMap?.[filterValues.country] || filters.SalesCurrency || []).sort();
// // // //   }, [filters.countryCurrencyMap, filterValues.country, filters.SalesCurrency]);

// // // //   // const getCommissionRate = (country: string, currency: string, totalFare: number): number => {
// // // //   //   if (country.toUpperCase() === "JAPAN") {
// // // //   //     return 3; // 3% for Japan
// // // //   //   }
// // // //   //   if (country.toUpperCase() === "AUSTRALIA" && currency === "AUD") {
// // // //   //     if (totalFare <= 2000000) {
// // // //   //       return 1.8; // 1.8% for AUD <= 2,000,000
// // // //   //     }
// // // //   //     if (totalFare >= 3000000) {
// // // //   //       return 1.65; // 1.65% for AUD >= 3,000,000
// // // //   //     }
// // // //   //     // Linear interpolation between 2M (1.8%) and 3M (1.65%)
// // // //   //     const fareDiff = 3000000 - 2000000;
// // // //   //     const rateDiff = 1.8 - 1.65;
// // // //   //     const fareProgress = (totalFare - 2000000) / fareDiff;
// // // //   //     return 1.8 - rateDiff * fareProgress;
// // // //   //   }
// // // //   //   return 2; // Default 2% for all other countries
// // // //   // };

// // // //   // update rule sesuai permintaan team Revenue
// // // // const getCommissionRate = (country: string, currency: string, totalFare: number): number => {
// // // //   if (country.toUpperCase() === "AUSTRALIA" && currency === "AUD") {
// // // //     // if (totalFare <= 2000000) return //1.80;
// // // //     if (totalFare < 3000000) return 1.80//1.65;
// // // //     if (totalFare < 4000000) return 1.65//1.55;
// // // //     if (totalFare < 5000000) return 1.55//1.30;
// // // //     if (totalFare < 6000000) return 1.30//1.25;
// // // //     if (totalFare < 7000000) return 1.25//1.15;
// // // //     if (totalFare < 8000000) return 1.15//1.05;
// // // //     if (totalFare < 9000000) return 1.05//1.00;
// // // //     if (totalFare < 10000000) return 1.00//0.90;
// // // //     if (totalFare < 11000000) return 0.90//0.90;
// // // //     if (totalFare < 12000000) return 0.90//0.85;
// // // //     if (totalFare < 13000000) return 0.85//0.85;
// // // //     if (totalFare < 14000000) return 0.85//0.80;
// // // //     if (totalFare < 15000000) return 0.80//0.75;  
// // // //     return 0.75; // > 15,000,000 or anything above
// // // //   }

// // // //   if (country.toUpperCase() === "JAPAN") {
// // // //     return 3.0;
// // // //   }

// // // //   return 2.0; // Default
// // // // };


// // // //   const computeTotals = (): TotalByCurrency[] => {
// // // //     const totals = filteredData.reduce((acc, row) => {
// // // //       const fare = typeof row.totalFare === "number" && !isNaN(row.totalFare) ? row.totalFare : 0;
// // // //       if (!acc[row.currency]) {
// // // //         acc[row.currency] = { currency: row.currency, totalFare: 0, totalCommission: 0, commissionRate: 2 };
// // // //       }
// // // //       acc[row.currency].totalFare += fare;
// // // //       return acc;
// // // //     }, {} as Record<string, TotalByCurrency>);

// // // //     // Calculate commission and rate after aggregating fares
// // // //     Object.values(totals).forEach((total) => {
// // // //       const countries = [...new Set(filteredData
// // // //         .filter(row => row.currency === total.currency)
// // // //         .map(row => row.country.toUpperCase()))];
      
// // // //       // If only one country uses this currency, use its rate
// // // //       if (countries.length === 1) {
// // // //         total.commissionRate = getCommissionRate(countries[0], total.currency, total.totalFare);
// // // //       } else {
// // // //         // If multiple countries, use default rate (or handle edge case)
// // // //         total.commissionRate = 2;
// // // //       }
// // // //       total.totalCommission = total.totalFare * (total.commissionRate / 100);
// // // //     });

// // // //     return Object.values(totals).sort((a, b) => a.currency.localeCompare(b.currency));
// // // //   };

// // // //   return (
// // // //     <ProtectedRoute>
// // // //       <div className="min-h-screen bg-gray-100 text-gray-900 p-4">
// // // //         <header className="mb-4">
// // // //           <h1 className="text-2xl font-bold mb-1 flex justify-between items-center">
// // // //             Airlines Dashboard
// // // //             <div className="flex gap-2">
// // // //               <button
// // // //                 onClick={fetchData}
// // // //                 disabled={isLoading}
// // // //                 className="flex items-center px-3 py-1 bg-blue-600 text-gray-100 font-mono rounded-md hover:bg-blue-700 transition disabled:opacity-50"
// // // //               >
// // // //                 <FaSync className={`inline mr-1 ${isLoading ? "animate-spin" : ""}`} /> Refresh
// // // //               </button>
// // // //               <Link
// // // //                 href="/log-history"
// // // //                 className="flex items-center px-3 py-1 bg-secondary text-gray-100 font-mono rounded-md hover:bg-gray-700 transition"
// // // //               >
// // // //                 <FaHistory className="inline mr-1" /> Log History
// // // //               </Link>
// // // //             </div>
// // // //           </h1>
// // // //           <p className="font-mono text-sm text-gray-700">Summary of ticket data from dashboard_orc</p>
// // // //         </header>

// // // //         <ErrorBoundary
// // // //           fallback={
// // // //             <div className="text-red-500 text-center p-4 bg-red-100 rounded-md">
// // // //               <p>An unexpected error occurred. Please try again.</p>
// // // //               <button
// // // //                 onClick={fetchData}
// // // //                 disabled={isLoading}
// // // //                 className="mt-2 px-3 py-1 bg-blue-500 text-white font-mono rounded-md hover:bg-blue-600 transition disabled:opacity-50"
// // // //               >
// // // //                 <FaSync className={`inline mr-1 ${isLoading ? "animate-spin" : ""}`} /> Try Again
// // // //               </button>
// // // //             </div>
// // // //           }
// // // //         >
// // // //           <div className="max-w-7xl mx-auto border border-gray-300 rounded-lg p-4 bg-white shadow-lg">
// // // //             {error ? (
// // // //               <div className="text-red-500 text-center p-4 bg-red-100 rounded-md">
// // // //                 <p>{error}</p>
// // // //                 <button
// // // //                   onClick={fetchData}
// // // //                   disabled={isLoading}
// // // //                   className="mt-2 px-3 py-1 bg-blue-500 text-white font-mono rounded-md hover:bg-blue-600 transition disabled:opacity-50"
// // // //                 >
// // // //                   <FaSync className={`inline mr-1 ${isLoading ? "animate-spin" : ""}`} /> Try Again
// // // //                 </button>
// // // //               </div>
// // // //             ) : (
// // // //               <>
// // // //                 <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
// // // //                   {Object.entries(filterKeyMap).map(([id, { key, field, label }]) => (
// // // //                     <div key={id}>
// // // //                       <label className="block text-sm font-medium text-gray-900 mb-1">{label}</label>
// // // //                       {key === "airlines" || key === "channel" ? (
// // // //                         <MultiSelect
// // // //                           options={field ? filters[field] || [] : []}
// // // //                           selected={filterValues[key] as string[]}
// // // //                           onChange={(value) => handleCheckboxChange(key as "airlines" | "channel", value)}
// // // //                           onSelectAll={() => handleSelectAll(key as "airlines" | "channel")}
// // // //                           onClear={() => handleClear(key as "airlines" | "channel")}
// // // //                           placeholder={`Select ${label}`}
// // // //                           id={id}
// // // //                         />
// // // //                       ) : (
// // // //                         <select
// // // //                           id={id}
// // // //                           className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
// // // //                           value={filterValues[key] as string}
// // // //                           onChange={(e) => handleFilterChange(key, e.target.value)}
// // // //                         >
// // // //                           <option value="">All</option>
// // // //                           {key === "district" ? (
// // // //                             getDistrictOptions.length > 0 ? (
// // // //                               getDistrictOptions.map((value) => (
// // // //                                 <option key={value} value={value}>
// // // //                                   {value}
// // // //                                 </option>
// // // //                               ))
// // // //                             ) : (
// // // //                               <option disabled>No districts available</option>
// // // //                             )
// // // //                           ) : key === "currency" ? (
// // // //                             getCurrencyOptions.length > 0 ? (
// // // //                               getCurrencyOptions.map((value) => (
// // // //                                 <option key={value} value={value}>
// // // //                                   {value}
// // // //                                 </option>
// // // //                               ))
// // // //                             ) : (
// // // //                               <option disabled>No currencies available</option>
// // // //                             )
// // // //                           ) : field && filters[field]?.length > 0 ? (
// // // //                             filters[field].sort().map((value: string) => (
// // // //                               <option key={value} value={value}>
// // // //                                 {value}
// // // //                               </option>
// // // //                             ))
// // // //                           ) : (
// // // //                             <option disabled>No options available</option>
// // // //                           )}
// // // //                         </select>
// // // //                       )}
// // // //                     </div>
// // // //                   ))}
// // // //                 </div>

// // // //                 <div className="overflow-x-auto mb-6">
// // // //                   <table className="w-full border-collapse">
// // // //                     <thead>
// // // //                       <tr className="bg-secondary text-gray-100">
// // // //                         <th className="p-3 text-left text-sm font-semibold">Month-Year</th>
// // // //                         <th className="p-3 text-left text-sm font-semibold">Country</th>
// // // //                         <th className="p-3 text-left text-sm font-semibold">AirlinesTKT</th>
// // // //                         <th className="p-3 text-left text-sm font-semibold">District</th>
// // // //                         <th className="p-3 text-left text-sm font-semibold">Channel</th>
// // // //                         <th className="p-3 text-left text-sm font-semibold">Currency</th>
// // // //                         <th className="p-3 text-right text-sm font-semibold">Fare</th>
// // // //                         <th className="p-3 text-right text-sm font-semibold">Commission</th>
// // // //                       </tr>
// // // //                     </thead>
// // // //                     <tbody>
// // // //                       {Array.isArray(filteredData) && filteredData.length > 0 ? (
// // // //                         filteredData.map((row, index) => {
// // // //                           const fare = typeof row.totalFare === "number" && !isNaN(row.totalFare) ? row.totalFare : 0;
// // // //                           const rate = getCommissionRate(row.country, row.currency, fare);
// // // //                           const commission = fare * (rate / 100);
// // // //                           console.log(`Row ${index} totalFare: ${row.totalFare}, Rate: ${rate}%, Commission: ${commission}`);
// // // //                           return (
// // // //                             <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
// // // //                               <td className="p-3 text-sm">{row.month}</td>
// // // //                               <td className="p-3 text-sm">{row.country}</td>
// // // //                               <td className="p-3 text-sm">{row.airlines}</td>
// // // //                               <td className="p-3 text-sm">{row.district}</td>
// // // //                               <td className="p-3 text-sm">{row.channel}</td>
// // // //                               <td className="p-3 text-sm">{row.currency}</td>
// // // //                               <td className="p-3 text-right text-sm">
// // // //                                 {fare.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
// // // //                               </td>
// // // //                               <td className="p-3 text-right text-sm">
// // // //                                 {commission.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
// // // //                                 <span className="text-xs text-gray-500"> ({rate}%)</span>
// // // //                               </td>
// // // //                             </tr>
// // // //                           );
// // // //                         })
// // // //                       ) : (
// // // //                         <tr>
// // // //                           <td colSpan={8} className="p-3 text-center text-gray-600">
// // // //                             No data available. Try adjusting filters or refreshing the data.
// // // //                           </td>
// // // //                         </tr>
// // // //                       )}
// // // //                     </tbody>
// // // //                   </table>
// // // //                 </div>

// // // //                 {Array.isArray(filteredData) && filteredData.length > 0 && (
// // // //                   <div className="overflow-x-auto">
// // // //                     <table className="w-full border-collapse">
// // // //                       <thead>
// // // //                         <tr className="bg-secondary text-gray-100">
// // // //                           <th className="p-3 text-left text-sm font-semibold">Total</th>
// // // //                           <th colSpan={4} className="p-3"></th>
// // // //                           <th className="p-3 text-left text-sm font-semibold">Currency</th>
// // // //                           <th className="p-3 text-right text-sm font-semibold">Fare</th>
// // // //                           <th className="p-3 text-right text-sm font-semibold">Commission</th>
// // // //                         </tr>
// // // //                       </thead>
// // // //                       <tbody>
// // // //                         {computeTotals().map((total, index) => (
// // // //                           <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
// // // //                             <td className="p-3 text-sm font-bold">TOTAL {total.currency}</td>
// // // //                             <td colSpan={4} className="p-3"></td>
// // // //                             <td className="p-3 text-sm">{total.currency}</td>
// // // //                             <td className="p-3 text-right text-sm">
// // // //                               {total.totalFare.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
// // // //                             </td>
// // // //                             <td className="p-3 text-right text-sm">
// // // //                               {total.totalCommission.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
// // // //                               <span className="text-xs text-gray-500"> ({total.commissionRate}%)</span>
// // // //                             </td>
// // // //                           </tr>
// // // //                         ))}
// // // //                       </tbody>
// // // //                     </table>
// // // //                   </div>
// // // //                 )}
// // // //               </>
// // // //             )}
// // // //           </div>
// // // //         </ErrorBoundary>
// // // //       </div>
// // // //     </ProtectedRoute>
// // // //   );
// // // // }

// // // "use client";

// // // import { useEffect, useState, useMemo, useRef } from "react";
// // // import Link from "next/link";
// // // import ProtectedRoute from "./components/ProtectedRoute";
// // // import { FaHistory, FaSync, FaTimes } from "react-icons/fa";

// // // type DashboardRow = {
// // //   month: string;
// // //   country: string;
// // //   airlines: string;
// // //   district: string;
// // //   channel: string;
// // //   currency: string;
// // //   totalFare: number;
// // //   count: number;
// // // };

// // // type Filters = {
// // //   MonthFlown: string[];
// // //   countryname: string[];
// // //   AirlinesTKT: string[];
// // //   Channel: string[];
// // //   SalesCurrency: string[];
// // //   countryDistrictMap: { [country: string]: string[] };
// // //   countryCurrencyMap: { [country: string]: string[] };
// // // };

// // // type FilterKey = "month" | "country" | "airlines" | "district" | "channel" | "currency";

// // // type FilterField = keyof Omit<Filters, "countryDistrictMap" | "countryCurrencyMap">;

// // // type TotalByCurrency = {
// // //   currency: string;
// // //   totalFare: number;
// // //   totalCommission: number;
// // //   commissionRate: number; // Percentage (e.g., 2 for 2%)
// // // };

// // // const filterKeyMap: Record<string, { key: FilterKey; field?: FilterField; label: string }> = {
// // //   monthFilter: { key: "month", field: "MonthFlown", label: "Month-Year" },
// // //   countryFilter: { key: "country", field: "countryname", label: "Country" },
// // //   airlinesFilter: { key: "airlines", field: "AirlinesTKT", label: "AirlinesTKT" },
// // //   districtFilter: { key: "district", label: "District" },
// // //   channelFilter: { key: "channel", field: "Channel", label: "Channel" },
// // //   currencyFilter: { key: "currency", field: "SalesCurrency", label: "Currency" },
// // // };

// // // // Error Boundary Component
// // // const ErrorBoundary: React.FC<{ children: React.ReactNode; fallback: React.ReactNode }> = ({ children, fallback }) => {
// // //   const [hasError, setHasError] = useState(false);

// // //   useEffect(() => {
// // //     setHasError(false);
// // //   }, [children]);

// // //   if (hasError) return <>{fallback}</>;

// // //   try {
// // //     return <>{children}</>;
// // //   } catch {
// // //     setHasError(true);
// // //     return <>{fallback}</>;
// // //   }
// // // };

// // // // MultiSelect Component
// // // interface MultiSelectProps {
// // //   options: string[];
// // //   selected: string[];
// // //   onChange: (value: string) => void;
// // //   onSelectAll: () => void;
// // //   onClear: () => void;
// // //   placeholder: string;
// // //   id: string;
// // // }

// // // const multiSelectStyles = {
// // //   container: "relative w-full",
// // //   trigger: "w-full p-2 border rounded-md bg-white cursor-pointer flex items-center justify-between",
// // //   text: "text-sm text-gray-600 truncate",
// // //   icon: `w-4 h-4 transform`,
// // //   dropdown: "absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto",
// // //   searchContainer: "p-2",
// // //   searchInput: "w-full p-2 border rounded-md text-sm",
// // //   buttonContainer: "flex justify-between p-2 border-b",
// // //   button: "text-xs text-blue-600 hover:underline",
// // //   option: `p-2 flex items-center cursor-pointer hover:bg-gray-100`,
// // //   selectedOption: "bg-blue-50",
// // //   noOptions: "p-2 text-sm text-gray-500",
// // //   tagsContainer: "mt-2 flex flex-wrap gap-2",
// // //   tag: "inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full",
// // //   tagButton: "ml-1 focus:outline-none",
// // //   tagIcon: "w-3 h-3",
// // // };

// // // const MultiSelect: React.FC<MultiSelectProps> = ({
// // //   options,
// // //   selected,
// // //   onChange,
// // //   onSelectAll,
// // //   onClear,
// // //   placeholder,
// // //   id,
// // // }) => {
// // //   const [isOpen, setIsOpen] = useState(false);
// // //   const [search, setSearch] = useState("");
// // //   const dropdownRef = useRef<HTMLDivElement>(null);

// // //   useEffect(() => {
// // //     const handleClickOutside = (event: MouseEvent) => {
// // //       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
// // //         setIsOpen(false);
// // //       }
// // //     };
// // //     document.addEventListener("mousedown", handleClickOutside);
// // //     return () => document.removeEventListener("mousedown", handleClickOutside);
// // //   }, []);

// // //   const filteredOptions = options.filter((option) =>
// // //     option.toLowerCase().includes(search.toLowerCase())
// // //   );

// // //   return (
// // //     <div className={multiSelectStyles.container} ref={dropdownRef}>
// // //       <div
// // //         className={multiSelectStyles.trigger}
// // //         onClick={() => setIsOpen(!isOpen)}
// // //       >
// // //         <span className={multiSelectStyles.text}>
// // //           {selected.length > 0 ? selected.join(", ") : placeholder}
// // //         </span>
// // //         <svg
// // //           className={`${multiSelectStyles.icon} ${isOpen ? "rotate-180" : ""}`}
// // //           fill="none"
// // //           stroke="currentColor"
// // //           viewBox="0 0 24 24"
// // //         >
// // //           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
// // //         </svg>
// // //       </div>
// // //       {isOpen && (
// // //         <div className={multiSelectStyles.dropdown}>
// // //           <div className={multiSelectStyles.searchContainer}>
// // //             <input
// // //               type="text"
// // //               className={multiSelectStyles.searchInput}
// // //               placeholder="Search..."
// // //               value={search}
// // //               onChange={(e) => setSearch(e.target.value)}
// // //               autoFocus
// // //             />
// // //           </div>
// // //           <div className={multiSelectStyles.buttonContainer}>
// // //             <button
// // //               type="button"
// // //               onClick={() => {
// // //                 onSelectAll();
// // //                 setSearch("");
// // //               }}
// // //               className={multiSelectStyles.button}
// // //             >
// // //               Select All
// // //             </button>
// // //             <button
// // //               type="button"
// // //               onClick={() => {
// // //                 onClear();
// // //                 setSearch("");
// // //               }}
// // //               className={multiSelectStyles.button}
// // //             >
// // //               Clear
// // //             </button>
// // //           </div>
// // //           {filteredOptions.length > 0 ? (
// // //             filteredOptions.map((option) => (
// // //               <div
// // //                 key={option}
// // //                 className={`${multiSelectStyles.option} ${
// // //                   selected.includes(option) ? multiSelectStyles.selectedOption : ""
// // //                 }`}
// // //                 onClick={() => {
// // //                   onChange(option);
// // //                   setSearch("");
// // //                 }}
// // //               >
// // //                 <input
// // //                   type="checkbox"
// // //                   checked={selected.includes(option)}
// // //                   onChange={() => onChange(option)}
// // //                   className="mr-2"
// // //                   id={`${id}-${option}`}
// // //                 />
// // //                 <label htmlFor={`${id}-${option}`} className="text-sm text-gray-800">
// // //                   {option}
// // //                 </label>
// // //               </div>
// // //             ))
// // //           ) : (
// // //             <p className={multiSelectStyles.noOptions}>No options found</p>
// // //           )}
// // //         </div>
// // //       )}
// // //       {selected.length > 0 && (
// // //         <div className={multiSelectStyles.tagsContainer}>
// // //           {selected.map((value) => (
// // //             <span
// // //               key={value}
// // //               className={multiSelectStyles.tag}
// // //             >
// // //               {value}
// // //               <button
// // //                 type="button"
// // //                 onClick={() => onChange(value)}
// // //                 className={multiSelectStyles.tagButton}
// // //               >
// // //                 <FaTimes className={multiSelectStyles.tagIcon} />
// // //               </button>
// // //             </span>
// // //           ))}
// // //         </div>
// // //       )}
// // //     </div>
// // //   );
// // // };

// // // export default function DashboardPage() {
// // //   const [data, setData] = useState<DashboardRow[]>([]);
// // //   const [filteredData, setFilteredData] = useState<DashboardRow[]>([]);
// // //   const [filters, setFilters] = useState<Filters>({
// // //     MonthFlown: [],
// // //     countryname: [],
// // //     AirlinesTKT: [],
// // //     Channel: [],
// // //     SalesCurrency: [],
// // //     countryDistrictMap: {},
// // //     countryCurrencyMap: {},
// // //   });
// // //   const [filterValues, setFilterValues] = useState<{
// // //     month: string;
// // //     country: string;
// // //     airlines: string[];
// // //     district: string;
// // //     channel: string[];
// // //     currency: string;
// // //   }>({
// // //     month: "",
// // //     country: "",
// // //     airlines: [],
// // //     district: "",
// // //     channel: [],
// // //     currency: "",
// // //   });
// // //   const [error, setError] = useState<string | null>(null);
// // //   const [isLoading, setIsLoading] = useState(false);

// // //   const fetchData = async () => {
// // //     setIsLoading(true);
// // //     try {
// // //       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboardSummary`);
// // //       if (!response.ok) {
// // //         throw new Error(`HTTP error: ${response.status}`);
// // //       }
// // //       const result = await response.json();
// // //       if (!result.success) {
// // //         throw new Error(result.message || "Failed to fetch dashboard summary");
// // //       }
// // //       console.log("API Data:", result.data);
// // //       console.log("Filters:", result.filters);
// // //       const validatedData = Array.isArray(result.data) ? result.data : [];
// // //       setData(validatedData);
// // //       setFilteredData(validatedData);
// // //       setFilters({
// // //         MonthFlown: result.filters.MonthFlown || [],
// // //         countryname: result.filters.countryname || [],
// // //         AirlinesTKT: result.filters.AirlinesTKT || [],
// // //         Channel: result.filters.Channel || [],
// // //         SalesCurrency: result.filters.SalesCurrency || [],
// // //         countryDistrictMap: result.filters.countryDistrictMap || {},
// // //         countryCurrencyMap: result.filters.countryCurrencyMap || {},
// // //       });
// // //       setError(null);
// // //     } catch (err) {
// // //       console.error("Error fetching dashboard data:", err);
// // //       const errorMessage = err instanceof Error ? err.message : String(err);
// // //       setError(`Failed to load dashboard data: ${errorMessage}. Please try again.`);
// // //       setData([]);
// // //       setFilteredData([]);
// // //     } finally {
// // //       setIsLoading(false);
// // //     }
// // //   };

// // //   useEffect(() => {
// // //     fetchData();
// // //   }, []);

// // //   useEffect(() => {
// // //     const newFilteredData = data.filter((row) =>
// // //       (filterValues.month === "" || row.month === filterValues.month) &&
// // //       (filterValues.country === "" || row.country === filterValues.country) &&
// // //       (filterValues.airlines.length === 0 || filterValues.airlines.includes(row.airlines)) &&
// // //       (filterValues.district === "" || row.district === filterValues.district) &&
// // //       (filterValues.channel.length === 0 || filterValues.channel.includes(row.channel)) &&
// // //       (filterValues.currency === "" || row.currency === filterValues.currency)
// // //     );
// // //     console.log("Applied Filters:", filterValues, "Filtered Data Length:", newFilteredData.length);
// // //     setFilteredData(newFilteredData);
// // //   }, [data, filterValues]);

// // //   const handleFilterChange = (field: FilterKey, value: string) => {
// // //     setFilterValues((prev) => {
// // //       const newValues = { ...prev, [field]: value };
// // //       if (field === "country") {
// // //         newValues.district = "";
// // //         // Only reset currency if the new country has valid currencies
// // //         const validCurrencies = filters.countryCurrencyMap?.[value] || [];
// // //         newValues.currency = validCurrencies.includes(prev.currency) ? prev.currency : "";
// // //       }
// // //       return newValues;
// // //     });
// // //   };

// // //   const handleCheckboxChange = (field: "airlines" | "channel", value: string) => {
// // //     setFilterValues((prev) => {
// // //       const currentValues = prev[field];
// // //       const newValues = currentValues.includes(value)
// // //         ? currentValues.filter((v) => v !== value)
// // //         : [...currentValues, value];
// // //       return { ...prev, [field]: newValues };
// // //     });
// // //   };

// // //   const handleSelectAll = (field: "airlines" | "channel") => {
// // //     setFilterValues((prev) => ({
// // //       ...prev,
// // //       [field]: filters[field === "airlines" ? "AirlinesTKT" : "Channel"] || [],
// // //     }));
// // //   };

// // //   const handleClear = (field: "airlines" | "channel") => {
// // //     setFilterValues((prev) => ({ ...prev, [field]: [] }));
// // //   };

// // //   const getDistrictOptions = useMemo(() => {
// // //     if (!filters.countryDistrictMap) return [];
// // //     if (filterValues.country === "") {
// // //       return Array.from(new Set(Object.values(filters.countryDistrictMap).flat())).sort();
// // //     }
// // //     return (filters.countryCurrencyMap?.[filterValues.country] || []).sort();
// // //   }, [filters.countryDistrictMap, filterValues.country]);

// // //   const getCurrencyOptions = useMemo(() => {
// // //     console.log("CountryCurrencyMap:", filters.countryCurrencyMap);
// // //     console.log("Selected Country:", filterValues.country);
// // //     console.log("CountryCurrencyMap for country:", filters.countryCurrencyMap?.[filterValues.country]);
// // //     if (filterValues.country === "") {
// // //       return filters.countryCurrencyMap
// // //         ? Array.from(new Set(Object.values(filters.countryCurrencyMap).flat())).sort()
// // //         : [];
// // //     }
// // //     return (filters.countryCurrencyMap?.[filterValues.country] || []).sort();
// // //   }, [filters.countryCurrencyMap, filterValues.country]);

// // //   // Update rule sesuai permintaan team Revenue
// // //   const getCommissionRate = (country: string, currency: string, totalFare: number): number => {
// // //     if (country.toUpperCase() === "AUSTRALIA" && currency === "AUD") {
// // //       if (totalFare < 3000000) return 1.80;
// // //       if (totalFare < 4000000) return 1.65;
// // //       if (totalFare < 5000000) return 1.55;
// // //       if (totalFare < 6000000) return 1.30;
// // //       if (totalFare < 7000000) return 1.25;
// // //       if (totalFare < 8000000) return 1.15;
// // //       if (totalFare < 9000000) return 1.05;
// // //       if (totalFare < 10000000) return 1.00;
// // //       if (totalFare < 11000000) return 0.90;
// // //       if (totalFare < 12000000) return 0.90;
// // //       if (totalFare < 13000000) return 0.85;
// // //       if (totalFare < 14000000) return 0.85;
// // //       if (totalFare < 15000000) return 0.80;
// // //       return 0.75; // > 15,000,000 or anything above
// // //     }

// // //     if (country.toUpperCase() === "JAPAN") {
// // //       return 3.0;
// // //     }

// // //     return 2.0; // Default
// // //   };

// // //   const computeTotals = (): TotalByCurrency[] => {
// // //     const totals = filteredData.reduce((acc, row) => {
// // //       const fare = typeof row.totalFare === "number" && !isNaN(row.totalFare) ? row.totalFare : 0;
// // //       if (!acc[row.currency]) {
// // //         acc[row.currency] = { currency: row.currency, totalFare: 0, totalCommission: 0, commissionRate: 2 };
// // //       }
// // //       acc[row.currency].totalFare += fare;
// // //       return acc;
// // //     }, {} as Record<string, TotalByCurrency>);

// // //     // Calculate commission and rate after aggregating fares
// // //     Object.values(totals).forEach((total) => {
// // //       const countries = [...new Set(filteredData
// // //         .filter(row => row.currency === total.currency)
// // //         .map(row => row.country.toUpperCase()))];
      
// // //       // If only one country uses this currency, use its rate
// // //       if (countries.length === 1) {
// // //         total.commissionRate = getCommissionRate(countries[0], total.currency, total.totalFare);
// // //       } else {
// // //         // If multiple countries, use default rate (or handle edge case)
// // //         total.commissionRate = 2;
// // //       }
// // //       total.totalCommission = total.totalFare * (total.commissionRate / 100);
// // //     });

// // //     return Object.values(totals).sort((a, b) => a.currency.localeCompare(b.currency));
// // //   };

// // //   return (
// // //     <ProtectedRoute><div className="min-h-screen bg-background text-gray-900 p-4">
// // //       <header className="mb-4">
// // //         <h1 className="text-2xl font-bold mb-1 flex justify-between items-center">
// // //           Airlines Dashboard
// // //           <div className="flex gap-2">
// // //             <button
// // //               onClick={fetchData}
// // //               disabled={isLoading}
// // //               className="flex items-center px-3 py-1 bg-blue-600 text-gray-100 font-mono rounded-md hover:bg-blue-700 transition disabled:opacity-50"
// // //             >
// // //               <FaSync className={`inline mr-1 ${isLoading ? "animate-spin" : ""}`} /> Refresh
// // //             </button>
// // //             <Link
// // //               href="/log-history"
// // //               className="flex items-center px-3 py-1 bg-secondary text-gray-100 font-mono rounded-md hover:bg-secondary transition"
// // //             >
// // //               <FaHistory className="inline mr-1" /> Log History
// // //             </Link>
// // //           </div>
// // //         </h1>
// // //         <p className="font-mono text-sm text-gray-700">Summary of ticket data from dashboard_orc</p>
// // //       </header>

// // //         <ErrorBoundary
// // //           fallback={
// // //             <div className="text-red-500 text-center p-4 bg-red-100 rounded-md">
// // //               <p>An unexpected error occurred. Please try again.</p>
// // //               <button
// // //                 onClick={fetchData}
// // //                 disabled={isLoading}
// // //                 className="mt-2 px-3 py-1 bg-blue-500 text-white font-mono rounded-md hover:bg-blue-600 transition disabled:opacity-50"
// // //               >
// // //                 <FaSync className={`inline mr-1 ${isLoading ? "animate-spin" : ""}`} /> Try Again
// // //               </button>
// // //             </div>
// // //           }
// // //         >
// // //           <div className="max-w-7xl mx-auto border border-gray-300 rounded-lg p-4 bg-white shadow-lg">
// // //             {error ? (
// // //               <div className="text-red-500 text-center p-4 bg-red-100 rounded-md">
// // //                 <p>{error}</p>
// // //                 <button
// // //                   onClick={fetchData}
// // //                   disabled={isLoading}
// // //                   className="mt-2 px-3 py-1 bg-blue-500 text-white font-mono rounded-md hover:bg-blue-600 transition disabled:opacity-50"
// // //                 >
// // //                   <FaSync className={`inline mr-1 ${isLoading ? "animate-spin" : ""}`} /> Try Again
// // //                 </button>
// // //               </div>
// // //             ) : (
// // //               <>
// // //                 <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
// // //                   {Object.entries(filterKeyMap).map(([id, { key, field, label }]) => (
// // //                     <div key={id}>
// // //                       <label className="block text-sm font-medium text-gray-900 mb-1">{label}</label>
// // //                       {key === "airlines" || key === "channel" ? (
// // //                         <MultiSelect
// // //                           options={field ? filters[field] || [] : []}
// // //                           selected={filterValues[key] as string[]}
// // //                           onChange={(value) => handleCheckboxChange(key as "airlines" | "channel", value)}
// // //                           onSelectAll={() => handleSelectAll(key as "airlines" | "channel")}
// // //                           onClear={() => handleClear(key as "airlines" | "channel")}
// // //                           placeholder={`Select ${label}`}
// // //                           id={id}
// // //                         />
// // //                       ) : (
// // //                         <select
// // //                           id={id}
// // //                           className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
// // //                           value={filterValues[key] as string}
// // //                           onChange={(e) => handleFilterChange(key, e.target.value)}
// // //                         >
// // //                           <option value="">All</option>
// // //                           {key === "district" ? (
// // //                             getDistrictOptions.length > 0 ? (
// // //                               getDistrictOptions.map((value) => (
// // //                                 <option key={value} value={value}>
// // //                                   {value}
// // //                                 </option>
// // //                               ))
// // //                             ) : (
// // //                               <option disabled>No districts available</option>
// // //                             )
// // //                           ) : key === "currency" ? (
// // //                             getCurrencyOptions.length > 0 ? (
// // //                               getCurrencyOptions.map((value) => (
// // //                                 <option key={value} value={value}>
// // //                                   {value}
// // //                                 </option>
// // //                               ))
// // //                             ) : (
// // //                               <option disabled>No currencies available</option>
// // //                             )
// // //                           ) : field && filters[field]?.length > 0 ? (
// // //                             filters[field].sort().map((value: string) => (
// // //                               <option key={value} value={value}>
// // //                                 {value}
// // //                               </option>
// // //                             ))
// // //                           ) : (
// // //                             <option disabled>No options available</option>
// // //                           )}
// // //                         </select>
// // //                       )}
// // //                     </div>
// // //                   ))}
// // //                 </div>

// // //                 <div className="overflow-x-auto mb-6">
// // //                   <table className="w-full border-collapse">
// // //                     <thead>
// // //                       <tr className="bg-secondary text-gray-100">
// // //                         <th className="p-3 text-left text-sm font-semibold">Month-Year</th>
// // //                         <th className="p-3 text-left text-sm font-semibold">Country</th>
// // //                         <th className="p-3 text-left text-sm font-semibold">AirlinesTKT</th>
// // //                         <th className="p-3 text-left text-sm font-semibold">District</th>
// // //                         <th className="p-3 text-left text-sm font-semibold">Channel</th>
// // //                         <th className="p-3 text-left text-sm font-semibold">Currency</th>
// // //                         <th className="p-3 text-right text-sm font-semibold">Fare</th>
// // //                         <th className="p-3 text-right text-sm font-semibold">Commission</th>
// // //                       </tr>
// // //                     </thead>
// // //                     <tbody>
// // //                       {Array.isArray(filteredData) && filteredData.length > 0 ? (
// // //                         filteredData.map((row, index) => {
// // //                           const fare = typeof row.totalFare === "number" && !isNaN(row.totalFare) ? row.totalFare : 0;
// // //                           const rate = getCommissionRate(row.country, row.currency, fare);
// // //                           const commission = fare * (rate / 100);
// // //                           console.log(`Row ${index} totalFare: ${row.totalFare}, Rate: ${rate}%, Commission: ${commission}`);
// // //                           return (
// // //                             <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
// // //                               <td className="p-3 text-sm">{row.month}</td>
// // //                               <td className="p-3 text-sm">{row.country}</td>
// // //                               <td className="p-3 text-sm">{row.airlines}</td>
// // //                               <td className="p-3 text-sm">{row.district}</td>
// // //                               <td className="p-3 text-sm">{row.channel}</td>
// // //                               <td className="p-3 text-sm">{row.currency}</td>
// // //                               <td className="p-3 text-right text-sm">
// // //                                 {fare.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
// // //                               </td>
// // //                               <td className="p-3 text-right text-sm">
// // //                                 {commission.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
// // //                                 <span className="text-xs text-gray-500"> ({rate}%)</span>
// // //                               </td>
// // //                             </tr>
// // //                           );
// // //                         })
// // //                       ) : (
// // //                         <tr>
// // //                           <td colSpan={8} className="p-3 text-center text-gray-600">
// // //                             No data available. Try adjusting filters or refreshing the data.
// // //                           </td>
// // //                         </tr>
// // //                       )}
// // //                     </tbody>
// // //                   </table>
// // //                 </div>

// // //                 {Array.isArray(filteredData) && filteredData.length > 0 && (
// // //                   <div className="overflow-x-auto">
// // //                     <table className="w-full border-collapse">
// // //                       <thead>
// // //                         <tr className="bg-secondary text-gray-100">
// // //                           <th className="p-3 text-left text-sm font-semibold">Total</th>
// // //                           <th colSpan={4} className="p-3"></th>
// // //                           <th className="p-3 text-left text-sm font-semibold">Currency</th>
// // //                           <th className="p-3 text-right text-sm font-semibold">Fare</th>
// // //                           <th className="p-3 text-right text-sm font-semibold">Commission</th>
// // //                         </tr>
// // //                       </thead>
// // //                       <tbody>
// // //                         {computeTotals().map((total, index) => (
// // //                           <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
// // //                             <td className="p-3 text-sm font-bold">TOTAL {total.currency}</td>
// // //                             <td colSpan={4} className="p-3"></td>
// // //                             <td className="p-3 text-sm">{total.currency}</td>
// // //                             <td className="p-3 text-right text-sm">
// // //                               {total.totalFare.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
// // //                             </td>
// // //                             <td className="p-3 text-right text-sm">
// // //                               {total.totalCommission.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
// // //                               <span className="text-xs text-gray-500"> ({total.commissionRate}%)</span>
// // //                             </td>
// // //                           </tr>
// // //                         ))}
// // //                       </tbody>
// // //                     </table>
// // //                   </div>
// // //                 )}
// // //               </>
// // //             )}
// // //           </div>
// // //         </ErrorBoundary>
// // //       </div>
// // //     </ProtectedRoute>
// // //   );
// // // }

// // // "use client";

// // // import { useEffect, useState, useMemo, useRef } from "react";
// // // import Link from "next/link";
// // // import ProtectedRoute from "./components/ProtectedRoute";
// // // import { FaHistory, FaSync, FaTimes, FaFileExport } from "react-icons/fa";

// // // type DashboardRow = {
// // //   month: string;
// // //   country: string;
// // //   airlines: string;
// // //   district: string;
// // //   channel: string;
// // //   currency: string;
// // //   totalFare: number;
// // //   count: number;
// // // };

// // // type Filters = {
// // //   MonthFlown: string[];
// // //   countryname: string[];
// // //   AirlinesTKT: string[];
// // //   Channel: string[];
// // //   SalesCurrency: string[];
// // //   countryDistrictMap: { [country: string]: string[] };
// // //   countryCurrencyMap: { [country: string]: string[] };
// // // };

// // // type FilterKey = "month" | "country" | "airlines" | "district" | "channel" | "currency";

// // // type FilterField = keyof Omit<Filters, "countryDistrictMap" | "countryCurrencyMap">;

// // // type TotalByCurrency = {
// // //   currency: string;
// // //   totalFare: number;
// // //   totalCommission: number;
// // //   commissionRate: number; // Percentage (e.g., 2 for 2%)
// // // };

// // // const filterKeyMap: Record<string, { key: FilterKey; field?: FilterField; label: string }> = {
// // //   monthFilter: { key: "month", field: "MonthFlown", label: "Month-Year" },
// // //   countryFilter: { key: "country", field: "countryname", label: "Country" },
// // //   airlinesFilter: { key: "airlines", field: "AirlinesTKT", label: "AirlinesTKT" },
// // //   districtFilter: { key: "district", label: "District" },
// // //   channelFilter: { key: "channel", field: "Channel", label: "Channel" },
// // //   currencyFilter: { key: "currency", field: "SalesCurrency", label: "Currency" },
// // // };

// // // // Error Boundary Component
// // // const ErrorBoundary: React.FC<{ children: React.ReactNode; fallback: React.ReactNode }> = ({ children, fallback }) => {
// // //   const [hasError, setHasError] = useState(false);

// // //   useEffect(() => {
// // //     setHasError(false);
// // //   }, [children]);

// // //   if (hasError) return <>{fallback}</>;

// // //   try {
// // //     return <>{children}</>;
// // //   } catch {
// // //     setHasError(true);
// // //     return <>{fallback}</>;
// // //   }
// // // };

// // // // MultiSelect Component
// // // interface MultiSelectProps {
// // //   options: string[];
// // //   selected: string[];
// // //   onChange: (value: string) => void;
// // //   onSelectAll: () => void;
// // //   onClear: () => void;
// // //   placeholder: string;
// // //   id: string;
// // // }

// // // const multiSelectStyles = {
// // //   container: "relative w-full",
// // //   trigger: "w-full p-2 border rounded-md bg-white cursor-pointer flex items-center justify-between",
// // //   text: "text-sm text-gray-600 truncate",
// // //   icon: `w-4 h-4 transform`,
// // //   dropdown: "absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto",
// // //   searchContainer: "p-2",
// // //   searchInput: "w-full p-2 border rounded-md text-sm",
// // //   buttonContainer: "flex justify-between p-2 border-b",
// // //   button: "text-xs text-blue-600 hover:underline",
// // //   option: `p-2 flex items-center cursor-pointer hover:bg-gray-100`,
// // //   selectedOption: "bg-blue-50",
// // //   noOptions: "p-2 text-sm text-gray-500",
// // //   tagsContainer: "mt-2 flex flex-wrap gap-2",
// // //   tag: "inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full",
// // //   tagButton: "ml-1 focus:outline-none",
// // //   tagIcon: "w-3 h-3",
// // // };

// // // const MultiSelect: React.FC<MultiSelectProps> = ({
// // //   options,
// // //   selected,
// // //   onChange,
// // //   onSelectAll,
// // //   onClear,
// // //   placeholder,
// // //   id,
// // // }) => {
// // //   const [isOpen, setIsOpen] = useState(false);
// // //   const [search, setSearch] = useState("");
// // //   const dropdownRef = useRef<HTMLDivElement>(null);

// // //   useEffect(() => {
// // //     const handleClickOutside = (event: MouseEvent) => {
// // //       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
// // //         setIsOpen(false);
// // //       }
// // //     };
// // //     document.addEventListener("mousedown", handleClickOutside);
// // //     return () => document.removeEventListener("mousedown", handleClickOutside);
// // //   }, []);

// // //   const filteredOptions = options.filter((option) =>
// // //     option.toLowerCase().includes(search.toLowerCase())
// // //   );

// // //   return (
// // //     <div className={multiSelectStyles.container} ref={dropdownRef}>
// // //       <div
// // //         className={multiSelectStyles.trigger}
// // //         onClick={() => setIsOpen(!isOpen)}
// // //       >
// // //         <span className={multiSelectStyles.text}>
// // //           {selected.length > 0 ? selected.join(", ") : placeholder}
// // //         </span>
// // //         <svg
// // //           className={`${multiSelectStyles.icon} ${isOpen ? "rotate-180" : ""}`}
// // //           fill="none"
// // //           stroke="currentColor"
// // //           viewBox="0 0 24 24"
// // //         >
// // //           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
// // //         </svg>
// // //       </div>
// // //       {isOpen && (
// // //         <div className={multiSelectStyles.dropdown}>
// // //           <div className={multiSelectStyles.searchContainer}>
// // //             <input
// // //               type="text"
// // //               className={multiSelectStyles.searchInput}
// // //               placeholder="Search..."
// // //               value={search}
// // //               onChange={(e) => setSearch(e.target.value)}
// // //               autoFocus
// // //             />
// // //           </div>
// // //           <div className={multiSelectStyles.buttonContainer}>
// // //             <button
// // //               type="button"
// // //               onClick={() => {
// // //                 onSelectAll();
// // //                 setSearch("");
// // //               }}
// // //               className={multiSelectStyles.button}
// // //             >
// // //               Select All
// // //             </button>
// // //             <button
// // //               type="button"
// // //               onClick={() => {
// // //                 onClear();
// // //                 setSearch("");
// // //               }}
// // //               className={multiSelectStyles.button}
// // //             >
// // //               Clear
// // //             </button>
// // //           </div>
// // //           {filteredOptions.length > 0 ? (
// // //             filteredOptions.map((option) => (
// // //               <div
// // //                 key={option}
// // //                 className={`${multiSelectStyles.option} ${
// // //                   selected.includes(option) ? multiSelectStyles.selectedOption : ""
// // //                 }`}
// // //                 onClick={() => {
// // //                   onChange(option);
// // //                   setSearch("");
// // //                 }}
// // //               >
// // //                 <input
// // //                   type="checkbox"
// // //                   checked={selected.includes(option)}
// // //                   onChange={() => onChange(option)}
// // //                   className="mr-2"
// // //                   id={`${id}-${option}`}
// // //                 />
// // //                 <label htmlFor={`${id}-${option}`} className="text-sm text-gray-800">
// // //                   {option}
// // //                 </label>
// // //               </div>
// // //             ))
// // //           ) : (
// // //             <p className={multiSelectStyles.noOptions}>No options found</p>
// // //           )}
// // //         </div>
// // //       )}
// // //       {selected.length > 0 && (
// // //         <div className={multiSelectStyles.tagsContainer}>
// // //           {selected.map((value) => (
// // //             <span
// // //               key={value}
// // //               className={multiSelectStyles.tag}
// // //             >
// // //               {value}
// // //               <button
// // //                 type="button"
// // //                 onClick={() => onChange(value)}
// // //                 className={multiSelectStyles.tagButton}
// // //               >
// // //                 <FaTimes className={multiSelectStyles.tagIcon} />
// // //               </button>
// // //             </span>
// // //           ))}
// // //         </div>
// // //       )}
// // //     </div>
// // //   );
// // // };

// // // // Utility function to convert data to CSV
// // // const convertToCSV = (data: any[], headers: string[], valueMappers: ((row: any) => string)[]) => {
// // //   const csvRows = [
// // //     headers.join(','), // Header row
// // //     ...data.map((row) =>
// // //       valueMappers.map((mapper) => `"${mapper(row).replace(/"/g, '""')}"`).join(',')
// // //     ),
// // //   ];
// // //   return csvRows.join('\n');
// // // };

// // // // Utility function to download CSV
// // // const downloadCSV = (csvContent: string, filename: string) => {
// // //   const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
// // //   const link = document.createElement('a');
// // //   const url = URL.createObjectURL(blob);
// // //   link.setAttribute('href', url);
// // //   link.setAttribute('download', filename);
// // //   link.style.visibility = 'hidden';
// // //   document.body.appendChild(link);
// // //   link.click();
// // //   document.body.removeChild(link);
// // // };

// // // export default function DashboardPage() {
// // //   const [data, setData] = useState<DashboardRow[]>([]);
// // //   const [filteredData, setFilteredData] = useState<DashboardRow[]>([]);
// // //   const [filters, setFilters] = useState<Filters>({
// // //     MonthFlown: [],
// // //     countryname: [],
// // //     AirlinesTKT: [],
// // //     Channel: [],
// // //     SalesCurrency: [],
// // //     countryDistrictMap: {},
// // //     countryCurrencyMap: {},
// // //   });
// // //   const [filterValues, setFilterValues] = useState<{
// // //     month: string;
// // //     country: string;
// // //     airlines: string[];
// // //     district: string;
// // //     channel: string[];
// // //     currency: string;
// // //   }>({
// // //     month: "",
// // //     country: "",
// // //     airlines: [],
// // //     district: "",
// // //     channel: [],
// // //     currency: "",
// // //   });
// // //   const [error, setError] = useState<string | null>(null);
// // //   const [isLoading, setIsLoading] = useState(false);
// // //   const [isExportingDetailed, setIsExportingDetailed] = useState(false);

// // //   const fetchData = async () => {
// // //     setIsLoading(true);
// // //     try {
// // //       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboardSummary`);
// // //       if (!response.ok) {
// // //         throw new Error(`HTTP error: ${response.status}`);
// // //       }
// // //       const result = await response.json();
// // //       if (!result.success) {
// // //         throw new Error(result.message || "Failed to fetch dashboard summary");
// // //       }
// // //       console.log("API Data:", result.data);
// // //       console.log("Filters:", result.filters);
// // //       const validatedData = Array.isArray(result.data) ? result.data : [];
// // //       setData(validatedData);
// // //       setFilteredData(validatedData);
// // //       setFilters({
// // //         MonthFlown: result.filters.MonthFlown || [],
// // //         countryname: result.filters.countryname || [],
// // //         AirlinesTKT: result.filters.AirlinesTKT || [],
// // //         Channel: result.filters.Channel || [],
// // //         SalesCurrency: result.filters.SalesCurrency || [],
// // //         countryDistrictMap: result.filters.countryDistrictMap || {},
// // //         countryCurrencyMap: result.filters.countryCurrencyMap || {},
// // //       });
// // //       setError(null);
// // //     } catch (err) {
// // //       console.error("Error fetching dashboard data:", err);
// // //       const errorMessage = err instanceof Error ? err.message : String(err);
// // //       setError(`Failed to load dashboard data: ${errorMessage}. Please try again.`);
// // //       setData([]);
// // //       setFilteredData([]);
// // //     } finally {
// // //       setIsLoading(false);
// // //     }
// // //   };

// // //   useEffect(() => {
// // //     fetchData();
// // //   }, []);

// // //   useEffect(() => {
// // //     const newFilteredData = data.filter((row) =>
// // //       (filterValues.month === "" || row.month === filterValues.month) &&
// // //       (filterValues.country === "" || row.country === filterValues.country) &&
// // //       (filterValues.airlines.length === 0 || filterValues.airlines.includes(row.airlines)) &&
// // //       (filterValues.district === "" || row.district === filterValues.district) &&
// // //       (filterValues.channel.length === 0 || filterValues.channel.includes(row.channel)) &&
// // //       (filterValues.currency === "" || row.currency === filterValues.currency)
// // //     );
// // //     console.log("Applied Filters:", filterValues, "Filtered Data Length:", newFilteredData.length);
// // //     setFilteredData(newFilteredData);
// // //   }, [data, filterValues]);

// // //   const handleFilterChange = (field: FilterKey, value: string) => {
// // //     setFilterValues((prev) => {
// // //       const newValues = { ...prev, [field]: value };
// // //       if (field === "country") {
// // //         newValues.district = "";
// // //         const validCurrencies = filters.countryCurrencyMap?.[value] || [];
// // //         newValues.currency = validCurrencies.includes(prev.currency) ? prev.currency : "";
// // //       }
// // //       return newValues;
// // //     });
// // //   };

// // //   const handleCheckboxChange = (field: "airlines" | "channel", value: string) => {
// // //     setFilterValues((prev) => {
// // //       const currentValues = prev[field];
// // //       const newValues = currentValues.includes(value)
// // //         ? currentValues.filter((v) => v !== value)
// // //         : [...currentValues, value];
// // //       return { ...prev, [field]: newValues };
// // //     });
// // //   };

// // //   const handleSelectAll = (field: "airlines" | "channel") => {
// // //     setFilterValues((prev) => ({
// // //       ...prev,
// // //       [field]: filters[field === "airlines" ? "AirlinesTKT" : "Channel"] || [],
// // //     }));
// // //   };

// // //   const handleClear = (field: "airlines" | "channel") => {
// // //     setFilterValues((prev) => ({ ...prev, [field]: [] }));
// // //   };

// // //   const getDistrictOptions = useMemo(() => {
// // //     if (!filters.countryDistrictMap) return [];
// // //     if (filterValues.country === "") {
// // //       return Array.from(new Set(Object.values(filters.countryDistrictMap).flat())).sort();
// // //     }
// // //     return (filters.countryDistrictMap?.[filterValues.country] || []).sort();
// // //   }, [filters.countryDistrictMap, filterValues.country]);

// // //   const getCurrencyOptions = useMemo(() => {
// // //     console.log("CountryCurrencyMap:", filters.countryCurrencyMap);
// // //     console.log("Selected Country:", filterValues.country);
// // //     console.log("CountryCurrencyMap for country:", filters.countryCurrencyMap?.[filterValues.country]);
// // //     if (filterValues.country === "") {
// // //       return filters.countryCurrencyMap
// // //         ? Array.from(new Set(Object.values(filters.countryCurrencyMap).flat())).sort()
// // //         : [];
// // //     }
// // //     return (filters.countryCurrencyMap?.[filterValues.country] || []).sort();
// // //   }, [filters.countryCurrencyMap, filterValues.country]);

// // //   const getCommissionRate = (country: string, currency: string, totalFare: number): number => {
// // //     if (country.toUpperCase() === "AUSTRALIA" && currency === "AUD") {
// // //       if (totalFare < 3000000) return 1.80;
// // //       if (totalFare < 4000000) return 1.65;
// // //       if (totalFare < 5000000) return 1.55;
// // //       if (totalFare < 6000000) return 1.30;
// // //       if (totalFare < 7000000) return 1.25;
// // //       if (totalFare < 8000000) return 1.15;
// // //       if (totalFare < 9000000) return 1.05;
// // //       if (totalFare < 10000000) return 1.00;
// // //       if (totalFare < 11000000) return 0.90;
// // //       if (totalFare < 12000000) return 0.90;
// // //       if (totalFare < 13000000) return 0.85;
// // //       if (totalFare < 14000000) return 0.85;
// // //       if (totalFare < 15000000) return 0.80;
// // //       return 0.75; // > 15,000,000 or anything above
// // //     }

// // //     if (country.toUpperCase() === "JAPAN") {
// // //       return 3.0;
// // //     }

// // //     return 2.0; // Default
// // //   };

// // //   const computeTotals = (): TotalByCurrency[] => {
// // //     const totals = filteredData.reduce((acc, row) => {
// // //       const fare = typeof row.totalFare === "number" && !isNaN(row.totalFare) ? row.totalFare : 0;
// // //       if (!acc[row.currency]) {
// // //         acc[row.currency] = { currency: row.currency, totalFare: 0, totalCommission: 0, commissionRate: 2 };
// // //       }
// // //       acc[row.currency].totalFare += fare;
// // //       return acc;
// // //     }, {} as Record<string, TotalByCurrency>);

// // //     Object.values(totals).forEach((total) => {
// // //       const countries = [...new Set(filteredData
// // //         .filter(row => row.currency === total.currency)
// // //         .map(row => row.country.toUpperCase()))];
      
// // //       if (countries.length === 1) {
// // //         total.commissionRate = getCommissionRate(countries[0], total.currency, total.totalFare);
// // //       } else {
// // //         total.commissionRate = 2;
// // //       }
// // //       total.totalCommission = total.totalFare * (total.commissionRate / 100);
// // //     });

// // //     return Object.values(totals).sort((a, b) => a.currency.localeCompare(b.currency));
// // //   };

// // //   const exportTableToCSV = () => {
// // //     if (filteredData.length === 0 && computeTotals().length === 0) {
// // //       alert("No data to export.");
// // //       return;
// // //     }

// // //     // Main table data
// // //     const mainHeaders = [
// // //       "Month-Year",
// // //       "Country",
// // //       "AirlinesTKT",
// // //       "District",
// // //       "Channel",
// // //       "Currency",
// // //       "Fare",
// // //       "Commission",
// // //     ];

// // //     const mainValueMappers = [
// // //       (row: DashboardRow) => row.month,
// // //       (row: DashboardRow) => row.country,
// // //       (row: DashboardRow) => row.airlines,
// // //       (row: DashboardRow) => row.district,
// // //       (row: DashboardRow) => row.channel,
// // //       (row: DashboardRow) => row.currency,
// // //       (row: DashboardRow) => {
// // //         const fare = typeof row.totalFare === "number" && !isNaN(row.totalFare) ? row.totalFare : 0;
// // //         return fare.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
// // //       },
// // //       (row: DashboardRow) => {
// // //         const fare = typeof row.totalFare === "number" && !isNaN(row.totalFare) ? row.totalFare : 0;
// // //         const rate = getCommissionRate(row.country, row.currency, fare);
// // //         const commission = fare * (rate / 100);
// // //         return `${commission.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${rate}%)`;
// // //       },
// // //     ];

// // //     const mainCSV = filteredData.length > 0
// // //       ? convertToCSV(filteredData, mainHeaders, mainValueMappers)
// // //       : "";

// // //     // Total by Currency data
// // //     const totalHeaders = [
// // //       "Total",
// // //       "", "", "", "", // Empty columns to align with main table
// // //       "Currency",
// // //       "Fare",
// // //       "Commission",
// // //     ];

// // //     const totalValueMappers = [
// // //       (row: TotalByCurrency) => `TOTAL ${row.currency}`,
// // //       () => "",
// // //       () => "",
// // //       () => "",
// // //       () => "",
// // //       (row: TotalByCurrency) => row.currency,
// // //       (row: TotalByCurrency) => row.totalFare.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
// // //       (row: TotalByCurrency) => `${row.totalCommission.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${row.commissionRate}%)`,
// // //     ];

// // //     const totals = computeTotals();
// // //     const totalCSV = totals.length > 0
// // //       ? convertToCSV(totals, totalHeaders, totalValueMappers)
// // //       : "";

// // //     // Combine CSVs with separator
// // //     const csvContent = [
// // //       mainCSV,
// // //       "", // Blank row
// // //       "Total by Currency",
// // //       totalCSV,
// // //     ].filter(part => part !== "").join("\n");

// // //     const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
// // //     downloadCSV(csvContent, `dashboard_table_${timestamp}.csv`);
// // //   };

// // //   // const exportDetailedDataToCSV = async () => {
// // //   //   setIsExportingDetailed(true);
// // //   //   try {
// // //   //     const queryParams = new URLSearchParams();
// // //   //     if (filterValues.month) {
// // //   //       const [month, year] = filterValues.month.split(" ");
// // //   //       queryParams.append("MonthFlown", month);
// // //   //       queryParams.append("YearFlown", year);
// // //   //     }
// // //   //     if (filterValues.country) queryParams.append("countryname", filterValues.country);
// // //   //     if (filterValues.airlines.length > 0) queryParams.append("AirlinesTKT", filterValues.airlines.join(","));
// // //   //     if (filterValues.district) queryParams.append("city_code", filterValues.district);
// // //   //     if (filterValues.channel.length > 0) queryParams.append("Channel", filterValues.channel.join(","));
// // //   //     if (filterValues.currency) queryParams.append("SalesCurrency", filterValues.currency);

// // //   //     console.log("Detailed export query:", queryParams.toString());

// // //   //     const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboardDetailed?${queryParams}`);
// // //   //     if (!response.ok) {
// // //   //       throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
// // //   //     }
// // //   //     const result = await response.json();
// // //   //     if (!result.success) {
// // //   //       throw new Error(result.message || "Failed to fetch detailed data");
// // //   //     }

// // //   //     const detailedData = Array.isArray(result.data) ? result.data : [];
// // //   //     if (detailedData.length === 0) {
// // //   //       alert("No detailed data to export for the selected filters.");
// // //   //       return;
// // //   //     }

// // //   //     // Define headers for detailed data (adjust based on actual fields)
// // //   //     const headers = [
// // //   //       "PNR",
// // //   //       "PassengerName",
// // //   //       "MonthFlown",
// // //   //       "YearFlown",
// // //   //       "countryname",
// // //   //       "AirlinesTKT",
// // //   //       "city_code",
// // //   //       "Channel",
// // //   //       "SalesCurrency",
// // //   //       "fareupdate",
// // //   //     ];

// // //   //     const valueMappers = headers.map((header) => (row: any) => {
// // //   //       const value = row[header] ?? "";
// // //   //       return String(value).replace(/,/g, "");
// // //   //     });

// // //   //     const csvContent = convertToCSV(detailedData, headers, valueMappers);
// // //   //     const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
// // //   //     downloadCSV(csvContent, `dashboard_detailed_${timestamp}.csv`);
// // //   //   } catch (err) {
// // //   //     console.error("Error exporting detailed data:", err);
// // //   //     const errorMessage = err instanceof Error ? err.message : String(err);
// // //   //     alert(`Failed to export detailed data: ${errorMessage}`);
// // //   //   } finally {
// // //   //     setIsExportingDetailed(false);
// // //   //   }
// // //   // };

// // // // const exportDetailedDataToCSV = async () => {
// // // //     setIsExportingDetailed(true);
// // // //     try {
// // // //         console.log("Filter values:", filterValues);
// // // //         const queryParams = new URLSearchParams();
// // // //         if (filterValues.month) {
// // // //             const parts = filterValues.month.split(" ");
// // // //             if (parts.length === 2) {
// // // //                 queryParams.append("MonthFlown", parts[0]);
// // // //                 queryParams.append("YearFlown", parts[1]);
// // // //             } else {
// // // //                 console.warn("Invalid month format:", filterValues.month);
// // // //             }
// // // //         }
// // // //         if (filterValues.country) queryParams.append("countryname", filterValues.country);
// // // //         if (filterValues.airlines.length > 0) queryParams.append("AirlinesTKT", filterValues.airlines.join(","));
// // // //         if (filterValues.district) queryParams.append("city_code", filterValues.district);
// // // //         if (filterValues.channel.length > 0) queryParams.append("Channel", filterValues.channel.join(","));
// // // //         if (filterValues.currency) queryParams.append("SalesCurrency", filterValues.currency);

// // // //         if (queryParams.toString() === "") {
// // // //             alert("Please select at least one filter to export detailed data.");
// // // //             return;
// // // //         }

// // // //         console.log("Detailed export query:", queryParams.toString());

// // // //         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboardDetailed?${queryParams}`);
// // // //         if (!response.ok) {
// // // //             throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
// // // //         }
// // // //         const result = await response.json();
// // // //         if (!result.success) {
// // // //             throw new Error(result.message || "Failed to fetch detailed data");
// // // //         }

// // // //         const detailedData = Array.isArray(result.data) ? result.data : [];
// // // //         if (detailedData.length === 0) {
// // // //             alert("No detailed data to export for the selected filters.");
// // // //             return;
// // // //         }

// // // //         console.log("Detailed data sample:", detailedData[0]); // Log sample record

// // // //         // Define headers based on dashboard_orc schema
// // // //         const headers = [
// // // //             "_id",
// // // //             "AgencyName",
// // // //             "AgentDieOrigin",
// // // //             "Agentdie",
// // // //             "AirlinesTKT",
// // // //             "Channel",
// // // //             "Exchticket",
// // // //             "Flightnumber",
// // // //             "Issueddate",
// // // //             "MonthFlown",
// // // //             "OriginalCurr",
// // // //             "OriginalFareUpdate",
// // // //             "OriginalIssueddate",
// // // //             "OriginalTicketnumber",
// // // //             "OriginalTranscode",
// // // //             "PNRR",
// // // //             "PartitionCode",
// // // //             "Paxname",
// // // //             "PreconjTicket",
// // // //             "QSfare",
// // // //             "RefundTicket",
// // // //             "SalesCurrency",
// // // //             "Stationcode",
// // // //             "StationnoOrigin",
// // // //             "StatusFlight",
// // // //             "StatusTicket",
// // // //             "Tourcodeorigin",
// // // //             "YearFlown",
// // // //             "airlines",
// // // //             "city_code",
// // // //             "countryname",
// // // //             "dateofflight",
// // // //             "descr",
// // // //             "doctype",
// // // //             "fareupdate",
// // // //             "fc",
// // // //             "flowndate",
// // // //             "routeakhir",
// // // //             "routeawal",
// // // //             "stationno",
// // // //             "stationopendate",
// // // //             "ticketnumber",
// // // //             "tourcode",
// // // //             "transcode",
// // // //             "existing",
// // // //         ];

// // // //         const valueMappers = headers.map((header) => (row: any) => {
// // // //             let value = row[header] ?? "";
// // // //             // Handle _id object
// // // //             if (header === "_id" && value && typeof value === "object" && value.$oid) {
// // // //                 value = value.$oid;
// // // //             }
// // // //             // Handle arrays (e.g., existing)
// // // //             if (Array.isArray(value)) {
// // // //                 value = JSON.stringify(value).replace(/"/g, '""');
// // // //             }
// // // //             // Convert to string and escape quotes only
// // // //             return String(value).replace(/"/g, '""');
// // // //         });

// // // //         const csvContent = convertToCSV(detailedData, headers, valueMappers);
// // // //         const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
// // // //         downloadCSV(csvContent, `dashboard_detailed_${timestamp}.csv`);
// // // //     } catch (err) {
// // // //         console.error("Error exporting detailed data:", err);
// // // //         const errorMessage = err instanceof Error ? err.message : String(err);
// // // //         alert(`Failed to export detailed data: ${errorMessage}`);
// // // //     } finally {
// // // //         setIsExportingDetailed(false);
// // // //     }
// // // // }; Iterasi untuk menghindari error export
// // // const exportDetailedDataToCSV = async () => {
// // //     setIsExportingDetailed(true);
// // //     try {
// // //         console.log("Filter values:", filterValues);
// // //         // Check if Month-Year and Country are selected
// // //         if (!filterValues.month) {
// // //             alert("Please select a Month-Year to export detailed data.");
// // //             return;
// // //         }
// // //         if (!filterValues.country) {
// // //             alert("Please select a Country to export detailed data.");
// // //             return;
// // //         }

// // //         const queryParams = new URLSearchParams();
// // //         // Month-Year is guaranteed to exist due to the check above
// // //         const parts = filterValues.month.split(" ");
// // //         if (parts.length === 2) {
// // //             queryParams.append("MonthFlown", parts[0]);
// // //             queryParams.append("YearFlown", parts[1]);
// // //         } else {
// // //             console.warn("Invalid month format:", filterValues.month);
// // //             alert("Invalid Month-Year format. Please select a valid Month-Year.");
// // //             return;
// // //         }
// // //         // Country is guaranteed to exist due to the check above
// // //         queryParams.append("countryname", filterValues.country);
// // //         if (filterValues.airlines.length > 0) queryParams.append("AirlinesTKT", filterValues.airlines.join(","));
// // //         if (filterValues.district) queryParams.append("city_code", filterValues.district);
// // //         if (filterValues.channel.length > 0) queryParams.append("Channel", filterValues.channel.join(","));
// // //         if (filterValues.currency) queryParams.append("SalesCurrency", filterValues.currency);

// // //         console.log("Detailed export query:", queryParams.toString());

// // //         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboardDetailed?${queryParams}`);
// // //         if (!response.ok) {
// // //             throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
// // //         }
// // //         const result = await response.json();
// // //         if (!result.success) {
// // //             throw new Error(result.message || "Failed to fetch detailed data");
// // //         }

// // //         const detailedData = Array.isArray(result.data) ? result.data : [];
// // //         if (detailedData.length === 0) {
// // //             alert("No detailed data to export for the selected filters.");
// // //             return;
// // //         }

// // //         console.log("Detailed data sample:", detailedData[0]);

// // //         // Define headers based on dashboard_orc schema
// // //         const headers = [
// // //             "_id",
// // //             "AgencyName",
// // //             "AgentDieOrigin",
// // //             "Agentdie",
// // //             "AirlinesTKT",
// // //             "Channel",
// // //             "Exchticket",
// // //             "Flightnumber",
// // //             "Issueddate",
// // //             "MonthFlown",
// // //             "OriginalCurr",
// // //             "OriginalFareUpdate",
// // //             "OriginalIssueddate",
// // //             "OriginalTicketnumber",
// // //             "OriginalTranscode",
// // //             "PNRR",
// // //             "PartitionCode",
// // //             "Paxname",
// // //             "PreconjTicket",
// // //             "QSfare",
// // //             "RefundTicket",
// // //             "SalesCurrency",
// // //             "Stationcode",
// // //             "StationnoOrigin",
// // //             "StatusFlight",
// // //             "StatusTicket",
// // //             "Tourcodeorigin",
// // //             "YearFlown",
// // //             "airlines",
// // //             "city_code",
// // //             "countryname",
// // //             "dateofflight",
// // //             "descr",
// // //             "doctype",
// // //             "fareupdate",
// // //             "fc",
// // //             "flowndate",
// // //             "routeakhir",
// // //             "routeawal",
// // //             "stationno",
// // //             "stationopendate",
// // //             "ticketnumber",
// // //             "tourcode",
// // //             "transcode",
// // //             "existing",
// // //         ];

// // //         const valueMappers = headers.map((header) => (row: any) => {
// // //             let value = row[header] ?? "";
// // //             if (header === "_id" && value && typeof value === "object" && value.$oid) {
// // //                 value = value.$oid;
// // //             }
// // //             if (Array.isArray(value)) {
// // //                 value = JSON.stringify(value).replace(/"/g, '""');
// // //             }
// // //             return String(value).replace(/"/g, '""');
// // //         });

// // //         const csvContent = convertToCSV(detailedData, headers, valueMappers);
// // //         const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
// // //         downloadCSV(csvContent, `dashboard_detailed_${timestamp}.csv`);
// // //     } catch (err) {
// // //         console.error("Error exporting detailed data:", err);
// // //         const errorMessage = err instanceof Error ? err.message : String(err);
// // //         alert(`Failed to export detailed data: ${errorMessage}`);
// // //     } finally {
// // //         setIsExportingDetailed(false);
// // //     }
// // // };

// // //   return (
// // //     <ProtectedRoute>
// // //       <div className="min-h-screen bg-background text-gray-900 p-4">
// // //         <header className="mb-4">
// // //           <h1 className="text-2xl font-bold mb-1 flex justify-between items-center">
// // //             Airlines Dashboard
// // //             <div className="flex gap-2">
// // //               <button
// // //                 onClick={fetchData}
// // //                 disabled={isLoading}
// // //                 className="flex items-center px-2.5 py-1 text-sm bg-blue-800 text-gray-100 font-mono rounded hover:bg-blue-900 transition disabled:opacity-50"
// // //                 title="Refresh data"
// // //               >
// // //                 <FaSync className={`w-4 h-4 mr-1 ${isLoading ? "animate-spin" : ""}`} /> Refresh
// // //               </button>

// // //               <button
// // //                 onClick={exportTableToCSV}
// // //                 disabled={isLoading || (filteredData.length === 0 && computeTotals().length === 0)}
// // //                 className="flex items-center px-2.5 py-1 text-sm bg-green-600 text-gray-100 font-mono rounded hover:bg-green-700 transition disabled:opacity-50"
// // //                 title="Export summary table"
// // //               >
// // //                 <FaFileExport className="w-4 h-4 mr-1" /> Export Table
// // //               </button>

// // //               <button
// // //                 onClick={exportDetailedDataToCSV}
// // //                 disabled={isLoading || isExportingDetailed}
// // //                 className="flex items-center px-2.5 py-1 text-sm bg-green-600 text-gray-100 font-mono rounded hover:bg-purple-700 transition disabled:opacity-50"
// // //                 title="Export detailed table"
// // //               >
// // //                 <FaFileExport className={`w-4 h-4 mr-1 ${isExportingDetailed ? "animate-spin" : ""}`} />
// // //                 Export Detailed
// // //               </button>

// // //               <Link
// // //                 href="/log-history"
// // //                 className="flex items-center px-2.5 py-1 text-sm bg-secondary text-gray-100 font-mono rounded hover:bg-gray-600 transition"
// // //                 title="View export logs"
// // //               >
// // //                 <FaHistory className="w-4 h-4 mr-1" /> Logs
// // //               </Link>
// // //             </div>
// // //           </h1>
// // //           <p className="font-mono text-sm text-gray-700">Fare Commision Calculation from Data Flown</p>
// // //         </header>


// // //         <ErrorBoundary
// // //           fallback={
// // //             <div className="text-red-500 text-center p-4 bg-red-100 rounded-md">
// // //               <p>An unexpected error occurred. Please try again.</p>
// // //               <button
// // //                 onClick={fetchData}
// // //                 disabled={isLoading}
// // //                 className="mt-2 px-3 py-1 bg-blue-500 text-white font-mono rounded-md hover:bg-blue-600 transition disabled:opacity-50"
// // //               >
// // //                 <FaSync className={`inline mr-1 ${isLoading ? "animate-spin" : ""}`} /> Try Again
// // //               </button>
// // //             </div>
// // //           }
// // //         >
// // //           <div className="max-w-7xl mx-auto border border-gray-300 rounded-lg p-4 bg-white shadow-lg">
// // //             {error ? (
// // //               <div className="text-red-500 text-center p-4 bg-red-100 rounded-md">
// // //                 <p>{error}</p>
// // //                 <button
// // //                   onClick={fetchData}
// // //                   disabled={isLoading}
// // //                   className="mt-2 px-3 py-1 bg-blue-500 text-white font-mono rounded-md hover:bg-blue-600 transition disabled:opacity-50"
// // //                 >
// // //                   <FaSync className={`inline mr-1 ${isLoading ? "animate-spin" : ""}`} /> Try Again
// // //                 </button>
// // //               </div>
// // //             ) : (
// // //               <>
// // //                 <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
// // //                   {Object.entries(filterKeyMap).map(([id, { key, field, label }]) => (
// // //                     <div key={id}>
// // //                       <label className="block text-sm font-medium text-gray-900 mb-1">{label}</label>
// // //                       {key === "airlines" || key === "channel" ? (
// // //                         <MultiSelect
// // //                           options={field ? filters[field] || [] : []}
// // //                           selected={filterValues[key] as string[]}
// // //                           onChange={(value) => handleCheckboxChange(key as "airlines" | "channel", value)}
// // //                           onSelectAll={() => handleSelectAll(key as "airlines" | "channel")}
// // //                           onClear={() => handleClear(key as "airlines" | "channel")}
// // //                           placeholder={`Select ${label}`}
// // //                           id={id}
// // //                         />
// // //                       ) : (
// // //                         <select
// // //                           id={id}
// // //                           className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
// // //                           value={filterValues[key] as string}
// // //                           onChange={(e) => handleFilterChange(key, e.target.value)}
// // //                         >
// // //                           <option value="">All</option>
// // //                           {key === "district" ? (
// // //                             getDistrictOptions.length > 0 ? (
// // //                               getDistrictOptions.map((value) => (
// // //                                 <option key={value} value={value}>
// // //                                   {value}
// // //                                 </option>
// // //                               ))
// // //                             ) : (
// // //                               <option disabled>No districts available</option>
// // //                             )
// // //                           ) : key === "currency" ? (
// // //                             getCurrencyOptions.length > 0 ? (
// // //                               getCurrencyOptions.map((value) => (
// // //                                 <option key={value} value={value}>
// // //                                   {value}
// // //                                 </option>
// // //                               ))
// // //                             ) : (
// // //                               <option disabled>No currencies available</option>
// // //                             )
// // //                           ) : field && filters[field]?.length > 0 ? (
// // //                             filters[field].sort().map((value: string) => (
// // //                               <option key={value} value={value}>
// // //                                 {value}
// // //                               </option>
// // //                             ))
// // //                           ) : (
// // //                             <option disabled>No options available</option>
// // //                           )}
// // //                         </select>
// // //                       )}
// // //                     </div>
// // //                   ))}
// // //                 </div>

// // //                 <div className="overflow-x-auto mb-6">
// // //                   <table className="w-full border-collapse">
// // //                     <thead>
// // //                       <tr className="bg-secondary text-gray-100">
// // //                         <th className="p-3 text-left text-sm font-semibold">Month-Year</th>
// // //                         <th className="p-3 text-left text-sm font-semibold">Country</th>
// // //                         <th className="p-3 text-left text-sm font-semibold">AirlinesTKT</th>
// // //                         <th className="p-3 text-left text-sm font-semibold">District</th>
// // //                         <th className="p-3 text-left text-sm font-semibold">Channel</th>
// // //                         <th className="p-3 text-left text-sm font-semibold">Currency</th>
// // //                         <th className="p-3 text-right text-sm font-semibold">Fare</th>
// // //                         <th className="p-3 text-right text-sm font-semibold">Commission</th>
// // //                       </tr>
// // //                     </thead>
// // //                     <tbody>
// // //                       {Array.isArray(filteredData) && filteredData.length > 0 ? (
// // //                         filteredData.map((row, index) => {
// // //                           const fare = typeof row.totalFare === "number" && !isNaN(row.totalFare) ? row.totalFare : 0;
// // //                           const rate = getCommissionRate(row.country, row.currency, fare);
// // //                           const commission = fare * (rate / 100);
// // //                           console.log(`Row ${index} totalFare: ${row.totalFare}, Rate: ${rate}%, Commission: ${commission}`);
// // //                           return (
// // //                             <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
// // //                               <td className="p-3 text-sm">{row.month}</td>
// // //                               <td className="p-3 text-sm">{row.country}</td>
// // //                               <td className="p-3 text-sm">{row.airlines}</td>
// // //                               <td className="p-3 text-sm">{row.district}</td>
// // //                               <td className="p-3 text-sm">{row.channel}</td>
// // //                               <td className="p-3 text-sm">{row.currency}</td>
// // //                               <td className="p-3 text-right text-sm">
// // //                                 {fare.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
// // //                               </td>
// // //                               <td className="p-3 text-right text-sm">
// // //                                 {commission.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
// // //                                 <span className="text-xs text-gray-500"> ({rate}%)</span>
// // //                               </td>
// // //                             </tr>
// // //                           );
// // //                         })
// // //                       ) : (
// // //                         <tr>
// // //                           <td colSpan={8} className="p-3 text-center text-gray-600">
// // //                             No data available. Try adjusting filters or refreshing the data.
// // //                           </td>
// // //                         </tr>
// // //                       )}
// // //                     </tbody>
// // //                   </table>
// // //                 </div>

// // //                 {Array.isArray(filteredData) && filteredData.length > 0 && (
// // //                   <div className="overflow-x-auto">
// // //                     <table className="w-full border-collapse">
// // //                       <thead>
// // //                         <tr className="bg-secondary text-gray-100">
// // //                           <th className="p-3 text-left text-sm font-semibold">Total</th>
// // //                           <th colSpan={4} className="p-3"></th>
// // //                           <th className="p-3 text-left text-sm font-semibold">Currency</th>
// // //                           <th className="p-3 text-right text-sm font-semibold">Fare</th>
// // //                           <th className="p-3 text-right text-sm font-semibold">Commission</th>
// // //                         </tr>
// // //                       </thead>
// // //                       <tbody>
// // //                         {computeTotals().map((total, index) => (
// // //                           <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
// // //                             <td className="p-3 text-sm font-bold">TOTAL {total.currency}</td>
// // //                             <td colSpan={4} className="p-3"></td>
// // //                             <td className="p-3 text-sm">{total.currency}</td>
// // //                             <td className="p-3 text-right text-sm">
// // //                               {total.totalFare.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
// // //                             </td>
// // //                             <td className="p-3 text-right text-sm">
// // //                               {total.totalCommission.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
// // //                               <span className="text-xs text-gray-500"> ({total.commissionRate}%)</span>
// // //                             </td>
// // //                           </tr>
// // //                         ))}
// // //                       </tbody>
// // //                     </table>
// // //                   </div>
// // //                 )}
// // //               </>
// // //             )}
// // //           </div>
// // //         </ErrorBoundary>
// // //       </div>
// // //     </ProtectedRoute>
// // //   );
// // // }
// // //iteration for gadget accessibility

// // "use client";

// // import { useEffect, useState, useMemo, useRef } from "react";
// // import Link from "next/link";
// // import ProtectedRoute from "./components/ProtectedRoute";
// // import { FaHistory, FaSync, FaTimes, FaFileExport } from "react-icons/fa";

// // type DashboardRow = {
// //   month: string;
// //   country: string;
// //   airlines: string;
// //   district: string;
// //   channel: string;
// //   currency: string;
// //   totalFare: number;
// //   count: number;
// // };

// // type Filters = {
// //   MonthFlown: string[];
// //   countryname: string[];
// //   AirlinesTKT: string[];
// //   Channel: string[];
// //   SalesCurrency: string[];
// //   countryDistrictMap: { [country: string]: string[] };
// //   countryCurrencyMap: { [country: string]: string[] };
// // };

// // type FilterKey = "month" | "country" | "airlines" | "district" | "channel" | "currency";

// // type FilterField = keyof Omit<Filters, "countryDistrictMap" | "countryCurrencyMap">;

// // type TotalByCurrency = {
// //   currency: string;
// //   totalFare: number;
// //   totalCommission: number;
// //   commissionRate: number;
// // };

// // const filterKeyMap: Record<string, { key: FilterKey; field?: FilterField; label: string }> = {
// //   monthFilter: { key: "month", field: "MonthFlown", label: "Month-Year" },
// //   countryFilter: { key: "country", field: "countryname", label: "Country" },
// //   airlinesFilter: { key: "airlines", field: "AirlinesTKT", label: "AirlinesTKT" },
// //   districtFilter: { key: "district", label: "District" },
// //   channelFilter: { key: "channel", field: "Channel", label: "Channel" },
// //   currencyFilter: { key: "currency", field: "SalesCurrency", label: "Currency" },
// // };

// // // Error Boundary Component
// // const ErrorBoundary: React.FC<{ children: React.ReactNode; fallback: React.ReactNode }> = ({ children, fallback }) => {
// //   const [hasError, setHasError] = useState(false);

// //   useEffect(() => {
// //     setHasError(false);
// //   }, [children]);

// //   if (hasError) return <>{fallback}</>;

// //   try {
// //     return <>{children}</>;
// //   } catch {
// //     setHasError(true);
// //     return <>{fallback}</>;
// //   }
// // };

// // // MultiSelect Component
// // interface MultiSelectProps {
// //   options: string[];
// //   selected: string[];
// //   onChange: (value: string) => void;
// //   onSelectAll: () => void;
// //   onClear: () => void;
// //   placeholder: string;
// //   id: string;
// // }

// // const multiSelectStyles = {
// //   container: "relative w-full",
// //   trigger: "w-full p-2 sm:p-2.5 border border-gray-300 rounded-md bg-white cursor-pointer flex items-center justify-between focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
// //   text: "text-xs sm:text-sm text-gray-600 truncate",
// //   icon: "w-4 h-4 transform",
// //   dropdown: "absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-[40vh] overflow-y-auto",
// //   searchContainer: "p-2",
// //   searchInput: "w-full p-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:ring-2 focus:ring-blue-500",
// //   buttonContainer: "flex justify-between p-2 border-b border-gray-200",
// //   button: "text-xs sm:text-sm text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500",
// //   option: "p-2 flex items-center cursor-pointer hover:bg-gray-100 focus:bg-gray-100 focus:outline-none",
// //   selectedOption: "bg-blue-50",
// //   noOptions: "p-2 text-xs sm:text-sm text-gray-500",
// //   tagsContainer: "mt-2 flex flex-wrap gap-1 sm:gap-2",
// //   tag: "inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-800 text-xs rounded-full",
// //   tagButton: "ml-1 focus:outline-none focus:ring-2 focus:ring-blue-500",
// //   tagIcon: "w-3 h-3",
// // };

// // const MultiSelect: React.FC<MultiSelectProps> = ({
// //   options,
// //   selected,
// //   onChange,
// //   onSelectAll,
// //   onClear,
// //   placeholder,
// //   id,
// // }) => {
// //   const [isOpen, setIsOpen] = useState(false);
// //   const [search, setSearch] = useState("");
// //   const dropdownRef = useRef<HTMLDivElement>(null);

// //   useEffect(() => {
// //     const handleClickOutside = (event: MouseEvent) => {
// //       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
// //         setIsOpen(false);
// //       }
// //     };
// //     document.addEventListener("mousedown", handleClickOutside);
// //     return () => document.removeEventListener("mousedown", handleClickOutside);
// //   }, []);

// //   const filteredOptions = options.filter((option) =>
// //     option.toLowerCase().includes(search.toLowerCase())
// //   );

// //   return (
// //     <div className={multiSelectStyles.container} ref={dropdownRef}>
// //       <div
// //         className={multiSelectStyles.trigger}
// //         onClick={() => setIsOpen(!isOpen)}
// //         role="combobox"
// //         aria-expanded={isOpen}
// //         aria-controls={`${id}-dropdown`}
// //         tabIndex={0}
// //         onKeyDown={(e) => {
// //           if (e.key === "Enter" || e.key === " ") {
// //             setIsOpen(!isOpen);
// //             e.preventDefault();
// //           }
// //         }}
// //       >
// //         <span className={multiSelectStyles.text}>
// //           {selected.length > 0 ? selected.join(", ") : placeholder}
// //         </span>
// //         <svg
// //           className={`${multiSelectStyles.icon} ${isOpen ? "rotate-180" : ""}`}
// //           fill="none"
// //           stroke="currentColor"
// //           viewBox="0 0 24 24"
// //           aria-hidden="true"
// //         >
// //           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
// //         </svg>
// //       </div>
// //       {isOpen && (
// //         <div className={multiSelectStyles.dropdown} id={`${id}-dropdown`} role="listbox">
// //           <div className={multiSelectStyles.searchContainer}>
// //             <input
// //               type="text"
// //               className={multiSelectStyles.searchInput}
// //               placeholder="Search..."
// //               value={search}
// //               onChange={(e) => setSearch(e.target.value)}
// //               autoFocus
// //               role="searchbox"
// //               aria-label={`Search ${placeholder}`}
// //             />
// //           </div>
// //           <div className={multiSelectStyles.buttonContainer}>
// //             <button
// //               type="button"
// //               onClick={() => {
// //                 onSelectAll();
// //                 setSearch("");
// //               }}
// //               className={multiSelectStyles.button}
// //               role="button"
// //               aria-label={`Select all ${placeholder}`}
// //             >
// //               Select All
// //             </button>
// //             <button
// //               type="button"
// //               onClick={() => {
// //                 onClear();
// //                 setSearch("");
// //               }}
// //               className={multiSelectStyles.button}
// //               role="button"
// //               aria-label={`Clear ${placeholder}`}
// //             >
// //               Clear
// //             </button>
// //           </div>
// //           {filteredOptions.length > 0 ? (
// //             filteredOptions.map((option) => (
// //               <div
// //                 key={option}
// //                 className={`${multiSelectStyles.option} ${
// //                   selected.includes(option) ? multiSelectStyles.selectedOption : ""
// //                 }`}
// //                 onClick={() => {
// //                   onChange(option);
// //                   setSearch("");
// //                 }}
// //                 onKeyDown={(e) => {
// //                   if (e.key === "Enter" || e.key === " ") {
// //                     onChange(option);
// //                     setSearch("");
// //                     e.preventDefault();
// //                   }
// //                 }}
// //                 role="option"
// //                 aria-selected={selected.includes(option)}
// //                 tabIndex={0}
// //               >
// //                 <input
// //                   type="checkbox"
// //                   checked={selected.includes(option)}
// //                   onChange={() => onChange(option)}
// //                   className="mr-2"
// //                   id={`${id}-${option}`}
// //                   aria-hidden="true"
// //                 />
// //                 <label htmlFor={`${id}-${option}`} className="text-xs sm:text-sm text-gray-800">
// //                   {option}
// //                 </label>
// //               </div>
// //             ))
// //           ) : (
// //             <p className={multiSelectStyles.noOptions}>No options found</p>
// //           )}
// //         </div>
// //       )}
// //       {selected.length > 0 && (
// //         <div className={multiSelectStyles.tagsContainer}>
// //           {selected.map((value) => (
// //             <span key={value} className={multiSelectStyles.tag}>
// //               {value}
// //               <button
// //                 type="button"
// //                 onClick={() => onChange(value)}
// //                 className={multiSelectStyles.tagButton}
// //                 aria-label={`Remove ${value}`}
// //               >
// //                 <FaTimes className={multiSelectStyles.tagIcon} />
// //               </button>
// //             </span>
// //           ))}
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // // Utility functions (unchanged)
// // const convertToCSV = (data: any[], headers: string[], valueMappers: ((row: any) => string)[]) => {
// //   const csvRows = [
// //     headers.join(','),
// //     ...data.map((row) =>
// //       valueMappers.map((mapper) => `"${mapper(row).replace(/"/g, '""')}"`).join(',')
// //     ),
// //   ];
// //   return csvRows.join('\n');
// // };

// // const downloadCSV = (csvContent: string, filename: string) => {
// //   const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
// //   const link = document.createElement('a');
// //   const url = URL.createObjectURL(blob);
// //   link.setAttribute('href', url);
// //   link.setAttribute('download', filename);
// //   link.style.visibility = 'hidden';
// //   document.body.appendChild(link);
// //   link.click();
// //   document.body.removeChild(link);
// // };

// // export default function DashboardPage() {
// //   const [data, setData] = useState<DashboardRow[]>([]);
// //   const [filteredData, setFilteredData] = useState<DashboardRow[]>([]);
// //   const [filters, setFilters] = useState<Filters>({
// //     MonthFlown: [],
// //     countryname: [],
// //     AirlinesTKT: [],
// //     Channel: [],
// //     SalesCurrency: [],
// //     countryDistrictMap: {},
// //     countryCurrencyMap: {},
// //   });
// //   const [filterValues, setFilterValues] = useState<{
// //     month: string;
// //     country: string;
// //     airlines: string[];
// //     district: string;
// //     channel: string[];
// //     currency: string;
// //   }>({
// //     month: "",
// //     country: "",
// //     airlines: [],
// //     district: "",
// //     channel: [],
// //     currency: "",
// //   });
// //   const [error, setError] = useState<string | null>(null);
// //   const [isLoading, setIsLoading] = useState(false);
// //   const [isExportingDetailed, setIsExportingDetailed] = useState(false);

// //   const fetchData = async () => {
// //     setIsLoading(true);
// //     try {
// //       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboardSummary`);
// //       if (!response.ok) {
// //         throw new Error(`HTTP error: ${response.status}`);
// //       }
// //       const result = await response.json();
// //       if (!result.success) {
// //         throw new Error(result.message || "Failed to fetch dashboard summary");
// //       }
// //       console.log("API Data:", result.data);
// //       console.log("Filters:", result.filters);
// //       const validatedData = Array.isArray(result.data) ? result.data : [];
// //       setData(validatedData);
// //       setFilteredData(validatedData);
// //       setFilters({
// //         MonthFlown: result.filters.MonthFlown || [],
// //         countryname: result.filters.countryname || [],
// //         AirlinesTKT: result.filters.AirlinesTKT || [],
// //         Channel: result.filters.Channel || [],
// //         SalesCurrency: result.filters.SalesCurrency || [],
// //         countryDistrictMap: result.filters.countryDistrictMap || {},
// //         countryCurrencyMap: result.filters.countryCurrencyMap || {},
// //       });
// //       setError(null);
// //     } catch (err) {
// //       console.error("Error fetching dashboard data:", err);
// //       const errorMessage = err instanceof Error ? err.message : String(err);
// //       setError(`Failed to load dashboard data: ${errorMessage}. Please try again.`);
// //       setData([]);
// //       setFilteredData([]);
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchData();
// //   }, []);

// //   useEffect(() => {
// //     const newFilteredData = data.filter((row) =>
// //       (filterValues.month === "" || row.month === filterValues.month) &&
// //       (filterValues.country === "" || row.country === filterValues.country) &&
// //       (filterValues.airlines.length === 0 || filterValues.airlines.includes(row.airlines)) &&
// //       (filterValues.district === "" || row.district === filterValues.district) &&
// //       (filterValues.channel.length === 0 || filterValues.channel.includes(row.channel)) &&
// //       (filterValues.currency === "" || row.currency === row.currency)
// //     );
// //     console.log("Applied Filters:", filterValues, "Filtered Data Length:", newFilteredData.length);
// //     setFilteredData(newFilteredData);
// //   }, [data, filterValues]);

// //   const handleFilterChange = (field: FilterKey, value: string) => {
// //     setFilterValues((prev) => {
// //       const newValues = { ...prev, [field]: value };
// //       if (field === "country") {
// //         newValues.district = "";
// //         const validCurrencies = filters.countryCurrencyMap?.[value] || [];
// //         newValues.currency = validCurrencies.includes(prev.currency) ? prev.currency : "";
// //       }
// //       return newValues;
// //     });
// //   };

// //   const handleCheckboxChange = (field: "airlines" | "channel", value: string) => {
// //     setFilterValues((prev) => {
// //       const currentValues = prev[field];
// //       const newValues = currentValues.includes(value)
// //         ? currentValues.filter((v) => v !== value)
// //         : [...currentValues, value];
// //       return { ...prev, [field]: newValues };
// //     });
// //   };

// //   const handleSelectAll = (field: "airlines" | "channel") => {
// //     setFilterValues((prev) => ({
// //       ...prev,
// //       [field]: filters[field === "airlines" ? "AirlinesTKT" : "Channel"] || [],
// //     }));
// //   };

// //   const handleClear = (field: "airlines" | "channel") => {
// //     setFilterValues((prev) => ({ ...prev, [field]: [] }));
// //   };

// //   const getDistrictOptions = useMemo(() => {
// //     if (!filters.countryDistrictMap) return [];
// //     if (filterValues.country === "") {
// //       return Array.from(new Set(Object.values(filters.countryDistrictMap).flat())).sort();
// //     }
// //     return (filters.countryDistrictMap?.[filterValues.country] || []).sort();
// //   }, [filters.countryDistrictMap, filterValues.country]);

// //   const getCurrencyOptions = useMemo(() => {
// //     console.log("CountryCurrencyMap:", filters.countryCurrencyMap);
// //     console.log("Selected Country:", filterValues.country);
// //     console.log("CountryCurrencyMap for country:", filters.countryCurrencyMap?.[filterValues.country]);
// //     if (filterValues.country === "") {
// //       return filters.countryCurrencyMap
// //         ? Array.from(new Set(Object.values(filters.countryCurrencyMap).flat())).sort()
// //         : [];
// //     }
// //     return (filters.countryCurrencyMap?.[filterValues.country] || []).sort();
// //   }, [filters.countryCurrencyMap, filterValues.country]);

// //   const getCommissionRate = (country: string, currency: string, totalFare: number): number => {
// //     if (country.toUpperCase() === "AUSTRALIA" && currency === "AUD") {
// //       if (totalFare < 3000000) return 1.80;
// //       if (totalFare < 4000000) return 1.65;
// //       if (totalFare < 5000000) return 1.55;
// //       if (totalFare < 6000000) return 1.30;
// //       if (totalFare < 7000000) return 1.25;
// //       if (totalFare < 8000000) return 1.15;
// //       if (totalFare < 9000000) return 1.05;
// //       if (totalFare < 10000000) return 1.00;
// //       if (totalFare < 11000000) return 0.90;
// //       if (totalFare < 12000000) return 0.90;
// //       if (totalFare < 13000000) return 0.85;
// //       if (totalFare < 14000000) return 0.85;
// //       if (totalFare < 15000000) return 0.80;
// //       return 0.75;
// //     }

// //     if (country.toUpperCase() === "JAPAN") {
// //       return 3.0;
// //     }

// //     return 2.0;
// //   };

// //   const computeTotals = (): TotalByCurrency[] => {
// //     const totals = filteredData.reduce((acc, row) => {
// //       const fare = typeof row.totalFare === "number" && !isNaN(row.totalFare) ? row.totalFare : 0;
// //       if (!acc[row.currency]) {
// //         acc[row.currency] = { currency: row.currency, totalFare: 0, totalCommission: 0, commissionRate: 2 };
// //       }
// //       acc[row.currency].totalFare += fare;
// //       return acc;
// //     }, {} as Record<string, TotalByCurrency>);

// //     Object.values(totals).forEach((total) => {
// //       const countries = [...new Set(filteredData
// //         .filter(row => row.currency === total.currency)
// //         .map(row => row.country.toUpperCase()))];
      
// //       if (countries.length === 1) {
// //         total.commissionRate = getCommissionRate(countries[0], total.currency, total.totalFare);
// //       } else {
// //         total.commissionRate = 2;
// //       }
// //       total.totalCommission = total.totalFare * (total.commissionRate / 100);
// //     });

// //     return Object.values(totals).sort((a, b) => a.currency.localeCompare(b.currency));
// //   };

// //   const exportTableToCSV = () => {
// //     if (filteredData.length === 0 && computeTotals().length === 0) {
// //       alert("No data to export.");
// //       return;
// //     }

// //     const mainHeaders = [
// //       "Month-Year",
// //       "Country",
// //       "AirlinesTKT",
// //       "District",
// //       "Channel",
// //       "Currency",
// //       "Fare",
// //       "Commission",
// //     ];

// //     const mainValueMappers = [
// //       (row: DashboardRow) => row.month,
// //       (row: DashboardRow) => row.country,
// //       (row: DashboardRow) => row.airlines,
// //       (row: DashboardRow) => row.district,
// //       (row: DashboardRow) => row.channel,
// //       (row: DashboardRow) => row.currency,
// //       (row: DashboardRow) => {
// //         const fare = typeof row.totalFare === "number" && !isNaN(row.totalFare) ? row.totalFare : 0;
// //         return fare.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
// //       },
// //       (row: DashboardRow) => {
// //         const fare = typeof row.totalFare === "number" && !isNaN(row.totalFare) ? row.totalFare : 0;
// //         const rate = getCommissionRate(row.country, row.currency, fare);
// //         const commission = fare * (rate / 100);
// //         return `${commission.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${rate}%)`;
// //       },
// //     ];

// //     const mainCSV = filteredData.length > 0
// //       ? convertToCSV(filteredData, mainHeaders, mainValueMappers)
// //       : "";

// //     const totalHeaders = [
// //       "Total",
// //       "", "", "", "",
// //       "Currency",
// //       "Fare",
// //       "Commission",
// //     ];

// //     const totalValueMappers = [
// //       (row: TotalByCurrency) => `TOTAL ${row.currency}`,
// //       () => "",
// //       () => "",
// //       () => "",
// //       () => "",
// //       (row: TotalByCurrency) => row.currency,
// //       (row: TotalByCurrency) => row.totalFare.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
// //       (row: TotalByCurrency) => `${row.totalCommission.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${row.commissionRate}%)`,
// //     ];

// //     const totals = computeTotals();
// //     const totalCSV = totals.length > 0
// //       ? convertToCSV(totals, totalHeaders, totalValueMappers)
// //       : "";

// //     const csvContent = [
// //       mainCSV,
// //       "",
// //       "Total by Currency",
// //       totalCSV,
// //     ].filter(part => part !== "").join("\n");

// //     const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
// //     downloadCSV(csvContent, `dashboard_table_${timestamp}.csv`);
// //   };

// //   const exportDetailedDataToCSV = async () => {
// //     setIsExportingDetailed(true);
// //     try {
// //       console.log("Filter values:", filterValues);
// //       if (!filterValues.month) {
// //         alert("Please select a Month-Year to export detailed data.");
// //         return;
// //       }
// //       if (!filterValues.country) {
// //         alert("Please select a Country to export detailed data.");
// //         return;
// //       }

// //       const queryParams = new URLSearchParams();
// //       const parts = filterValues.month.split(" ");
// //       if (parts.length === 2) {
// //         queryParams.append("MonthFlown", parts[0]);
// //         queryParams.append("YearFlown", parts[1]);
// //       } else {
// //         console.warn("Invalid month format:", filterValues.month);
// //         alert("Invalid Month-Year format. Please select a valid Month-Year.");
// //         return;
// //       }
// //       queryParams.append("countryname", filterValues.country);
// //       if (filterValues.airlines.length > 0) queryParams.append("AirlinesTKT", filterValues.airlines.join(","));
// //       if (filterValues.district) queryParams.append("city_code", filterValues.district);
// //       if (filterValues.channel.length > 0) queryParams.append("Channel", filterValues.channel.join(","));
// //       if (filterValues.currency) queryParams.append("SalesCurrency", filterValues.currency);

// //       console.log("Detailed export query:", queryParams.toString());

// //       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboardDetailed?${queryParams}`);
// //       if (!response.ok) {
// //         throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
// //       }
// //       const result = await response.json();
// //       if (!result.success) {
// //         throw new Error(result.message || "Failed to fetch detailed data");
// //       }

// //       const detailedData = Array.isArray(result.data) ? result.data : [];
// //       if (detailedData.length === 0) {
// //         alert("No detailed data to export for the selected filters.");
// //         return;
// //       }

// //       console.log("Detailed data sample:", detailedData[0]);

// //       const headers = [
// //         "_id",
// //         "AgencyName",
// //         "AgentDieOrigin",
// //         "Agentdie",
// //         "AirlinesTKT",
// //         "Channel",
// //         "Exchticket",
// //         "Flightnumber",
// //         "Issueddate",
// //         "MonthFlown",
// //         "OriginalCurr",
// //         "OriginalFareUpdate",
// //         "OriginalIssueddate",
// //         "OriginalTicketnumber",
// //         "OriginalTranscode",
// //         "PNRR",
// //         "PartitionCode",
// //         "Paxname",
// //         "PreconjTicket",
// //         "QSfare",
// //         "RefundTicket",
// //         "SalesCurrency",
// //         "Stationcode",
// //         "StationnoOrigin",
// //         "StatusFlight",
// //         "StatusTicket",
// //         "Tourcodeorigin",
// //         "YearFlown",
// //         "airlines",
// //         "city_code",
// //         "countryname",
// //         "dateofflight",
// //         "descr",
// //         "doctype",
// //         "fareupdate",
// //         "fc",
// //         "flowndate",
// //         "routeakhir",
// //         "routeawal",
// //         "stationno",
// //         "stationopendate",
// //         "ticketnumber",
// //         "tourcode",
// //         "transcode",
// //         "existing",
// //       ];

// //       const valueMappers = headers.map((header) => (row: any) => {
// //         let value = row[header] ?? "";
// //         if (header === "_id" && value && typeof value === "object" && value.$oid) {
// //           value = value.$oid;
// //         }
// //         if (Array.isArray(value)) {
// //           value = JSON.stringify(value).replace(/"/g, '""');
// //         }
// //         return String(value).replace(/"/g, '""');
// //       });

// //       const csvContent = convertToCSV(detailedData, headers, valueMappers);
// //       const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
// //       downloadCSV(csvContent, `dashboard_detailed_${timestamp}.csv`);
// //     } catch (err) {
// //       console.error("Error exporting detailed data:", err);
// //       const errorMessage = err instanceof Error ? err.message : String(err);
// //       alert(`Failed to export detailed data: ${errorMessage}`);
// //     } finally {
// //       setIsExportingDetailed(false);
// //     }
// //   };

// //   return (
// //     <ProtectedRoute>
// //       <div className="min-h-screen bg-background text-gray-900 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
// //         <header className="mb-4 sm:mb-6">
// //           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
// //             <div>
// //               <h1 className="text-xl sm:text-2xl font-bold mb-1">Airlines Dashboard</h1>
// //               <p className="font-mono text-xs sm:text-sm text-gray-700">
// //                 Fare Commission Calculation from Data Flown
// //               </p>
// //             </div>
// //             <div className="flex flex-wrap gap-2 sm:gap-3">
// //               <button
// //                 onClick={fetchData}
// //                 disabled={isLoading}
// //                 className="flex items-center px-3 py-1.5 text-xs sm:text-sm bg-blue-800 text-gray-100 font-mono rounded hover:bg-blue-900 transition disabled:opacity-50 min-w-[100px]"
// //                 title="Refresh data"
// //                 aria-label="Refresh data"
// //               >
// //                 <FaSync className={`w-4 h-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
// //                 Refresh
// //               </button>
// //               <button
// //                 onClick={exportTableToCSV}
// //                 disabled={isLoading || (filteredData.length === 0 && computeTotals().length === 0)}
// //                 className="flex items-center px-3 py-1.5 text-xs sm:text-sm bg-green-600 text-gray-100 font-mono rounded hover:bg-green-700 transition disabled:opacity-50 min-w-[100px]"
// //                 title="Export summary table"
// //                 aria-label="Export summary table"
// //               >
// //                 <FaFileExport className="w-4 h-4 mr-1" />
// //                 Export Table
// //               </button>
// //               <button
// //                 onClick={exportDetailedDataToCSV}
// //                 disabled={isLoading || isExportingDetailed}
// //                 className="flex items-center px-3 py-1.5 text-xs sm:text-sm bg-green-600 text-gray-100 font-mono rounded hover:bg-purple-700 transition disabled:opacity-50 min-w-[100px]"
// //                 title="Export detailed table"
// //                 aria-label="Export detailed table"
// //               >
// //                 <FaFileExport className={`w-4 h-4 mr-1 ${isExportingDetailed ? "animate-spin" : ""}`} />
// //                 Export Detailed
// //               </button>
// //               <Link
// //                 href="/log-history"
// //                 className="flex items-center px-3 py-1.5 text-xs sm:text-sm bg-secondary text-gray-100 font-mono rounded hover:bg-gray-600 transition min-w-[80px]"
// //                 title="View export logs"
// //                 aria-label="View export logs"
// //               >
// //                 <FaHistory className="w-4 h-4 mr-1" />
// //                 Logs
// //               </Link>
// //             </div>
// //           </div>
// //         </header>

// //         <ErrorBoundary
// //           fallback={
// //             <div className="text-red-500 text-center p-4 bg-red-100 rounded-md">
// //               <p className="text-sm sm:text-base">An unexpected error occurred. Please try again.</p>
// //               <button
// //                 onClick={fetchData}
// //                 disabled={isLoading}
// //                 className="mt-2 px-3 py-1.5 text-xs sm:text-sm bg-blue-500 text-white font-mono rounded hover:bg-blue-600 transition disabled:opacity-50"
// //                 aria-label="Try again"
// //               >
// //                 <FaSync className={`inline mr-1 ${isLoading ? "animate-spin" : ""}`} />
// //                 Try Again
// //               </button>
// //             </div>
// //           }
// //         >
// //           <div className="max-w-full mx-auto border border-gray-300 rounded-lg p-4 sm:p-6 bg-white shadow-lg">
// //             {error ? (
// //               <div className="text-red-500 text-center p-4 bg-red-100 rounded-md">
// //                 <p className="text-sm sm:text-base">{error}</p>
// //                 <button
// //                   onClick={fetchData}
// //                   disabled={isLoading}
// //                   className="mt-2 px-3 py-1.5 text-xs sm:text-sm bg-blue-500 text-white font-mono rounded hover:bg-blue-600 transition disabled:opacity-50"
// //                   aria-label="Try again"
// //                 >
// //                   <FaSync className={`inline mr-1 ${isLoading ? "animate-spin" : ""}`} />
// //                   Try Again
// //                 </button>
// //               </div>
// //             ) : (
// //               <>
// //                 <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
// //                   {Object.entries(filterKeyMap).map(([id, { key, field, label }]) => (
// //                     <div key={id}>
// //                       <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-1">
// //                         {label}
// //                       </label>
// //                       {key === "airlines" || key === "channel" ? (
// //                         <MultiSelect
// //                           options={field ? filters[field] || [] : []}
// //                           selected={filterValues[key] as string[]}
// //                           onChange={(value) => handleCheckboxChange(key as "airlines" | "channel", value)}
// //                           onSelectAll={() => handleSelectAll(key as "airlines" | "channel")}
// //                           onClear={() => handleClear(key as "airlines" | "channel")}
// //                           placeholder={`Select ${label}`}
// //                           id={id}
// //                         />
// //                       ) : (
// //                         <select
// //                           id={id}
// //                           className="w-full p-2 sm:p-2.5 border border-gray-300 rounded-md text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
// //                           value={filterValues[key] as string}
// //                           onChange={(e) => handleFilterChange(key, e.target.value)}
// //                           aria-label={`Select ${label}`}
// //                         >
// //                           <option value="">All</option>
// //                           {key === "district" ? (
// //                             getDistrictOptions.length > 0 ? (
// //                               getDistrictOptions.map((value) => (
// //                                 <option key={value} value={value}>
// //                                   {value}
// //                                 </option>
// //                               ))
// //                             ) : (
// //                               <option disabled>No districts available</option>
// //                             )
// //                           ) : key === "currency" ? (
// //                             getCurrencyOptions.length > 0 ? (
// //                               getCurrencyOptions.map((value) => (
// //                                 <option key={value} value={value}>
// //                                   {value}
// //                                 </option>
// //                               ))
// //                             ) : (
// //                               <option disabled>No currencies available</option>
// //                             )
// //                           ) : field && filters[field]?.length > 0 ? (
// //                             filters[field].sort().map((value: string) => (
// //                               <option key={value} value={value}>
// //                                 {value}
// //                               </option>
// //                             ))
// //                           ) : (
// //                             <option disabled>No options available</option>
// //                           )}
// //                         </select>
// //                       )}
// //                     </div>
// //                   ))}
// //                 </div>

// //                 <div className="mb-6 overflow-x-auto">
// //                   <div className="block sm:hidden">
// //                     {Array.isArray(filteredData) && filteredData.length > 0 ? (
// //                       filteredData.map((row, index) => {
// //                         const fare = typeof row.totalFare === "number" && !isNaN(row.totalFare) ? row.totalFare : 0;
// //                         const rate = getCommissionRate(row.country, row.currency, fare);
// //                         const commission = fare * (rate / 100);
// //                         return (
// //                           <div
// //                             key={index}
// //                             className="mb-4 p-4 border border-gray-200 rounded-md bg-white shadow-sm"
// //                           >
// //                             <div className="grid grid-cols-2 gap-2 text-xs">
// //                               <div className="font-semibold">Month-Year:</div>
// //                               <div>{row.month}</div>
// //                               <div className="font-semibold">Country:</div>
// //                               <div>{row.country}</div>
// //                               <div className="font-semibold">AirlinesTKT:</div>
// //                               <div>{row.airlines}</div>
// //                               <div className="font-semibold">District:</div>
// //                               <div>{row.district}</div>
// //                               <div className="font-semibold">Channel:</div>
// //                               <div>{row.channel}</div>
// //                               <div className="font-semibold">Currency:</div>
// //                               <div>{row.currency}</div>
// //                               <div className="font-semibold">Fare:</div>
// //                               <div className="text-right">
// //                                 {fare.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
// //                               </div>
// //                               <div className="font-semibold">Commission:</div>
// //                               <div className="text-right">
// //                                 {commission.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
// //                                 <span className="text-gray-500"> ({rate}%)</span>
// //                               </div>
// //                             </div>
// //                           </div>
// //                         );
// //                       })
// //                     ) : (
// //                       <div className="p-4 text-center text-gray-600 text-xs">
// //                         No data available. Try adjusting filters or refreshing the data.
// //                       </div>
// //                     )}
// //                   </div>
// //                   <table className="w-full border-collapse hidden sm:table">
// //                     <thead>
// //                       <tr className="bg-secondary text-gray-100">
// //                         <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-semibold">Month-Year</th>
// //                         <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-semibold">Country</th>
// //                         <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-semibold">AirlinesTKT</th>
// //                         <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-semibold">District</th>
// //                         <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-semibold">Channel</th>
// //                         <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-semibold">Currency</th>
// //                         <th className="p-2 sm:p-3 text-right text-xs sm:text-sm font-semibold">Fare</th>
// //                         <th className="p-2 sm:p-3 text-right text-xs sm:text-sm font-semibold">Commission</th>
// //                       </tr>
// //                     </thead>
// //                     <tbody>
// //                       {Array.isArray(filteredData) && filteredData.length > 0 ? (
// //                         filteredData.map((row, index) => {
// //                           const fare = typeof row.totalFare === "number" && !isNaN(row.totalFare) ? row.totalFare : 0;
// //                           const rate = getCommissionRate(row.country, row.currency, fare);
// //                           const commission = fare * (rate / 100);
// //                           return (
// //                             <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
// //                               <td className="p-2 sm:p-3 text-xs sm:text-sm">{row.month}</td>
// //                               <td className="p-2 sm:p-3 text-xs sm:text-sm">{row.country}</td>
// //                               <td className="p-2 sm:p-3 text-xs sm:text-sm">{row.airlines}</td>
// //                               <td className="p-2 sm:p-3 text-xs sm:text-sm">{row.district}</td>
// //                               <td className="p-2 sm:p-3 text-xs sm:text-sm">{row.channel}</td>
// //                               <td className="p-2 sm:p-3 text-xs sm:text-sm">{row.currency}</td>
// //                               <td className="p-2 sm:p-3 text-right text-xs sm:text-sm">
// //                                 {fare.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
// //                               </td>
// //                               <td className="p-2 sm:p-3 text-right text-xs sm:text-sm">
// //                                 {commission.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
// //                                 <span className="text-xs text-gray-500"> ({rate}%)</span>
// //                               </td>
// //                             </tr>
// //                           );
// //                         })
// //                       ) : (
// //                         <tr>
// //                           <td colSpan={8} className="p-3 text-center text-gray-600 text-xs sm:text-sm">
// //                             No data available. Try adjusting filters or refreshing the data.
// //                           </td>
// //                         </tr>
// //                       )}
// //                     </tbody>
// //                   </table>
// //                 </div>

// //                 {Array.isArray(filteredData) && filteredData.length > 0 && (
// //                   <div className="overflow-x-auto">
// //                     <div className="block sm:hidden">
// //                       {computeTotals().map((total, index) => (
// //                         <div
// //                           key={index}
// //                           className="mb-4 p-4 border border-gray-200 rounded-md bg-white shadow-sm"
// //                         >
// //                           <div className="grid grid-cols-2 gap-2 text-xs">
// //                             <div className="font-semibold">Total:</div>
// //                             <div>TOTAL {total.currency}</div>
// //                             <div className="font-semibold">Currency:</div>
// //                             <div>{total.currency}</div>
// //                             <div className="font-semibold">Fare:</div>
// //                             <div className="text-right">
// //                               {total.totalFare.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
// //                             </div>
// //                             <div className="font-semibold">Commission:</div>
// //                             <div className="text-right">
// //                               {total.totalCommission.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
// //                               <span className="text-gray-500"> ({total.commissionRate}%)</span>
// //                             </div>
// //                           </div>
// //                         </div>
// //                       ))}
// //                     </div>
// //                     <table className="w-full border-collapse hidden sm:table">
// //                       <thead>
// //                         <tr className="bg-secondary text-gray-100">
// //                           <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-semibold">Total</th>
// //                           <th colSpan={4} className="p-2 sm:p-3"></th>
// //                           <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-semibold">Currency</th>
// //                           <th className="p-2 sm:p-3 text-right text-xs sm:text-sm font-semibold">Fare</th>
// //                           <th className="p-2 sm:p-3 text-right text-xs sm:text-sm font-semibold">Commission</th>
// //                         </tr>
// //                       </thead>
// //                       <tbody>
// //                         {computeTotals().map((total, index) => (
// //                           <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
// //                             <td className="p-2 sm:p-3 text-xs sm:text-sm font-bold">TOTAL {total.currency}</td>
// //                             <td colSpan={4} className="p-2 sm:p-3"></td>
// //                             <td className="p-2 sm:p-3 text-xs sm:text-sm">{total.currency}</td>
// //                             <td className="p-2 sm:p-3 text-right text-xs sm:text-sm">
// //                               {total.totalFare.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
// //                             </td>
// //                             <td className="p-2 sm:p-3 text-right text-xs sm:text-sm">
// //                               {total.totalCommission.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
// //                               <span className="text-xs text-gray-500"> ({total.commissionRate}%)</span>
// //                             </td>
// //                           </tr>
// //                         ))}
// //                       </tbody>
// //                     </table>
// //                   </div>
// //                 )}
// //               </>
// //             )}
// //           </div>
// //         </ErrorBoundary>
// //       </div>
// //     </ProtectedRoute>
// //   );
// // }

// "use client";

// import { useEffect, useState, useMemo, useRef } from "react";
// import Link from "next/link";
// import ProtectedRoute from "./components/ProtectedRoute";
// import { FaHistory, FaSync, FaTimes, FaFileExport } from "react-icons/fa";

// type DashboardRow = {
//   month: string;
//   country: string;
//   airlines: string;
//   district: string;
//   channel: string;
//   currency: string;
//   totalFare: number;
//   count: number;
// };

// type Filters = {
//   MonthFlown: string[];
//   countryname: string[];
//   AirlinesTKT: string[];
//   Channel: string[];
//   SalesCurrency: string[];
//   countryDistrictMap: { [country: string]: string[] };
//   countryCurrencyMap: { [country: string]: string[] };
// };

// type FilterKey = "month" | "country" | "airlines" | "district" | "channel" | "currency";

// type FilterField = keyof Omit<Filters, "countryDistrictMap" | "countryCurrencyMap">;

// type TotalByCurrency = {
//   currency: string;
//   totalFare: number;
//   totalCommission: number;
//   commissionRate: number;
// };

// const filterKeyMap: Record<string, { key: FilterKey; field?: FilterField; label: string }> = {
//   monthFilter: { key: "month", field: "MonthFlown", label: "Month-Year" },
//   countryFilter: { key: "country", field: "countryname", label: "Country" },
//   airlinesFilter: { key: "airlines", field: "AirlinesTKT", label: "AirlinesTKT" },
//   districtFilter: { key: "district", label: "District" },
//   channelFilter: { key: "channel", field: "Channel", label: "Channel" },
//   currencyFilter: { key: "currency", field: "SalesCurrency", label: "Currency" },
// };

// // Error Boundary Component
// const ErrorBoundary: React.FC<{ children: React.ReactNode; fallback: React.ReactNode }> = ({ children, fallback }) => {
//   const [hasError, setHasError] = useState(false);

//   useEffect(() => {
//     setHasError(false);
//   }, [children]);

//   if (hasError) return <>{fallback}</>;

//   try {
//     return <>{children}</>;
//   } catch {
//     setHasError(true);
//     return <>{fallback}</>;
//   }
// };

// // MultiSelect Component
// interface MultiSelectProps {
//   options: string[];
//   selected: string[];
//   onChange: (value: string) => void;
//   onSelectAll: () => void;
//   onClear: () => void;
//   placeholder: string;
//   id: string;
// }

// const multiSelectStyles = {
//   container: "relative w-full",
//   trigger: "w-full p-2 sm:p-2.5 border border-gray-300 rounded-md bg-white cursor-pointer flex items-center justify-between focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
//   text: "text-xs sm:text-sm text-gray-600 truncate",
//   icon: "w-4 h-4 transform",
//   dropdown: "absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-[40vh] overflow-y-auto",
//   searchContainer: "p-2",
//   searchInput: "w-full p-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:ring-2 focus:ring-blue-500",
//   buttonContainer: "flex justify-between p-2 border-b border-gray-200",
//   button: "text-xs sm:text-sm text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500",
//   option: "p-2 flex items-center cursor-pointer hover:bg-gray-100 focus:bg-gray-100 focus:outline-none",
//   selectedOption: "bg-blue-50",
//   noOptions: "p-2 text-xs sm:text-sm text-gray-500",
//   tagsContainer: "mt-2 flex flex-wrap gap-1 sm:gap-2",
//   tag: "inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-800 text-xs rounded-full",
//   tagButton: "ml-1 focus:outline-none focus:ring-2 focus:ring-blue-500",
//   tagIcon: "w-3 h-3",
// };

// const MultiSelect: React.FC<MultiSelectProps> = ({
//   options,
//   selected,
//   onChange,
//   onSelectAll,
//   onClear,
//   placeholder,
//   id,
// }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [search, setSearch] = useState("");
//   const dropdownRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//         setIsOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const filteredOptions = options.filter((option) =>
//     option.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <div className={multiSelectStyles.container} ref={dropdownRef}>
//       <div
//         className={multiSelectStyles.trigger}
//         onClick={() => setIsOpen(!isOpen)}
//         role="combobox"
//         aria-expanded={isOpen}
//         aria-controls={`${id}-dropdown`}
//         tabIndex={0}
//         onKeyDown={(e) => {
//           if (e.key === "Enter" || e.key === " ") {
//             setIsOpen(!isOpen);
//             e.preventDefault();
//           }
//         }}
//       >
//         <span className={multiSelectStyles.text}>
//           {selected.length > 0 ? selected.join(", ") : placeholder}
//         </span>
//         <svg
//           className={`${multiSelectStyles.icon} ${isOpen ? "rotate-180" : ""}`}
//           fill="none"
//           stroke="currentColor"
//           viewBox="0 0 24 24"
//           aria-hidden="true"
//         >
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
//         </svg>
//       </div>
//       {isOpen && (
//         <div className={multiSelectStyles.dropdown} id={`${id}-dropdown`} role="listbox">
//           <div className={multiSelectStyles.searchContainer}>
//             <input
//               type="text"
//               className={multiSelectStyles.searchInput}
//               placeholder="Search..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               autoFocus
//               role="searchbox"
//               aria-label={`Search ${placeholder}`}
//             />
//           </div>
//           <div className={multiSelectStyles.buttonContainer}>
//             <button
//               type="button"
//               onClick={() => {
//                 onSelectAll();
//                 setSearch("");
//               }}
//               className={multiSelectStyles.button}
//               role="button"
//               aria-label={`Select all ${placeholder}`}
//             >
//               Select All
//             </button>
//             <button
//               type="button"
//               onClick={() => {
//                 onClear();
//                 setSearch("");
//               }}
//               className={multiSelectStyles.button}
//               role="button"
//               aria-label={`Clear ${placeholder}`}
//             >
//               Clear
//             </button>
//           </div>
//           {filteredOptions.length > 0 ? (
//             filteredOptions.map((option) => (
//               <div
//                 key={option}
//                 className={`${multiSelectStyles.option} ${
//                   selected.includes(option) ? multiSelectStyles.selectedOption : ""
//                 }`}
//                 onClick={() => {
//                   onChange(option);
//                   setSearch("");
//                 }}
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter" || e.key === " ") {
//                     onChange(option);
//                     setSearch("");
//                     e.preventDefault();
//                   }
//                 }}
//                 role="option"
//                 aria-selected={selected.includes(option)}
//                 tabIndex={0}
//               >
//                 <input
//                   type="checkbox"
//                   checked={selected.includes(option)}
//                   onChange={() => onChange(option)}
//                   className="mr-2"
//                   id={`${id}-${option}`}
//                   aria-hidden="true"
//                 />
//                 <label htmlFor={`${id}-${option}`} className="text-xs sm:text-sm text-gray-800">
//                   {option}
//                 </label>
//               </div>
//             ))
//           ) : (
//             <p className={multiSelectStyles.noOptions}>No options found</p>
//           )}
//         </div>
//       )}
//       {selected.length > 0 && (
//         <div className={multiSelectStyles.tagsContainer}>
//           {selected.map((value) => (
//             <span key={value} className={multiSelectStyles.tag}>
//               {value}
//               <button
//                 type="button"
//                 onClick={() => onChange(value)}
//                 className={multiSelectStyles.tagButton}
//                 aria-label={`Remove ${value}`}
//               >
//                 <FaTimes className={multiSelectStyles.tagIcon} />
//               </button>
//             </span>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// // Utility functions (unchanged)
// const convertToCSV = (data: any[], headers: string[], valueMappers: ((row: any) => string)[]) => {
//   const csvRows = [
//     headers.join(','),
//     ...data.map((row) =>
//       valueMappers.map((mapper) => `"${mapper(row).replace(/"/g, '""')}"`).join(',')
//     ),
//   ];
//   return csvRows.join('\n');
// };

// const downloadCSV = (csvContent: string, filename: string) => {
//   const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//   const link = document.createElement('a');
//   const url = URL.createObjectURL(blob);
//   link.setAttribute('href', url);
//   link.setAttribute('download', filename);
//   link.style.visibility = 'hidden';
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
// };

// export default function DashboardPage() {
//   const [data, setData] = useState<DashboardRow[]>([]);
//   const [filteredData, setFilteredData] = useState<DashboardRow[]>([]);
//   const [filters, setFilters] = useState<Filters>({
//     MonthFlown: [],
//     countryname: [],
//     AirlinesTKT: [],
//     Channel: [],
//     SalesCurrency: [],
//     countryDistrictMap: {},
//     countryCurrencyMap: {},
//   });
//   const [filterValues, setFilterValues] = useState<{
//     month: string;
//     country: string;
//     airlines: string[];
//     district: string;
//     channel: string[];
//     currency: string[];
//   }>({
//     month: "",
//     country: "",
//     airlines: [],
//     district: "",
//     channel: [],
//     currency: [],
//   });
//   const [error, setError] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isExportingDetailed, setIsExportingDetailed] = useState(false);

//   const fetchData = async () => {
//     setIsLoading(true);
//     try {
//       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboardSummary`);
//       if (!response.ok) {
//         throw new Error(`HTTP error: ${response.status}`);
//       }
//       const result = await response.json();
//       if (!result.success) {
//         throw new Error(result.message || "Failed to fetch dashboard summary");
//       }
//       console.log("API Data:", result.data);
//       console.log("Filters:", result.filters);
//       const validatedData = Array.isArray(result.data) ? result.data : [];
//       setData(validatedData);
//       setFilteredData(validatedData);
//       setFilters({
//         MonthFlown: result.filters.MonthFlown || [],
//         countryname: result.filters.countryname || [],
//         AirlinesTKT: result.filters.AirlinesTKT || [],
//         Channel: result.filters.Channel || [],
//         SalesCurrency: result.filters.SalesCurrency || [],
//         countryDistrictMap: result.filters.countryDistrictMap || {},
//         countryCurrencyMap: result.filters.countryCurrencyMap || {},
//       });
//       setError(null);
//     } catch (err) {
//       console.error("Error fetching dashboard data:", err);
//       const errorMessage = err instanceof Error ? err.message : String(err);
//       setError(`Failed to load dashboard data: ${errorMessage}. Please try again.`);
//       setData([]);
//       setFilteredData([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   useEffect(() => {
//     const newFilteredData = data.filter((row) =>
//       (filterValues.month === "" || row.month === filterValues.month) &&
//       (filterValues.country === "" || row.country === filterValues.country) &&
//       (filterValues.airlines.length === 0 || filterValues.airlines.includes(row.airlines)) &&
//       (filterValues.district === "" || row.district === filterValues.district) &&
//       (filterValues.channel.length === 0 || filterValues.channel.includes(row.channel)) &&
//       (filterValues.currency.length === 0 || filterValues.currency.includes(row.currency))
//     );
//     console.log("Applied Filters:", filterValues, "Filtered Data Length:", newFilteredData.length);
//     setFilteredData(newFilteredData);
//   }, [data, filterValues]);

//   const handleFilterChange = (field: FilterKey, value: string) => {
//     setFilterValues((prev) => {
//       const newValues = { ...prev, [field]: value };
//       if (field === "country") {
//         newValues.district = "";
//         newValues.currency = [];
//       }
//       return newValues;
//     });
//   };

//   const handleCheckboxChange = (field: "airlines" | "channel" | "currency", value: string) => {
//     setFilterValues((prev) => {
//       const currentValues = prev[field];
//       const newValues = currentValues.includes(value)
//         ? currentValues.filter((v) => v !== value)
//         : [...currentValues, value];
//       return { ...prev, [field]: newValues };
//     });
//   };

//   const handleSelectAll = (field: "airlines" | "channel" | "currency") => {
//     setFilterValues((prev) => ({
//       ...prev,
//       [field]: filters[field === "airlines" ? "AirlinesTKT" : field === "channel" ? "Channel" : "SalesCurrency"] || [],
//     }));
//   };

//   const handleClear = (field: "airlines" | "channel" | "currency") => {
//     setFilterValues((prev) => ({ ...prev, [field]: [] }));
//   };

//   const getDistrictOptions = useMemo(() => {
//     if (!filters.countryDistrictMap) return [];
//     if (filterValues.country === "") {
//       return Array.from(new Set(Object.values(filters.countryDistrictMap).flat())).sort();
//     }
//     return (filters.countryDistrictMap?.[filterValues.country] || []).sort();
//   }, [filters.countryDistrictMap, filterValues.country]);

//   const getCurrencyOptions = useMemo(() => {
//     console.log("CountryCurrencyMap:", filters.countryCurrencyMap);
//     console.log("Selected Country:", filterValues.country);
//     console.log("CountryCurrencyMap for country:", filters.countryCurrencyMap?.[filterValues.country]);
//     if (filterValues.country === "") {
//       return filters.countryCurrencyMap
//         ? Array.from(new Set(Object.values(filters.countryCurrencyMap).flat())).sort()
//         : [];
//     }
//     return (filters.countryCurrencyMap?.[filterValues.country] || []).sort();
//   }, [filters.countryCurrencyMap, filterValues.country]);

//   const getCommissionRate = (country: string, currency: string, totalFare: number): number => {
//     if (country.toUpperCase() === "AUSTRALIA" && currency === "AUD") {
//       if (totalFare < 3000000) return 1.80;
//       if (totalFare < 4000000) return 1.65;
//       if (totalFare < 5000000) return 1.55;
//       if (totalFare < 6000000) return 1.30;
//       if (totalFare < 7000000) return 1.25;
//       if (totalFare < 8000000) return 1.15;
//       if (totalFare < 9000000) return 1.05;
//       if (totalFare < 10000000) return 1.00;
//       if (totalFare < 11000000) return 0.90;
//       if (totalFare < 12000000) return 0.90;
//       if (totalFare < 13000000) return 0.85;
//       if (totalFare < 14000000) return 0.85;
//       if (totalFare < 15000000) return 0.80;
//       return 0.75;
//     }

//     if (country.toUpperCase() === "JAPAN") {
//       return 3.0;
//     }

//     return 2.0;
//   };

//   const computeTotals = (): TotalByCurrency[] => {
//     const totals = filteredData.reduce((acc, row) => {
//       const fare = typeof row.totalFare === "number" && !isNaN(row.totalFare) ? row.totalFare : 0;
//       if (!acc[row.currency]) {
//         acc[row.currency] = { currency: row.currency, totalFare: 0, totalCommission: 0, commissionRate: 2 };
//       }
//       acc[row.currency].totalFare += fare;
//       return acc;
//     }, {} as Record<string, TotalByCurrency>);

//     Object.values(totals).forEach((total) => {
//       const countries = [...new Set(filteredData
//         .filter(row => row.currency === total.currency)
//         .map(row => row.country.toUpperCase()))];
      
//       if (countries.length === 1) {
//         total.commissionRate = getCommissionRate(countries[0], total.currency, total.totalFare);
//       } else {
//         total.commissionRate = 2;
//       }
//       total.totalCommission = total.totalFare * (total.commissionRate / 100);
//     });

//     return Object.values(totals).sort((a, b) => a.currency.localeCompare(b.currency));
//   };

//   const exportTableToCSV = () => {
//     if (filteredData.length === 0 && computeTotals().length === 0) {
//       alert("No data to export.");
//       return;
//     }

//     const mainHeaders = [
//       "Month-Year",
//       "Country",
//       "AirlinesTKT",
//       "District",
//       "Channel",
//       "Currency",
//       "Fare",
//       "Commission",
//     ];

//     const mainValueMappers = [
//       (row: DashboardRow) => row.month,
//       (row: DashboardRow) => row.country,
//       (row: DashboardRow) => row.airlines,
//       (row: DashboardRow) => row.district,
//       (row: DashboardRow) => row.channel,
//       (row: DashboardRow) => row.currency,
//       (row: DashboardRow) => {
//         const fare = typeof row.totalFare === "number" && !isNaN(row.totalFare) ? row.totalFare : 0;
//         return fare.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
//       },
//       (row: DashboardRow) => {
//         const fare = typeof row.totalFare === "number" && !isNaN(row.totalFare) ? row.totalFare : 0;
//         const rate = getCommissionRate(row.country, row.currency, fare);
//         const commission = fare * (rate / 100);
//         return `${commission.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${rate}%)`;
//       },
//     ];

//     const mainCSV = filteredData.length > 0
//       ? convertToCSV(filteredData, mainHeaders, mainValueMappers)
//       : "";

//     const totalHeaders = [
//       "Total",
//       "", "", "", "",
//       "Currency",
//       "Fare",
//       "Commission",
//     ];

//     const totalValueMappers = [
//       (row: TotalByCurrency) => `TOTAL ${row.currency}`,
//       () => "",
//       () => "",
//       () => "",
//       () => "",
//       (row: TotalByCurrency) => row.currency,
//       (row: TotalByCurrency) => row.totalFare.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
//       (row: TotalByCurrency) => `${row.totalCommission.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${row.commissionRate}%)`,
//     ];

//     const totals = computeTotals();
//     const totalCSV = totals.length > 0
//       ? convertToCSV(totals, totalHeaders, totalValueMappers)
//       : "";

//     const csvContent = [
//       mainCSV,
//       "",
//       "Total by Currency",
//       totalCSV,
//     ].filter(part => part !== "").join("\n");

//     const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
//     downloadCSV(csvContent, `dashboard_table_${timestamp}.csv`);
//   };

//   const exportDetailedDataToCSV = async () => {
//     setIsExportingDetailed(true);
//     try {
//       console.log("Filter values:", filterValues);
//       if (!filterValues.month) {
//         alert("Please select a Month-Year to export detailed data.");
//         return;
//       }
//       if (!filterValues.country) {
//         alert("Please select a Country to export detailed data.");
//         return;
//       }

//       const queryParams = new URLSearchParams();
//       const parts = filterValues.month.split(" ");
//       if (parts.length === 2) {
//         queryParams.append("MonthFlown", parts[0]);
//         queryParams.append("YearFlown", parts[1]);
//       } else {
//         console.warn("Invalid month format:", filterValues.month);
//         alert("Invalid Month-Year format. Please select a valid Month-Year.");
//         return;
//       }
//       queryParams.append("countryname", filterValues.country);
//       if (filterValues.airlines.length > 0) queryParams.append("AirlinesTKT", filterValues.airlines.join(","));
//       if (filterValues.district) queryParams.append("city_code", filterValues.district);
//       if (filterValues.channel.length > 0) queryParams.append("Channel", filterValues.channel.join(","));
//       if (filterValues.currency.length > 0) queryParams.append("SalesCurrency", filterValues.currency.join(","));

//       console.log("Detailed export query:", queryParams.toString());

//       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboardDetailed?${queryParams}`);
//       if (!response.ok) {
//         throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
//       }
//       const result = await response.json();
//       if (!result.success) {
//         throw new Error(result.message || "Failed to fetch detailed data");
//       }

//       const detailedData = Array.isArray(result.data) ? result.data : [];
//       if (detailedData.length === 0) {
//         alert("No detailed data to export for the selected filters.");
//         return;
//       }

//       console.log("Detailed data sample:", detailedData[0]);

//       const headers = [
//         "_id",
//         "AgencyName",
//         "AgentDieOrigin",
//         "Agentdie",
//         "AirlinesTKT",
//         "Channel",
//         "Exchticket",
//         "Flightnumber",
//         "Issueddate",
//         "MonthFlown",
//         "OriginalCurr",
//         "OriginalFareUpdate",
//         "OriginalIssueddate",
//         "OriginalTicketnumber",
//         "OriginalTranscode",
//         "PNRR",
//         "PartitionCode",
//         "Paxname",
//         "PreconjTicket",
//         "QSfare",
//         "RefundTicket",
//         "SalesCurrency",
//         "Stationcode",
//         "StationnoOrigin",
//         "StatusFlight",
//         "StatusTicket",
//         "Tourcodeorigin",
//         "YearFlown",
//         "airlines",
//         "city_code",
//         "countryname",
//         "dateofflight",
//         "descr",
//         "doctype",
//         "fareupdate",
//         "fc",
//         "flowndate",
//         "routeakhir",
//         "routeawal",
//         "stationno",
//         "stationopendate",
//         "ticketnumber",
//         "tourcode",
//         "transcode",
//         "existing",
//       ];

//       const valueMappers = headers.map((header) => (row: any) => {
//         let value = row[header] ?? "";
//         if (header === "_id" && value && typeof value === "object" && value.$oid) {
//           value = value.$oid;
//         }
//         if (Array.isArray(value)) {
//           value = JSON.stringify(value).replace(/"/g, '""');
//         }
//         return String(value).replace(/"/g, '""');
//       });

//       const csvContent = convertToCSV(detailedData, headers, valueMappers);
//       const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
//       downloadCSV(csvContent, `dashboard_detailed_${timestamp}.csv`);
//     } catch (err) {
//       console.error("Error exporting detailed data:", err);
//       const errorMessage = err instanceof Error ? err.message : String(err);
//       alert(`Failed to export detailed data: ${errorMessage}`);
//     } finally {
//       setIsExportingDetailed(false);
//     }
//   };

//   return (
//     <ProtectedRoute>
//       <div className="min-h-screen bg-background text-gray-900 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
//         <header className="mb-4 sm:mb-6">
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
//             <div>
//               <h1 className="text-xl sm:text-2xl font-bold mb-1">Airlines Dashboard</h1>
//               <p className="font-mono text-xs sm:text-sm text-gray-700">
//                 Fare Commission Calculation from Data Flown
//               </p>
//             </div>
//             <div className="flex flex-wrap gap-2 sm:gap-3">
//               <button
//                 onClick={fetchData}
//                 disabled={isLoading}
//                 className="flex items-center px-3 py-1.5 text-xs sm:text-sm bg-blue-800 text-gray-100 font-mono rounded hover:bg-blue-900 transition disabled:opacity-50 min-w-[100px]"
//                 title="Refresh data"
//                 aria-label="Refresh data"
//               >
//                 <FaSync className={`w-4 h-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
//                 Refresh
//               </button>
//               <button
//                 onClick={exportTableToCSV}
//                 disabled={isLoading || (filteredData.length === 0 && computeTotals().length === 0)}
//                 className="flex items-center px-3 py-1.5 text-xs sm:text-sm bg-green-600 text-gray-100 font-mono rounded hover:bg-green-700 transition disabled:opacity-50 min-w-[100px]"
//                 title="Export summary table"
//                 aria-label="Export summary table"
//               >
//                 <FaFileExport className="w-4 h-4 mr-1" />
//                 Export Table
//               </button>
//               <button
//                 onClick={exportDetailedDataToCSV}
//                 disabled={isLoading || isExportingDetailed}
//                 className="flex items-center px-3 py-1.5 text-xs sm:text-sm bg-green-600 text-gray-100 font-mono rounded hover:bg-purple-700 transition disabled:opacity-50 min-w-[100px]"
//                 title="Export detailed table"
//                 aria-label="Export detailed table"
//               >
//                 <FaFileExport className={`w-4 h-4 mr-1 ${isExportingDetailed ? "animate-spin" : ""}`} />
//                 Export Detailed
//               </button>
//               <Link
//                 href="/log-history"
//                 className="flex items-center px-3 py-1.5 text-xs sm:text-sm bg-secondary text-gray-100 font-mono rounded hover:bg-gray-600 transition min-w-[80px]"
//                 title="View export logs"
//                 aria-label="View export logs"
//               >
//                 <FaHistory className="w-4 h-4 mr-1" />
//                 Logs
//               </Link>
//             </div>
//           </div>
//         </header>

//         <ErrorBoundary
//           fallback={
//             <div className="text-red-500 text-center p-4 bg-red-100 rounded-md">
//               <p className="text-sm sm:text-base">An unexpected error occurred. Please try again.</p>
//               <button
//                 onClick={fetchData}
//                 disabled={isLoading}
//                 className="mt-2 px-3 py-1.5 text-xs sm:text-sm bg-blue-500 text-white font-mono rounded hover:bg-blue-600 transition disabled:opacity-50"
//                 aria-label="Try again"
//               >
//                 <FaSync className={`inline mr-1 ${isLoading ? "animate-spin" : ""}`} />
//                 Try Again
//               </button>
//             </div>
//           }
//         >
//           <div className="max-w-full mx-auto border border-gray-300 rounded-lg p-4 sm:p-6 bg-white shadow-lg">
//             {error ? (
//               <div className="text-red-500 text-center p-4 bg-red-100 rounded-md">
//                 <p className="text-sm sm:text-base">{error}</p>
//                 <button
//                   onClick={fetchData}
//                   disabled={isLoading}
//                   className="mt-2 px-3 py-1.5 text-xs sm:text-sm bg-blue-500 text-white font-mono rounded hover:bg-blue-600 transition disabled:opacity-50"
//                   aria-label="Try again"
//                 >
//                   <FaSync className={`inline mr-1 ${isLoading ? "animate-spin" : ""}`} />
//                   Try Again
//                 </button>
//               </div>
//             ) : (
//               <>
//                 <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//                   {Object.entries(filterKeyMap).map(([id, { key, field, label }]) => (
//                     <div key={id}>
//                       <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-1">
//                         {label}
//                       </label>
//                       {key === "airlines" || key === "channel" || key === "currency" ? (
//                         <MultiSelect
//                           options={field ? filters[field] || [] : []}
//                           selected={filterValues[key] as string[]}
//                           onChange={(value) => handleCheckboxChange(key as "airlines" | "channel" | "currency", value)}
//                           onSelectAll={() => handleSelectAll(key as "airlines" | "channel" | "currency")}
//                           onClear={() => handleClear(key as "airlines" | "channel" | "currency")}
//                           placeholder={`Select ${label}`}
//                           id={id}
//                         />
//                       ) : (
//                         <select
//                           id={id}
//                           className="w-full p-2 sm:p-2.5 border border-gray-300 rounded-md text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                           value={filterValues[key] as string}
//                           onChange={(e) => handleFilterChange(key, e.target.value)}
//                           aria-label={`Select ${label}`}
//                         >
//                           <option value="">All</option>
//                           {key === "district" ? (
//                             getDistrictOptions.length > 0 ? (
//                               getDistrictOptions.map((value) => (
//                                 <option key={value} value={value}>
//                                   {value}
//                                 </option>
//                               ))
//                             ) : (
//                               <option disabled>No districts available</option>
//                             )
//                           ) : field && filters[field]?.length > 0 ? (
//                             filters[field].sort().map((value: string) => (
//                               <option key={value} value={value}>
//                                 {value}
//                               </option>
//                             ))
//                           ) : (
//                             <option disabled>No options available</option>
//                           )}
//                         </select>
//                       )}
//                     </div>
//                   ))}
//                 </div>

//                 <div className="mb-6 overflow-x-auto">
//                   <div className="block sm:hidden">
//                     {Array.isArray(filteredData) && filteredData.length > 0 ? (
//                       filteredData.map((row, index) => {
//                         const fare = typeof row.totalFare === "number" && !isNaN(row.totalFare) ? row.totalFare : 0;
//                         const rate = getCommissionRate(row.country, row.currency, fare);
//                         const commission = fare * (rate / 100);
//                         return (
//                           <div
//                             key={index}
//                             className="mb-4 p-4 border border-gray-200 rounded-md bg-white shadow-sm"
//                           >
//                             <div className="grid grid-cols-2 gap-2 text-xs">
//                               <div className="font-semibold">Month-Year:</div>
//                               <div>{row.month}</div>
//                               <div className="font-semibold">Country:</div>
//                               <div>{row.country}</div>
//                               <div className="font-semibold">AirlinesTKT:</div>
//                               <div>{row.airlines}</div>
//                               <div className="font-semibold">District:</div>
//                               <div>{row.district}</div>
//                               <div className="font-semibold">Channel:</div>
//                               <div>{row.channel}</div>
//                               <div className="font-semibold">Currency:</div>
//                               <div>{row.currency}</div>
//                               <div className="font-semibold">Fare:</div>
//                               <div className="text-right">
//                                 {fare.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
//                               </div>
//                               <div className="font-semibold">Commission:</div>
//                               <div className="text-right">
//                                 {commission.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
//                                 <span className="text-gray-500"> ({rate}%)</span>
//                               </div>
//                             </div>
//                           </div>
//                         );
//                       })
//                     ) : (
//                       <div className="p-4 text-center text-gray-600 text-xs">
//                         No data available. Try adjusting filters or refreshing the data.
//                       </div>
//                     )}
//                   </div>
//                   <table className="w-full border-collapse hidden sm:table">
//                     <thead>
//                       <tr className="bg-secondary text-gray-100">
//                         <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-semibold">Month-Year</th>
//                         <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-semibold">Country</th>
//                         <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-semibold">AirlinesTKT</th>
//                         <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-semibold">District</th>
//                         <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-semibold">Channel</th>
//                         <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-semibold">Currency</th>
//                         <th className="p-2 sm:p-3 text-right text-xs sm:text-sm font-semibold">Fare</th>
//                         <th className="p-2 sm:p-3 text-right text-xs sm:text-sm font-semibold">Commission</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {Array.isArray(filteredData) && filteredData.length > 0 ? (
//                         filteredData.map((row, index) => {
//                           const fare = typeof row.totalFare === "number" && !isNaN(row.totalFare) ? row.totalFare : 0;
//                           const rate = getCommissionRate(row.country, row.currency, fare);
//                           const commission = fare * (rate / 100);
//                           return (
//                             <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
//                               <td className="p-2 sm:p-3 text-xs sm:text-sm">{row.month}</td>
//                               <td className="p-2 sm:p-3 text-xs sm:text-sm">{row.country}</td>
//                               <td className="p-2 sm:p-3 text-xs sm:text-sm">{row.airlines}</td>
//                               <td className="p-2 sm:p-3 text-xs sm:text-sm">{row.district}</td>
//                               <td className="p-2 sm:p-3 text-xs sm:text-sm">{row.channel}</td>
//                               <td className="p-2 sm:p-3 text-xs sm:text-sm">{row.currency}</td>
//                               <td className="p-2 sm:p-3 text-right text-xs sm:text-sm">
//                                 {fare.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
//                               </td>
//                               <td className="p-2 sm:p-3 text-right text-xs sm:text-sm">
//                                 {commission.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
//                                 <span className="text-xs text-gray-500"> ({rate}%)</span>
//                               </td>
//                             </tr>
//                           );
//                         })
//                       ) : (
//                         <tr>
//                           <td colSpan={8} className="p-3 text-center text-gray-600 text-xs sm:text-sm">
//                             No data available. Try adjusting filters or refreshing the data.
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>

//                 {Array.isArray(filteredData) && filteredData.length > 0 && (
//                   <div className="overflow-x-auto">
//                     <div className="block sm:hidden">
//                       {computeTotals().map((total, index) => (
//                         <div
//                           key={index}
//                           className="mb-4 p-4 border border-gray-200 rounded-md bg-white shadow-sm"
//                         >
//                           <div className="grid grid-cols-2 gap-2 text-xs">
//                             <div className="font-semibold">Total:</div>
//                             <div>TOTAL {total.currency}</div>
//                             <div className="font-semibold">Currency:</div>
//                             <div>{total.currency}</div>
//                             <div className="font-semibold">Fare:</div>
//                             <div className="text-right">
//                               {total.totalFare.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
//                             </div>
//                             <div className="font-semibold">Commission:</div>
//                             <div className="text-right">
//                               {total.totalCommission.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
//                               <span className="text-gray-500"> ({total.commissionRate}%)</span>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                     <table className="w-full border-collapse hidden sm:table">
//                       <thead>
//                         <tr className="bg-secondary text-gray-100">
//                           <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-semibold">Total</th>
//                           <th colSpan={4} className="p-2 sm:p-3"></th>
//                           <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-semibold">Currency</th>
//                           <th className="p-2 sm:p-3 text-right text-xs sm:text-sm font-semibold">Fare</th>
//                           <th className="p-2 sm:p-3 text-right text-xs sm:text-sm font-semibold">Commission</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {computeTotals().map((total, index) => (
//                           <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
//                             <td className="p-2 sm:p-3 text-xs sm:text-sm font-bold">TOTAL {total.currency}</td>
//                             <td colSpan={4} className="p-2 sm:p-3"></td>
//                             <td className="p-2 sm:p-3 text-xs sm:text-sm">{total.currency}</td>
//                             <td className="p-2 sm:p-3 text-right text-xs sm:text-sm">
//                               {total.totalFare.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
//                             </td>
//                             <td className="p-2 sm:p-3 text-right text-xs sm:text-sm">
//                               {total.totalCommission.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
//                               <span className="text-xs text-gray-500"> ({total.commissionRate}%)</span>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 )}
//               </>
//             )}
//           </div>
//         </ErrorBoundary>
//       </div>
//     </ProtectedRoute>
//   );
// }

// choose 1 currency (iteration again to choose more)

"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import ProtectedRoute from "./components/ProtectedRoute";
import { FaHistory, FaSync, FaTimes, FaFileExport } from "react-icons/fa";

type DashboardRow = {
  month: string;
  country: string;
  airlines: string;
  district: string;
  channel: string;
  currency: string;
  totalFare: number;
  count: number;
};

type Filters = {
  MonthFlown: string[];
  countryname: string[];
  AirlinesTKT: string[];
  Channel: string[];
  SalesCurrency: string[];
  countryDistrictMap: { [country: string]: string[] };
  countryCurrencyMap: { [country: string]: string[] };
};

type FilterKey = "month" | "country" | "airlines" | "district" | "channel" | "currency";

type FilterField = keyof Omit<Filters, "countryDistrictMap" | "countryCurrencyMap">;

type TotalByCurrency = {
  currency: string;
  totalFare: number;
  totalCommission: number;
  commissionRate: number;
};

const filterKeyMap: Record<string, { key: FilterKey; field?: FilterField; label: string }> = {
  monthFilter: { key: "month", field: "MonthFlown", label: "Month-Year" },
  countryFilter: { key: "country", field: "countryname", label: "Country" },
  airlinesFilter: { key: "airlines", field: "AirlinesTKT", label: "AirlinesTKT" },
  districtFilter: { key: "district", label: "District" },
  channelFilter: { key: "channel", field: "Channel", label: "Channel" },
  currencyFilter: { key: "currency", field: "SalesCurrency", label: "Currency" },
};

// Error Boundary Component
const ErrorBoundary: React.FC<{ children: React.ReactNode; fallback: React.ReactNode }> = ({ children, fallback }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [children]);

  if (hasError) return <>{fallback}</>;

  try {
    return <>{children}</>;
  } catch {
    setHasError(true);
    return <>{fallback}</>;
  }
};

// MultiSelect Component
interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (value: string) => void;
  onSelectAll: () => void;
  onClear: () => void;
  placeholder: string;
  id: string;
}

const multiSelectStyles = {
  container: "relative w-full",
  trigger: "w-full p-2 sm:p-2.5 border border-gray-300 rounded-md bg-white cursor-pointer flex items-center justify-between focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
  text: "text-xs sm:text-sm text-gray-600 truncate",
  icon: "w-4 h-4 transform",
  dropdown: "absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-[40vh] overflow-y-auto",
  searchContainer: "p-2",
  searchInput: "w-full p-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:ring-2 focus:ring-blue-500",
  buttonContainer: "flex justify-between p-2 border-b border-gray-200",
  button: "text-xs sm:text-sm text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500",
  option: "p-2 flex items-center cursor-pointer hover:bg-gray-100 focus:bg-gray-100 focus:outline-none",
  selectedOption: "bg-blue-50",
  noOptions: "p-2 text-xs sm:text-sm text-gray-500",
  tagsContainer: "mt-2 flex flex-wrap gap-1 sm:gap-2",
  tag: "inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-800 text-xs rounded-full",
  tagButton: "ml-1 focus:outline-none focus:ring-2 focus:ring-blue-500",
  tagIcon: "w-3 h-3",
};

const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selected,
  onChange,
  onSelectAll,
  onClear,
  placeholder,
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={multiSelectStyles.container} ref={dropdownRef}>
      <div
        className={multiSelectStyles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={`${id}-dropdown`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            setIsOpen(!isOpen);
            e.preventDefault();
          }
        }}
      >
        <span className={multiSelectStyles.text}>
          {selected.length > 0 ? selected.join(", ") : placeholder}
        </span>
        <svg
          className={`${multiSelectStyles.icon} ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {isOpen && (
        <div className={multiSelectStyles.dropdown} id={`${id}-dropdown`} role="listbox">
          <div className={multiSelectStyles.searchContainer}>
            <input
              type="text"
              className={multiSelectStyles.searchInput}
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              role="searchbox"
              aria-label={`Search ${placeholder}`}
            />
          </div>
          <div className={multiSelectStyles.buttonContainer}>
            <button
              type="button"
              onClick={() => {
                onSelectAll();
                setSearch("");
              }}
              className={multiSelectStyles.button}
              role="button"
              aria-label={`Select all ${placeholder}`}
            >
              Select All
            </button>
            <button
              type="button"
              onClick={() => {
                onClear();
                setSearch("");
              }}
              className={multiSelectStyles.button}
              role="button"
              aria-label={`Clear ${placeholder}`}
            >
              Clear
            </button>
          </div>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option}
                className={`${multiSelectStyles.option} ${
                  selected.includes(option) ? multiSelectStyles.selectedOption : ""
                }`}
                onClick={() => {
                  onChange(option);
                  setSearch("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    onChange(option);
                    setSearch("");
                    e.preventDefault();
                  }
                }}
                role="option"
                aria-selected={selected.includes(option)}
                tabIndex={0}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={() => onChange(option)}
                  className="mr-2"
                  id={`${id}-${option}`}
                  aria-hidden="true"
                />
                <label htmlFor={`${id}-${option}`} className="text-xs sm:text-sm text-gray-800">
                  {option}
                </label>
              </div>
            ))
          ) : (
            <p className={multiSelectStyles.noOptions}>No options found</p>
          )}
        </div>
      )}
      {selected.length > 0 && (
        <div className={multiSelectStyles.tagsContainer}>
          {selected.map((value) => (
            <span key={value} className={multiSelectStyles.tag}>
              {value}
              <button
                type="button"
                onClick={() => onChange(value)}
                className={multiSelectStyles.tagButton}
                aria-label={`Remove ${value}`}
              >
                <FaTimes className={multiSelectStyles.tagIcon} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// Utility functions (unchanged)
const convertToCSV = (data: any[], headers: string[], valueMappers: ((row: any) => string)[]) => {
  const csvRows = [
    headers.join(','),
    ...data.map((row) =>
      valueMappers.map((mapper) => `"${mapper(row).replace(/"/g, '""')}"`).join(',')
    ),
  ];
  return csvRows.join('\n');
};

const downloadCSV = (csvContent: string, filename: string) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardRow[]>([]);
  const [filteredData, setFilteredData] = useState<DashboardRow[]>([]);
  const [filters, setFilters] = useState<Filters>({
    MonthFlown: [],
    countryname: [],
    AirlinesTKT: [],
    Channel: [],
    SalesCurrency: [],
    countryDistrictMap: {},
    countryCurrencyMap: {},
  });
  const [filterValues, setFilterValues] = useState<{
    month: string;
    country: string;
    airlines: string[];
    district: string;
    channel: string[];
    currency: string[];
  }>({
    month: "",
    country: "",
    airlines: [],
    district: "",
    channel: [],
    currency: [],
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExportingDetailed, setIsExportingDetailed] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboardSummary`);
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "Failed to fetch dashboard summary");
      }
      console.log("API Data:", result.data);
      console.log("Filters:", result.filters);
      const validatedData = Array.isArray(result.data) ? result.data : [];
      setData(validatedData);
      setFilteredData(validatedData);
      setFilters({
        MonthFlown: result.filters.MonthFlown || [],
        countryname: result.filters.countryname || [],
        AirlinesTKT: result.filters.AirlinesTKT || [],
        Channel: result.filters.Channel || [],
        SalesCurrency: result.filters.SalesCurrency || [],
        countryDistrictMap: result.filters.countryDistrictMap || {},
        countryCurrencyMap: result.filters.countryCurrencyMap || {},
      });
      setError(null);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Failed to load dashboard data: ${errorMessage}. Please try again.`);
      setData([]);
      setFilteredData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const newFilteredData = data.filter((row) =>
      (filterValues.month === "" || row.month === filterValues.month) &&
      (filterValues.country === "" || row.country === filterValues.country) &&
      (filterValues.airlines.length === 0 || filterValues.airlines.includes(row.airlines)) &&
      (filterValues.district === "" || row.district === filterValues.district) &&
      (filterValues.channel.length === 0 || filterValues.channel.includes(row.channel)) &&
      (filterValues.currency.length === 0 || filterValues.currency.includes(row.currency))
    );
    console.log("Applied Filters:", filterValues, "Filtered Data Length:", newFilteredData.length);
    setFilteredData(newFilteredData);
  }, [data, filterValues]);

  const handleFilterChange = (field: FilterKey, value: string) => {
    setFilterValues((prev) => {
      const newValues = { ...prev, [field]: value };
      if (field === "country") {
        newValues.district = "";
        newValues.currency = [];
      }
      return newValues;
    });
  };

  const handleCheckboxChange = (field: "airlines" | "channel" | "currency", value: string) => {
    setFilterValues((prev) => {
      const currentValues = prev[field];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];
      return { ...prev, [field]: newValues };
    });
  };

  const handleSelectAll = (field: "airlines" | "channel" | "currency") => {
    setFilterValues((prev) => ({
      ...prev,
      [field]: filters[field === "airlines" ? "AirlinesTKT" : field === "channel" ? "Channel" : "SalesCurrency"] || [],
    }));
  };

  const handleClear = (field: "airlines" | "channel" | "currency") => {
    setFilterValues((prev) => ({ ...prev, [field]: [] }));
  };

  const getDistrictOptions = useMemo(() => {
    if (!filters.countryDistrictMap) return [];
    if (filterValues.country === "") {
      return Array.from(new Set(Object.values(filters.countryDistrictMap).flat())).sort();
    }
    return (filters.countryDistrictMap?.[filterValues.country] || []).sort();
  }, [filters.countryDistrictMap, filterValues.country]);

  const getCurrencyOptions = useMemo(() => {
    console.log("CountryCurrencyMap:", filters.countryCurrencyMap);
    console.log("Selected Country:", filterValues.country);
    console.log("CountryCurrencyMap for country:", filters.countryCurrencyMap?.[filterValues.country]);
    if (filterValues.country === "") {
      return filters.countryCurrencyMap
        ? Array.from(new Set(Object.values(filters.countryCurrencyMap).flat())).sort()
        : [];
    }
    return (filters.countryCurrencyMap?.[filterValues.country] || []).sort();
  }, [filters.countryCurrencyMap, filterValues.country]);

  const getCommissionRate = (country: string, currency: string, totalFare: number): number => {
    if (country.toUpperCase() === "AUSTRALIA" && currency === "AUD") {
      if (totalFare < 3000000) return 1.80;
      if (totalFare < 4000000) return 1.65;
      if (totalFare < 5000000) return 1.55;
      if (totalFare < 6000000) return 1.30;
      if (totalFare < 7000000) return 1.25;
      if (totalFare < 8000000) return 1.15;
      if (totalFare < 9000000) return 1.05;
      if (totalFare < 10000000) return 1.00;
      if (totalFare < 11000000) return 0.90;
      if (totalFare < 12000000) return 0.90;
      if (totalFare < 13000000) return 0.85;
      if (totalFare < 14000000) return 0.85;
      if (totalFare < 15000000) return 0.80;
      return 0.75;
    }

    if (country.toUpperCase() === "JAPAN") {
      return 3.0;
    }

    return 2.0;
  };

  const computeTotals = (): TotalByCurrency[] => {
    const totals = filteredData.reduce((acc, row) => {
      const fare = typeof row.totalFare === "number" && !isNaN(row.totalFare) ? row.totalFare : 0;
      if (!acc[row.currency]) {
        acc[row.currency] = { currency: row.currency, totalFare: 0, totalCommission: 0, commissionRate: 2 };
      }
      acc[row.currency].totalFare += fare;
      return acc;
    }, {} as Record<string, TotalByCurrency>);

    Object.values(totals).forEach((total) => {
      const countries = [...new Set(filteredData
        .filter(row => row.currency === total.currency)
        .map(row => row.country.toUpperCase()))];
      
      if (countries.length === 1) {
        total.commissionRate = getCommissionRate(countries[0], total.currency, total.totalFare);
      } else {
        total.commissionRate = 2;
      }
      total.totalCommission = total.totalFare * (total.commissionRate / 100);
    });

    return Object.values(totals).sort((a, b) => a.currency.localeCompare(b.currency));
  };

  const exportTableToCSV = () => {
    if (filteredData.length === 0 && computeTotals().length === 0) {
      alert("No data to export.");
      return;
    }

    const mainHeaders = [
      "Month-Year",
      "Country",
      "AirlinesTKT",
      "District",
      "Channel",
      "Currency",
      "Fare",
      "Commission",
    ];

    const mainValueMappers = [
      (row: DashboardRow) => row.month,
      (row: DashboardRow) => row.country,
      (row: DashboardRow) => row.airlines,
      (row: DashboardRow) => row.district,
      (row: DashboardRow) => row.channel,
      (row: DashboardRow) => row.currency,
      (row: DashboardRow) => {
        const fare = typeof row.totalFare === "number" && !isNaN(row.totalFare) ? row.totalFare : 0;
        return fare.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      },
      (row: DashboardRow) => {
        const fare = typeof row.totalFare === "number" && !isNaN(row.totalFare) ? row.totalFare : 0;
        const rate = getCommissionRate(row.country, row.currency, fare);
        const commission = fare * (rate / 100);
        return `${commission.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${rate}%)`;
      },
    ];

    const mainCSV = filteredData.length > 0
      ? convertToCSV(filteredData, mainHeaders, mainValueMappers)
      : "";

    const totalHeaders = [
      "Total",
      "", "", "", "",
      "Currency",
      "Fare",
      "Commission",
    ];

    const totalValueMappers = [
      (row: TotalByCurrency) => `TOTAL ${row.currency}`,
      () => "",
      () => "",
      () => "",
      () => "",
      (row: TotalByCurrency) => row.currency,
      (row: TotalByCurrency) => row.totalFare.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      (row: TotalByCurrency) => `${row.totalCommission.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${row.commissionRate}%)`,
    ];

    const totals = computeTotals();
    const totalCSV = totals.length > 0
      ? convertToCSV(totals, totalHeaders, totalValueMappers)
      : "";

    const csvContent = [
      mainCSV,
      "",
      "Total by Currency",
      totalCSV,
    ].filter(part => part !== "").join("\n");

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    downloadCSV(csvContent, `dashboard_table_${timestamp}.csv`);
  };

  const exportDetailedDataToCSV = async () => {
    setIsExportingDetailed(true);
    try {
      console.log("Filter values:", filterValues);
      if (!filterValues.month) {
        alert("Please select a Month-Year to export detailed data.");
        return;
      }
      if (!filterValues.country) {
        alert("Please select a Country to export detailed data.");
        return;
      }

      const queryParams = new URLSearchParams();
      const parts = filterValues.month.split(" ");
      if (parts.length === 2) {
        queryParams.append("MonthFlown", parts[0]);
        queryParams.append("YearFlown", parts[1]);
      } else {
        console.warn("Invalid month format:", filterValues.month);
        alert("Invalid Month-Year format. Please select a valid Month-Year.");
        return;
      }
      queryParams.append("countryname", filterValues.country);
      if (filterValues.airlines.length > 0) queryParams.append("AirlinesTKT", filterValues.airlines.join(","));
      if (filterValues.district) queryParams.append("city_code", filterValues.district);
      if (filterValues.channel.length > 0) queryParams.append("Channel", filterValues.channel.join(","));
      if (filterValues.currency.length > 0) queryParams.append("SalesCurrency", filterValues.currency.join(","));

      console.log("Detailed export query:", queryParams.toString());

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboardDetailed?${queryParams}`);
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "Failed to fetch detailed data");
      }

      const detailedData = Array.isArray(result.data) ? result.data : [];
      if (detailedData.length === 0) {
        alert("No detailed data to export for the selected filters.");
        return;
      }

      console.log("Detailed data sample:", detailedData[0]);

      const headers = [
        "_id",
        "AgencyName",
        "AgentDieOrigin",
        "Agentdie",
        "AirlinesTKT",
        "Channel",
        "Exchticket",
        "Flightnumber",
        "Issueddate",
        "MonthFlown",
        "OriginalCurr",
        "OriginalFareUpdate",
        "OriginalIssueddate",
        "OriginalTicketnumber",
        "OriginalTranscode",
        "PNRR",
        "PartitionCode",
        "Paxname",
        "PreconjTicket",
        "QSfare",
        "RefundTicket",
        "SalesCurrency",
        "Stationcode",
        "StationnoOrigin",
        "StatusFlight",
        "StatusTicket",
        "Tourcodeorigin",
        "YearFlown",
        "airlines",
        "city_code",
        "countryname",
        "dateofflight",
        "descr",
        "doctype",
        "fareupdate",
        "fc",
        "flowndate",
        "routeakhir",
        "routeawal",
        "stationno",
        "stationopendate",
        "ticketnumber",
        "tourcode",
        "transcode",
        "existing",
      ];

      const valueMappers = headers.map((header) => (row: any) => {
        let value = row[header] ?? "";
        if (header === "_id" && value && typeof value === "object" && value.$oid) {
          value = value.$oid;
        }
        if (Array.isArray(value)) {
          value = JSON.stringify(value).replace(/"/g, '""');
        }
        return String(value).replace(/"/g, '""');
      });

      const csvContent = convertToCSV(detailedData, headers, valueMappers);
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      downloadCSV(csvContent, `dashboard_detailed_${timestamp}.csv`);
    } catch (err) {
      console.error("Error exporting detailed data:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      alert(`Failed to export detailed data: ${errorMessage}`);
    } finally {
      setIsExportingDetailed(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-gray-900 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <header className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold mb-1">Airlines Dashboard</h1>
              <p className="font-mono text-xs sm:text-sm text-gray-700">
                Fare Commission Calculation from Data Flown
              </p>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button
                onClick={fetchData}
                disabled={isLoading}
                className="flex items-center px-3 py-1.5 text-xs sm:text-sm bg-blue-800 text-gray-100 font-mono rounded hover:bg-blue-900 transition disabled:opacity-50 min-w-[100px]"
                title="Refresh data"
                aria-label="Refresh data"
              >
                <FaSync className={`w-4 h-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <button
                onClick={exportTableToCSV}
                disabled={isLoading || (filteredData.length === 0 && computeTotals().length === 0)}
                className="flex items-center px-3 py-1.5 text-xs sm:text-sm bg-green-600 text-gray-100 font-mono rounded hover:bg-green-700 transition disabled:opacity-50 min-w-[100px]"
                title="Export summary table"
                aria-label="Export summary table"
              >
                <FaFileExport className="w-4 h-4 mr-1" />
                Export Table
              </button>
              <button
                onClick={exportDetailedDataToCSV}
                disabled={isLoading || isExportingDetailed}
                className="flex items-center px-3 py-1.5 text-xs sm:text-sm bg-green-600 text-gray-100 font-mono rounded hover:bg-purple-700 transition disabled:opacity-50 min-w-[100px]"
                title="Export detailed table"
                aria-label="Export detailed table"
              >
                <FaFileExport className={`w-4 h-4 mr-1 ${isExportingDetailed ? "animate-spin" : ""}`} />
                Export Detailed
              </button>
              <Link
                href="/log-history"
                className="flex items-center px-3 py-1.5 text-xs sm:text-sm bg-secondary text-gray-100 font-mono rounded hover:bg-gray-600 transition min-w-[80px]"
                title="View export logs"
                aria-label="View export logs"
              >
                <FaHistory className="w-4 h-4 mr-1" />
                Logs
              </Link>
            </div>
          </div>
        </header>

        <ErrorBoundary
          fallback={
            <div className="text-red-500 text-center p-4 bg-red-100 rounded-md">
              <p className="text-sm sm:text-base">An unexpected error occurred. Please try again.</p>
              <button
                onClick={fetchData}
                disabled={isLoading}
                className="mt-2 px-3 py-1.5 text-xs sm:text-sm bg-blue-500 text-white font-mono rounded hover:bg-blue-600 transition disabled:opacity-50"
                aria-label="Try again"
              >
                <FaSync className={`inline mr-1 ${isLoading ? "animate-spin" : ""}`} />
                Try Again
              </button>
            </div>
          }
        >
          <div className="max-w-full mx-auto border border-gray-300 rounded-lg p-4 sm:p-6 bg-white shadow-lg">
            {error ? (
              <div className="text-red-500 text-center p-4 bg-red-100 rounded-md">
                <p className="text-sm sm:text-base">{error}</p>
                <button
                  onClick={fetchData}
                  disabled={isLoading}
                  className="mt-2 px-3 py-1.5 text-xs sm:text-sm bg-blue-500 text-white font-mono rounded hover:bg-blue-600 transition disabled:opacity-50"
                  aria-label="Try again"
                >
                  <FaSync className={`inline mr-1 ${isLoading ? "animate-spin" : ""}`} />
                  Try Again
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(filterKeyMap).map(([id, { key, field, label }]) => (
                    <div key={id}>
                      <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-1">
                        {label}
                      </label>
                      {key === "airlines" || key === "channel" || key === "currency" ? (
                        <MultiSelect
                          options={field ? filters[field] || [] : []}
                          selected={filterValues[key] as string[]}
                          onChange={(value) => handleCheckboxChange(key as "airlines" | "channel" | "currency", value)}
                          onSelectAll={() => handleSelectAll(key as "airlines" | "channel" | "currency")}
                          onClear={() => handleClear(key as "airlines" | "channel" | "currency")}
                          placeholder={`Select ${label}`}
                          id={id}
                        />
                      ) : (
                        <select
                          id={id}
                          className="w-full p-2 sm:p-2.5 border border-gray-300 rounded-md text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={filterValues[key] as string}
                          onChange={(e) => handleFilterChange(key, e.target.value)}
                          aria-label={`Select ${label}`}
                        >
                          <option value="">All</option>
                          {key === "district" ? (
                            getDistrictOptions.length > 0 ? (
                              getDistrictOptions.map((value) => (
                                <option key={value} value={value}>
                                  {value}
                                </option>
                              ))
                            ) : (
                              <option disabled>No districts available</option>
                            )
                          ) : field && filters[field]?.length > 0 ? (
                            filters[field].sort().map((value: string) => (
                              <option key={value} value={value}>
                                {value}
                              </option>
                            ))
                          ) : (
                            <option disabled>No options available</option>
                          )}
                        </select>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mb-6 overflow-x-auto">
                  <div className="block sm:hidden">
                    {Array.isArray(filteredData) && filteredData.length > 0 ? (
                      filteredData.map((row, index) => {
                        const fare = typeof row.totalFare === "number" && !isNaN(row.totalFare) ? row.totalFare : 0;
                        const rate = getCommissionRate(row.country, row.currency, fare);
                        const commission = fare * (rate / 100);
                        return (
                          <div
                            key={index}
                            className="mb-4 p-4 border border-gray-200 rounded-md bg-white shadow-sm"
                          >
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="font-semibold">Month-Year:</div>
                              <div>{row.month}</div>
                              <div className="font-semibold">Country:</div>
                              <div>{row.country}</div>
                              <div className="font-semibold">AirlinesTKT:</div>
                              <div>{row.airlines}</div>
                              <div className="font-semibold">District:</div>
                              <div>{row.district}</div>
                              <div className="font-semibold">Channel:</div>
                              <div>{row.channel}</div>
                              <div className="font-semibold">Currency:</div>
                              <div>{row.currency}</div>
                              <div className="font-semibold">Fare:</div>
                              <div className="text-right">
                                {fare.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                              <div className="font-semibold">Commission:</div>
                              <div className="text-right">
                                {commission.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                <span className="text-gray-500"> ({rate}%)</span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-4 text-center text-gray-600 text-xs">
                        No data available. Try adjusting filters or refreshing the data.
                      </div>
                    )}
                  </div>
                  <table className="w-full border-collapse hidden sm:table">
                    <thead>
                      <tr className="bg-secondary text-gray-100">
                        <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-semibold">Month-Year</th>
                        <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-semibold">Country</th>
                        <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-semibold">AirlinesTKT</th>
                        <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-semibold">District</th>
                        <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-semibold">Channel</th>
                        <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-semibold">Currency</th>
                        <th className="p-2 sm:p-3 text-right text-xs sm:text-sm font-semibold">Fare</th>
                        <th className="p-2 sm:p-3 text-right text-xs sm:text-sm font-semibold">Commission</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(filteredData) && filteredData.length > 0 ? (
                        filteredData.map((row, index) => {
                          const fare = typeof row.totalFare === "number" && !isNaN(row.totalFare) ? row.totalFare : 0;
                          const rate = getCommissionRate(row.country, row.currency, fare);
                          const commission = fare * (rate / 100);
                          return (
                            <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                              <td className="p-2 sm:p-3 text-xs sm:text-sm">{row.month}</td>
                              <td className="p-2 sm:p-3 text-xs sm:text-sm">{row.country}</td>
                              <td className="p-2 sm:p-3 text-xs sm:text-sm">{row.airlines}</td>
                              <td className="p-2 sm:p-3 text-xs sm:text-sm">{row.district}</td>
                              <td className="p-2 sm:p-3 text-xs sm:text-sm">{row.channel}</td>
                              <td className="p-2 sm:p-3 text-xs sm:text-sm">{row.currency}</td>
                              <td className="p-2 sm:p-3 text-right text-xs sm:text-sm">
                                {fare.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td className="p-2 sm:p-3 text-right text-xs sm:text-sm">
                                {commission.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                <span className="text-xs text-gray-500"> ({rate}%)</span>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={8} className="p-3 text-center text-gray-600 text-xs sm:text-sm">
                            No data available. Try adjusting filters or refreshing the data.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {Array.isArray(filteredData) && filteredData.length > 0 && (
                  <div className="overflow-x-auto">
                    <div className="block sm:hidden">
                      {computeTotals().map((total, index) => (
                        <div
                          key={index}
                          className="mb-4 p-4 border border-gray-200 rounded-md bg-white shadow-sm"
                        >
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="font-semibold">Total:</div>
                            <div>TOTAL {total.currency}</div>
                            <div className="font-semibold">Currency:</div>
                            <div>{total.currency}</div>
                            <div className="font-semibold">Fare:</div>
                            <div className="text-right">
                              {total.totalFare.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className="font-semibold">Commission:</div>
                            <div className="text-right">
                              {total.totalCommission.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              <span className="text-gray-500"> ({total.commissionRate}%)</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <table className="w-full border-collapse hidden sm:table">
                      <thead>
                        <tr className="bg-secondary text-gray-100">
                          <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-semibold">Total</th>
                          <th colSpan={4} className="p-2 sm:p-3"></th>
                          <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-semibold">Currency</th>
                          <th className="p-2 sm:p-3 text-right text-xs sm:text-sm font-semibold">Fare</th>
                          <th className="p-2 sm:p-3 text-right text-xs sm:text-sm font-semibold">Commission</th>
                        </tr>
                      </thead>
                      <tbody>
                        {computeTotals().map((total, index) => (
                          <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="p-2 sm:p-3 text-xs sm:text-sm font-bold">TOTAL {total.currency}</td>
                            <td colSpan={4} className="p-2 sm:p-3"></td>
                            <td className="p-2 sm:p-3 text-xs sm:text-sm">{total.currency}</td>
                            <td className="p-2 sm:p-3 text-right text-xs sm:text-sm">
                              {total.totalFare.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="p-2 sm:p-3 text-right text-xs sm:text-sm">
                              {total.totalCommission.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              <span className="text-xs text-gray-500"> ({total.commissionRate}%)</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </ErrorBoundary>
      </div>
    </ProtectedRoute>
  );
}