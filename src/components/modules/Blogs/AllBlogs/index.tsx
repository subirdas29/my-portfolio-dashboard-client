/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash, Eye, Calendar, Filter, CalendarDays } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import DeleteConfirmationModal from "@/components/ui/core/PortfolioModal/DeleteConfirmationModal";
import { PortfolioTable } from "@/components/ui/core/PortfolioTable";

import { deleteBlog } from "@/services/Blogs";
import { TBlogs } from "@/types/blogs";

const AllBlogsTable = ({ blogs }: { blogs: TBlogs[] }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // ফিল্টার স্টেটস
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [timeRange, setTimeRange] = useState<string>("all"); // today, week, month, all
  const [specificDate, setSpecificDate] = useState<string>(""); // নির্দিষ্ট তারিখ

  const router = useRouter();

  // ক্যাটাগরি লিস্ট
  const categories = useMemo(() => {
    const unique = Array.from(new Set(blogs?.map((b) => b.category)));
    return ["All", ...unique];
  }, [blogs]);

  // ফিল্টারিং এবং সর্টিং লজিক
  const filteredBlogs = useMemo(() => {
    let result = [...(blogs || [])];

    // ১. ক্যাটাগরি ফিল্টার
    if (categoryFilter !== "All") {
      result = result.filter((blog) => blog.category === categoryFilter);
    }

    // ২. টাইম রেঞ্জ ফিল্টার (Today, 7 days, 30 days)
    const now = new Date();
    if (timeRange !== "all") {
      result = result.filter((blog) => {
        const blogDate = new Date(blog.createdAt || "");
        const diffInDays = (now.getTime() - blogDate.getTime()) / (1000 * 3600 * 24);

        if (timeRange === "today") return diffInDays < 1;
        if (timeRange === "week") return diffInDays <= 7;
        if (timeRange === "month") return diffInDays <= 30;
        return true;
      });
    }

    // ৩. নির্দিষ্ট তারিখ ফিল্টার (যদি ইউজার ক্যালেন্ডার থেকে ডেট সিলেক্ট করে)
    if (specificDate) {
      result = result.filter((blog) => {
        const blogDate = new Date(blog.createdAt || "").toISOString().split("T")[0];
        return blogDate === specificDate;
      });
    }

    // ডিফল্ট সর্ট: নতুনগুলো আগে
    return result.sort((a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime());
  }, [blogs, categoryFilter, timeRange, specificDate]);

  const handleDeleteConfirm = async () => {
    try {
      if (selectedId) {
        const res = await deleteBlog(selectedId);
        if (res.success) {
          toast.success(res.message);
          setModalOpen(false);
        }
      }
    } catch (err) {
      toast.error("Failed to delete blog.");
    }
  };

  const columns = useMemo<ColumnDef<TBlog>[]>(() => [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => <span className="font-bold text-gray-800 dark:text-gray-200">{row.original.title}</span>,
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold rounded">
          {row.original.category}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Published Date",
      cell: ({ row }) => (
        <span className="text-sm text-gray-500">
          {new Date(row.original.createdAt as string).toLocaleDateString("en-GB")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex space-x-3">
          <button className="text-yellow-600" onClick={() => router.push(`/blogs/${row.original._id}`)}><Eye className="w-5 h-5" /></button>
          <button className="text-green-500" onClick={() => router.push(`/blogs/update-blog/${row.original._id}`)}><Edit className="w-5 h-5" /></button>
          <button className="text-red-500" onClick={() => {
            setSelectedId(row.original._id as string);
            setSelectedTitle(row.original.title);
            setModalOpen(true);
          }}><Trash className="w-5 h-5" /></button>
        </div>
      ),
    },
  ], [router]);

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-white/5">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-8 gap-6">
        <h1 className="text-2xl font-black">Blog Management</h1>

        <div className="flex flex-wrap items-center gap-4">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

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
                setTimeRange("all"); // ডেট সিলেক্ট করলে টাইম রেঞ্জ 'all' হয়ে যাবে
              }}
              className="bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          
          {/* Reset Button */}
          {(categoryFilter !== "All" || timeRange !== "all" || specificDate !== "") && (
            <button 
              onClick={() => {
                setCategoryFilter("All");
                setTimeRange("all");
                setSpecificDate("");
              }}
              className="text-xs font-bold text-red-500 hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <PortfolioTable columns={columns} data={filteredBlogs} isSortable={false} />
      </div>

      <DeleteConfirmationModal
        name={selectedTitle}
        isOpen={isModalOpen}
        onOpenChange={setModalOpen}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default AllBlogsTable;