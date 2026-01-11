
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash, Eye, Calendar, Filter, CalendarDays, BarChart3 } from "lucide-react";
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

  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [timeRange, setTimeRange] = useState<string>("all");
  const [specificDate, setSpecificDate] = useState<string>(""); 

  const router = useRouter();

  const categories = useMemo(() => {
    const unique = Array.from(new Set(blogs?.map((b) => b.category)));
    return ["All", ...unique.filter(Boolean)];
  }, [blogs]);

  const filteredBlogs = useMemo(() => {
    let result = [...(blogs || [])];

    if (categoryFilter !== "All") {
      result = result.filter((blog) => blog.category === categoryFilter);
    }

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

    if (specificDate) {
      result = result.filter((blog) => {
        const blogDate = new Date(blog.createdAt || "").toISOString().split("T")[0];
        return blogDate === specificDate;
      });
    }

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

  const columns = useMemo<ColumnDef<TBlogs>[]>(() => [
    {
      accessorKey: "featuredImage",
      header: "Image",
      cell: ({ row }) => (
        <div className="w-16 h-10 rounded-md overflow-hidden bg-gray-100 border border-gray-200 dark:border-gray-700">
          {row.original.featuredImage ? (
            <img 
              src={row.original.featuredImage} 
              alt={row.original.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-[10px] text-gray-400">No Image</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="max-w-[250px]">
          <p className="font-bold text-gray-800 dark:text-gray-200 truncate">{row.original.title}</p>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold rounded">
          {row.original.category || "Uncategorized"}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status || 'draft';
        return (
          <span className={`px-2 py-1 text-[10px] uppercase font-black rounded-full border ${
            status === 'published' 
            ? 'bg-green-50 text-green-600 border-green-200' 
            : 'bg-gray-50 text-gray-500 border-gray-200'
          }`}>
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: "meta.views",
      header: () => <div className="flex items-center gap-1"><BarChart3 className="w-3 h-3"/> Views</div>,
      cell: ({ row }) => <span className="text-sm font-medium">{row.original.meta?.views || 0}</span>,
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-xs text-gray-500">
          {new Date(row.original.createdAt as Date).toLocaleDateString("en-GB")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
        <a 
  href={`https://subirdas-portfolio.vercel.app/all-blogs/blog-details/${row.original.slug}`} 
  target="_blank" 
  rel="noopener noreferrer"
  className="p-1.5 hover:bg-yellow-50 text-yellow-600 rounded-lg transition-colors inline-block"
>
  <Eye className="w-4 h-4" />
</a>
          <button className="p-1.5 hover:bg-green-50 text-green-500 rounded-lg transition-colors" onClick={() => router.push(`/blogs/update-blog/${row.original.slug}`)}><Edit className="w-4 h-4" /></button>
          <button className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors" onClick={() => {
            setSelectedId(row.original._id as string);
            setSelectedTitle(row.original.title);
            setModalOpen(true);
          }}><Trash className="w-4 h-4" /></button>
        </div>
      ),
    },
  ], [router]);

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-white/5">
      {/* Header & Filters remain the same */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-8 gap-6">
        <h1 className="text-2xl font-black">Blog Management</h1>

        <div className="flex flex-wrap items-center gap-4">
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

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input 
              type="date"
              value={specificDate}
              onChange={(e) => {
                setSpecificDate(e.target.value);
                setTimeRange("all");
              }}
              className="bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          
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