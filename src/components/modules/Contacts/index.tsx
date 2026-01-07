/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Trash, Eye, CheckCircle2, AlertCircle, Calendar, Phone, Mail, User, X, ChevronLeft, ChevronRight, RotateCcw, Database, Filter, MessageSquareText } from "lucide-react";
import { useState } from "react";
import { PortfolioTable } from "@/components/ui/core/PortfolioTable";
import DeleteConfirmationModal from "@/components/ui/core/PortfolioModal/DeleteConfirmationModal";
import { toast } from "sonner";
import { TContact } from "@/types/contacts";
import { deleteContact, updateContactStatus } from "@/services/contacts";
import { useRouter, usePathname, useSearchParams } from "next/navigation";


// --- Detail View Modal (Updated with Scrollable Message) ---
const ViewMessageModal = ({ data, isOpen, onClose }: { data: TContact | null, isOpen: boolean, onClose: () => void }) => {
    if (!isOpen || !data) return null;
    
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border dark:border-gray-800">
                
                {/* Modal Header */}
                <div className="flex justify-between items-center p-6 border-b dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                            <User className="w-5 h-5 text-amber-600" />
                        </div>
                        <h3 className="text-xl font-black italic text-gray-800 dark:text-white uppercase tracking-tighter">Lead Details</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-amber-500/20 shrink-0">
                                {data.name[0].toUpperCase()}
                            </div>
                            <div>
                                <h4 className="text-lg font-black text-gray-900 dark:text-white leading-tight">{data.name}</h4>
                                <p className="text-xs text-gray-500 font-bold flex items-center gap-1 mt-1">
                                    <Calendar className="w-3 h-3"/> {new Date(data.createdAt as string).toLocaleString('en-GB')}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                                <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                                <span className="text-sm font-bold text-blue-900 dark:text-blue-300 break-all">{data.email}</span>
                            </div>
                            
                            {data.phone && (
                                <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                                    <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span className="text-sm font-bold text-emerald-900 dark:text-emerald-300">{data.phone}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Message Content with Scrollability */}
                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Message Body</p>
                        <div className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border dark:border-gray-700 shadow-inner">
                            <div className="max-h-[200px] overflow-y-auto pr-2 custom-scrollbar text-sm leading-relaxed italic text-gray-700 dark:text-gray-300">
                                "{data.message}"
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 flex justify-end bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-800">
                    <button 
                        onClick={onClose} 
                        className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                    >
                        Done Reading
                    </button>
                </div>
            </div>
        </div>
    );
};

const ManageContacts = ({ contact, meta }: { contact: TContact[], meta: any }) => {
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isViewModalOpen, setViewModalOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState<TContact | null>(null);

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const updateQuery = (newParams: Record<string, string | undefined>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(newParams).forEach(([key, value]) => {
            if (value) params.set(key, value);
            else params.delete(key);
        });
        
        if (newParams.createdAt) params.delete("range");
        if (newParams.range) params.delete("createdAt");

        if (!newParams.page) params.set("page", "1"); 
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        const toastId = toast.loading("Updating Pipeline...");
        try {
            const res = await updateContactStatus(id, newStatus);
            if (res.success) toast.success(`Moved to ${newStatus}`, { id: toastId });
        } catch (error) { toast.error("Update failed", { id: toastId }); }
    };

    const columns: ColumnDef<TContact>[] = [
        {
            accessorKey: "createdAt",
            header: "Date",
            cell: ({ row }) => (
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-tight whitespace-nowrap">
                    {new Date(row.original.createdAt as string).toLocaleDateString("en-GB")}
                </div>
            )
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <select 
                    value={row.original.status || "Pending"}
                    onChange={(e) => handleStatusChange(row.original._id as string, e.target.value)}
                    className="text-[10px] font-black uppercase py-1.5 px-2 rounded-lg border-2 bg-white dark:bg-gray-800 outline-none cursor-pointer"
                >
                    <option value="Pending">🆕 NEW</option>
                    <option value="Replied">✉️ REPLIED</option>
                    <option value="No Response">🔇 GHOSTED</option>
                    <option value="Dealing">🤝 DEALING</option>
                    <option value="Booked">💰 Booked</option>
                    <option value="Closed">📁 CLOSED</option>
                </select>
            )
        },
        {
            accessorKey: "name",
            header: "Profile",
            cell: ({ row }) => (
                <div className="flex flex-col min-w-[120px]">
                    <span className="font-bold text-sm flex items-center gap-1.5 truncate max-w-[150px]"><User className="w-3 h-3 text-amber-500 shrink-0"/> {row.original.name}</span>
                    <span className="text-[10px] text-gray-400 truncate max-w-[150px]">{row.original.email}</span>
                </div>
            )
        },
        // --- Message Snippet Added Here ---
        {
            accessorKey: "message",
            header: "Message Snippet",
            cell: ({ row }) => (
                <div className="flex items-center gap-2 max-w-[200px]">
                    <MessageSquareText className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                    <p className="text-xs text-gray-500 truncate italic">
                        {row.original.message}
                    </p>
                </div>
            )
        },
        {
            id: "actions",
            header: "Action",
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    <button className="p-2 hover:bg-amber-100 text-amber-600 rounded-xl" onClick={() => { setSelectedContact(row.original); setViewModalOpen(true); }}><Eye className="w-4 h-4" /></button>
                    <button className="p-2 hover:bg-red-50 text-red-500 rounded-xl" onClick={() => { setSelectedContact(row.original); setDeleteModalOpen(true); }}><Trash className="w-4 h-4" /></button>
                </div>
            )
        }
    ];

    const totalPages = Math.ceil((meta?.total || 0) / (meta?.limit || 10));
    const currentPage = Number(meta?.page) || 1;

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-950 p-6 lg:p-10 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5">
                
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
                    <div>
                        <h1 className="text-3xl font-black italic tracking-tighter">Client CRM</h1>
                        <div className="flex flex-wrap gap-3 mt-4">
                            <div className="flex items-center gap-2 bg-gray-900 text-white px-4 py-1.5 rounded-2xl text-xs font-bold shadow-md">
                                <Database className="w-3.5 h-3.5 text-amber-400"/> Total: {meta?.total || 0}
                            </div>
                            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-2xl border border-emerald-100 text-xs font-bold shadow-sm">
                                <CheckCircle2 className="w-3.5 h-3.5"/> Booked: {meta?.totalBooked || 0}
                            </div>
                            <div className="flex items-center gap-2 bg-pink-50 text-pink-700 px-4 py-1.5 rounded-2xl border border-pink-100 text-xs font-bold shadow-sm">
                                <AlertCircle className="w-3.5 h-3.5"/> Ghosted: {meta?.totalGhosted || 0}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-3xl border shadow-inner">
                        <div className="flex items-center gap-2 border-r pr-3">
                            <Filter className="w-3 h-3 text-gray-400" />
                            <select 
                                value={searchParams.get("status") || ""} 
                                onChange={(e) => updateQuery({ status: e.target.value })}
                                className="bg-transparent text-[11px] font-black uppercase outline-none cursor-pointer"
                            >
                                <option value="">ALL STATUS</option>
                                <option value="Pending">🆕 NEW</option>
                                <option value="Replied">✉️ REPLIED</option>
                                <option value="No Response">🔇 GHOSTED</option>
                                <option value="Dealing">🤝 DEALING</option>
                                <option value="Booked">💰 Booked</option>
                                <option value="Closed">📁 CLOSED</option>
                            </select>
                        </div>

                        <select 
                            value={searchParams.get("range") || ""} 
                            onChange={(e) => updateQuery({ range: e.target.value })}
                            className="bg-transparent text-[11px] font-black uppercase outline-none border-r pr-3 cursor-pointer"
                        >
                            <option value="">TIMELINE</option>
                            <option value="today">Today</option>
                            <option value="7">Last 7 Days</option>
                            <option value="15">Last 15 Days</option>
                            <option value="30">Last 30 Days</option>
                        </select>

                        <div className="flex items-center gap-2 px-1">
                           <Calendar className="w-3 h-3 text-gray-400"/>
                           <input 
                                type="date" 
                                value={searchParams.get("createdAt") || ""}
                                onChange={(e) => updateQuery({ createdAt: e.target.value })}
                                className="bg-transparent text-[11px] font-black outline-none cursor-pointer" 
                            />
                        </div>

                        {(searchParams.get("status") || searchParams.get("createdAt") || searchParams.get("range")) && (
                            <button 
                                onClick={() => router.push(pathname)} 
                                className="ml-1 bg-red-500 text-white p-1.5 rounded-full hover:rotate-180 transition-all duration-500 shadow-md active:scale-90"
                            >
                                <RotateCcw className="w-3 h-3"/>
                            </button>
                        )}
                    </div>
                </div>

                <div className="rounded-[1.5rem] overflow-hidden border border-gray-50">
                    <PortfolioTable columns={columns} data={contact} />
                </div>

                <div className="flex items-center justify-center mt-12">
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900/50 p-2 rounded-3xl border">
                        <button 
                            disabled={currentPage <= 1}
                            onClick={() => updateQuery({ page: (currentPage - 1).toString() })}
                            className="p-2 rounded-2xl border bg-white dark:bg-gray-800 shadow-sm disabled:opacity-30 active:scale-95 transition-all"
                        >
                            <ChevronLeft className="w-5 h-5"/>
                        </button>
                        <div className="px-6 py-2 bg-white dark:bg-gray-800 rounded-2xl border shadow-sm">
                            <span className="text-sm font-black italic tracking-widest uppercase">Page {currentPage} / {totalPages || 1}</span>
                        </div>
                        <button 
                            disabled={currentPage >= totalPages}
                            onClick={() => updateQuery({ page: (currentPage + 1).toString() })}
                            className="p-2 rounded-2xl border bg-white dark:bg-gray-800 shadow-sm disabled:opacity-30 active:scale-95 transition-all"
                        >
                            <ChevronRight className="w-5 h-5"/>
                        </button>
                    </div>
                </div>
            </div>

            <ViewMessageModal isOpen={isViewModalOpen} data={selectedContact} onClose={() => setViewModalOpen(false)} />
            
            <DeleteConfirmationModal
                name={selectedContact?.name || ""}
                isOpen={isDeleteModalOpen}
                onOpenChange={setDeleteModalOpen}
                onConfirm={async () => {
                   if(selectedContact?._id) {
                       await deleteContact(selectedContact._id);
                       toast.success("Lead Removed");
                       setDeleteModalOpen(false);
                   }
                }}
            />
        </div>
    );
};

export default ManageContacts;