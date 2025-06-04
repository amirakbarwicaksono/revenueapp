// "use client";

// import { useState, useEffect } from 'react';
// import SubpageGuard from '../../components/SubpageGuard';
// import ProtectedRoute from '../../components/ProtectedRoute';
// import Select from 'react-select';
// import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
// import '../../../styles/globals.css';

// // Interfaces for type safety
// interface TopCountry {
//   _id: string;
//   totalFare: number;
//   ticketCount: number;
// }

// interface Partition {
//   _id: string;
//   ticketCount: number;
// }

// interface Channel {
//   _id: string;
//   ticketCount: number;
// }

// interface RoutePerformance {
//   _id: { route: string };
//   totalFare: number;
//   ticketCount: number;
// }

// interface CountryDetail {
//   _id: { airline: string; channel: string; route: string };
//   totalFare: number;
//   ticketCount: number;
// }

// interface DashboardData {
//   years: number[];
//   months: number[];
//   countries: string[];
//   airlines: string[];
//   topCountries: TopCountry[];
//   partitions: Partition[];
//   channels: Channel[];
//   routePerformanceStats: RoutePerformance[];
//   countryDetails?: { country: string; details: CountryDetail[] };
// }

// export default function DashboardManagement() {
//   const [data, setData] = useState<DashboardData>({
//     years: [],
//     months: [],
//     countries: [],
//     airlines: [],
//     topCountries: [],
//     partitions: [],
//     channels: [],
//     routePerformanceStats: [],
//   });
//   const [selectedYear, setSelectedYear] = useState<string | null>(null);
//   const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
//   const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
//   const [transcode, setTranscode] = useState<"SALE" | "EXCH">("SALE");
//   const [loading, setLoading] = useState(false);
//   const [errorMessage, setErrorMessage] = useState("");

//   const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://192.168.198.209:8080/api";

//   const fetchData = async (queryParams: Record<string, string | undefined>) => {
//     setLoading(true);
//     setErrorMessage("");
//     const query = new URLSearchParams();
//     for (const [key, value] of Object.entries(queryParams)) {
//       if (value !== undefined) query.append(key, value);
//     }
//     try {
//       const response = await fetch(`${apiUrl}/dashboardManagement?${query}`);
//       if (!response.ok) throw new Error(`HTTP ${response.status}`);
//       const responseData: DashboardData = await response.json();
//       setData(responseData);
//     } catch (error) {
//       setErrorMessage(String(error));
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData({ transcode: "SALE" });
//   }, []);

//   const handleYearChange = (selected: { value: string } | null) => {
//     const value = selected ? selected.value : undefined;
//     setSelectedYear(value || null);
//     setSelectedMonth(null);
//     setSelectedCountry(null);
//     fetchData({ year: value, month: undefined, country: undefined, transcode });
//   };

//   const handleMonthChange = (selected: { value: string } | null) => {
//     const value = selected ? selected.value : undefined;
//     setSelectedMonth(value || null);
//     setSelectedCountry(null);
//     fetchData({ year: selectedYear || undefined, month: value, country: undefined, transcode });
//   };

//   const handleCountryChange = (selected: { value: string } | null) => {
//     const value = selected ? selected.value : undefined;
//     setSelectedCountry(value || null);
//     fetchData({ year: selectedYear || undefined, month: selectedMonth || undefined, country: value, transcode });
//   };

//   const handleTranscodeToggle = () => {
//     const newTranscode = transcode === "SALE" ? "EXCH" : "SALE";
//     setTranscode(newTranscode);
//     fetchData({
//       year: selectedYear || undefined,
//       month: selectedMonth || undefined,
//       country: selectedCountry || undefined,
//       transcode: newTranscode,
//     });
//   };

//   // Prepare dropdown options
//   const yearOptions = data.years.map(y => ({ value: y.toString(), label: y.toString() }));
//   const monthOptions = data.months.map(m => ({ value: m.toString(), label: getMonthName(m) }));
//   const countryOptions = data.countries.map(c => ({ value: c, label: c }));

//   // Chart data
//   const totalFare = data.topCountries.reduce((sum, c) => sum + c.totalFare, 0);
//   const totalTicketCount = data.topCountries.reduce((sum, c) => sum + c.ticketCount, 0);

//   const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#3b82f6', '#f97316', '#6b7280'];

//   const formatYAxis = (tick: number) => (tick >= 1000 ? `${(tick / 1000).toFixed(1)}K` : tick.toString());
//   const formatCurrency = (value: number, currency: string = 'IDR') => `${currency} ${value.toLocaleString()}`;
//   const formatTicketCount = (value: number) => value.toLocaleString();

//   // Helper to get month name (mirrors backend)
//   function getMonthName(month: number): string {
//     const monthNames = [
//       'January', 'February', 'March', 'April', 'May', 'June',
//       'July', 'August', 'September', 'October', 'November', 'December'
//     ];
//     return month >= 1 && month <= 12 ? monthNames[month - 1] : '';
//   }

//   return (
//     <ProtectedRoute>
//       <SubpageGuard requiredAccess="dtwbs">
//         <div className="min-h-screen p-6 bg-background text-gray-900 font-inter">
//           <header className="mb-6 bg-gradient-to-r from-red-600 to-black
//  text-white p-6 rounded-xl shadow-lg">
//             <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
//               <div className="flex flex-col sm:flex-row gap-3">
//                 <div className="w-40">
//                   <h3 className="text-xs font-medium mb-1">Year</h3>
//                   <Select
//                     options={yearOptions}
//                     onChange={handleYearChange}
//                     placeholder="Select Year"
//                     isClearable
//                     isDisabled={loading}
//                     className="text-xs"
//                     styles={{
//                       control: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         borderRadius: '0.375rem',
//                         borderColor: '#e5e7eb',
//                         boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
//                         padding: '0.125rem',
//                         '&:hover': { borderColor: '#d1d5db' },
//                       }),
//                       option: (base, { isFocused }) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         backgroundColor: isFocused ? '#e0f2fe' : 'white',
//                         color: '#1f2937',
//                         '&:active': { backgroundColor: '#bae6fd' },
//                       }),
//                       placeholder: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         color: '#6b7280',
//                       }),
//                       singleValue: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         color: '#1f2937',
//                       }),
//                     }}
//                     value={yearOptions.find(option => option.value === selectedYear) || null}
//                   />
//                 </div>
//                 <div className="w-40">
//                   <h3 className="text-xs font-medium mb-1">Month</h3>
//                   <Select
//                     options={monthOptions}
//                     onChange={handleMonthChange}
//                     placeholder="Select Month"
//                     isClearable
//                     isDisabled={loading || !selectedYear}
//                     className="text-xs"
//                     styles={{
//                       control: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         borderRadius: '0.375rem',
//                         borderColor: '#e5e7eb',
//                         boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
//                         padding: '0.125rem',
//                         '&:hover': { borderColor: '#d1d5db' },
//                       }),
//                       option: (base, { isFocused }) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         backgroundColor: isFocused ? '#e0f2fe' : 'white',
//                         color: '#1f2937',
//                         '&:active': { backgroundColor: '#bae6fd' },
//                       }),
//                       placeholder: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         color: '#6b7280',
//                       }),
//                       singleValue: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         color: '#1f2937',
//                       }),
//                     }}
//                     value={monthOptions.find(option => option.value === selectedMonth) || null}
//                   />
//                 </div>
//                 <div className="w-40">
//                   <h3 className="text-xs font-medium mb-1">Country</h3>
//                   <Select
//                     options={countryOptions}
//                     onChange={handleCountryChange}
//                     placeholder="Select Country"
//                     isClearable
//                     isDisabled={loading}
//                     className="text-xs"
//                     styles={{
//                       control: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         borderRadius: '0.375rem',
//                         borderColor: '#e5e7eb',
//                         boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
//                         padding: '0.125rem',
//                         '&:hover': { borderColor: '#d1d5db' },
//                       }),
//                       option: (base, { isFocused }) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         backgroundColor: isFocused ? '#e0f2fe' : 'white',
//                         color: '#1f2937',
//                         '&:active': { backgroundColor: '#bae6fd' },
//                       }),
//                       placeholder: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         color: '#6b7280',
//                       }),
//                       singleValue: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         color: '#1f2937',
//                       }),
//                     }}
//                     value={countryOptions.find(option => option.value === selectedCountry) || null}
//                   />
//                 </div>
//               </div>
//               <div className="flex items-center gap-3">
//                 <h1 className="text-xl text-gray-100 font-bold tracking-tight">
//                   Wibisono Dashboard ({transcode} - {selectedYear || 'All'})
//                 </h1>
//                 <div className="flex items-center space-x-2">
//                   <span className="text-xs text-gray-100 font-medium">EXCH</span>
//                   <label className="relative inline-flex items-center cursor-pointer">
//                     <input
//                       type="checkbox"
//                       checked={transcode === "SALE"}
//                       onChange={handleTranscodeToggle}
//                       className="sr-only peer"
//                     />
//                     <div className="w-14 h-7 bg-gray-300 rounded-full peer peer-checked:bg-indigo-600 transition-colors duration-300 ease-in-out">
//                       <div
//                         className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
//                           transcode === "SALE" ? 'translate-x-7' : 'translate-x-0.5'
//                         }`}
//                       />
//                     </div>
//                   </label>
//                   <span className="text-xs text-gray-100 font-medium">SALE</span>
//                 </div>
//               </div>
//             </div>
//           </header>

//           {errorMessage && (
//             <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md shadow-sm border border-red-200">
//               {errorMessage}
//             </div>
//           )}

//           {loading ? (
//             <div className="flex justify-center items-center h-64">
//               <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//               {/* Key Metrics */}
//               <div className="p-6 bg-white rounded-xl shadow-md transition-transform hover:scale-[1.02]">
//                 <h3 className="text-xl font-bold text-indigo-600 mb-4">Quick Stats</h3>
//                 <div className="space-y-4">
//                   <div>
//                     <p className="text-sm font-medium text-gray-600">Total Tickets</p>
//                     <p className="text-lg font-bold text-indigo-700">{formatTicketCount(totalTicketCount)}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm font-medium text-gray-600">Total Revenue</p>
//                     <p className="text-lg font-bold text-indigo-700">{formatCurrency(totalFare)}</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Top 10 Countries */}
//               <div className="p-6 bg-white rounded-xl shadow-md col-span-3">
//                 <h3 className="text-xl font-bold text-indigo-600 mb-4">Top Countries by Tickets</h3>
//                 {data.topCountries.length > 0 ? (
//                   <ResponsiveContainer width="100%" height={350}>
//                     <BarChart data={data.topCountries} margin={{ top: 20, right: 30, left: 10, bottom: 80 }}>
//                       <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
//                       <XAxis
//                         dataKey="_id"
//                         angle={45}
//                         textAnchor="start"
//                         height={80}
//                         fontSize={12}
//                       />
//                       <YAxis
//                         tickFormatter={formatYAxis}
//                         fontSize={12}
//                         domain={[0, 'auto']}
//                         allowDecimals={false}
//                       />
//                       <Tooltip
//                         formatter={(value: number) => [`${formatTicketCount(value)} tickets`, 'Tickets']}
//                         contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', padding: '8px', border: '1px solid #e5e7eb' }}
//                       />
//                       <Bar dataKey="ticketCount" radius={[6, 6, 0, 0]} isAnimationActive>
//                         {data.topCountries.map((entry, index) => (
//                           <Cell
//                             key={`cell-${index}`}
//                             fill={COLORS[index % COLORS.length]}
//                             onClick={() => handleCountryChange({ value: entry._id })}
//                             style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
//                             className="hover:opacity-80"
//                           />
//                         ))}
//                       </Bar>
//                     </BarChart>
//                   </ResponsiveContainer>
//                 ) : (
//                   <p className="text-sm text-gray-500">No data available.</p>
//                 )}
//               </div>

//               {/* Channels */}
//               <div className="p-6 bg-white rounded-xl shadow-md col-span-2">
//                 <h3 className="text-xl font-bold text-indigo-600 mb-4">Tickets by Channel</h3>
//                 {data.channels.length > 0 ? (
//                   <ResponsiveContainer width="100%" height={350}>
//                     <PieChart>
//                       <Pie
//                         data={data.channels}
//                         dataKey="ticketCount"
//                         nameKey="_id"
//                         cx="50%"
//                         cy="50%"
//                         outerRadius={120}
//                         label={({ name, value }) => `${name}: ${formatTicketCount(value)}`}
//                         labelLine={{ stroke: "#4b5563", strokeWidth: 1 }}
//                         isAnimationActive
//                       >
//                         {data.channels.map((_, index) => (
//                           <Cell
//                             key={`cell-${index}`}
//                             fill={COLORS[index % COLORS.length]}
//                             className="hover:opacity-80 transition-opacity"
//                           />
//                         ))}
//                       </Pie>
//                       <Tooltip
//                         formatter={(value: number) => [`${formatTicketCount(value)} tickets`, 'Tickets']}
//                         contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', padding: '8px', border: '1px solid #e5e7eb' }}
//                       />
//                       <Legend wrapperStyle={{ fontSize: '14px', color: '#4b5563' }} />
//                     </PieChart>
//                   </ResponsiveContainer>
//                 ) : (
//                   <p className="text-sm text-gray-500">No data available.</p>
//                 )}
//               </div>

//               {/* Partitions */}
//               <div className="p-6 bg-white rounded-xl shadow-md col-span-2">
//                 <h3 className="text-xl font-bold text-indigo-600 mb-4">Tickets by Partition</h3>
//                 {data.partitions.length > 0 ? (
//                   <ResponsiveContainer width="100%" height={350}>
//                     <BarChart data={data.partitions} margin={{ top: 20, right: 30, left: 10, bottom: 80 }}>
//                       <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
//                       <XAxis
//                         dataKey="_id"
//                         angle={45}
//                         textAnchor="start"
//                         height={80}
//                         fontSize={12}
//                       />
//                       <YAxis
//                         tickFormatter={formatYAxis}
//                         fontSize={12}
//                         domain={[0, 'auto']}
//                         allowDecimals={false}
//                       />
//                       <Tooltip
//                         formatter={(value: number) => [`${formatTicketCount(value)} tickets`, 'Tickets']}
//                         contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', padding: '8px', border: '1px solid #e5e7eb' }}
//                       />
//                       <Bar dataKey="ticketCount" radius={[6, 6, 0, 0]} isAnimationActive>
//                         {data.partitions.map((entry, index) => (
//                           <Cell
//                             key={`cell-${index}`}
//                             fill={COLORS[index % COLORS.length]}
//                             className="hover:opacity-80 transition-opacity"
//                           />
//                         ))}
//                       </Bar>
//                     </BarChart>
//                   </ResponsiveContainer>
//                 ) : (
//                   <p className="text-sm text-gray-500">No data available.</p>
//                 )}
//               </div>

//               {/* Route Performance */}
//               <div className="p-6 bg-white rounded-xl shadow-md col-span-4">
//                 <h3 className="text-xl font-bold text-indigo-600 mb-4">Top Routes by Tickets</h3>
//                 {data.routePerformanceStats.length > 0 ? (
//                   <ResponsiveContainer width="100%" height={350}>
//                     <BarChart data={data.routePerformanceStats} margin={{ top: 20, right: 30, left: 10, bottom: 80 }}>
//                       <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
//                       <XAxis
//                         dataKey="_id.route"
//                         angle={45}
//                         textAnchor="start"
//                         height={80}
//                         fontSize={12}
//                       />
//                       <YAxis
//                         tickFormatter={formatYAxis}
//                         fontSize={12}
//                         domain={[0, 'auto']}
//                         allowDecimals={false}
//                       />
//                       <Tooltip
//                         formatter={(value: number) => [`${formatTicketCount(value)} tickets`, 'Tickets']}
//                         contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', padding: '8px', border: '1px solid #e5e7eb' }}
//                       />
//                       <Bar dataKey="ticketCount" radius={[6, 6, 0, 0]} isAnimationActive>
//                         {data.routePerformanceStats.map((entry, index) => (
//                           <Cell
//                             key={`cell-${index}`}
//                             fill={COLORS[index % COLORS.length]}
//                             className="hover:opacity-80 transition-opacity"
//                           />
//                         ))}
//                       </Bar>
//                     </BarChart>
//                   </ResponsiveContainer>
//                 ) : (
//                   <p className="text-sm text-gray-500">No data available.</p>
//                 )}
//               </div>

//               {/* Country Details */}
//               {data.countryDetails && data.countryDetails.details.length > 0 && (
//                 <div className="p-6 bg-white rounded-xl shadow-md col-span-4">
//                   <h3 className="text-xl font-bold text-indigo-600 mb-4">Details for {data.countryDetails.country}</h3>
//                   <div className="overflow-x-auto">
//                     <table className="w-full border-collapse text-sm">
//                       <thead>
//                         <tr className="bg-indigo-50">
//                           <th className="px-6 py-3 border-b border-gray-200 text-left font-semibold text-indigo-700">Airline</th>
//                           <th className="px-6 py-3 border-b border-gray-200 text-left font-semibold text-indigo-700">Channel</th>
//                           <th className="px-6 py-3 border-b border-gray-200 text-left font-semibold text-indigo-700">Route</th>
//                           <th className="px-6 py-3 border-b border-gray-200 text-left font-semibold text-indigo-700">Total Revenue</th>
//                           <th className="px-6 py-3 border-b border-gray-200 text-left font-semibold text-indigo-700">Ticket Count</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {data.countryDetails.details.map((detail, index) => (
//                           <tr key={index} className="hover:bg-gray-50 transition-colors">
//                             <td className="px-6 py-3 border-b border-gray-200">{detail._id.airline}</td>
//                             <td className="px-6 py-3 border-b border-gray-200">{detail._id.channel}</td>
//                             <td className="px-6 py-3 border-b border-gray-200">{detail._id.route}</td>
//                             <td className="px-6 py-3 border-b border-gray-200">{formatCurrency(detail.totalFare)}</td>
//                             <td className="px-6 py-3 border-b border-gray-200">{formatTicketCount(detail.ticketCount)}</td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </SubpageGuard>
//     </ProtectedRoute>
//   );
// }

// "use client";

// import { useState, useEffect, useMemo, useCallback } from 'react';
// import SubpageGuard from '../../components/SubpageGuard';
// import ProtectedRoute from '../../components/ProtectedRoute';
// import Select from 'react-select';
// import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
// import '../../../styles/globals.css';

// // Interfaces for type safety
// interface TopCountry {
//   _id: string;
//   totalFare: number;
//   ticketCount: number;
// }

// interface Partition {
//   _id: string;
//   ticketCount: number;
// }

// interface Channel {
//   _id: string;
//   ticketCount: number;
// }

// interface RoutePerformance {
//   _id: { route: string };
//   totalFare: number;
//   ticketCount: number;
// }

// interface CountryDetail {
//   _id: { airline: string; channel: string; route: string };
//   totalFare: number;
//   ticketCount: number;
// }

// interface DashboardData {
//   years: number[];
//   months: number[];
//   countries: string[];
//   airlines: string[];
//   topCountries: TopCountry[];
//   partitions: Partition[];
//   channels: Channel[];
//   routePerformanceStats: RoutePerformance[];
//   countryDetails?: { country: string; details: CountryDetail[] };
// }

// // Backend response type (matches handlers/dashboard.go)
// interface DashboardResponse {
//   years: number[];
//   months: number[];
//   countries: string[];
//   airlines: string[];
//   topCountries: TopCountry[];
//   partitions: Partition[];
//   channels: Channel[];
//   routePerformanceStats: RoutePerformance[];
//   countryDetails?: { country: string; details: CountryDetail[] };
// }

// export default function DashboardManagement() {
//   const [data, setData] = useState<DashboardData>({
//     years: [],
//     months: [],
//     countries: [],
//     airlines: [],
//     topCountries: [],
//     partitions: [],
//     channels: [],
//     routePerformanceStats: [],
//   });
//   const [selectedYear, setSelectedYear] = useState<string | null>(null);
//   const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
//   const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
//   const [selectedAirlines, setSelectedAirlines] = useState<string | null>(null);
//   const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
//   const [transcode, setTranscode] = useState<"SALE" | "EXCH">("SALE");
//   const [loading, setLoading] = useState(false);
//   const [errorMessage, setErrorMessage] = useState("");
//   const [quickStats, setQuickStats] = useState<{ totalFare: number; totalTicketCount: number } | null>(null);

//   const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://192.168.198.209:8080/api";

//   if (!process.env.NEXT_PUBLIC_API_URL) {
//     console.warn("NEXT_PUBLIC_API_URL not set, using fallback:", apiUrl);
//   }

//   const cache = useMemo(() => new Map<string, DashboardData>(), []);

//   const debounce = useCallback((fn: (...args: any[]) => void, delay: number) => {
//     let timeout: NodeJS.Timeout;
//     return (...args: any[]) => {
//       clearTimeout(timeout);
//       timeout = setTimeout(() => fn(...args), delay);
//     };
//   }, []);

//   const fetchData = useCallback(async (queryParams: Record<string, string | undefined>, retryCount = 0) => {
//     setLoading(true);
//     setErrorMessage("");
//     const query = new URLSearchParams();
//     for (const [key, value] of Object.entries(queryParams)) {
//       if (value !== undefined) query.append(key, value);
//     }
//     const cacheKey = query.toString();
//     if (cache.has(cacheKey)) {
//       console.log("Using cached data for:", cacheKey);
//       const cachedData = cache.get(cacheKey)!;
//       setData(cachedData);
//       setQuickStats({
//         totalFare: cachedData.topCountries.reduce((sum, c) => sum + c.totalFare, 0),
//         totalTicketCount: cachedData.topCountries.reduce((sum, c) => sum + c.ticketCount, 0),
//       });
//       setLoading(false);
//       return;
//     }
//     try {
//       const url = `${apiUrl}/dashboardManagement?${query}`;
//       console.log("Fetching data from:", url);
//       const response = await fetch(url, {
//         method: 'GET',
//         headers: { 'Content-Type': 'application/json' },
//         credentials: 'include', // Include cookies if authentication is needed
//       });
//       if (!response.ok) {
//         throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//       }
//       const responseData: DashboardResponse = await response.json();
//       if (!responseData || typeof responseData !== 'object') {
//         throw new Error("Invalid response format");
//       }
//       const validatedData: DashboardData = {
//         years: Array.isArray(responseData.years)
//           ? responseData.years.filter((n: number) => !isNaN(n))
//           : [],
//         months: Array.isArray(responseData.months)
//           ? responseData.months.filter((n: number) => !isNaN(n) && n >= 1 && n <= 12)
//           : [],
//         countries: Array.isArray(responseData.countries) ? responseData.countries.filter(c => typeof c === 'string') : [],
//         airlines: Array.isArray(responseData.airlines) ? responseData.airlines.filter(a => typeof a === 'string') : [],
//         topCountries: Array.isArray(responseData.topCountries) ? responseData.topCountries : [],
//         partitions: Array.isArray(responseData.partitions) ? responseData.partitions : [],
//         channels: Array.isArray(responseData.channels) ? responseData.channels : [],
//         routePerformanceStats: Array.isArray(responseData.routePerformanceStats) ? responseData.routePerformanceStats : [],
//         countryDetails: responseData.countryDetails && typeof responseData.countryDetails === 'object'
//           ? responseData.countryDetails
//           : undefined,
//       };
//       console.log("Received data:", validatedData);
//       cache.set(cacheKey, validatedData);
//       setData(validatedData);
//       setQuickStats({
//         totalFare: validatedData.topCountries.reduce((sum, c) => sum + c.totalFare, 0),
//         totalTicketCount: validatedData.topCountries.reduce((sum, c) => sum + c.ticketCount, 0),
//       });
//       setErrorMessage("");
//     } catch (error) {
//       console.error("Fetch error:", error, { url: `${apiUrl}/dashboardManagement?${query}`, retryCount });
//       const errorMsg = error instanceof Error ? error.message : String(error);
//       if (errorMsg.includes('NetworkError') && retryCount < 2) {
//         console.log(`Retrying fetch (${retryCount + 1}/2)...`);
//         setTimeout(() => fetchData(queryParams, retryCount + 1), 1000);
//         return;
//       }
//       setErrorMessage(`Failed to load data: ${errorMsg}. Please check the backend or network.`);
//     } finally {
//       setLoading(false);
//     }
//   }, [apiUrl, cache]);

//   const debouncedFetchData = useMemo(() => debounce(fetchData, 300), [fetchData]);

//   useEffect(() => {
//     fetchData({ transcode: "SALE" });
//   }, [fetchData]);

//   const handleYearChange = (selected: { value: string } | null) => {
//     const value = selected ? selected.value : null;
//     setSelectedYear(value);
//     setSelectedMonth(null); // Reset month when year changes
//     setSelectedCountry(null);
//     setSelectedAirlines(null);
//     setSelectedChannel(null);
//     debouncedFetchData({
//       year: value || undefined,
//       month: undefined,
//       country: undefined,
//       AirlinesTKT: undefined,
//       Channel: undefined,
//       transcode,
//     });
//   };

//   const handleMonthChange = (selected: { value: string } | null) => {
//     const value = selected ? selected.value : null;
//     if (!selectedYear && value) {
//       setErrorMessage("Please select a year before selecting a month.");
//       return;
//     }
//     setSelectedMonth(value);
//     setSelectedCountry(null);
//     setSelectedAirlines(null);
//     setSelectedChannel(null);
//     debouncedFetchData({
//       year: selectedYear || undefined,
//       month: value || undefined,
//       country: undefined,
//       AirlinesTKT: undefined,
//       Channel: undefined,
//       transcode,
//     });
//   };

//   const handleCountryChange = (selected: { value: string } | null) => {
//     const value = selected ? selected.value : null;
//     setSelectedCountry(value);
//     setSelectedAirlines(null);
//     setSelectedChannel(null);
//     debouncedFetchData({
//       year: selectedYear || undefined,
//       month: selectedMonth || undefined,
//       country: value || undefined,
//       AirlinesTKT: undefined,
//       Channel: undefined,
//       transcode,
//     });
//   };

//   const handleAirlinesChange = (selected: { value: string } | null) => {
//     const value = selected ? selected.value : null;
//     setSelectedAirlines(value);
//     debouncedFetchData({
//       year: selectedYear || undefined,
//       month: selectedMonth || undefined,
//       country: selectedCountry || undefined,
//       AirlinesTKT: value || undefined,
//       Channel: selectedChannel || undefined,
//       transcode,
//     });
//   };

//   const handleChannelChange = (selected: { value: string } | null) => {
//     const value = selected ? selected.value : null;
//     setSelectedChannel(value);
//     debouncedFetchData({
//       year: selectedYear || undefined,
//       month: selectedMonth || undefined,
//       country: selectedCountry || undefined,
//       AirlinesTKT: selectedAirlines || undefined,
//       Channel: value || undefined,
//       transcode,
//     });
//   };

//   const handleTranscodeToggle = () => {
//     const newTranscode = transcode === "SALE" ? "EXCH" : "SALE";
//     setTranscode(newTranscode);
//     debouncedFetchData({
//       year: selectedYear || undefined,
//       month: selectedMonth || undefined,
//       country: selectedCountry || undefined,
//       AirlinesTKT: selectedAirlines || undefined,
//       Channel: selectedChannel || undefined,
//       transcode: newTranscode,
//     });
//   };

//   const clearCache = () => {
//     cache.clear();
//     console.log("Cache cleared");
//     fetchData({
//       year: selectedYear || undefined,
//       month: selectedMonth || undefined,
//       country: selectedCountry || undefined,
//       AirlinesTKT: selectedAirlines || undefined,
//       Channel: selectedChannel || undefined,
//       transcode,
//     });
//   };

//   const yearOptions = useMemo(() => (data.years || []).map(y => ({ value: y.toString(), label: y.toString() })), [data.years]);
//   const monthOptions = useMemo(() => (data.months || []).map(m => ({ value: m.toString(), label: getMonthName(m) })), [data.months]);
//   const countryOptions = useMemo(() => (data.countries || []).map(c => ({ value: c, label: c })), [data.countries]);
//   const airlineOptions = useMemo(() => (data.airlines || []).map(a => ({ value: a, label: a })), [data.airlines]);
//   const channelOptions = useMemo(() => (data.channels || []).map(c => ({ value: c._id, label: c._id })), [data.channels]);

//   const totalFare = useMemo(() => quickStats?.totalFare || 0, [quickStats]);
//   const totalTicketCount = useMemo(() => quickStats?.totalTicketCount || 0, [quickStats]);

//   const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#3b82f6', '#f97316', '#6b7280'];

//   const formatYAxis = (tick: number) => (tick >= 1000 ? `${(tick / 1000).toFixed(1)}K` : tick.toString());
//   const formatCurrency = (value: number, currency: string = 'IDR') => `${currency} ${value.toLocaleString()}`;
//   const formatTicketCount = (value: number) => value.toLocaleString();

//   function getMonthName(month: number): string {
//     const monthNames = [
//       'January', 'February', 'March', 'April', 'May', 'June',
//       'July', 'August', 'September', 'October', 'November', 'December'
//     ];
//     return month >= 1 && month <= 12 ? monthNames[month - 1] : 'Unknown';
//   }

//   return (
//     <ProtectedRoute>
//       <SubpageGuard requiredAccess="dtwbs">
//         <div className="min-h-screen p-6 bg-background text-gray-900 font-inter">
//           <header className="mb-6 bg-gradient-to-r from-red-600 to-black text-white p-6 rounded-xl shadow-lg">
//             <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
//               <div className="flex flex-col sm:flex-row gap-3">
//                 <div className="w-40">
//                   <h3 className="text-xs font-medium mb-1">Year</h3>
//                   <Select
//                     options={yearOptions}
//                     onChange={handleYearChange}
//                     placeholder="Select Year"
//                     isClearable
//                     isDisabled={loading}
//                     className="text-xs"
//                     styles={{
//                       control: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         borderRadius: '0.375rem',
//                         borderColor: '#e5e7eb',
//                         boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
//                         padding: '0.125rem',
//                         '&:hover': { borderColor: '#d1d5db' },
//                       }),
//                       option: (base, { isFocused }) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         backgroundColor: isFocused ? '#e0f2fe' : 'white',
//                         color: '#1f2937',
//                         '&:active': { backgroundColor: '#bae6fd' },
//                       }),
//                       placeholder: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         color: '#6b7280',
//                       }),
//                       singleValue: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         color: '#1f2937',
//                       }),
//                     }}
//                     value={yearOptions.find(option => option.value === selectedYear) || null}
//                   />
//                 </div>
//                 <div className="w-40">
//                   <h3 className="text-xs font-medium mb-1">Month</h3>
//                   <Select
//                     options={monthOptions}
//                     onChange={handleMonthChange}
//                     placeholder="Select Month"
//                     isClearable
//                     isDisabled={loading || !selectedYear}
//                     className="text-xs"
//                     styles={{
//                       control: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         borderRadius: '0.375rem',
//                         borderColor: '#e5e7eb',
//                         boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
//                         padding: '0.125rem',
//                         '&:hover': { borderColor: '#d1d5db' },
//                       }),
//                       option: (base, { isFocused }) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         backgroundColor: isFocused ? '#e0f2fe' : 'white',
//                         color: '#1f2937',
//                         '&:active': { backgroundColor: '#bae6fd' },
//                       }),
//                       placeholder: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         color: '#6b7280',
//                       }),
//                       singleValue: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         color: '#1f2937',
//                       }),
//                     }}
//                     value={monthOptions.find(option => option.value === selectedMonth) || null}
//                   />
//                 </div>
//                 <div className="w-40">
//                   <h3 className="text-xs font-medium mb-1">Country</h3>
//                   <Select
//                     options={countryOptions}
//                     onChange={handleCountryChange}
//                     placeholder="Select Country"
//                     isClearable
//                     isDisabled={loading}
//                     className="text-xs"
//                     styles={{
//                       control: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         borderRadius: '0.375rem',
//                         borderColor: '#e5e7eb',
//                         boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
//                         padding: '0.125rem',
//                         '&:hover': { borderColor: '#d1d5db' },
//                       }),
//                       option: (base, { isFocused }) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         backgroundColor: isFocused ? '#e0f2fe' : 'white',
//                         color: '#1f2937',
//                         '&:active': { backgroundColor: '#bae6fd' },
//                       }),
//                       placeholder: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         color: '#6b7280',
//                       }),
//                       singleValue: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         color: '#1f2937',
//                       }),
//                     }}
//                     value={countryOptions.find(option => option.value === selectedCountry) || null}
//                   />
//                 </div>
//                 <div className="w-40">
//                   <h3 className="text-xs font-medium mb-1">Airline</h3>
//                   <Select
//                     options={airlineOptions}
//                     onChange={handleAirlinesChange}
//                     placeholder="Select Airline"
//                     isClearable
//                     isDisabled={loading}
//                     className="text-xs"
//                     styles={{
//                       control: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         borderRadius: '0.375rem',
//                         borderColor: '#e5e7eb',
//                         boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
//                         padding: '0.125rem',
//                         '&:hover': { borderColor: '#d1d5db' },
//                       }),
//                       option: (base, { isFocused }) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         backgroundColor: isFocused ? '#e0f2fe' : 'white',
//                         color: '#1f2937',
//                         '&:active': { backgroundColor: '#bae6fd' },
//                       }),
//                       placeholder: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         color: '#6b7280',
//                       }),
//                       singleValue: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         color: '#1f2937',
//                       }),
//                     }}
//                     value={airlineOptions.find(option => option.value === selectedAirlines) || null}
//                   />
//                 </div>
//                 <div className="w-40">
//                   <h3 className="text-xs font-medium mb-1">Channel</h3>
//                   <Select
//                     options={channelOptions}
//                     onChange={handleChannelChange}
//                     placeholder="Select Channel"
//                     isClearable
//                     isDisabled={loading}
//                     className="text-xs"
//                     styles={{
//                       control: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         borderRadius: '0.375rem',
//                         borderColor: '#e5e7eb',
//                         boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
//                         padding: '0.125rem',
//                         '&:hover': { borderColor: '#d1d5db' },
//                       }),
//                       option: (base, { isFocused }) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         backgroundColor: isFocused ? '#e0f2fe' : 'white',
//                         color: '#1f2937',
//                         '&:active': { backgroundColor: '#bae6fd' },
//                       }),
//                       placeholder: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         color: '#6b7280',
//                       }),
//                       singleValue: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         color: '#1f2937',
//                       }),
//                     }}
//                     value={channelOptions.find(option => option.value === selectedChannel) || null}
//                   />
//                 </div>
//               </div>
//               <div className="flex items-center gap-3">
//                 <h1 className="text-xl text-gray-100 font-bold tracking-tight">
//                   Wibisono Dashboard ({transcode} - {selectedYear || 'All'})
//                 </h1>
//                 <div className="flex items-center space-x-2">
//                   <span className="text-xs text-gray-100 font-medium">EXCH</span>
//                   <label className="relative inline-flex items-center cursor-pointer">
//                     <input
//                       type="checkbox"
//                       checked={transcode === "SALE"}
//                       onChange={handleTranscodeToggle}
//                       className="sr-only peer"
//                     />
//                     <div className="w-14 h-7 bg-gray-300 rounded-full peer peer-checked:bg-indigo-600 transition-colors duration-300 ease-in-out">
//                       <div
//                         className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
//                           transcode === "SALE" ? 'translate-x-7' : 'translate-x-0.5'
//                         }`}
//                       />
//                     </div>
//                   </label>
//                   <span className="text-xs text-gray-100 font-medium">SALE</span>
//                 </div>
//                 <button
//                   onClick={clearCache}
//                   className="px-3 py-1 bg-gray-500 text-white rounded-md text-sm hover:bg-gray-600"
//                 >
//                   Clear Cache
//                 </button>
//               </div>
//             </div>
//           </header>

//           {errorMessage && (
//             <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md shadow-sm border border-red-200">
//               {errorMessage}
//               <button
//                 onClick={() => fetchData({
//                   year: selectedYear || undefined,
//                   month: selectedMonth || undefined,
//                   country: selectedCountry || undefined,
//                   AirlinesTKT: selectedAirlines || undefined,
//                   Channel: selectedChannel || undefined,
//                   transcode,
//                 })}
//                 className="ml-4 px-3 py-1 bg-indigo-500 text-white rounded-md text-sm hover:bg-indigo-600"
//               >
//                 Retry
//               </button>
//             </div>
//           )}

//           {loading && !quickStats ? (
//             <div className="flex justify-center items-center h-64">
//               <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//               {/* Key Metrics */}
//               <div className="p-6 bg-white rounded-xl shadow-md transition-transform hover:scale-[1.02]">
//                 <h3 className="text-xl font-bold text-indigo-600 mb-4">Quick Stats</h3>
//                 <div className="space-y-4">
//                   <div>
//                     <p className="text-sm font-medium text-gray-600">Total Tickets</p>
//                     <p className="text-lg font-bold text-indigo-700">{quickStats ? formatTicketCount(totalTicketCount) : 'Loading...'}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm font-medium text-gray-600">Total Revenue</p>
//                     <p className="text-lg font-bold text-indigo-700">{quickStats ? formatCurrency(totalFare) : 'Loading...'}</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Top 10 Countries */}
//               <div className="p-6 bg-white rounded-xl shadow-md col-span-3">
//                 <h3 className="text-xl font-bold text-indigo-600 mb-4">Top Countries by Tickets</h3>
//                 {(data.topCountries || []).length > 0 ? (
//                   <ResponsiveContainer width="100%" height={350}>
//                     <BarChart data={data.topCountries} margin={{ top: 20, right: 30, left: 10, bottom: 80 }}>
//                       <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
//                       <XAxis
//                         dataKey="_id"
//                         angle={45}
//                         textAnchor="start"
//                         height={80}
//                         fontSize={12}
//                       />
//                       <YAxis
//                         tickFormatter={formatYAxis}
//                         fontSize={12}
//                         domain={[0, 'auto']}
//                         allowDecimals={false}
//                       />
//                       <Tooltip
//                         formatter={(value: number) => [`${formatTicketCount(value)} tickets`, 'Tickets']}
//                         contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', padding: '8px', border: '1px solid #e5e7eb' }}
//                       />
//                       <Bar dataKey="ticketCount" radius={[6, 6, 0, 0]} isAnimationActive>
//                         {(data.topCountries || []).map((entry, index) => (
//                           <Cell
//                             key={`cell-${index}`}
//                             fill={COLORS[index % COLORS.length]}
//                             onClick={() => handleCountryChange({ value: entry._id })}
//                             style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
//                             className="hover:opacity-80"
//                           />
//                         ))}
//                       </Bar>
//                     </BarChart>
//                   </ResponsiveContainer>
//                 ) : (
//                   <p className="text-sm text-gray-500">No data available.</p>
//                 )}
//               </div>

//               {/* Channels */}
//               <div className="p-6 bg-white rounded-xl shadow-md col-span-2">
//                 <h3 className="text-xl font-bold text-indigo-600 mb-4">Tickets by Channel</h3>
//                 {(data.channels || []).length > 0 ? (
//                   <ResponsiveContainer width="100%" height={350}>
//                     <PieChart>
//                       <Pie
//                         data={data.channels}
//                         dataKey="ticketCount"
//                         nameKey="_id"
//                         cx="50%"
//                         cy="50%"
//                         outerRadius={120}
//                         label={({ name, value }) => `${name}: ${formatTicketCount(value)}`}
//                         labelLine={{ stroke: "#4b5563", strokeWidth: 1 }}
//                         isAnimationActive
//                         onClick={(data) => handleChannelChange({ value: data._id })}
//                       >
//                         {(data.channels || []).map((_, index) => (
//                           <Cell
//                             key={`cell-${index}`}
//                             fill={COLORS[index % COLORS.length]}
//                             className="hover:opacity-80 transition-opacity"
//                           />
//                         ))}
//                       </Pie>
//                       <Tooltip
//                         formatter={(value: number) => [`${formatTicketCount(value)} tickets`, 'Tickets']}
//                         contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', padding: '8px', border: '1px solid #e5e7eb' }}
//                       />
//                       <Legend wrapperStyle={{ fontSize: '14px', color: '#4b5563' }} />
//                     </PieChart>
//                   </ResponsiveContainer>
//                 ) : (
//                   <p className="text-sm text-gray-500">No data available.</p>
//                 )}
//               </div>

//               {/* Partitions */}
//               <div className="p-6 bg-white rounded-xl shadow-md col-span-2">
//                 <h3 className="text-xl font-bold text-indigo-600 mb-4">Tickets by Partition</h3>
//                 {(data.partitions || []).length > 0 ? (
//                   <ResponsiveContainer width="100%" height={350}>
//                     <BarChart data={data.partitions} margin={{ top: 20, right: 30, left: 10, bottom: 80 }}>
//                       <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
//                       <XAxis
//                         dataKey="_id"
//                         angle={45}
//                         textAnchor="start"
//                         height={80}
//                         fontSize={12}
//                       />
//                       <YAxis
//                         tickFormatter={formatYAxis}
//                         fontSize={12}
//                         domain={[0, 'auto']}
//                         allowDecimals={false}
//                       />
//                       <Tooltip
//                         formatter={(value: number) => [`${formatTicketCount(value)} tickets`, 'Tickets']}
//                         contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', padding: '8px', border: '1px solid #e5e7eb' }}
//                       />
//                       <Bar dataKey="ticketCount" radius={[6, 6, 0, 0]} isAnimationActive>
//                         {(data.partitions || []).map((entry, index) => (
//                           <Cell
//                             key={`cell-${index}`}
//                             fill={COLORS[index % COLORS.length]}
//                             className="hover:opacity-80 transition-opacity"
//                           />
//                         ))}
//                       </Bar>
//                     </BarChart>
//                   </ResponsiveContainer>
//                 ) : (
//                   <p className="text-sm text-gray-500">No data available.</p>
//                 )}
//               </div>

//               {/* Route Performance */}
//               <div className="p-6 bg-white rounded-xl shadow-md col-span-4">
//                 <h3 className="text-xl font-bold text-indigo-600 mb-4">Top Routes by Tickets</h3>
//                 {(data.routePerformanceStats || []).length > 0 ? (
//                   <ResponsiveContainer width="100%" height={350}>
//                     <BarChart data={data.routePerformanceStats} margin={{ top: 20, right: 30, left: 10, bottom: 80 }}>
//                       <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
//                       <XAxis
//                         dataKey="_id.route"
//                         angle={45}
//                         textAnchor="start"
//                         height={80}
//                         fontSize={12}
//                       />
//                       <YAxis
//                         tickFormatter={formatYAxis}
//                         fontSize={12}
//                         domain={[0, 'auto']}
//                         allowDecimals={false}
//                       />
//                       <Tooltip
//                         formatter={(value: number) => [`${formatTicketCount(value)} tickets`, 'Tickets']}
//                         contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', padding: '8px', border: '1px solid #e5e7eb' }}
//                       />
//                       <Bar dataKey="ticketCount" radius={[6, 6, 0, 0]} isAnimationActive>
//                         {(data.routePerformanceStats || []).map((entry, index) => (
//                           <Cell
//                             key={`cell-${index}`}
//                             fill={COLORS[index % COLORS.length]}
//                             className="hover:opacity-80 transition-opacity"
//                           />
//                         ))}
//                       </Bar>
//                     </BarChart>
//                   </ResponsiveContainer>
//                 ) : (
//                   <p className="text-sm text-gray-500">No data available.</p>
//                 )}
//               </div>

//               {/* Country Details */}
//               {data.countryDetails && (data.countryDetails.details || []).length > 0 && (
//                 <div className="p-6 bg-white rounded-xl shadow-md col-span-4">
//                   <h3 className="text-xl font-bold text-indigo-600 mb-4">Details for {data.countryDetails.country}</h3>
//                   <div className="overflow-x-auto">
//                     <table className="w-full border-collapse text-sm">
//                       <thead>
//                         <tr className="bg-indigo-50">
//                           <th className="px-6 py-3 border-b border-gray-200 text-left font-semibold text-indigo-700">Airline</th>
//                           <th className="px-6 py-3 border-b border-gray-200 text-left font-semibold text-indigo-700">Channel</th>
//                           <th className="px-6 py-3 border-b border-gray-200 text-left font-semibold text-indigo-700">Route</th>
//                           <th className="px-6 py-3 border-b border-gray-200 text-left font-semibold text-indigo-700">Total Revenue</th>
//                           <th className="px-6 py-3 border-b border-gray-200 text-left font-semibold text-indigo-700">Tickets</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {(data.countryDetails.details || []).map((detail, index) => (
//                           <tr key={index} className="hover:bg-gray-50 transition-colors">
//                             <td className="px-2 py-4 border-b border-gray-200">{detail._id.airline || ''}</td>
//                             <td className="px-2 py-4 border-b border-gray-200">{detail._id.channel || ''}</td>
//                             <td className="px-2 py-4 border-b border-gray-200">
//                               {detail._id.route || 'N/A'}
//                               {detail._id.route && (
//                                 <button
//                                   onClick={() => debouncedFetchData({
//                                     year: selectedYear || undefined,
//                                     month: selectedMonth || undefined,
//                                     country: selectedCountry || undefined,
//                                     AirlinesTKT: selectedAirlines || undefined,
//                                     Channel: selectedChannel || undefined,
//                                     route: detail._id.route,
//                                     transcode,
//                                   })}
//                                   className="ml-2 px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 cursor-pointer"
//                                 >
//                                   View Route
//                                 </button>
//                               )}
//                             </td>
//                             <td className="px-2 py-4 border-b border-gray-200">{formatCurrency(detail.totalFare)}</td>
//                             <td className="px-2 py-4 border-b border-gray-200">{formatTicketCount(detail.ticketCount)}</td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </SubpageGuard>
//     </ProtectedRoute>
//   );
// }

// "use client";

// import { useState, useEffect, useMemo, useCallback } from 'react';
// import SubpageGuard from '../../components/SubpageGuard';
// import ProtectedRoute from '../../components/ProtectedRoute';
// import Select from 'react-select';
// import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
// import '../../../styles/globals.css';

// // Interfaces for type safety
// interface TopCountry {
//   _id: string;
//   totalFare: number;
//   ticketCount: number;
// }

// interface Partition {
//   _id: string;
//   ticketCount: number;
// }

// interface Channel {
//   _id: string;
//   ticketCount: number;
// }

// interface RoutePerformance {
//   _id: { route: string };
//   totalFare: number;
//   ticketCount: number;
// }

// interface CountryDetail {
//   _id: { airline: string; channel: string; route: string };
//   totalFare: number;
//   ticketCount: number;
// }

// interface DashboardData {
//   years: number[];
//   months: number[];
//   airlines: string[];
//   topCountries: TopCountry[];
//   partitions: Partition[];
//   channels: Channel[];
//   routePerformanceStats: RoutePerformance[];
//   // Removed countryDetails since it's tied to country filter
// }

// interface DashboardResponse {
//   years: number[];
//   months: number[];
//   airlines: string[];
//   topCountries: TopCountry[];
//   partitions: Partition[];
//   channels: Channel[];
//   routePerformanceStats: RoutePerformance[];
// }

// export default function DashboardManagement() {
//   const [data, setData] = useState<DashboardData>({
//     years: [],
//     months: [],
//     airlines: [],
//     topCountries: [],
//     partitions: [],
//     channels: [],
//     routePerformanceStats: [],
//   });
//   const [selectedYear, setSelectedYear] = useState<string | null>(null);
//   const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
//   const [selectedAirlines, setSelectedAirlines] = useState<string | null>(null);
//   const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
//   const [transcode, setTranscode] = useState<"SALE" | "EXCH">("SALE");
//   const [loading, setLoading] = useState(false);
//   const [errorMessage, setErrorMessage] = useState("");
//   const [quickStats, setQuickStats] = useState<{ totalFare: number; totalTicketCount: number } | null>(null);

//   const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://192.168.198.209:8080/api";

//   if (!process.env.NEXT_PUBLIC_API_URL) {
//     console.warn("NEXT_PUBLIC_API_URL not set, using fallback:", apiUrl);
//   }

//   const cache = useMemo(() => new Map<string, DashboardData>(), []);

//   const debounce = useCallback((fn: (...args: any[]) => void, delay: number) => {
//     let timeout: NodeJS.Timeout;
//     return (...args: any[]) => {
//       clearTimeout(timeout);
//       timeout = setTimeout(() => fn(...args), delay);
//     };
//   }, []);

//   const fetchData = useCallback(async (queryParams: Record<string, string | undefined>, retryCount = 0) => {
//     setLoading(true);
//     setErrorMessage("");
//     const query = new URLSearchParams();
//     for (const [key, value] of Object.entries(queryParams)) {
//       if (value !== undefined) query.append(key, value);
//     }
//     const cacheKey = query.toString();
//     if (cache.has(cacheKey)) {
//       console.log("Using cached data for:", cacheKey);
//       const cachedData = cache.get(cacheKey)!;
//       setData(cachedData);
//       setQuickStats({
//         totalFare: cachedData.topCountries.reduce((sum, c) => sum + c.totalFare, 0),
//         totalTicketCount: cachedData.topCountries.reduce((sum, c) => sum + c.ticketCount, 0),
//       });
//       setLoading(false);
//       return;
//     }
//     try {
//       const url = `${apiUrl}/dashboardManagement?${query}`;
//       console.log("Fetching data from:", url);
//       const response = await fetch(url, {
//         method: 'GET',
//         headers: { 'Content-Type': 'application/json' },
//         credentials: 'include',
//       });
//       if (!response.ok) {
//         throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//       }
//       const responseData: DashboardResponse = await response.json();
//       if (!responseData || typeof responseData !== 'object') {
//         throw new Error("Invalid response format");
//       }
//       const validatedData: DashboardData = {
//         years: Array.isArray(responseData.years)
//           ? responseData.years.filter((n: number) => !isNaN(n))
//           : [],
//         months: Array.isArray(responseData.months)
//           ? responseData.months.filter((n: number) => !isNaN(n) && n >= 1 && n <= 12)
//           : [],
//         airlines: Array.isArray(responseData.airlines) ? responseData.airlines.filter(a => typeof a === 'string') : [],
//         topCountries: Array.isArray(responseData.topCountries) ? responseData.topCountries : [],
//         partitions: Array.isArray(responseData.partitions) ? responseData.partitions : [],
//         channels: Array.isArray(responseData.channels) ? responseData.channels : [],
//         routePerformanceStats: Array.isArray(responseData.routePerformanceStats) ? responseData.routePerformanceStats : [],
//       };
//       console.log("Received data:", validatedData);
//       cache.set(cacheKey, validatedData);
//       setData(validatedData);
//       setQuickStats({
//         totalFare: validatedData.topCountries.reduce((sum, c) => sum + c.totalFare, 0),
//         totalTicketCount: validatedData.topCountries.reduce((sum, c) => sum + c.ticketCount, 0),
//       });
//       setErrorMessage("");
//     } catch (error) {
//       console.error("Fetch error:", error, { url: `${apiUrl}/dashboardManagement?${query}`, retryCount });
//       const errorMsg = error instanceof Error ? error.message : String(error);
//       if (errorMsg.includes('NetworkError') && retryCount < 2) {
//         console.log(`Retrying fetch (${retryCount + 1}/2)...`);
//         setTimeout(() => fetchData(queryParams, retryCount + 1), 1000);
//         return;
//       }
//       setErrorMessage(`Failed to load data: ${errorMsg}. Please check the backend or network.`);
//     } finally {
//       setLoading(false);
//     }
//   }, [apiUrl, cache]);

//   const debouncedFetchData = useMemo(() => debounce(fetchData, 300), [fetchData]);

//   useEffect(() => {
//     fetchData({ transcode: "SALE" });
//   }, [fetchData]);

//   const handleYearChange = (selected: { value: string } | null) => {
//     const value = selected ? selected.value : null;
//     setSelectedYear(value);
//     setSelectedMonth(null);
//     setSelectedAirlines(null);
//     setSelectedChannel(null);
//     debouncedFetchData({
//       year: value || undefined,
//       month: undefined,
//       AirlinesTKT: undefined,
//       Channel: undefined,
//       transcode,
//     });
//   };

//   const handleMonthChange = (selected: { value: string } | null) => {
//     const value = selected ? selected.value : null;
//     if (!selectedYear && value) {
//       setErrorMessage("Please select a year before selecting a month.");
//       return;
//     }
//     setSelectedMonth(value);
//     setSelectedAirlines(null);
//     setSelectedChannel(null);
//     debouncedFetchData({
//       year: selectedYear || undefined,
//       month: value || undefined,
//       AirlinesTKT: undefined,
//       Channel: undefined,
//       transcode,
//     });
//   };

//   const handleAirlinesChange = (selected: { value: string } | null) => {
//     const value = selected ? selected.value : null;
//     setSelectedAirlines(value);
//     debouncedFetchData({
//       year: selectedYear || undefined,
//       month: selectedMonth || undefined,
//       AirlinesTKT: value || undefined,
//       Channel: selectedChannel || undefined,
//       transcode,
//     });
//   };

//   const handleChannelChange = (selected: { value: string } | null) => {
//     const value = selected ? selected.value : null;
//     setSelectedChannel(value);
//     debouncedFetchData({
//       year: selectedYear || undefined,
//       month: selectedMonth || undefined,
//       AirlinesTKT: selectedAirlines || undefined,
//       Channel: value || undefined,
//       transcode,
//     });
//   };

//   const handleTranscodeToggle = () => {
//     const newTranscode = transcode === "SALE" ? "EXCH" : "SALE";
//     setTranscode(newTranscode);
//     debouncedFetchData({
//       year: selectedYear || undefined,
//       month: selectedMonth || undefined,
//       AirlinesTKT: selectedAirlines || undefined,
//       Channel: selectedChannel || undefined,
//       transcode: newTranscode,
//     });
//   };

//   const clearCache = () => {
//     cache.clear();
//     console.log("Cache cleared");
//     fetchData({
//       year: selectedYear || undefined,
//       month: selectedMonth || undefined,
//       AirlinesTKT: selectedAirlines || undefined,
//       Channel: selectedChannel || undefined,
//       transcode,
//     });
//   };

//   const yearOptions = useMemo(() => (data.years || []).map(y => ({ value: y.toString(), label: y.toString() })), [data.years]);
//   const monthOptions = useMemo(() => (data.months || []).map(m => ({ value: m.toString(), label: getMonthName(m) })), [data.months]);
//   const airlineOptions = useMemo(() => (data.airlines || []).map(a => ({ value: a, label: a })), [data.airlines]);
//   const channelOptions = useMemo(() => (data.channels || []).map(c => ({ value: c._id, label: c._id })), [data.channels]);

//   const totalFare = useMemo(() => quickStats?.totalFare || 0, [quickStats]);
//   const totalTicketCount = useMemo(() => quickStats?.totalTicketCount || 0, [quickStats]);

//   const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#3b82f6', '#f97316', '#6b7280'];

//   const formatYAxis = (tick: number) => (tick >= 1000 ? `${(tick / 1000).toFixed(1)}K` : tick.toString());
//   const formatCurrency = (value: number, currency: string = 'IDR') => `${currency} ${value.toLocaleString()}`;
//   const formatTicketCount = (value: number) => value.toLocaleString();

//   function getMonthName(month: number): string {
//     const monthNames = [
//       'January', 'February', 'March', 'April', 'May', 'June',
//       'July', 'August', 'September', 'October', 'November', 'December'
//     ];
//     return month >= 1 && month <= 12 ? monthNames[month - 1] : 'Unknown';
//   }

//   return (
//     <ProtectedRoute>
//       <SubpageGuard requiredAccess="dtwbs">
//         <div className="min-h-screen p-6 bg-background text-gray-900 font-inter">
//           <header className="mb-6 bg-gradient-to-r from-red-600 to-black text-white p-6 rounded-xl shadow-lg">
//             <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
//               <div className="flex flex-col sm:flex-row gap-3">
//                 <div className="w-40">
//                   <h3 className="text-xs font-medium mb-1">Year</h3>
//                   <Select
//                     options={yearOptions}
//                     onChange={handleYearChange}
//                     placeholder="Select Year"
//                     isClearable
//                     isDisabled={loading}
//                     className="text-xs"
//                     styles={{
//                       control: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         borderRadius: '0.375rem',
//                         borderColor: '#e5e7eb',
//                         boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
//                         padding: '0.125rem',
//                         '&:hover': { borderColor: '#d1d5db' },
//                       }),
//                       option: (base, { isFocused }) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         backgroundColor: isFocused ? '#e0f2fe' : 'white',
//                         color: '#1f2937',
//                         '&:active': { backgroundColor: '#bae6fd' },
//                       }),
//                       placeholder: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         color: '#6b7280',
//                       }),
//                       singleValue: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         color: '#1f2937',
//                       }),
//                     }}
//                     value={yearOptions.find(option => option.value === selectedYear) || null}
//                   />
//                 </div>
//                 <div className="w-40">
//                   <h3 className="text-xs font-medium mb-1">Month</h3>
//                   <Select
//                     options={monthOptions}
//                     onChange={handleMonthChange}
//                     placeholder="Select Month"
//                     isClearable
//                     isDisabled={loading || !selectedYear}
//                     className="text-xs"
//                     styles={{
//                       control: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         borderRadius: '0.375rem',
//                         borderColor: '#e5e7eb',
//                         boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
//                         padding: '0.125rem',
//                         '&:hover': { borderColor: '#d1d5db' },
//                       }),
//                       option: (base, { isFocused }) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         backgroundColor: isFocused ? '#e0f2fe' : 'white',
//                         color: '#1f2937',
//                         '&:active': { backgroundColor: '#bae6fd' },
//                       }),
//                       placeholder: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         color: '#6b7280',
//                       }),
//                       singleValue: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         color: '#1f2937',
//                       }),
//                     }}
//                     value={monthOptions.find(option => option.value === selectedMonth) || null}
//                   />
//                 </div>
//                 <div className="w-40">
//                   <h3 className="text-xs font-medium mb-1">Airline</h3>
//                   <Select
//                     options={airlineOptions}
//                     onChange={handleAirlinesChange}
//                     placeholder="Select Airline"
//                     isClearable
//                     isDisabled={loading}
//                     className="text-xs"
//                     styles={{
//                       control: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         borderRadius: '0.375rem',
//                         borderColor: '#e5e7eb',
//                         boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
//                         padding: '0.125rem',
//                         '&:hover': { borderColor: '#d1d5db' },
//                       }),
//                       option: (base, { isFocused }) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         backgroundColor: isFocused ? '#e0f2fe' : 'white',
//                         color: '#1f2937',
//                         '&:active': { backgroundColor: '#bae6fd' },
//                       }),
//                       placeholder: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         color: '#6b7280',
//                       }),
//                       singleValue: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         color: '#1f2937',
//                       }),
//                     }}
//                     value={airlineOptions.find(option => option.value === selectedAirlines) || null}
//                   />
//                 </div>
//                 <div className="w-40">
//                   <h3 className="text-xs font-medium mb-1">Channel</h3>
//                   <Select
//                     options={channelOptions}
//                     onChange={handleChannelChange}
//                     placeholder="Select Channel"
//                     isClearable
//                     isDisabled={loading}
//                     className="text-xs"
//                     styles={{
//                       control: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         borderRadius: '0.375rem',
//                         borderColor: '#e5e7eb',
//                         boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
//                         padding: '0.125rem',
//                         '&:hover': { borderColor: '#d1d5db' },
//                       }),
//                       option: (base, { isFocused }) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         backgroundColor: isFocused ? '#e0f2fe' : 'white',
//                         color: '#1f2937',
//                         '&:active': { backgroundColor: '#bae6fd' },
//                       }),
//                       placeholder: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         color: '#6b7280',
//                       }),
//                       singleValue: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         color: '#1f2937',
//                       }),
//                     }}
//                     value={channelOptions.find(option => option.value === selectedChannel) || null}
//                   />
//                 </div>
//               </div>
//               <div className="flex items-center gap-3">
//                 <h1 className="text-xl text-gray-100 font-bold tracking-tight">
//                   Wibisono Dashboard ({transcode} - {selectedYear || 'All'})
//                 </h1>
//                 <div className="flex items-center space-x-2">
//                   <span className="text-xs text-gray-100 font-medium">EXCH</span>
//                   <label className="relative inline-flex items-center cursor-pointer">
//                     <input
//                       type="checkbox"
//                       checked={transcode === "SALE"}
//                       onChange={handleTranscodeToggle}
//                       className="sr-only peer"
//                     />
//                     <div className="w-14 h-7 bg-gray-300 rounded-full peer peer-checked:bg-indigo-600 transition-colors duration-300 ease-in-out">
//                       <div
//                         className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
//                           transcode === "SALE" ? 'translate-x-7' : 'translate-x-0.5'
//                         }`}
//                       />
//                     </div>
//                   </label>
//                   <span className="text-xs text-gray-100 font-medium">SALE</span>
//                 </div>
//                 <button
//                   onClick={clearCache}
//                   className="px-3 py-1 bg-gray-500 text-white rounded-md text-sm hover:bg-gray-600"
//                 >
//                   Clear Cache
//                 </button>
//               </div>
//             </div>
//           </header>

//           {errorMessage && (
//             <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md shadow-sm border border-red-200">
//               {errorMessage}
//               <button
//                 onClick={() => fetchData({
//                   year: selectedYear || undefined,
//                   month: selectedMonth || undefined,
//                   AirlinesTKT: selectedAirlines || undefined,
//                   Channel: selectedChannel || undefined,
//                   transcode,
//                 })}
//                 className="ml-4 px-3 py-1 bg-indigo-500 text-white rounded-md text-sm hover:bg-indigo-600"
//               >
//                 Retry
//               </button>
//             </div>
//           )}

//           {loading && !quickStats ? (
//             <div className="flex justify-center items-center h-64">
//               <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//               {/* Key Metrics */}
//               <div className="p-6 bg-white rounded-xl shadow-md transition-transform hover:scale-[1.02]">
//                 <h3 className="text-xl font-bold text-indigo-600 mb-4">Quick Stats</h3>
//                 <div className="space-y-4">
//                   <div>
//                     <p className="text-sm font-medium text-gray-600">Total Tickets</p>
//                     <p className="text-lg font-bold text-indigo-700">{quickStats ? formatTicketCount(totalTicketCount) : 'Loading...'}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm font-medium text-gray-600">Total Revenue</p>
//                     <p className="text-lg font-bold text-indigo-700">{quickStats ? formatCurrency(totalFare) : 'Loading...'}</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Top 10 Countries */}
//               <div className="p-6 bg-white rounded-xl shadow-md col-span-3">
//                 <h3 className="text-xl font-bold text-indigo-600 mb-4">Top Countries by Tickets</h3>
//                 {(data.topCountries || []).length > 0 ? (
//                   <ResponsiveContainer width="100%" height={350}>
//                     <BarChart data={data.topCountries} margin={{ top: 20, right: 30, left: 10, bottom: 80 }}>
//                       <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
//                       <XAxis
//                         dataKey="_id"
//                         angle={45}
//                         textAnchor="start"
//                         height={80}
//                         fontSize={12}
//                       />
//                       <YAxis
//                         tickFormatter={formatYAxis}
//                         fontSize={12}
//                         domain={[0, 'auto']}
//                         allowDecimals={false}
//                       />
//                       <Tooltip
//                         formatter={(value: number) => [`${formatTicketCount(value)} tickets`, 'Tickets']}
//                         contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', padding: '8px', border: '1px solid #e5e7eb' }}
//                       />
//                       <Bar dataKey="ticketCount" radius={[6, 6, 0, 0]} isAnimationActive>
//                         {(data.topCountries || []).map((entry, index) => (
//                           <Cell
//                             key={`cell-${index}`}
//                             fill={COLORS[index % COLORS.length]}
//                             className="hover:opacity-80 transition-opacity"
//                           />
//                         ))}
//                       </Bar>
//                     </BarChart>
//                   </ResponsiveContainer>
//                 ) : (
//                   <p className="text-sm text-gray-500">No data available.</p>
//                 )}
//               </div>

//               {/* Channels */}
//               <div className="p-6 bg-white rounded-xl shadow-md col-span-2">
//                 <h3 className="text-xl font-bold text-indigo-600 mb-4">Tickets by Channel</h3>
//                 {(data.channels || []).length > 0 ? (
//                   <ResponsiveContainer width="100%" height={350}>
//                     <PieChart>
//                       <Pie
//                         data={data.channels}
//                         dataKey="ticketCount"
//                         nameKey="_id"
//                         cx="50%"
//                         cy="50%"
//                         outerRadius={120}
//                         label={({ name, value }) => `${name}: ${formatTicketCount(value)}`}
//                         labelLine={{ stroke: "#4b5563", strokeWidth: 1 }}
//                         isAnimationActive
//                         onClick={(data) => handleChannelChange({ value: data._id })}
//                       >
//                         {(data.channels || []).map((_, index) => (
//                           <Cell
//                             key={`cell-${index}`}
//                             fill={COLORS[index % COLORS.length]}
//                             className="hover:opacity-80 transition-opacity"
//                           />
//                         ))}
//                       </Pie>
//                       <Tooltip
//                         formatter={(value: number) => [`${formatTicketCount(value)} tickets`, 'Tickets']}
//                         contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', padding: '8px', border: '1px solid #e5e7eb' }}
//                       />
//                       <Legend wrapperStyle={{ fontSize: '14px', color: '#4b5563' }} />
//                     </PieChart>
//                   </ResponsiveContainer>
//                 ) : (
//                   <p className="text-sm text-gray-500">No data available.</p>
//                 )}
//               </div>

//               {/* Partitions */}
//               <div className="p-6 bg-white rounded-xl shadow-md col-span-2">
//                 <h3 className="text-xl font-bold text-indigo-600 mb-4">Tickets by Partition</h3>
//                 {(data.partitions || []).length > 0 ? (
//                   <ResponsiveContainer width="100%" height={350}>
//                     <BarChart data={data.partitions} margin={{ top: 20, right: 30, left: 10, bottom: 80 }}>
//                       <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
//                       <XAxis
//                         dataKey="_id"
//                         angle={45}
//                         textAnchor="start"
//                         height={80}
//                         fontSize={12}
//                       />
//                       <YAxis
//                         tickFormatter={formatYAxis}
//                         fontSize={12}
//                         domain={[0, 'auto']}
//                         allowDecimals={false}
//                       />
//                       <Tooltip
//                         formatter={(value: number) => [`${formatTicketCount(value)} tickets`, 'Tickets']}
//                         contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', padding: '8px', border: '1px solid #e5e7eb' }}
//                       />
//                       <Bar dataKey="ticketCount" radius={[6, 6, 0, 0]} isAnimationActive>
//                         {(data.partitions || []).map((entry, index) => (
//                           <Cell
//                             key={`cell-${index}`}
//                             fill={COLORS[index % COLORS.length]}
//                             className="hover:opacity-80 transition-opacity"
//                           />
//                         ))}
//                       </Bar>
//                     </BarChart>
//                   </ResponsiveContainer>
//                 ) : (
//                   <p className="text-sm text-gray-500">No data available.</p>
//                 )}
//               </div>

//               {/* Route Performance */}
//               <div className="p-6 bg-white rounded-xl shadow-md col-span-4">
//                 <h3 className="text-xl font-bold text-indigo-600 mb-4">Top Routes by Tickets</h3>
//                 {(data.routePerformanceStats || []).length > 0 ? (
//                   <ResponsiveContainer width="100%" height={350}>
//                     <BarChart data={data.routePerformanceStats} margin={{ top: 20, right: 30, left: 10, bottom: 80 }}>
//                       <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
//                       <XAxis
//                         dataKey="_id.route"
//                         angle={45}
//                         textAnchor="start"
//                         height={80}
//                         fontSize={12}
//                       />
//                       <YAxis
//                         tickFormatter={formatYAxis}
//                         fontSize={12}
//                         domain={[0, 'auto']}
//                         allowDecimals={false}
//                       />
//                       <Tooltip
//                         formatter={(value: number) => [`${formatTicketCount(value)} tickets`, 'Tickets']}
//                         contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', padding: '8px', border: '1px solid #e5e7eb' }}
//                       />
//                       <Bar dataKey="ticketCount" radius={[6, 6, 0, 0]} isAnimationActive>
//                         {(data.routePerformanceStats || []).map((entry, index) => (
//                           <Cell
//                             key={`cell-${index}`}
//                             fill={COLORS[index % COLORS.length]}
//                             className="hover:opacity-80 transition-opacity"
//                           />
//                         ))}
//                       </Bar>
//                     </BarChart>
//                   </ResponsiveContainer>
//                 ) : (
//                   <p className="text-sm text-gray-500">No data available.</p>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       </SubpageGuard>
//     </ProtectedRoute>
//   );
// }
// added two condition in routes

// "use client";

// import { useState, useEffect, useMemo, useCallback } from 'react';
// import SubpageGuard from '../../components/SubpageGuard';
// import ProtectedRoute from '../../components/ProtectedRoute';
// import Select from 'react-select';
// import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
// import '../../../styles/globals.css';

// // Interfaces for type safety
// interface TopCountry {
//   _id: string;
//   totalFare: number;
//   ticketCount: number;
// }

// interface Partition {
//   _id: string;
//   ticketCount: number;
// }

// interface Channel {
//   _id: string;
//   ticketCount: number;
// }

// interface RoutePerformance {
//   _id: { route: string };
//   totalFare: number;
//   ticketCount: number;
// }

// interface DashboardData {
//   years: number[];
//   months: number[];
//   airlines: string[];
//   topCountries: TopCountry[];
//   partitions: Partition[];
//   channels: Channel[];
//   routePerformanceStats: RoutePerformance[];
// }

// interface DashboardResponse {
//   years: number[];
//   months: number[];
//   airlines: string[];
//   topCountries: TopCountry[];
//   partitions: Partition[];
//   channels: Channel[];
//   routePerformanceStats: RoutePerformance[];
// }

// export default function DashboardManagement() {
//   const [data, setData] = useState<DashboardData>({
//     years: [],
//     months: [],
//     airlines: [],
//     topCountries: [],
//     partitions: [],
//     channels: [],
//     routePerformanceStats: [],
//   });
//   const [selectedYear, setSelectedYear] = useState<string | null>(null);
//   const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
//   const [selectedAirlines, setSelectedAirlines] = useState<string | null>(null);
//   const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
//   const [transcode, setTranscode] = useState<"SALE" | "EXCH">("SALE");
//   const [loading, setLoading] = useState(false);
//   const [errorMessage, setErrorMessage] = useState("");
//   const [quickStats, setQuickStats] = useState<{ totalFare: number; totalTicketCount: number } | null>(null);

//   const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://192.168.198.209:8080/api";

//   if (!process.env.NEXT_PUBLIC_API_URL) {
//     console.warn("NEXT_PUBLIC_API_URL not set, using fallback:", apiUrl);
//   }

//   const cache = useMemo(() => new Map<string, DashboardData>(), []);

//   const debounce = useCallback((fn: (...args: any[]) => void, delay: number) => {
//     let timeout: NodeJS.Timeout;
//     return (...args: any[]) => {
//       clearTimeout(timeout);
//       timeout = setTimeout(() => fn(...args), delay);
//     };
//   }, []);

//   const fetchData = useCallback(async (queryParams: Record<string, string | undefined>, retryCount = 0) => {
//     setLoading(true);
//     setErrorMessage("");
//     const query = new URLSearchParams();
//     for (const [key, value] of Object.entries(queryParams)) {
//       if (value !== undefined) query.append(key, value);
//     }
//     const cacheKey = query.toString();
//     if (cache.has(cacheKey)) {
//       console.log("Using cached data for:", cacheKey);
//       const cachedData = cache.get(cacheKey)!;
//       setData(cachedData);
//       setQuickStats({
//         totalFare: cachedData.topCountries.reduce((sum, c) => sum + c.totalFare, 0),
//         totalTicketCount: cachedData.topCountries.reduce((sum, c) => sum + c.ticketCount, 0),
//       });
//       setLoading(false);
//       return;
//     }
//     try {
//       const url = `${apiUrl}/dashboardManagement?${query}`;
//       console.log("Fetching data from:", url);
//       const response = await fetch(url, {
//         method: 'GET',
//         headers: { 'Content-Type': 'application/json' },
//         credentials: 'include',
//       });
//       if (!response.ok) {
//         throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//       }
//       const responseData: DashboardResponse = await response.json();
//       if (!responseData || typeof responseData !== 'object') {
//         throw new Error("Invalid response format");
//       }
//       const validatedData: DashboardData = {
//         years: Array.isArray(responseData.years)
//           ? responseData.years.filter((n: number) => !isNaN(n))
//           : [],
//         months: Array.isArray(responseData.months)
//           ? responseData.months.filter((n: number) => !isNaN(n) && n >= 1 && n <= 12)
//           : [],
//         airlines: Array.isArray(responseData.airlines) ? responseData.airlines.filter(a => typeof a === 'string') : [],
//         topCountries: Array.isArray(responseData.topCountries) ? responseData.topCountries : [],
//         partitions: Array.isArray(responseData.partitions) ? responseData.partitions : [],
//         channels: Array.isArray(responseData.channels) ? responseData.channels : [],
//         routePerformanceStats: Array.isArray(responseData.routePerformanceStats) ? responseData.routePerformanceStats : [],
//       };
//       console.log("Received data:", validatedData);
//       cache.set(cacheKey, validatedData);
//       setData(validatedData);
//       setQuickStats({
//         totalFare: validatedData.topCountries.reduce((sum, c) => sum + c.totalFare, 0),
//         totalTicketCount: validatedData.topCountries.reduce((sum, c) => sum + c.ticketCount, 0),
//       });
//       setErrorMessage("");
//     } catch (error) {
//       console.error("Fetch error:", error, { url: `${apiUrl}/dashboardManagement?${query}`, retryCount });
//       const errorMsg = error instanceof Error ? error.message : String(error);
//       if (errorMsg.includes('NetworkError') && retryCount < 2) {
//         console.log(`Retrying fetch (${retryCount + 1}/2)...`);
//         setTimeout(() => fetchData(queryParams, retryCount + 1), 1000);
//         return;
//       }
//       setErrorMessage(`Failed to load data: ${errorMsg}. Please check the backend or network.`);
//     } finally {
//       setLoading(false);
//     }
//   }, [apiUrl, cache]);

//   const debouncedFetchData = useMemo(() => debounce(fetchData, 300), [fetchData]);

//   useEffect(() => {
//     fetchData({ transcode: "SALE" });
//   }, [fetchData]);

//   const handleYearChange = (selected: { value: string } | null) => {
//     const value = selected ? selected.value : null;
//     setSelectedYear(value);
//     setSelectedMonth(null);
//     setSelectedAirlines(null);
//     setSelectedChannel(null);
//     debouncedFetchData({
//       year: value || undefined,
//       month: undefined,
//       AirlinesTKT: undefined,
//       Channel: undefined,
//       transcode,
//     });
//   };

//   const handleMonthChange = (selected: { value: string } | null) => {
//     const value = selected ? selected.value : null;
//     if (!selectedYear && value) {
//       setErrorMessage("Please select a year before selecting a month.");
//       return;
//     }
//     setSelectedMonth(value);
//     setSelectedAirlines(null);
//     setSelectedChannel(null);
//     debouncedFetchData({
//       year: selectedYear || undefined,
//       month: value || undefined,
//       AirlinesTKT: undefined,
//       Channel: undefined,
//       transcode,
//     });
//   };

//   const handleAirlinesChange = (selected: { value: string } | null) => {
//     const value = selected ? selected.value : null;
//     setSelectedAirlines(value);
//     debouncedFetchData({
//       year: selectedYear || undefined,
//       month: selectedMonth || undefined,
//       AirlinesTKT: value || undefined,
//       Channel: selectedChannel || undefined,
//       transcode,
//     });
//   };

//   const handleChannelChange = (selected: { value: string } | null) => {
//     const value = selected ? selected.value : null;
//     setSelectedChannel(value);
//     debouncedFetchData({
//       year: selectedYear || undefined,
//       month: selectedMonth || undefined,
//       AirlinesTKT: selectedAirlines || undefined,
//       Channel: value || undefined,
//       transcode,
//     });
//   };

//   const handleTranscodeToggle = () => {
//     const newTranscode = transcode === "SALE" ? "EXCH" : "SALE";
//     setTranscode(newTranscode);
//     debouncedFetchData({
//       year: selectedYear || undefined,
//       month: selectedMonth || undefined,
//       AirlinesTKT: selectedAirlines || undefined,
//       Channel: selectedChannel || undefined,
//       transcode: newTranscode,
//     });
//   };

//   const clearCache = () => {
//     cache.clear();
//     console.log("Cache cleared");
//     fetchData({
//       year: selectedYear || undefined,
//       month: selectedMonth || undefined,
//       AirlinesTKT: selectedAirlines || undefined,
//       Channel: selectedChannel || undefined,
//       transcode,
//     });
//   };

//   const yearOptions = useMemo(() => (data.years || []).map(y => ({ value: y.toString(), label: y.toString() })), [data.years]);
//   const monthOptions = useMemo(() => (data.months || []).map(m => ({ value: m.toString(), label: getMonthName(m) })), [data.months]);
//   const airlineOptions = useMemo(() => (data.airlines || []).map(a => ({ value: a, label: a })), [data.airlines]);
//   const channelOptions = useMemo(() => (data.channels || []).map(c => ({ value: c._id, label: c._id })), [data.channels]);

//   const totalFare = useMemo(() => quickStats?.totalFare || 0, [quickStats]);
//   const totalTicketCount = useMemo(() => quickStats?.totalTicketCount || 0, [quickStats]);

//   const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#3b82f6', '#f97316', '#6b7280'];

//   const formatYAxis = (tick: number) => (tick >= 1000 ? `${(tick / 1000).toFixed(1)}K` : tick.toString());
//   const formatCurrency = (value: number, currency: string = 'IDR') => `${currency} ${value.toLocaleString()}`;
//   const formatTicketCount = (value: number) => value.toLocaleString();

//   function getMonthName(month: number): string {
//     const monthNames = [
//       'January', 'February', 'March', 'April', 'May', 'June',
//       'July', 'August', 'September', 'October', 'November', 'December'
//     ];
//     return month >= 1 && month <= 12 ? monthNames[month - 1] : 'Unknown';
//   }

//   return (
//     <ProtectedRoute>
//       <SubpageGuard requiredAccess="dtwbs">
//         <div className="min-h-screen p-6 bg-background text-gray-900 font-inter">
//           <header className="mb-6 bg-gradient-to-r from-red-600 to-black text-white p-6 rounded-xl shadow-lg">
//             <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
//               <div className="flex flex-col sm:flex-row gap-3">
//                 <div className="w-40">
//                   <h3 className="text-xs font-medium mb-1">Year</h3>
//                   <Select
//                     options={yearOptions}
//                     onChange={handleYearChange}
//                     placeholder="Select Year"
//                     isClearable
//                     isDisabled={loading}
//                     className="text-xs"
//                     styles={{
//                       control: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         borderRadius: '0.375rem',
//                         borderColor: '#e5e7eb',
//                         boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
//                         padding: '0.125rem',
//                         '&:hover': { borderColor: '#d1d5db' },
//                       }),
//                       option: (base, { isFocused }) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         backgroundColor: isFocused ? '#e0f2fe' : 'white',
//                         color: '#1f2937',
//                         '&:active': { backgroundColor: '#bae6fd' },
//                       }),
//                       placeholder: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         color: '#6b7280',
//                       }),
                     

//  singleValue: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         color: '#1f2937',
//                       }),
//                     }}
//                     value={yearOptions.find(option => option.value === selectedYear) || null}
//                   />
//                 </div>
//                 <div className="w-40">
//                   <h3 className="text-xs font-medium mb-1">Month</h3>
//                   <Select
//                     options={monthOptions}
//                     onChange={handleMonthChange}
//                     placeholder="Select Month"
//                     isClearable
//                     isDisabled={loading || !selectedYear}
//                     className="text-xs"
//                     styles={{
//                       control: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         borderRadius: '0.375rem',
//                         borderColor: '#e5e7eb',
//                         boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
//                         padding: '0.125rem',
//                         '&:hover': { borderColor: '#d1d5db' },
//                       }),
//                       option: (base, { isFocused }) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         backgroundColor: isFocused ? '#e0f2fe' : 'white',
//                         color: '#1f2937',
//                         '&:active': { backgroundColor: '#bae6fd' },
//                       }),
//                       placeholder: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         color: '#6b7280',
//                       }),
//                       singleValue: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         color: '#1f2937',
//                       }),
//                     }}
//                     value={monthOptions.find(option => option.value === selectedMonth) || null}
//                   />
//                 </div>
//                 <div className="w-40">
//                   <h3 className="text-xs font-medium mb-1">Airline</h3>
//                   <Select
//                     options={airlineOptions}
//                     onChange={handleAirlinesChange}
//                     placeholder="Select Airline"
//                     isClearable
//                     isDisabled={loading}
//                     className="text-xs"
//                     styles={{
//                       control: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         borderRadius: '0.375rem',
//                         borderColor: '#e5e7eb',
//                         boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
//                         padding: '0.125rem',
//                         '&:hover': { borderColor: '#d1d5db' },
//                       }),
//                       option: (base, { isFocused }) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         backgroundColor: isFocused ? '#e0f2fe' : 'white',
//                         color: '#1f2937',
//                         '&:active': { backgroundColor: '#bae6fd' },
//                       }),
//                       placeholder: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         color: '#6b7280',
//                       }),
//                       singleValue: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         color: '#1f2937',
//                       }),
//                     }}
//                     value={airlineOptions.find(option => option.value === selectedAirlines) || null}
//                   />
//                 </div>
//                 <div className="w-40">
//                   <h3 className="text-xs font-medium mb-1">Channel</h3>
//                   <Select
//                     options={channelOptions}
//                     onChange={handleChannelChange}
//                     placeholder="Select Channel"
//                     isClearable
//                     isDisabled={loading}
//                     className="text-xs"
//                     styles={{
//                       control: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         borderRadius: '0.375rem',
//                         borderColor: '#e5e7eb',
//                         boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
//                         padding: '0.125rem',
//                         '&:hover': { borderColor: '#d1d5db' },
//                       }),
//                       option: (base, { isFocused }) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         backgroundColor: isFocused ? '#e0f2fe' : 'white',
//                         color: '#1f2937',
//                         '&:active': { backgroundColor: '#bae6fd' },
//                       }),
//                       placeholder: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         color: '#6b7280',
//                       }),
//                       singleValue: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         color: '#1f2937',
//                       }),
//                     }}
//                     value={channelOptions.find(option => option.value === selectedChannel) || null}
//                   />
//                 </div>
//               </div>
//               <div className="flex items-center gap-3">
//                 <h1 className="text-xl text-gray-100 font-bold tracking-tight">
//                   Wibisono Dashboard ({transcode} - {selectedYear || 'All'})
//                 </h1>
//                 <div className="flex items-center space-x-2">
//                   <span className="text-xs text-gray-100 font-medium">EXCH</span>
//                   <label className="relative inline-flex items-center cursor-pointer">
//                     <input
//                       type="checkbox"
//                       checked={transcode === "SALE"}
//                       onChange={handleTranscodeToggle}
//                       className="sr-only peer"
//                     />
//                     <div className="w-14 h-7 bg-gray-300 rounded-full peer peer-checked:bg-indigo-600 transition-colors duration-300 ease-in-out">
//                       <div
//                         className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
//                           transcode === "SALE" ? 'translate-x-7' : 'translate-x-0.5'
//                         }`}
//                       />
//                     </div>
//                   </label>
//                   <span className="text-xs text-gray-100 font-medium">SALE</span>
//                 </div>
//                 <button
//                   onClick={clearCache}
//                   className="px-3 py-1 bg-gray-500 text-white rounded-md text-sm hover:bg-gray-600"
//                 >
//                   Clear Cache
//                 </button>
//               </div>
//             </div>
//           </header>

//           {errorMessage && (
//             <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md shadow-sm border border-red-200">
//               {errorMessage}
//               <button
//                 onClick={() => fetchData({
//                   year: selectedYear || undefined,
//                   month: selectedMonth || undefined,
//                   AirlinesTKT: selectedAirlines || undefined,
//                   Channel: selectedChannel || undefined,
//                   transcode,
//                 })}
//                 className="ml-4 px-3 py-1 bg-indigo-500 text-white rounded-md text-sm hover:bg-indigo-600"
//               >
//                 Retry
//               </button>
//             </div>
//           )}

//           {loading && !quickStats ? (
//             <div className="flex justify-center items-center h-64">
//               <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//               <div className="p-6 bg-white rounded-xl shadow-md transition-transform hover:scale-[1.02]">
//                 <h3 className="text-xl font-bold text-indigo-600 mb-4">Quick Stats</h3>
//                 <div className="space-y-4">
//                   <div>
//                     <p className="text-sm font-medium text-gray-600">Total Tickets</p>
//                     <p className="text-lg font-bold text-indigo-700">{quickStats ? formatTicketCount(totalTicketCount) : 'Loading...'}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm font-medium text-gray-600">Total Revenue</p>
//                     <p className="text-lg font-bold text-indigo-700">{quickStats ? formatCurrency(totalFare) : 'Loading...'}</p>
//                   </div>
//                 </div>
//               </div>

//               <div className="p-6 bg-white rounded-xl shadow-md col-span-3">
//                 <h3 className="text-xl font-bold text-indigo-600 mb-4">Top Countries by Tickets</h3>
//                 {(data.topCountries || []).length > 0 ? (
//                   <ResponsiveContainer width="100%" height={350}>
//                     <BarChart data={data.topCountries} margin={{ top: 20, right: 30, left: 10, bottom: 80 }}>
//                       <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
//                       <XAxis
//                         dataKey="_id"
//                         angle={45}
//                         textAnchor="start"
//                         height={80}
//                         fontSize={12}
//                       />
//                       <YAxis
//                         tickFormatter={formatYAxis}
//                         fontSize={12}
//                         domain={[0, 'auto']}
//                         allowDecimals={false}
//                       />
//                       <Tooltip
//                         formatter={(value: number) => [`${formatTicketCount(value)} tickets`, 'Tickets']}
//                         contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', padding: '8px', border: '1px solid #e5e7eb' }}
//                       />
//                       <Bar dataKey="ticketCount" radius={[6, 6, 0, 0]} isAnimationActive>
//                         {(data.topCountries || []).map((entry, index) => (
//                           <Cell
//                             key={`cell-${index}`}
//                             fill={COLORS[index % COLORS.length]}
//                             className="hover:opacity-80 transition-opacity"
//                           />
//                         ))}
//                       </Bar>
//                     </BarChart>
//                   </ResponsiveContainer>
//                 ) : (
//                   <p className="text-sm text-gray-500">No data available.</p>
//                 )}
//               </div>

//               <div className="p-6 bg-white rounded-xl shadow-md col-span-2">
//                 <h3 className="text-xl font-bold text-indigo-600 mb-4">Tickets by Channel</h3>
//                 {(data.channels || []).length > 0 ? (
//                   <ResponsiveContainer width="100%" height={350}>
//                     <PieChart>
//                       <Pie
//                         data={data.channels}
//                         dataKey="ticketCount"
//                         nameKey="_id"
//                         cx="50%"
//                         cy="50%"
//                         outerRadius={120}
//                         label={({ name, value }) => `${name}: ${formatTicketCount(value)}`}
//                         labelLine={{ stroke: "#4b5563", strokeWidth: 1 }}
//                         isAnimationActive
//                         onClick={(data) => handleChannelChange({ value: data._id })}
//                       >
//                         {(data.channels || []).map((_, index) => (
//                           <Cell
//                             key={`cell-${index}`}
//                             fill={COLORS[index % COLORS.length]}
//                             className="hover:opacity-80 transition-opacity"
//                           />
//                         ))}
//                       </Pie>
//                       <Tooltip
//                         formatter={(value: number) => [`${formatTicketCount(value)} tickets`, 'Tickets']}
//                         contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', padding: '8px', border: '1px solid #e5e7eb' }}
//                       />
//                       <Legend wrapperStyle={{ fontSize: '14px', color: '#4b5563' }} />
//                     </PieChart>
//                   </ResponsiveContainer>
//                 ) : (
//                   <p className="text-sm text-gray-500">No data available.</p>
//                 )}
//               </div>

//               <div className="p-6 bg-white rounded-xl shadow-md col-span-2">
//                 <h3 className="text-xl font-bold text-indigo-600 mb-4">Tickets by Partition</h3>
//                 {(data.partitions || []).length > 0 ? (
//                   <ResponsiveContainer width="100%" height={350}>
//                     <BarChart data={data.partitions} margin={{ top: 20, right: 30, left: 10, bottom: 80 }}>
//                       <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
//                       <XAxis
//                         dataKey="_id"
//                         angle={45}
//                         textAnchor="start"
//                         height={80}
//                         fontSize={12}
//                       />
//                       <YAxis
//                         tickFormatter={formatYAxis}
//                         fontSize={12}
//                         domain={[0, 'auto']}
//                         allowDecimals={false}
//                       />
//                       <Tooltip
//                         formatter={(value: number) => [`${formatTicketCount(value)} tickets`, 'Tickets']}
//                         contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', padding: '8px', border: '1px solid #e5e7eb' }}
//                       />
//                       <Bar dataKey="ticketCount" radius={[6, 6, 0, 0]} isAnimationActive>
//                         {(data.partitions || []).map((entry, index) => (
//                           <Cell
//                             key={`cell-${index}`}
//                             fill={COLORS[index % COLORS.length]}
//                             className="hover:opacity-80 transition-opacity"
//                           />
//                         ))}
//                       </Bar>
//                     </BarChart>
//                   </ResponsiveContainer>
//                 ) : (
//                   <p className="text-sm text-gray-500">No data available.</p>
//                 )}
//               </div>

//               <div className="p-6 bg-white rounded-xl shadow-md col-span-4">
//                 <h3 className="text-xl font-bold text-indigo-600 mb-4">Top Routes by Tickets</h3>
//                 {(data.routePerformanceStats || []).length > 0 ? (
//                   <ResponsiveContainer width="100%" height={350}>
//                     <BarChart data={data.routePerformanceStats} margin={{ top: 20, right: 30, left: 10, bottom: 80 }}>
//                       <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
//                       <XAxis
//                         dataKey="_id.route"
//                         angle={45}
//                         textAnchor="start"
//                         height={80}
//                         fontSize={12}
//                       />
//                       <YAxis
//                         tickFormatter={formatYAxis}
//                         fontSize={12}
//                         domain={[0, 'auto']}
//                         allowDecimals={false}
//                       />
//                       <Tooltip
//                         formatter={(value: number) => [`${formatTicketCount(value)} tickets`, 'Tickets']}
//                         contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', padding: '8px', border: '1px solid #e5e7eb' }}
//                       />
//                       <Bar dataKey="ticketCount" radius={[6, 6, 0, 0]} isAnimationActive>
//                         {(data.routePerformanceStats || []).map((entry, index) => (
//                           <Cell
//                             key={`cell-${index}`}
//                             fill={COLORS[index % COLORS.length]}
//                             className="hover:opacity-80 transition-opacity"
//                           />
//                         ))}
//                       </Bar>
//                     </BarChart>
//                   </ResponsiveContainer>
//                 ) : (
//                   <p className="text-sm text-gray-500">No data available.</p>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       </SubpageGuard>
//     </ProtectedRoute>
//   );
// }
// before update gadget version
// "use client";

// import { useState, useEffect, useMemo, useCallback } from 'react';
// import SubpageGuard from '../../components/SubpageGuard';
// import ProtectedRoute from '../../components/ProtectedRoute';
// import Select from 'react-select';
// import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
// import '../../../styles/globals.css';

// // Interfaces for type safety
// interface TopCountry {
//   _id: string;
//   totalFare: number;
//   ticketCount: number;
// }

// interface Partition {
//   _id: string;
//   ticketCount: number;
// }

// interface Channel {
//   _id: string;
//   ticketCount: number;
// }

// interface RoutePerformance {
//   _id: { route: string };
//   totalFare: number;
//   ticketCount: number;
// }

// interface DashboardData {
//   years: number[];
//   months: number[];
//   airlines: string[];
//   topCountries: TopCountry[];
//   partitions: Partition[];
//   channels: Channel[];
//   routePerformanceStats: RoutePerformance[];
//   totalCountryCount: number;
// }

// interface DashboardResponse {
//   years: number[];
//   months: number[];
//   airlines: string[];
//   topCountries: TopCountry[];
//   partitions: Partition[];
//   channels: Channel[];
//   routePerformanceStats: RoutePerformance[];
//   totalCountryCount: number;
// }

// export default function DashboardManagement() {
//   const [data, setData] = useState<DashboardData>({
//     years: [],
//     months: [],
//     airlines: [],
//     topCountries: [],
//     partitions: [],
//     channels: [],
//     routePerformanceStats: [],
//     totalCountryCount: 0,
//   });
//   const [selectedYear, setSelectedYear] = useState<string | null>(null);
//   const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
//   const [selectedAirlines, setSelectedAirlines] = useState<string | null>(null);
//   const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
//   const [transcode, setTranscode] = useState<"SALE" | "EXCH">("SALE");
//   const [loading, setLoading] = useState(false);
//   const [errorMessage, setErrorMessage] = useState("");
//   const [quickStats, setQuickStats] = useState<{ totalFare: number; totalTicketCount: number; totalCountryCount: number } | null>(null);

//   const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://192.168.198.209:8080/api";

//   if (!process.env.NEXT_PUBLIC_API_URL) {
//     console.warn("NEXT_PUBLIC_API_URL not set, using fallback:", apiUrl);
//   }

//   const cache = useMemo(() => new Map<string, DashboardData>(), []);

//   const debounce = useCallback((fn: (...args: any[]) => void, delay: number) => {
//     let timeout: NodeJS.Timeout;
//     return (...args: any[]) => {
//       clearTimeout(timeout);
//       timeout = setTimeout(() => fn(...args), delay);
//     };
//   }, []);

//   const fetchData = useCallback(async (queryParams: Record<string, string | undefined>, retryCount = 0) => {
//     setLoading(true);
//     setErrorMessage("");
//     const query = new URLSearchParams();
//     for (const [key, value] of Object.entries(queryParams)) {
//       if (value !== undefined) query.append(key, value);
//     }
//     const cacheKey = query.toString() + `:${Date.now()}`; // Force fresh fetch
//     console.log("Fetching with cacheKey:", cacheKey);
//     if (cache.has(cacheKey)) {
//       console.log("Using cached data:", cache.get(cacheKey));
//       const cachedData = cache.get(cacheKey)!;
//       setData(cachedData);
//       setQuickStats({
//         totalFare: cachedData.topCountries.reduce((sum, c) => sum + c.totalFare, 0),
//         totalTicketCount: cachedData.topCountries.reduce((sum, c) => sum + c.ticketCount, 0),
//         totalCountryCount: cachedData.totalCountryCount,
//       });
//       console.log("quickStats from cache:", {
//         totalFare: cachedData.topCountries.reduce((sum, c) => sum + c.totalFare, 0),
//         totalTicketCount: cachedData.topCountries.reduce((sum, c) => sum + c.ticketCount, 0),
//         totalCountryCount: cachedData.totalCountryCount,
//       });
//       setLoading(false);
//       return;
//     }
//     try {
//       const url = `${apiUrl}/dashboardManagement?${query}`;
//       console.log("Fetching data from:", url);
//       const response = await fetch(url, {
//         method: 'GET',
//         headers: { 'Content-Type': 'application/json' },
//         credentials: 'include',
//       });
//       if (!response.ok) {
//         throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//       }
//       const responseData: DashboardResponse = await response.json();
//       console.log("API response:", responseData);
//       if (!responseData || typeof responseData !== 'object') {
//         throw new Error("Invalid response format");
//       }
//       const validatedData: DashboardData = {
//         years: Array.isArray(responseData.years)
//           ? responseData.years.filter((n: number) => !isNaN(n))
//           : [],
//         months: Array.isArray(responseData.months)
//           ? responseData.months.filter((n: number) => !isNaN(n) && n >= 1 && n <= 12)
//           : [],
//         airlines: Array.isArray(responseData.airlines) ? responseData.airlines.filter(a => typeof a === 'string') : [],
//         topCountries: Array.isArray(responseData.topCountries) ? responseData.topCountries : [],
//         partitions: Array.isArray(responseData.partitions) ? responseData.partitions : [],
//         channels: Array.isArray(responseData.channels) ? responseData.channels : [],
//         routePerformanceStats: Array.isArray(responseData.routePerformanceStats) ? responseData.routePerformanceStats : [],
//         totalCountryCount: typeof responseData.totalCountryCount === 'number' ? responseData.totalCountryCount : 0,
//       };
//       console.log("Validated data:", validatedData);
//       cache.set(cacheKey, validatedData);
//       setData(validatedData);
//       setQuickStats({
//         totalFare: validatedData.topCountries.reduce((sum, c) => sum + c.totalFare, 0),
//         totalTicketCount: validatedData.topCountries.reduce((sum, c) => sum + c.ticketCount, 0),
//         totalCountryCount: validatedData.totalCountryCount,
//       });
//       console.log("quickStats set:", {
//         totalFare: validatedData.topCountries.reduce((sum, c) => sum + c.totalFare, 0),
//         totalTicketCount: validatedData.topCountries.reduce((sum, c) => sum + c.ticketCount, 0),
//         totalCountryCount: validatedData.totalCountryCount,
//       });
//       setErrorMessage("");
//     } catch (error) {
//       console.error("Fetch error:", error, { url: `${apiUrl}/dashboardManagement?${query}`, retryCount });
//       const errorMsg = error instanceof Error ? error.message : String(error);
//       if (errorMsg.includes('NetworkError') && retryCount < 2) {
//         console.log(`Retrying fetch (${retryCount + 1}/2)...`);
//         setTimeout(() => fetchData(queryParams, retryCount + 1), 1000);
//         return;
//       }
//       setErrorMessage(`Failed to load data: ${errorMsg}. Please check the backend or network.`);
//     } finally {
//       setLoading(false);
//     }
//   }, [apiUrl, cache]);

//   const debouncedFetchData = useMemo(() => debounce(fetchData, 300), [fetchData]);

//   useEffect(() => {
//     fetchData({ transcode: "SALE" });
//   }, [fetchData]);

//   const handleYearChange = (selected: { value: string } | null) => {
//     const value = selected ? selected.value : null;
//     setSelectedYear(value);
//     setSelectedMonth(null);
//     setSelectedAirlines(null);
//     setSelectedChannel(null);
//     debouncedFetchData({
//       year: value || undefined,
//       month: undefined,
//       AirlinesTKT: undefined,
//       Channel: undefined,
//       transcode,
//     });
//   };

//   const handleMonthChange = (selected: { value: string } | null) => {
//     const value = selected ? selected.value : null;
//     if (!selectedYear && value) {
//       setErrorMessage("Please select a year before selecting a month.");
//       return;
//     }
//     setSelectedMonth(value);
//     setSelectedAirlines(null);
//     setSelectedChannel(null);
//     debouncedFetchData({
//       year: selectedYear || undefined,
//       month: value || undefined,
//       AirlinesTKT: undefined,
//       Channel: undefined,
//       transcode,
//     });
//   };

//   const handleAirlinesChange = (selected: { value: string } | null) => {
//     const value = selected ? selected.value : null;
//     setSelectedAirlines(value);
//     debouncedFetchData({
//       year: selectedYear || undefined,
//       month: selectedMonth || undefined,
//       AirlinesTKT: value || undefined,
//       Channel: selectedChannel || undefined,
//       transcode,
//     });
//   };

//   const handleChannelChange = (selected: { value: string } | null) => {
//     const value = selected ? selected.value : null;
//     setSelectedChannel(value);
//     debouncedFetchData({
//       year: selectedYear || undefined,
//       month: selectedMonth || undefined,
//       AirlinesTKT: selectedAirlines || undefined,
//       Channel: value || undefined,
//       transcode,
//     });
//   };

//   const handleTranscodeToggle = () => {
//     const newTranscode = transcode === "SALE" ? "EXCH" : "SALE";
//     setTranscode(newTranscode);
//     debouncedFetchData({
//       year: selectedYear || undefined,
//       month: selectedMonth || undefined,
//       AirlinesTKT: selectedAirlines || undefined,
//       Channel: selectedChannel || undefined,
//       transcode: newTranscode,
//     });
//   };

//   const clearCache = () => {
//     cache.clear();
//     console.log("Cache cleared");
//     fetchData({
//       year: selectedYear || undefined,
//       month: selectedMonth || undefined,
//       AirlinesTKT: selectedAirlines || undefined,
//       Channel: selectedChannel || undefined,
//       transcode,
//     });
//   };

//   const yearOptions = useMemo(() => (data.years || []).map(y => ({ value: y.toString(), label: y.toString() })), [data.years]);
//   const monthOptions = useMemo(() => (data.months || []).map(m => ({ value: m.toString(), label: getMonthName(m) })), [data.months]);
//   const airlineOptions = useMemo(() => (data.airlines || []).map(a => ({ value: a, label: a })), [data.airlines]);
//   const channelOptions = useMemo(() => (data.channels || []).map(c => ({ value: c._id, label: c._id })), [data.channels]);

//   const totalFare = useMemo(() => quickStats?.totalFare || 0, [quickStats]);
//   const totalTicketCount = useMemo(() => quickStats?.totalTicketCount || 0, [quickStats]);
//   const totalCountryCount = useMemo(() => quickStats?.totalCountryCount || 0, [quickStats]);

//   useEffect(() => {
//     console.log("totalCountryCount rendered:", totalCountryCount);
//   }, [totalCountryCount]);

//   const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#3b82f6', '#f97316', '#6b7280'];

//   const formatYAxis = (tick: number) => (tick >= 1000 ? `${(tick / 1000).toFixed(1)}K` : tick.toString());
//   const formatCurrency = (value: number, currency: string = 'IDR') => `${currency} ${value.toLocaleString()}`;
//   const formatTicketCount = (value: number) => value.toLocaleString();

//   function getMonthName(month: number): string {
//     const monthNames = [
//       'January', 'February', 'March', 'April', 'May', 'June',
//       'July', 'August', 'September', 'October', 'November', 'December'
//     ];
//     return month >= 1 && month <= 12 ? monthNames[month - 1] : 'Unknown';
//   }

//   return (
//     <ProtectedRoute>
//       <SubpageGuard requiredAccess="dtwbs">
//         <div className="p-2 sm:p-3 bg-background text-gray-900 font-inter">
//           <header className="mb-4 bg-gradient-to-r from-red-700 via-red-900 to-zinc-600 text-white p-5 rounded-2xl shadow-lg border border-red-500">
//             <div className="flex flex-col gap-3">
//               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//                 <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight flex items-center gap-2">
//                   <span className="inline-block bg-white text-black px-2 py-0.5 rounded shadow-sm text-sm">Wibisono</span>
//                   Dashboard <span className="text-gray-100">({transcode} - {selectedYear || 'All'})</span>
//                 </h1>
//                 <div className="flex items-center gap-3">
//                   <span className="text-xs font-semibold tracking-wide text-gray-100">EXCH</span>
//                   <label className="relative inline-flex items-center cursor-pointer">
//                     <input
//                       type="checkbox"
//                       checked={transcode === "SALE"}
//                       onChange={handleTranscodeToggle}
//                       className="sr-only peer"
//                     />
//                     <div className="w-14 h-7 bg-red-700 rounded-full peer peer-checked:bg-red-500 transition-colors duration-300 ease-in-out shadow-inner">
//                       <div
//                         className={`absolute w-6 h-6 bg-white rounded-full shadow-md ring-1 ring-black/10 transform transition-transform duration-200 ease-in-out ${
//                           transcode === "SALE" ? 'translate-x-7' : 'translate-x-1'
//                         }`}
//                       />
//                     </div>
//                   </label>
//                   <span className="text-xs font-semibold tracking-wide text-gray-100">SALE</span>
//                   <button
//                     onClick={clearCache}
//                     className="px-3 py-1.5 text-gray-100 bg-red-500 hover:bg-red-600 transition-colors duration-200 text-xs rounded-full shadow-md font-semibold"
//                   >
//                     Clear Cache
//                   </button>
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//                 <div className="w-full">
//                   <h3 className="text-xs font-semibold mb-1 text-gray-100">Year</h3>
//                   <Select
//                     options={yearOptions}
//                     onChange={handleYearChange}
//                     placeholder="Select Year"
//                     isClearable
//                     isDisabled={loading}
//                     className="text-xs"
//                     styles={{
//                       control: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         borderRadius: '8px',
//                         borderColor: '#f87171',
//                         boxShadow: '0 0 4px rgba(255,255,255,0.15)',
//                         padding: '2px',
//                         minHeight: '30px',
//                         '&:hover': { borderColor: '#ef4444' },
//                       }),
//                       option: (base, { isFocused }) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         backgroundColor: isFocused ? '#fee2e2' : 'white',
//                         color: '#1f2937',
//                       }),
//                       singleValue: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         color: '#1f2937',
//                       }),
//                       placeholder: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         color: '#9ca3af',
//                       }),
//                     }}
//                     value={yearOptions.find(option => option.value === selectedYear) || null}
//                   />
//                 </div>

//                 <div className="w-full">
//                   <h3 className="text-xs font-semibold mb-1 text-gray-100">Month</h3>
//                   <Select
//                     options={monthOptions}
//                     onChange={handleMonthChange}
//                     placeholder="Select Month"
//                     isClearable
//                     isDisabled={loading || !selectedYear}
//                     className="text-xs"
//                     styles={{
//                       control: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         borderRadius: '8px',
//                         borderColor: '#f87171',
//                         boxShadow: '0 0 4px rgba(255,255,255,0.15)',
//                         padding: '2px',
//                         minHeight: '30px',
//                         '&:hover': { borderColor: '#ef4444' },
//                       }),
//                       option: (base, { isFocused }) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         backgroundColor: isFocused ? '#fee2e2' : 'white',
//                         color: '#1f2937',
//                       }),
//                       singleValue: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         color: '#1f2937',
//                       }),
//                       placeholder: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         color: '#9ca3af',
//                       }),
//                     }}
//                     value={monthOptions.find(option => option.value === selectedMonth) || null}
//                   />
//                 </div>
//                 <div className="w-full">
//                   <h3 className="text-xs font-semibold mb-1 text-gray-100">Airline</h3>
//                   <Select
//                     options={airlineOptions}
//                     onChange={handleAirlinesChange}
//                     placeholder="Select Airline"
//                     isClearable
//                     isDisabled={loading}
//                     className="text-xs"
//                     styles={{
//                       control: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         borderRadius: '8px',
//                         borderColor: '#f87171',
//                         boxShadow: '0 0 4px rgba(255,255,255,0.15)',
//                         padding: '2px',
//                         minHeight: '30px',
//                         '&:hover': { borderColor: '#ef4444' },
//                       }),
//                       option: (base, { isFocused }) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         backgroundColor: isFocused ? '#fee2e2' : 'white',
//                         color: '#1f2937',
//                         padding: '4px 8px',
//                         '&:active': { backgroundColor: '#fecaca' },
//                       }),
//                       singleValue: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         color: '#1f2937',
//                       }),
//                       placeholder: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         color: '#9ca3af',
//                       }),
//                     }}
//                     value={airlineOptions.find(option => option.value === selectedAirlines) || null}
//                   />
//                 </div>

//                 <div className="w-full">
//                   <h3 className="text-xs font-semibold mb-1 text-gray-100">Channel</h3>
//                   <Select
//                     options={channelOptions}
//                     onChange={handleChannelChange}
//                     placeholder="Select Channel"
//                     isClearable
//                     isDisabled={loading}
//                     className="text-xs"
//                     styles={{
//                       control: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         borderRadius: '8px',
//                         borderColor: '#f87171',
//                         boxShadow: '0 0 4px rgba(255,255,255,0.15)',
//                         padding: '2px',
//                         minHeight: '30px',
//                         '&:hover': { borderColor: '#ef4444' },
//                       }),
//                       option: (base, { isFocused }) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         backgroundColor: isFocused ? '#fee2e2' : 'white',
//                         color: '#1f2937',
//                         padding: '4px 8px',
//                         '&:active': { backgroundColor: '#fecaca' },
//                       }),
//                       singleValue: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         color: '#fef3c7',
//                       }),
//                       placeholder: (base) => ({
//                         ...base,
//                         fontSize: '0.75rem',
//                         color: '#9ca3af',
//                       }),
//                     }}
//                     value={channelOptions.find(option => option.value === selectedChannel) || null}
//                   />
//                 </div>
//               </div>
//             </div>
//           </header>
// {/* 
//           <header className="mb-3 bg-gradient-to-r from-red-600 to-black text-white p-3 rounded-lg shadow-md">
//             <div className="flex flex-col gap-2">
//               <div className="flex flex-col sm:flex-row sm:items-center gap-2">
//                 <h1 className="text-base sm:text-lg font-bold tracking-tight">
//                   Wibisono Dashboard ({transcode} - {selectedYear || 'All'})
//                 </h1>
//                 <div className="flex items-center gap-2">
//                   <span className="text-xs font-medium">EXCH</span>
//                   <label className="relative inline-flex items-center cursor-pointer">
//                     <input
//                       type="checkbox"
//                       checked={transcode === "SALE"}
//                       onChange={handleTranscodeToggle}
//                       className="sr-only peer"
//                     />
//                     <div className="w-10 h-5 bg-gray-300 rounded-full peer peer-checked:bg-indigo-600 transition-colors duration-300 ease-in-out">
//                       <div
//                         className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
//                           transcode === "SALE" ? 'translate-x-5' : 'translate-x-0.5'
//                         }`}
//                       />
//                     </div>
//                   </label>
//                   <span className="text-xs font-medium">SALE</span>
//                   <button
//                     onClick={clearCache}
//                     className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
//                   >
//                     Clear Cache
//                   </button>
//                 </div>
//               </div>
//               <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
//                 <div className="w-full">
//                   <h3 className="text-[10px] sm:text-xs font-medium mb-0.5">Year</h3>
//                   <Select
//                     options={yearOptions}
//                     onChange={handleYearChange}
//                     placeholder="Select Year"
//                     isClearable
//                     isDisabled={loading}
//                     className="text-[10px] sm:text-xs"
//                     styles={{
//                       control: (base) => ({
//                         ...base,
//                         fontSize: '0.625rem',
//                         borderRadius: '6px',
//                         borderColor: '#e5e7eb',
//                         boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
//                         padding: '1px',
//                         minHeight: '28px',
//                         height: '28px',
//                         '&:hover': { borderColor: '#d1d5db' },
//                       }),
//                       option: (base, { isFocused }) => ({
//                         ...base,
//                         fontSize: '10px',
//                         backgroundColor: isFocused ? '#e0f2fe' : 'white',
//                         color: '#1f2937',
//                         padding: '4px 8px',
//                         '&:active': { backgroundColor: '#bae6fd' },
//                       }),
//                       placeholder: (base) => ({
//                         ...base,
//                         fontSize: '10px',
//                         color: '#6b7280',
//                       }),
//                       singleValue: (base) => ({
//                         ...base,
//                         fontSize: '10px',
//                         color: '#1f2937',
//                       }),
//                       menu: (base) => ({
//                         ...base,
//                         marginTop: '2px',
//                       }),
//                       input: (base) => ({
//                         ...base,
//                         margin: '0',
//                         padding: '0',
//                       }),
//                     }}
//                     value={yearOptions.find(option => option.value === selectedYear) || null}
//                   />
//                 </div>
//                 <div className="w-full">
//                   <h3 className="text-[10px] sm:text-xs font-medium mb-0.5">Month</h3>
//                   <Select
//                     options={monthOptions}
//                     onChange={handleMonthChange}
//                     placeholder="Select Month"
//                     isClearable
//                     isDisabled={loading || !selectedYear}
//                     className="text-[10px] sm:text-xs"
//                     styles={{
//                       control: (base) => ({
//                         ...base,
//                         fontSize: '0.625rem',
//                         borderRadius: '6px',
//                         borderColor: '#e5e7eb',
//                         boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
//                         padding: '1px',
//                         minHeight: '28px',
//                         height: '28px',
//                         '&:hover': { borderColor: '#d1d5db' },
//                       }),
//                       option: (base, { isFocused }) => ({
//                         ...base,
//                         fontSize: '10px',
//                         backgroundColor: isFocused ? '#e0f2fe' : 'white',
//                         color: '#1f2937',
//                         padding: '4px 8px',
//                         '&:active': { backgroundColor: '#bae6fd' },
//                       }),
//                       placeholder: (base) => ({
//                         ...base,
//                         fontSize: '10px',
//                         color: '#6b7280',
//                       }),
//                       singleValue: (base) => ({
//                         ...base,
//                         fontSize: '10px',
//                         color: '#1f2937',
//                       }),
//                       menu: (base) => ({
//                         ...base,
//                         marginTop: '2px',
//                       }),
//                       input: (base) => ({
//                         ...base,
//                         margin: '0',
//                         padding: '0',
//                       }),
//                     }}
//                     value={monthOptions.find(option => option.value === selectedMonth) || null}
//                   />
//                 </div>
//                 <div className="w-full">
//                   <h3 className="text-[10px] sm:text-xs font-medium mb-0.5">Airline</h3>
//                   <Select
//                     options={airlineOptions}
//                     onChange={handleAirlinesChange}
//                     placeholder="Select Airline"
//                     isClearable
//                     isDisabled={loading}
//                     className="text-[10px] sm:text-xs"
//                     styles={{
//                       control: (base) => ({
//                         ...base,
//                         fontSize: '0.625rem',
//                         borderRadius: '6px',
//                         borderColor: '#e5e7eb',
//                         boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
//                         padding: '1px',
//                         minHeight: '28px',
//                         height: '28px',
//                         '&:hover': { borderColor: '#d1d5db' },
//                       }),
//                       option: (base, { isFocused }) => ({
//                         ...base,
//                         fontSize: '10px',
//                         backgroundColor: isFocused ? '#e0f2fe' : 'white',
//                         color: '#1f2937',
//                         padding: '4px 8px',
//                         '&:active': { backgroundColor: '#bae6fd' },
//                       }),
//                       placeholder: (base) => ({
//                         ...base,
//                         fontSize: '10px',
//                         color: '#6b7280',
//                       }),
//                       singleValue: (base) => ({
//                         ...base,
//                         fontSize: '10px',
//                         color: '#1f2937',
//                       }),
//                       menu: (base) => ({
//                         ...base,
//                         marginTop: '2px',
//                       }),
//                       input: (base) => ({
//                         ...base,
//                         margin: '0',
//                         padding: '0',
//                       }),
//                     }}
//                     value={airlineOptions.find(option => option.value === selectedAirlines) || null}
//                   />
//                 </div>
//                 <div className="w-full">
//                   <h3 className="text-[10px] sm:text-xs font-medium mb-0.5">Channel</h3>
//                   <Select
//                     options={channelOptions}
//                     onChange={handleChannelChange}
//                     placeholder="Select Channel"
//                     isClearable
//                     isDisabled={loading}
//                     className="text-[10px] sm:text-xs"
//                     styles={{
//                       control: (base) => ({
//                         ...base,
//                         fontSize: '0.625rem',
//                         borderRadius: '6px',
//                         borderColor: '#e5e7eb',
//                         boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
//                         padding: '1px',
//                         minHeight: '28px',
//                         height: '28px',
//                         '&:hover': { borderColor: '#d1d5db' },
//                       }),
//                       option: (base, { isFocused }) => ({
//                         ...base,
//                         fontSize: '10px',
//                         backgroundColor: isFocused ? '#e0f2fe' : 'white',
//                         color: '#1f2937',
//                         padding: '4px 8px',
//                         '&:active': { backgroundColor: '#bae6fd' },
//                       }),
//                       placeholder: (base) => ({
//                         ...base,
//                         fontSize: '10px',
//                         color: '#6b7280',
//                       }),
//                       singleValue: (base) => ({
//                         ...base,
//                         fontSize: '10px',
//                         color: '#1f2937',
//                       }),
//                       menu: (base) => ({
//                         ...base,
//                         marginTop: '2px',
//                       }),
//                       input: (base) => ({
//                         ...base,
//                         margin: '0',
//                         padding: '0',
//                       }),
//                     }}
//                     value={channelOptions.find(option => option.value === selectedChannel) || null}
//                   />
//                 </div>
//               </div>
//             </div>
//           </header> */}

//           {errorMessage && (
//             <div className="mb-2 p-2 bg-red-50 text-red-700 rounded-md shadow-sm border border-red-200 text-xs">
//               {errorMessage}
//               <button
//                 onClick={() => fetchData({
//                   year: selectedYear || undefined,
//                   month: selectedMonth || undefined,
//                   AirlinesTKT: selectedAirlines || undefined,
//                   Channel: selectedChannel || undefined,
//                   transcode,
//                 })}
//                 className="ml-2 px-2 py-1 bg-indigo-500 text-white rounded text-xs hover:bg-indigo-600"
//               >
//                 Retry
//               </button>
//             </div>
//           )}

//           {loading && !quickStats ? (
//             <div className="flex justify-center items-center h-32">
//               <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
//               <div className="p-3 bg-white rounded-lg shadow-md transition-transform hover:scale-[1.02] col-span-1">
//                 <h3 className="text-base font-bold text-indigo-600 mb-2">Quick Stats</h3>
//                 <div className="space-y-2">
//                   <div>
//                     <p className="text-xs font-medium text-gray-600">Total Tickets</p>
//                     <p className="text-sm font-bold text-indigo-700">{quickStats ? formatTicketCount(totalTicketCount) : 'Loading...'}</p>
//                   </div>
//                   <div>
//                     <p className="text-xs font-medium text-gray-600">Total Country Count</p>
//                     <p className="text-sm font-bold text-indigo-700">{quickStats ? formatTicketCount(totalCountryCount) : 'Loading...'}</p>
//                   </div>
//                 </div>
//               </div>

//               <div className="p-3 bg-white rounded-lg shadow-md col-span-1 sm:col-span-2 lg:col-span-3">
//                 <h3 className="text-base font-bold text-indigo-600 mb-2">Top Countries by Tickets</h3>
//                 {(data.topCountries || []).length > 0 ? (
//                   <ResponsiveContainer width="100%" height={200}>
//                     <BarChart data={data.topCountries} margin={{ top: 10, right: 15, left: 5, bottom: 40 }}>
//                       <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
//                       <XAxis
//                         dataKey="_id"
//                         angle={45}
//                         textAnchor="start"
//                         height={40}
//                         fontSize={10}
//                       />
//                       <YAxis
//                         tickFormatter={formatYAxis}
//                         fontSize={10}
//                         domain={[0, 'auto']}
//                         allowDecimals={false}
//                       />
//                       <Tooltip
//                         formatter={(value: number) => [`${formatTicketCount(value)} tickets`, 'Tickets']}
//                         contentStyle={{ backgroundColor: '#fff', borderRadius: '6px', padding: '4px', border: '1px solid #e5e7eb', fontSize: '10px' }}
//                       />
//                       <Bar dataKey="ticketCount" radius={[4, 4, 0, 0]} isAnimationActive>
//                         {(data.topCountries || []).map((entry, index) => (
//                           <Cell
//                             key={`cell-${index}`}
//                             fill={COLORS[index % COLORS.length]}
//                             className="hover:opacity-80 transition-opacity"
//                           />
//                         ))}
//                       </Bar>
//                     </BarChart>
//                   </ResponsiveContainer>
//                 ) : (
//                   <p className="text-xs text-gray-500">No data available.</p>
//                 )}
//               </div>

//               <div className="p-3 bg-white rounded-lg shadow-md col-span-1 lg:col-span-2">
//                 <h3 className="text-base font-bold text-indigo-600 mb-2">Tickets by Channel</h3>
//                 {(data.channels || []).length > 0 ? (
//                   <ResponsiveContainer width="100%" height={200}>
//                     <PieChart>
//                       <Pie
//                         data={data.channels}
//                         dataKey="ticketCount"
//                         nameKey="_id"
//                         cx="50%"
//                         cy="50%"
//                         outerRadius={60}
//                         label={({ name, value }) => `${name}: ${formatTicketCount(value)}`}
//                         labelLine={{ stroke: "#4b5563", strokeWidth: 1 }}
//                         isAnimationActive
//                         onClick={(data) => handleChannelChange({ value: data._id })}
//                       >
//                         {(data.channels || []).map((_, index) => (
//                           <Cell
//                             key={`cell-${index}`}
//                             fill={COLORS[index % COLORS.length]}
//                             className="hover:opacity-80 transition-opacity"
//                           />
//                         ))}
//                       </Pie>
//                       <Tooltip
//                         formatter={(value: number) => [`${formatTicketCount(value)} tickets`, 'Tickets']}
//                         contentStyle={{ backgroundColor: '#fff', borderRadius: '6px', padding: '4px', border: '1px solid #e5e7eb', fontSize: '10px' }}
//                       />
//                       <Legend wrapperStyle={{ fontSize: '10px', color: '#4b5563' }} />
//                     </PieChart>
//                   </ResponsiveContainer>
//                 ) : (
//                   <p className="text-xs text-gray-500">No data available.</p>
//                 )}
//               </div>

//               <div className="p-3 bg-white rounded-lg shadow-md col-span-1 lg:col-span-2">
//                 <h3 className="text-base font-bold text-indigo-600 mb-2">Tickets by Partition</h3>
//                 {(data.partitions || []).length > 0 ? (
//                   <ResponsiveContainer width="100%" height={200}>
//                     <BarChart data={data.partitions} margin={{ top: 10, right: 15, left: 5, bottom: 40 }}>
//                       <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
//                       <XAxis
//                         dataKey="_id"
//                         angle={45}
//                         textAnchor="start"
//                         height={40}
//                         fontSize={10}
//                       />
//                       <YAxis
//                         tickFormatter={formatYAxis}
//                         fontSize={10}
//                         domain={[0, 'auto']}
//                         allowDecimals={false}
//                       />
//                       <Tooltip
//                         formatter={(value: number) => [`${formatTicketCount(value)} tickets`, 'Tickets']}
//                         contentStyle={{ backgroundColor: '#fff', borderRadius: '6px', padding: '4px', border: '1px solid #e5e7eb', fontSize: '10px' }}
//                       />
//                       <Bar dataKey="ticketCount" radius={[4, 4, 0, 0]} isAnimationActive>
//                         {(data.partitions || []).map((entry, index) => (
//                           <Cell
//                             key={`cell-${index}`}
//                             fill={COLORS[index % COLORS.length]}
//                             className="hover:opacity-80 transition-opacity"
//                           />
//                         ))}
//                       </Bar>
//                     </BarChart>
//                   </ResponsiveContainer>
//                 ) : (
//                   <p className="text-xs text-gray-500">No data available.</p>
//                 )}
//               </div>

//               <div className="p-3 bg-white rounded-lg shadow-md col-span-1 sm:col-span-2 lg:col-span-4">
//                 <h3 className="text-base font-bold text-indigo-600 mb-2">Top Routes by Tickets</h3>
//                 {(data.routePerformanceStats || []).length > 0 ? (
//                   <ResponsiveContainer width="100%" height={200}>
//                     <BarChart data={data.routePerformanceStats} margin={{ top: 10, right: 15, left: 5, bottom: 40 }}>
//                       <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
//                       <XAxis
//                         dataKey="_id.route"
//                         angle={45}
//                         textAnchor="start"
//                         height={40}
//                         fontSize={10}
//                       />
//                       <YAxis
//                         tickFormatter={formatYAxis}
//                         fontSize={10}
//                         domain={[0, 'auto']}
//                         allowDecimals={false}
//                       />
//                       <Tooltip
//                         formatter={(value: number) => [`${formatTicketCount(value)} tickets`, 'Tickets']}
//                         contentStyle={{ backgroundColor: '#fff', borderRadius: '6px', padding: '4px', border: '1px solid #e5e7eb', fontSize: '10px' }}
//                       />
//                       <Bar dataKey="ticketCount" radius={[4, 4, 0, 0]} isAnimationActive>
//                         {(data.routePerformanceStats || []).map((entry, index) => (
//                           <Cell
//                             key={`cell-${index}`}
//                             fill={COLORS[index % COLORS.length]}
//                             className="hover:opacity-80 transition-opacity"
//                           />
//                         ))}
//                       </Bar>
//                     </BarChart>
//                   </ResponsiveContainer>
//                 ) : (
//                   <p className="text-xs text-gray-500">No data available.</p>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       </SubpageGuard>
//     </ProtectedRoute>
//   );
// }
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import SubpageGuard from '../../components/SubpageGuard';
import ProtectedRoute from '../../components/ProtectedRoute';
import Select from 'react-select';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import '../../../styles/globals.css';

// Interfaces for type safety
interface TopCountry {
  _id: string;
  totalFare: number;
  ticketCount: number;
}

interface Partition {
  _id: string;
  ticketCount: number;
}

interface Channel {
  _id: string;
  ticketCount: number;
}

interface RoutePerformance {
  _id: { route: string };
  totalFare: number;
  ticketCount: number;
}

interface DashboardData {
  years: number[];
  months: number[];
  airlines: string[];
  topCountries: TopCountry[];
  partitions: Partition[];
  channels: Channel[];
  routePerformanceStats: RoutePerformance[];
  totalCountryCount: number;
  totalPaxCount: number;
  totalAgentCount: number;
}

interface DashboardResponse {
  years: number[];
  months: number[];
  airlines: string[];
  topCountries: TopCountry[];
  partitions: Partition[];
  channels: Channel[];
  routePerformanceStats: RoutePerformance[];
  totalCountryCount: number;
  totalPaxCount: number;
  totalAgentCount: number;
}

export default function DashboardManagement() {
  const [data, setData] = useState<DashboardData>({
    years: [],
    months: [],
    airlines: [],
    topCountries: [],
    partitions: [],
    channels: [],
    routePerformanceStats: [],
    totalCountryCount: 0,
    totalPaxCount: 0,
    totalAgentCount: 0,
  });
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedAirlines, setSelectedAirlines] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [transcode, setTranscode] = useState<"SALE" | "EXCH">("SALE");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [quickStats, setQuickStats] = useState<{
    totalFare: number;
    totalTicketCount: number;
    totalCountryCount: number;
    totalPaxCount: number;
    totalAgentCount: number;
  } | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://192.168.198.209:8080/api";

  if (!process.env.NEXT_PUBLIC_API_URL) {
    console.warn("NEXT_PUBLIC_API_URL not set, using fallback:", apiUrl);
  }

  const cache = useMemo(() => new Map<string, DashboardData>(), []);

  const debounce = useCallback((fn: (...args: any[]) => void, delay: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  }, []);

  const fetchData = useCallback(async (queryParams: Record<string, string | undefined>, retryCount = 0) => {
    setLoading(true);
    setErrorMessage("");
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) query.append(key, value);
    }
    const cacheKey = query.toString();
    if (cache.has(cacheKey)) {
      const cachedData = cache.get(cacheKey)!;
      setData(cachedData);
      setQuickStats({
        totalFare: cachedData.topCountries.reduce((sum, c) => sum + c.totalFare, 0),
        totalTicketCount: cachedData.topCountries.reduce((sum, c) => sum + c.ticketCount, 0),
        totalCountryCount: cachedData.totalCountryCount,
        totalPaxCount: cachedData.totalPaxCount,
        totalAgentCount: cachedData.totalAgentCount,
      });
      setLoading(false);
      return;
    }
    try {
      const url = `${apiUrl}/dashboardManagement?${query}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const responseData: DashboardResponse = await response.json();
      if (!responseData || typeof responseData !== 'object') {
        throw new Error("Invalid response format");
      }
      const validatedData: DashboardData = {
        years: Array.isArray(responseData.years)
          ? responseData.years.filter((n: number) => !isNaN(n))
          : [],
        months: Array.isArray(responseData.months)
          ? responseData.months.filter((n: number) => !isNaN(n) && n >= 1 && n <= 12)
          : [],
        airlines: Array.isArray(responseData.airlines) ? responseData.airlines.filter(a => typeof a === 'string') : [],
        topCountries: Array.isArray(responseData.topCountries) ? responseData.topCountries : [],
        partitions: Array.isArray(responseData.partitions) ? responseData.partitions : [],
        channels: Array.isArray(responseData.channels) ? responseData.channels : [],
        routePerformanceStats: Array.isArray(responseData.routePerformanceStats) ? responseData.routePerformanceStats : [],
        totalCountryCount: typeof responseData.totalCountryCount === 'number' ? responseData.totalCountryCount : 0,
        totalPaxCount: typeof responseData.totalPaxCount === 'number' ? responseData.totalPaxCount : 0,
        totalAgentCount: typeof responseData.totalAgentCount === 'number' ? responseData.totalAgentCount : 0,
      };
      cache.set(cacheKey, validatedData);
      setData(validatedData);
      setQuickStats({
        totalFare: validatedData.topCountries.reduce((sum, c) => sum + c.totalFare, 0),
        totalTicketCount: validatedData.topCountries.reduce((sum, c) => sum + c.ticketCount, 0),
        totalCountryCount: validatedData.totalCountryCount,
        totalPaxCount: validatedData.totalPaxCount,
        totalAgentCount: validatedData.totalAgentCount,
      });
      setErrorMessage("");
    } catch (error) {
      console.error("Fetch error:", error, { url: `${apiUrl}/dashboardManagement?${query}`, retryCount });
      const errorMsg = error instanceof Error ? error.message : String(error);
      if (errorMsg.includes('NetworkError') && retryCount < 2) {
        setTimeout(() => fetchData(queryParams, retryCount + 1), 1000);
        return;
      }
      setErrorMessage(`Failed to load data: ${errorMsg}. Please check the backend or network.`);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, cache]);

  const debouncedFetchData = useMemo(() => debounce(fetchData, 300), [fetchData]);

  useEffect(() => {
    fetchData({ transcode: "SALE" });
  }, [fetchData]);

  const handleYearChange = (selected: { value: string } | null) => {
    const value = selected ? selected.value : null;
    setSelectedYear(value);
    setSelectedMonth(null);
    setSelectedAirlines(null);
    setSelectedChannel(null);
    debouncedFetchData({
      year: value || undefined,
      month: undefined,
      AirlinesTKT: undefined,
      Channel: undefined,
      transcode,
    });
  };

  const handleMonthChange = (selected: { value: string } | null) => {
    const value = selected ? selected.value : null;
    if (!selectedYear && value) {
      setErrorMessage("Please select a year before selecting a month.");
      return;
    }
    setSelectedMonth(value);
    setSelectedAirlines(null);
    setSelectedChannel(null);
    debouncedFetchData({
      year: selectedYear || undefined,
      month: value || undefined,
      AirlinesTKT: undefined,
      Channel: undefined,
      transcode,
    });
  };

  const handleAirlinesChange = (selected: { value: string } | null) => {
    const value = selected ? selected.value : null;
    setSelectedAirlines(value);
    debouncedFetchData({
      year: selectedYear || undefined,
      month: selectedMonth || undefined,
      AirlinesTKT: value || undefined,
      Channel: selectedChannel || undefined,
      transcode,
    });
  };

  const handleChannelChange = (selected: { value: string } | null) => {
    const value = selected ? selected.value : null;
    setSelectedChannel(value);
    debouncedFetchData({
      year: selectedYear || undefined,
      month: selectedMonth || undefined,
      AirlinesTKT: selectedAirlines || undefined,
      Channel: value || undefined,
      transcode,
    });
  };

  const handleTranscodeToggle = () => {
    const newTranscode = transcode === "SALE" ? "EXCH" : "SALE";
    setTranscode(newTranscode);
    debouncedFetchData({
      year: selectedYear || undefined,
      month: selectedMonth || undefined,
      AirlinesTKT: selectedAirlines || undefined,
      Channel: selectedChannel || undefined,
      transcode: newTranscode,
    });
  };

  const clearCache = () => {
    cache.clear();
    fetchData({
      year: selectedYear || undefined,
      month: selectedMonth || undefined,
      AirlinesTKT: selectedAirlines || undefined,
      Channel: selectedChannel || undefined,
      transcode,
    });
  };

  const yearOptions = useMemo(() => (data.years || []).map(y => ({ value: y.toString(), label: y.toString() })), [data.years]);
  const monthOptions = useMemo(() => (data.months || []).map(m => ({ value: m.toString(), label: getMonthName(m) })), [data.months]);
  const airlineOptions = useMemo(() => (data.airlines || []).map(a => ({ value: a, label: a })), [data.airlines]);
  const channelOptions = useMemo(() => (data.channels || []).map(c => ({ value: c._id, label: c._id })), [data.channels]);

  const totalFare = useMemo(() => quickStats?.totalFare || 0, [quickStats]);
  const totalTicketCount = useMemo(() => quickStats?.totalTicketCount || 0, [quickStats]);
  const totalCountryCount = useMemo(() => quickStats?.totalCountryCount || 0, [quickStats]);
  const totalPaxCount = useMemo(() => quickStats?.totalPaxCount || 0, [quickStats]);
  const totalAgentCount = useMemo(() => quickStats?.totalAgentCount || 0, [quickStats]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#3b82f6', '#f97316', '#6b7280'];

  const formatYAxis = (tick: number) => (tick >= 1000 ? `${(tick / 1000).toFixed(1)}K` : tick.toString());
  const formatCurrency = (value: number, currency: string = 'IDR') => `${currency} ${value.toLocaleString()}`;
  const formatTicketCount = (value: number) => value.toLocaleString();

  function getMonthName(month: number): string {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return month >= 1 && month <= 12 ? monthNames[month - 1] : 'Unknown';
  }

  return (
    <ProtectedRoute>
      <SubpageGuard requiredAccess="dtwbs">
        <div className="p-2 sm:p-3 bg-background text-gray-900 font-inter">
          <header className="mb-4 bg-gradient-to-r from-red-700 via-red-900 to-zinc-600 text-white p-5 rounded-2xl shadow-lg border border-red-500">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight flex items-center gap-2">
                  <span className="inline-block bg-white text-black px-2 py-0.5 rounded shadow-sm text-sm">Wibisono</span>
                  Dashboard <span className="text-gray-100">({transcode} - {selectedYear || 'All'})</span>
                </h1>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold tracking-wide text-gray-100">EXCH</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={transcode === "SALE"}
                      onChange={handleTranscodeToggle}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-red-700 rounded-full peer peer-checked:bg-red-500 transition-colors duration-300 ease-in-out shadow-inner">
                      <div
                        className={`absolute w-6 h-6 bg-white rounded-full shadow-md ring-1 ring-black/10 transform transition-transform duration-200 ease-in-out ${
                          transcode === "SALE" ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </div>
                  </label>
                  <span className="text-xs font-semibold tracking-wide text-gray-100">SALE</span>
                  <button
                    onClick={clearCache}
                    className="px-3 py-1.5 text-gray-100 bg-red-500 hover:bg-red-600 transition-colors duration-200 text-xs rounded-full shadow-md font-semibold"
                  >
                    Clear Cache
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="w-full">
                  <h3 className="text-xs font-semibold mb-1 text-gray-100">Year</h3>
                  <Select
                    options={yearOptions}
                    onChange={handleYearChange}
                    placeholder="Select Year"
                    isClearable
                    isDisabled={loading}
                    className="text-xs"
                    styles={{
                      control: (base) => ({
                        ...base,
                        fontSize: '0.75rem',
                        borderRadius: '8px',
                        borderColor: '#f87171',
                        boxShadow: '0 0 4px rgba(255,255,255,0.15)',
                        padding: '2px',
                        minHeight: '30px',
                        '&:hover': { borderColor: '#ef4444' },
                      }),
                      option: (base, { isFocused }) => ({
                        ...base,
                        fontSize: '0.75rem',
                        backgroundColor: isFocused ? '#fee2e2' : 'white',
                        color: '#1f2937',
                      }),
                      singleValue: (base) => ({
                        ...base,
                        fontSize: '0.75rem',
                        color: '#1f2937',
                      }),
                      placeholder: (base) => ({
                        ...base,
                        fontSize: '0.75rem',
                        color: '#9ca3af',
                      }),
                    }}
                    value={yearOptions.find(option => option.value === selectedYear) || null}
                  />
                </div>

                <div className="w-full">
                  <h3 className="text-xs font-semibold mb-1 text-gray-100">Month</h3>
                  <Select
                    options={monthOptions}
                    onChange={handleMonthChange}
                    placeholder="Select Month"
                    isClearable
                    isDisabled={loading || !selectedYear}
                    className="text-xs"
                    styles={{
                      control: (base) => ({
                        ...base,
                        fontSize: '0.75rem',
                        borderRadius: '8px',
                        borderColor: '#f87171',
                        boxShadow: '0 0 4px rgba(255,255,255,0.15)',
                        padding: '2px',
                        minHeight: '30px',
                        '&:hover': { borderColor: '#ef4444' },
                      }),
                      option: (base, { isFocused }) => ({
                        ...base,
                        fontSize: '0.75rem',
                        backgroundColor: isFocused ? '#fee2e2' : 'white',
                        color: '#1f2937',
                      }),
                      singleValue: (base) => ({
                        ...base,
                        fontSize: '0.75rem',
                        color: '#1f2937',
                      }),
                      placeholder: (base) => ({
                        ...base,
                        fontSize: '0.75rem',
                        color: '#9ca3af',
                      }),
                    }}
                    value={monthOptions.find(option => option.value === selectedMonth) || null}
                  />
                </div>
                <div className="w-full">
                  <h3 className="text-xs font-semibold mb-1 text-gray-100">Airline</h3>
                  <Select
                    options={airlineOptions}
                    onChange={handleAirlinesChange}
                    placeholder="Select Airline"
                    isClearable
                    isDisabled={loading}
                    className="text-xs"
                    styles={{
                      control: (base) => ({
                        ...base,
                        fontSize: '0.75rem',
                        borderRadius: '8px',
                        borderColor: '#f87171',
                        boxShadow: '0 0 4px rgba(255,255,255,0.15)',
                        padding: '2px',
                        minHeight: '30px',
                        '&:hover': { borderColor: '#ef4444' },
                      }),
                      option: (base, { isFocused }) => ({
                        ...base,
                        fontSize: '0.75rem',
                        backgroundColor: isFocused ? '#fee2e2' : 'white',
                        color: '#1f2937',
                        padding: '4px 8px',
                        '&:active': { backgroundColor: '#fecaca' },
                      }),
                      singleValue: (base) => ({
                        ...base,
                        fontSize: '0.75rem',
                        color: '#1f2937',
                      }),
                      placeholder: (base) => ({
                        ...base,
                        fontSize: '0.75rem',
                        color: '#9ca3af',
                      }),
                    }}
                    value={airlineOptions.find(option => option.value === selectedAirlines) || null}
                  />
                </div>

                <div className="w-full">
                  <h3 className="text-xs font-semibold mb-1 text-gray-100">Channel</h3>
                  <Select
                    options={channelOptions}
                    onChange={handleChannelChange}
                    placeholder="Select Channel"
                    isClearable
                    isDisabled={loading}
                    className="text-xs"
                    styles={{
                      control: (base) => ({
                        ...base,
                        fontSize: '0.75rem',
                        borderRadius: '8px',
                        borderColor: '#f87171',
                        boxShadow: '0 0 4px rgba(255,255,255,0.15)',
                        padding: '2px',
                        minHeight: '30px',
                        '&:hover': { borderColor: '#ef4444' },
                      }),
                      option: (base, { isFocused }) => ({
                        ...base,
                        fontSize: '0.75rem',
                        backgroundColor: isFocused ? '#fee2e2' : 'white',
                        color: '#1f2937',
                        padding: '4px 8px',
                        '&:active': { backgroundColor: '#fecaca' },
                      }),
                      singleValue: (base) => ({
                        ...base,
                        fontSize: '0.75rem',
                        color: '#fef3c7',
                      }),
                      placeholder: (base) => ({
                        ...base,
                        fontSize: '0.75rem',
                        color: '#9ca3af',
                      }),
                    }}
                    value={channelOptions.find(option => option.value === selectedChannel) || null}
                  />
                </div>
              </div>
            </div>
          </header>

          {errorMessage && (
            <div className="mb-2 p-2 bg-red-50 text-red-700 rounded-md shadow-sm border border-red-200 text-xs">
              {errorMessage}
              <button
                onClick={() => fetchData({
                  year: selectedYear || undefined,
                  month: selectedMonth || undefined,
                  AirlinesTKT: selectedAirlines || undefined,
                  Channel: selectedChannel || undefined,
                  transcode,
                })}
                className="ml-2 px-2 py-1 bg-indigo-500 text-white rounded text-xs hover:bg-indigo-600"
              >
                Retry
              </button>
            </div>
          )}

          {loading && !quickStats ? (
            <div className="flex justify-center items-center h-32">
              <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              <div className="p-3 bg-white rounded-lg shadow-md transition-transform hover:scale-[1.02] col-span-1">
                <h3 className="text-base font-bold text-indigo-600 mb-2">Quick Stats</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Total Tickets</p>
                    <p className="text-sm font-bold text-indigo-700">{quickStats ? formatTicketCount(totalTicketCount) : 'Loading...'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600">Total Country Count</p>
                    <p className="text-sm font-bold text-indigo-700">{quickStats ? formatTicketCount(totalCountryCount) : 'Loading...'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600">Total Pax</p>
                    <p className="text-sm font-bold text-indigo-700">{quickStats ? formatTicketCount(totalPaxCount) : 'Loading...'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600">Total Agent</p>
                    <p className="text-sm font-bold text-indigo-700">{quickStats ? formatTicketCount(totalAgentCount) : 'Loading...'}</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg shadow-md col-span-1 sm:col-span-2 lg:col-span-3">
                <h3 className="text-base font-bold text-indigo-600 mb-2">Top Countries by Tickets</h3>
                {(data.topCountries || []).length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={data.topCountries} margin={{ top: 10, right: 15, left: 5, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="_id"
                        angle={45}
                        textAnchor="start"
                        height={40}
                        fontSize={10}
                      />
                      <YAxis
                        tickFormatter={formatYAxis}
                        fontSize={10}
                        domain={[0, 'auto']}
                        allowDecimals={false}
                      />
                      <Tooltip
                        formatter={(value: number) => [`${formatTicketCount(value)} tickets`, 'Tickets']}
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '6px', padding: '4px', border: '1px solid #e5e7eb', fontSize: '10px' }}
                      />
                      <Bar dataKey="ticketCount" radius={[4, 4, 0, 0]} isAnimationActive>
                        {(data.topCountries || []).map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            className="hover:opacity-80 transition-opacity"
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-gray-500">No data available.</p>
                )}
              </div>

              <div className="p-3 bg-white rounded-lg shadow-md col-span-1 lg:col-span-2">
                <h3 className="text-base font-bold text-indigo-600 mb-2">Tickets by Channel</h3>
                {(data.channels || []).length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={data.channels}
                        dataKey="ticketCount"
                        nameKey="_id"
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        label={({ name, value }) => `${name}: ${formatTicketCount(value)}`}
                        labelLine={{ stroke: "#4b5563", strokeWidth: 1 }}
                        isAnimationActive
                        onClick={(data) => handleChannelChange({ value: data._id })}
                      >
                        {(data.channels || []).map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            className="hover:opacity-80 transition-opacity"
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [`${formatTicketCount(value)} tickets`, 'Tickets']}
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '6px', padding: '4px', border: '1px solid #e5e7eb', fontSize: '10px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '10px', color: '#4b5563' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-gray-500">No data available.</p>
                )}
              </div>

              <div className="p-3 bg-white rounded-lg shadow-md col-span-1 lg:col-span-2">
                <h3 className="text-base font-bold text-indigo-600 mb-2">Tickets by Partition</h3>
                {(data.partitions || []).length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={data.partitions} margin={{ top: 10, right: 15, left: 5, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="_id"
                        angle={45}
                        textAnchor="start"
                        height={40}
                        fontSize={10}
                      />
                      <YAxis
                        tickFormatter={formatYAxis}
                        fontSize={10}
                        domain={[0, 'auto']}
                        allowDecimals={false}
                      />
                      <Tooltip
                        formatter={(value: number) => [`${formatTicketCount(value)} tickets`, 'Tickets']}
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '6px', padding: '4px', border: '1px solid #e5e7eb', fontSize: '10px' }}
                      />
                      <Bar dataKey="ticketCount" radius={[4, 4, 0, 0]} isAnimationActive>
                        {(data.partitions || []).map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            className="hover:opacity-80 transition-opacity"
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-gray-500">No data available.</p>
                )}
              </div>

              <div className="p-3 bg-white rounded-lg shadow-md col-span-1 sm:col-span-2 lg:col-span-4">
                <h3 className="text-base font-bold text-indigo-600 mb-2">Top Routes by Tickets</h3>
                {(data.routePerformanceStats || []).length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={data.routePerformanceStats} margin={{ top: 10, right: 15, left: 5, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="_id.route"
                        angle={45}
                        textAnchor="start"
                        height={40}
                        fontSize={10}
                      />
                      <YAxis
                        tickFormatter={formatYAxis}
                        fontSize={10}
                        domain={[0, 'auto']}
                        allowDecimals={false}
                      />
                      <Tooltip
                        formatter={(value: number) => [`${formatTicketCount(value)} tickets`, 'Tickets']}
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '6px', padding: '4px', border: '1px solid #e5e7eb', fontSize: '10px' }}
                      />
                      <Bar dataKey="ticketCount" radius={[4, 4, 0, 0]} isAnimationActive>
                        {(data.routePerformanceStats || []).map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            className="hover:opacity-80 transition-opacity"
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-gray-500">No data available.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </SubpageGuard>
    </ProtectedRoute>
  );
}