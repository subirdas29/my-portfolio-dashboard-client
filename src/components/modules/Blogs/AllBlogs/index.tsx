"use client";

import { ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Edit, Trash, Eye } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import DeleteConfirmationModal from "@/components/ui/core/PortfolioModal/DeleteConfirmationModal";
import { PortfolioTable } from "@/components/ui/core/PortfolioTable";
import { TBlog } from "@/types/blogs";
import { deleteBlog } from "@/services/Blogs";

const AllBlogsTable = ({ blogs }: { blogs: TBlog[] }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const router = useRouter();

  const handleDelete = (blog: TBlog) => {
    if (!blog._id) return;
    setSelectedId(blog._id);
    setSelectedTitle(blog.title);
    setModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (selectedId) {
        const res = await deleteBlog(selectedId);
        if (res.success) {
          toast.success(res.message);
          setModalOpen(false);
        } else {
          toast.error(res.message);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete blog.");
    }
  };


  const columns = useMemo<ColumnDef<TBlog>[]>(() => [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => <span className="font-medium">{row.original.title}</span>,
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => <span className="text-gray-600">{row.original.category}</span>,
    },
    {
      accessorKey: "content",
      header: "Content",
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {row.original.content.replace(/<\/?[^>]+(>|$)/g, "").substring(0, 50)}...
        </span>
      ),
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex space-x-3">
          <button
            className="text-yellow-600 cursor-pointer"
            title="View Blog"
            onClick={() => router.push(`/blogs/${row.original._id}`)}
          >
            <Eye className="w-5 h-5" />
          </button>

          <button
            className="text-green-500 hover:text-blue-500 cursor-pointer"
            title="Edit"
            onClick={() => router.push(`/blogs/update-blog/${row.original._id}`)}
          >
            <Edit className="w-5 h-5" />
          </button>

          <button
            className="text-red-500 cursor-pointer"
            title="Delete"
            onClick={() => handleDelete(row.original)}
          >
            <Trash className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ], [router]);


  const table = useReactTable({
    data: blogs || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row._id as string, 
  });

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">All Blogs</h1>
      <div className="overflow-x-auto">
     
        <PortfolioTable table={table} />
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