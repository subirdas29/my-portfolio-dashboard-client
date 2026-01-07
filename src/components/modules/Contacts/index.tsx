/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Trash, CalendarDays, Calendar, Filter } from "lucide-react";
import { useState, useMemo } from "react";
import { PortfolioTable } from "@/components/ui/core/PortfolioTable";
import DeleteConfirmationModal from "@/components/ui/core/PortfolioModal/DeleteConfirmationModal";
import { toast } from "sonner";
import { TContact } from "@/types/contacts";
import { deleteContact } from "@/services/contacts";

type TContactProps = {
    contact: TContact[]; 
};

const ManageContacts = ({ contact }: TContactProps) => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<string | null>(null);

    // ১. ফিল্টার স্টেটস
    const [timeRange, setTimeRange] = useState<string>("all");
    const [specificDate, setSpecificDate] = useState<string>("");

    // ২. ফিল্টারিং লজিক
    const filteredContacts = useMemo(() => {
        let result = [...(contact || [])];

        // টাইম রেঞ্জ ফিল্টার (Today, 7 days, 30 days)
        const now = new Date();
        if (timeRange !== "all") {
            result = result.filter((item) => {
                const itemDate = new Date(item.createdAt || "");
                const diffInDays = (now.getTime() - itemDate.getTime()) / (1000 * 3600 * 24);

                if (timeRange === "today") return diffInDays < 1;
                if (timeRange === "week") return diffInDays <= 7;
                if (timeRange === "month") return diffInDays <= 30;
                return true;
            });
        }

        // নির্দিষ্ট তারিখ ফিল্টার
        if (specificDate) {
            result = result.filter((item) => {
                const itemDate = new Date(item.createdAt || "").toISOString().split("T")[0];
                return itemDate === specificDate;
            });
        }

        // লেটেস্ট মেসেজগুলো উপরে দেখানোর জন্য সর্টিং
        return result.sort((a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime());
    }, [contact, timeRange, specificDate]);

    const handleDelete = (data: TContact) => {
        setSelectedId(data?._id ?? null);
        setSelectedItem(data?.name);
        setModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            if (selectedId) {
                const res = await deleteContact(selectedId);
                if (res.success) {
                    toast.success(res.message);
                    setModalOpen(false);
                } else {
                    toast.error(res.message);
                }
            }
        } catch (err: any) {
            toast.error(err?.message || "Failed to delete");
        }
    };

    const columns: ColumnDef<TContact>[] = [
        {
            accessorKey: "createdAt",
            header: "Date",
            cell: ({ row }) => (
                <span className="text-sm text-gray-500">
                    {new Date(row.original.createdAt as string).toLocaleDateString("en-GB")}
                </span>
            ),
        },
        {
            accessorKey: "name",
            header: "Client Name",
            cell: ({ row }) => <span className="font-bold">{row.original.name}</span>,
        },
        {
            accessorKey: "email",
            header: "Client Email",
        },
        {
            accessorKey: "phone",
            header: "Phone",
        },
        {
            accessorKey: "message",
            header: "Message",
            cell: ({ row }) => (
                <p className="max-w-[200px] truncate text-gray-600" title={row.original.message}>
                    {row.original.message}
                </p>
            ),
        },
        {
            accessorKey: "action",
            header: "Action",
            cell: ({ row }) => (
                <button
                    className="text-red-500 hover:text-red-700 transition-colors"
                    onClick={() => handleDelete(row.original)}
                >
                    <Trash className="w-5 h-5" />
                </button>
            ),
        },
    ];

    return (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-white/5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h1 className="text-2xl font-black">Contact Messages</h1>

                {/* ফিল্টার সেকশন */}
                <div className="flex flex-wrap items-center gap-4">
                    {/* Time Range Filter */}
                    <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-gray-400" />
                        <select
                            value={timeRange}
                            onChange={(e) => {
                                setTimeRange(e.target.value);
                                setSpecificDate(""); 
                            }}
                            className="bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
                        >
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="week">Last 7 Days</option>
                            <option value="month">Last 30 Days</option>
                        </select>
                    </div>

                    {/* Specific Date Picker */}
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <input 
                            type="date"
                            value={specificDate}
                            onChange={(e) => {
                                setSpecificDate(e.target.value);
                                setTimeRange("all"); // ডেট সিলেক্ট করলে টাইম রেঞ্জ ক্লিয়ার হবে
                            }}
                            className="bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
                        />
                    </div>

                    {/* Reset Button */}
                    {(timeRange !== "all" || specificDate !== "") && (
                        <button 
                            onClick={() => {
                                setTimeRange("all");
                                setSpecificDate("");
                            }}
                            className="text-xs font-bold text-red-500 hover:underline"
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto">
                <PortfolioTable columns={columns} data={filteredContacts} />
            </div>

            <DeleteConfirmationModal
                name={selectedItem}
                isOpen={isModalOpen}
                onOpenChange={setModalOpen}
                onConfirm={handleDeleteConfirm}
            />
        </div>
    );
};

export default ManageContacts;