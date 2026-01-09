"use client";

import { useState, useMemo, useEffect } from "react";
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
    Plus,
    ChevronLeft,
    Users,
    FileText,
    Settings
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
    createdAt: string | null;
    stripeSessionId?: string;
}

interface DashboardClientProps {
    initialPayments: Payment[];
}

type View = "menu" | "payments" | "prices" | "methods" | "users" | "pages";

export default function DashboardClient({ initialPayments }: DashboardClientProps) {
    const [activeView, setActiveView] = useState<View>("menu");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortConfig, setSortConfig] = useState<{
        key: keyof Payment | "dateCount";
        direction: "asc" | "desc";
    } | null>({ key: "createdAt", direction: "desc" });

    const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});
    const [priceInput, setPriceInput] = useState<string>("");
    const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);

    // Fetch current price
    useEffect(() => {
        fetch("/api/settings/price")
            .then(res => res.json())
            .then(data => {
                if (data.amount) {
                    setPriceInput((data.amount / 100).toFixed(2));
                }
            })
            .catch(console.error);
    }, []);

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
            return { key, direction: "desc" };
        });
    };

    const updatePrice = async () => {
        setIsUpdatingPrice(true);
        try {
            const amountPennies = Math.round(parseFloat(priceInput) * 100);
            if (isNaN(amountPennies) || amountPennies < 0) {
                alert("Invalid price");
                return;
            }
            const res = await fetch("/api/settings/price", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: amountPennies })
            });
            if (res.ok) {
                alert("Price updated successfully");
            } else {
                alert("Failed to update price");
            }
        } catch (error) {
            console.error(error);
            alert("Error updating price");
        } finally {
            setIsUpdatingPrice(false);
        }
    };

    const uniqueEmails = useMemo(() => {
        const allEmails = initialPayments
            .map(p => p.email.toLowerCase().trim())
            .filter(email => email !== "");
        return Array.from(new Set(allEmails));
    }, [initialPayments]);

    const renderMenu = () => (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 gap-4">
                <MenuCard
                    title="Payments"
                    count={`${initialPayments.length} items`}
                    onClick={() => setActiveView("payments")}
                />
                <MenuCard
                    title="Prices"
                    count="1 item"
                    onClick={() => setActiveView("prices")}
                />
                <MenuCard
                    title="Payment Methods"
                    count="1 item"
                    onClick={() => setActiveView("methods")}
                />
                <MenuCard
                    title="Users"
                    count={`${uniqueEmails.length} items`}
                    onClick={() => setActiveView("users")}
                />
                <MenuCard
                    title="Pages"
                    count="0 items"
                    onClick={() => setActiveView("pages")}
                />
            </div>
        </div>
    );

    const renderPayments = () => (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
                <button onClick={() => setActiveView("menu")} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold text-white">Payments</h1>
            </div>

            {/* Filters Toolbar */}
            <div className="bg-[#1e1e1e] p-4 rounded-xl shadow-sm border border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search registration, email, zone..."
                        className="w-full pl-10 pr-4 py-2 bg-[#2a2a2a] border border-white/5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter className="text-gray-400 w-4 h-4" />
                    <select
                        className="w-full md:w-48 pl-2 pr-8 py-2 bg-[#2a2a2a] border border-white/5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-white"
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

            {/* Mobile View (Cards) */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {sortedPayments.map((payment) => (
                    <div
                        key={payment._id}
                        className="bg-[#1e1e1e] p-5 rounded-xl border border-white/10 space-y-4"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg text-white">
                                    {payment.registrationNumber}
                                </h3>
                                <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                                    <MapPin className="w-3 h-3" /> {payment.cleanAirZone}
                                </p>
                            </div>
                            <StatusBadge status={payment.status} />
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="p-3 bg-white/5 rounded-lg">
                                <span className="text-gray-500 block text-xs">Dates</span>
                                <button
                                    onClick={() => toggleDateExpansion(payment._id)}
                                    className="font-medium text-blue-400 flex items-center gap-1 mt-1"
                                >
                                    {payment.selectedDates.length} days
                                    {expandedDates[payment._id] ? (
                                        <ChevronUp className="w-3 h-3" />
                                    ) : (
                                        <ChevronDown className="w-3 h-3" />
                                    )}
                                </button>
                                {expandedDates[payment._id] && (
                                    <div className="mt-2 text-xs text-gray-400 space-y-1">
                                        {payment.selectedDates.map((d) => (
                                            <div key={d}>{d}</div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="p-3 bg-white/5 rounded-lg">
                                <span className="text-gray-500 block text-xs">Amount</span>
                                <span className="font-medium text-white">
                                    £{(payment.totalAmount / 100).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop View (Table) */}
            <div className="hidden md:block bg-[#1e1e1e] rounded-xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 border-b border-white/10">
                            <tr>
                                <SortableHeader label="Vehicle" sortKey="registrationNumber" currentSort={sortConfig} onSort={handleSort} />
                                <th className="px-6 py-4 font-semibold text-gray-300">Zone & Type</th>
                                <SortableHeader label="Customer" sortKey="email" currentSort={sortConfig} onSort={handleSort} />
                                <SortableHeader label="Dates" sortKey="dateCount" currentSort={sortConfig} onSort={handleSort} />
                                <SortableHeader label="Amount" sortKey="totalAmount" currentSort={sortConfig} onSort={handleSort} />
                                <SortableHeader label="Status" sortKey="status" currentSort={sortConfig} onSort={handleSort} />
                                <SortableHeader label="Date Created" sortKey="createdAt" currentSort={sortConfig} onSort={handleSort} />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {sortedPayments.map((payment) => (
                                <tr key={payment._id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-medium text-white">
                                        {payment.registrationNumber}
                                        <span className="block text-xs text-gray-500 font-normal">{payment.registrationLocation}</span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400">{payment.cleanAirZone}</td>
                                    <td className="px-6 py-4 text-gray-400">{payment.email}</td>
                                    <td className="px-6 py-4 text-gray-400">{payment.selectedDates.length} days</td>
                                    <td className="px-6 py-4 font-medium text-white">£{(payment.totalAmount / 100).toFixed(2)}</td>
                                    <td className="px-6 py-4"><StatusBadge status={payment.status} /></td>
                                    <td className="px-6 py-4 text-gray-500">{payment.createdAt ? format(new Date(payment.createdAt), "MMM d, HH:mm") : "-"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderPrices = () => (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
                <button onClick={() => setActiveView("menu")} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold text-white">Price Settings</h1>
            </div>
            <div className="bg-[#1e1e1e] p-6 rounded-xl border border-white/10 max-w-md">
                <h2 className="text-lg font-bold text-white mb-4">Daily Charge Settings</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Daily Charge Amount (£)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="w-full bg-[#2a2a2a] border border-white/5 rounded-lg px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500"
                            value={priceInput}
                            onChange={(e) => setPriceInput(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={updatePrice}
                        disabled={isUpdatingPrice}
                        className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {isUpdatingPrice ? "Saving..." : "Update Price"}
                    </button>
                </div>
            </div>
        </div>
    );

    const renderUsers = () => {
        const userStats = uniqueEmails.map(email => {
            const userPayments = initialPayments.filter(p => p.email.toLowerCase().trim() === email);
            const paidCount = userPayments.filter(p => p.status === "paid" || p.status === "completed").length;
            return { email, total: userPayments.length, paid: paidCount };
        });

        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4 mb-4">
                    <button onClick={() => setActiveView("menu")} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-bold text-white">Users</h1>
                </div>
                <div className="bg-[#1e1e1e] rounded-xl border border-white/10 overflow-hidden">
                    <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                        <h2 className="text-sm font-semibold text-gray-300">Unique Users ({uniqueEmails.length})</h2>
                        <span className="text-xs text-gray-500">Total / Paid</span>
                    </div>
                    <div className="divide-y divide-white/5">
                        {userStats.length > 0 ? userStats.map((user, idx) => (
                            <div key={idx} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center">
                                        <Mail className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <span className="text-white font-medium">{user.email}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-white font-bold">{user.total}</span>
                                    <span className="text-gray-500 mx-1">/</span>
                                    <span className="text-green-500 font-bold">{user.paid}</span>
                                </div>
                            </div>
                        )) : (
                            <div className="p-12 text-center text-gray-500 italic">No users found.</div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderPaymentMethods = () => (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
                <button onClick={() => setActiveView("menu")} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold text-white">Payment Methods</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#1e1e1e] p-6 rounded-2xl border border-white/10 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-600 p-3 rounded-xl">
                            <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg">Stripe</h3>
                            <p className="text-gray-500 text-sm">Credit/Debit Cards (Active)</p>
                        </div>
                    </div>
                    <div className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-xs font-bold">
                        ACTIVE
                    </div>
                </div>
            </div>
        </div>
    );

    const renderPlaceholder = (title: string) => (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
                <button onClick={() => setActiveView("menu")} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold text-white">{title}</h1>
            </div>
            <div className="bg-[#1e1e1e] p-12 rounded-xl border border-white/10 text-center">
                <p className="text-gray-500 italic">This module is currently under development.</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#121212] p-4 md:p-8 font-sans selection:bg-blue-500/30">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                    <p className="text-gray-400 font-medium">Dartcrossing Admin</p>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 border-2 border-white/20"></div>
                </div>

                {activeView === "menu" && renderMenu()}
                {activeView === "payments" && renderPayments()}
                {activeView === "prices" && renderPrices()}
                {activeView === "methods" && renderPaymentMethods()}
                {activeView === "users" && renderUsers()}
                {activeView === "pages" && renderPlaceholder("Pages")}
            </div>
        </div>
    );
}

function MenuCard({ title, count, onClick }: { title: string; count: string; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="w-full bg-[#1e1e1e] border border-white/5 hover:border-white/20 p-5 rounded-2xl flex items-center justify-between group transition-all duration-300"
        >
            <div className="text-left">
                <h3 className="text-blue-400 font-bold text-lg mb-1 group-hover:text-blue-300 transition-colors">{title}</h3>
                <p className="text-gray-500 text-sm">{count}</p>
            </div>
            <div className="bg-[#2a2a2a] p-2 rounded-xl group-hover:bg-[#333] transition-colors">
                <Plus className="w-6 h-6 text-gray-400" />
            </div>
        </button>
    );
}

function SortableHeader({ label, sortKey, currentSort, onSort }: { label: string; sortKey: string; currentSort: any; onSort: (key: any) => void }) {
    const isActive = currentSort?.key === sortKey;
    return (
        <th className="px-6 py-4 font-semibold text-gray-300 cursor-pointer group select-none hover:bg-white/5 transition-colors" onClick={() => onSort(sortKey)}>
            <div className="flex items-center gap-1">
                {label}
                <ArrowUpDown className={`w-3 h-3 transition-opacity ${isActive ? "text-blue-500 opacity-100" : "text-gray-500 opacity-0 group-hover:opacity-50"}`} />
            </div>
        </th>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
        paid: "bg-green-500/10 text-green-500 border-green-500/20",
        completed: "bg-green-500/10 text-green-500 border-green-500/20",
        failed: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    const currentStyle = styles[status as keyof typeof styles] || "bg-gray-500/10 text-gray-500 border-gray-500/20";
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${currentStyle} capitalize`}>
            {status}
        </span>
    );
}
