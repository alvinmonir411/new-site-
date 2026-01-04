"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import {
    Car,
    Calendar,
    CreditCard,
    Mail,
    MapPin,
    PoundSterling,
    CheckCircle,
    Clock,
    Search,
    Filter,
    ArrowUpDown,
    ChevronDown,
    ChevronUp,
} from "lucide-react";

interface Payment {
    _id: string;
    registrationNumber: string;
    registrationLocation: string;
    vehicleType: string;
    cleanAirZone: string;
    selectedDates: string[];
    email: string;
    totalAmount: number;
    currency: string;
    status: string;
    createdAt: string; // Serialized date
    stripeSessionId?: string;
}

interface DashboardClientProps {
    initialPayments: Payment[];
}

export default function DashboardClient({ initialPayments }: DashboardClientProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortConfig, setSortConfig] = useState<{
        key: keyof Payment | "dateCount";
        direction: "asc" | "desc";
    } | null>({ key: "createdAt", direction: "desc" });

    const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});

    const toggleDateExpansion = (id: string) => {
        setExpandedDates((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const filteredPayments = useMemo(() => {
        return initialPayments.filter((payment) => {
            const matchesSearch =
                payment.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.cleanAirZone.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [initialPayments, searchTerm, statusFilter]);

    const sortedPayments = useMemo(() => {
        if (!sortConfig) return filteredPayments;

        return [...filteredPayments].sort((a, b) => {
            let aValue: any = a[sortConfig.key as keyof Payment];
            let bValue: any = b[sortConfig.key as keyof Payment];

            if (sortConfig.key === "dateCount") {
                aValue = a.selectedDates.length;
                bValue = b.selectedDates.length;
            }

            if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
            return 0;
        });
    }, [filteredPayments, sortConfig]);

    const handleSort = (key: keyof Payment | "dateCount") => {
        setSortConfig((current) => {
            if (current?.key === key) {
                return { key, direction: current.direction === "asc" ? "desc" : "asc" };
            }
            return { key, direction: "desc" }; // Default to desc for new sort
        });
    };

    const totalRevenue =
        sortedPayments.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0) / 100;

    return (
        <div className="space-y-6">
            {/* Filters Toolbar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search registration, email, zone..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter className="text-gray-400 w-4 h-4" />
                    <select
                        className="w-full md:w-48 pl-2 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                    </select>
                </div>
            </div>

            {/* Stats (Filtered) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Filtered Revenue</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                        £{totalRevenue.toFixed(2)}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Shown Orders</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                        {sortedPayments.length}
                    </p>
                </div>
            </div>

            {/* Mobile View (Cards) */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {sortedPayments.map((payment) => (
                    <div
                        key={payment._id}
                        className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 space-y-4"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">
                                    {payment.registrationNumber}
                                </h3>
                                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                    <MapPin className="w-3 h-3" /> {payment.cleanAirZone}
                                </p>
                            </div>
                            <StatusBadge status={payment.status} />
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-500 block text-xs">Dates</span>
                                <button
                                    onClick={() => toggleDateExpansion(payment._id)}
                                    className="font-medium text-blue-600 flex items-center gap-1 mt-1"
                                >
                                    {payment.selectedDates.length} days
                                    {expandedDates[payment._id] ? (
                                        <ChevronUp className="w-3 h-3" />
                                    ) : (
                                        <ChevronDown className="w-3 h-3" />
                                    )}
                                </button>
                                {expandedDates[payment._id] && (
                                    <div className="mt-2 text-xs text-gray-600 space-y-1">
                                        {payment.selectedDates.map((d) => (
                                            <div key={d}>{d}</div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-500 block text-xs">Amount</span>
                                <span className="font-medium text-gray-900">
                                    £{(payment.totalAmount / 100).toFixed(2)}
                                </span>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-gray-100 flex flex-col gap-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <Car className="w-4 h-4 text-gray-400" />
                                {payment.vehicleType}
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-400" />
                                {payment.email}
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                {payment.createdAt
                                    ? format(new Date(payment.createdAt), "PP p")
                                    : "N/A"}
                            </div>
                        </div>
                    </div>
                ))}
                {sortedPayments.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No payments match your search.
                    </div>
                )}
            </div>

            {/* Desktop View (Table) */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <SortableHeader
                                    label="Vehicle"
                                    sortKey="registrationNumber"
                                    currentSort={sortConfig}
                                    onSort={handleSort}
                                />
                                <th className="px-6 py-4 font-semibold text-gray-700">Zone & Type</th>
                                <SortableHeader
                                    label="Customer"
                                    sortKey="email"
                                    currentSort={sortConfig}
                                    onSort={handleSort}
                                />
                                <SortableHeader
                                    label="Dates"
                                    sortKey="dateCount"
                                    currentSort={sortConfig}
                                    onSort={handleSort}
                                />
                                <SortableHeader
                                    label="Amount"
                                    sortKey="totalAmount"
                                    currentSort={sortConfig}
                                    onSort={handleSort}
                                />
                                <SortableHeader
                                    label="Status"
                                    sortKey="status"
                                    currentSort={sortConfig}
                                    onSort={handleSort}
                                />
                                <SortableHeader
                                    label="Date Created"
                                    sortKey="createdAt"
                                    currentSort={sortConfig}
                                    onSort={handleSort}
                                />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {sortedPayments.map((payment) => (
                                <tr
                                    key={payment._id}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {payment.registrationNumber}
                                        <span className="block text-xs text-gray-500 font-normal">
                                            {payment.registrationLocation}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900">
                                                {payment.cleanAirZone}
                                            </span>
                                            <span className="text-xs">{payment.vehicleType}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <span className="truncate max-w-[150px]" title={payment.email}>
                                                {payment.email}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        <div className="relative">
                                            <button
                                                onClick={() => toggleDateExpansion(payment._id)}
                                                className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                                            >
                                                <span className="underline decoration-dotted">
                                                    {payment.selectedDates.length} days
                                                </span>
                                                {expandedDates[payment._id] ? (
                                                    <ChevronUp className="w-3 h-3" />
                                                ) : (
                                                    <ChevronDown className="w-3 h-3" />
                                                )}
                                            </button>

                                            {expandedDates[payment._id] && (
                                                <div className="absolute z-20 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 p-2 text-xs animate-in fade-in zoom-in-95 duration-100">
                                                    <div className="font-semibold text-gray-900 mb-1 px-1">Selected Dates:</div>
                                                    <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
                                                        {payment.selectedDates.map(date => (
                                                            <div key={date} className="px-2 py-1 bg-gray-50 rounded text-gray-600">
                                                                {date}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        £{(payment.totalAmount / 100).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={payment.status} />
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {payment.createdAt
                                            ? format(new Date(payment.createdAt), "MMM d, yyyy HH:mm")
                                            : "-"}
                                    </td>
                                </tr>
                            ))}

                            {sortedPayments.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-6 py-12 text-center text-gray-500"
                                    >
                                        No payments match your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function SortableHeader({
    label,
    sortKey,
    currentSort,
    onSort,
}: {
    label: string;
    sortKey: string;
    currentSort: any;
    onSort: (key: any) => void;
}) {
    const isActive = currentSort?.key === sortKey;

    return (
        <th
            className="px-6 py-4 font-semibold text-gray-700 cursor-pointer group select-none hover:bg-gray-100 transition-colors"
            onClick={() => onSort(sortKey)}
        >
            <div className="flex items-center gap-1">
                {label}
                <ArrowUpDown className={`w-3 h-3 transition-opacity ${isActive ? "text-blue-500 opacity-100" : "text-gray-400 opacity-0 group-hover:opacity-50"}`} />
            </div>
        </th>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
        paid: "bg-green-100 text-green-700 border-green-200",
        completed: "bg-green-100 text-green-700 border-green-200",
        failed: "bg-red-100 text-red-700 border-red-200",
    };

    const currentStyle =
        styles[status as keyof typeof styles] ||
        "bg-gray-100 text-gray-700 border-gray-200";

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${currentStyle} capitalize`}
        >
            {status === "pending" && <Clock className="w-3 h-3 mr-1" />}
            {status === "paid" && <CheckCircle className="w-3 h-3 mr-1" />}
            {status}
        </span>
    );
}
