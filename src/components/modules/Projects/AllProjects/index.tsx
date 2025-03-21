"use client";

import { TProjects } from "@/types/projects";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash, Eye } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

import { useRouter } from "next/navigation";
import DeleteConfirmationModal from "@/components/ui/core/PortfolioModal/DeleteConfirmationModal";
import { PortfolioTable } from "@/components/ui/core/PortfolioTable";
import { deleteProject } from "@/services/Projects";

const AllProjectsTable = ({ projects }: { projects: TProjects[] }) => {
    console.log(projects)
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const router = useRouter();

  const handleDelete = (project: TProjects) => {
    if (!project._id) return;
    setSelectedId(project?._id);
    setSelectedTitle(project?.title);


    setModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      
        if (selectedId) {
            const res = await deleteProject(selectedId);
            console.log(res);
            if (res.success) {
              toast.success(res.message);
              setModalOpen(false);
            } else {
              toast.error(res.message);
            }
          }
    } catch (err) {
      console.error(err);
      toast.error("Failed to cancel order.");
    }
  };

  const columns: ColumnDef<TProjects>[] = [
    {
      accessorKey: "imageUrls",
      header: "Image",
      cell: ({ row }) => (
        <Image
          src={row.original.imageUrls[0]}
          alt={row.original.title}
          width={50}
          height={50}
          className="w-12 h-12 rounded object-cover"
        />
      ),
    },
    {
      accessorKey: "title",
      header: "Project Title",
      cell: ({ row }) => <span className="font-medium">{row.original.title}</span>,
    },
    {
      accessorKey: "projectType",
      header: "Project Type",
      cell: ({ row }) => <span>{row.original.projectType}</span>,
    },
   
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex space-x-3">
          <button
            className="text-yellow-600 cursor-pointer"
            title="View Live"
            onClick={() => window.open(row.original.liveLink, "_blank")}
          >
            <Eye className="w-5 h-5" />
          </button>

          <button
            className="text-green-500 hover:text-blue-500 cursor-pointer"
            title="Edit"
            onClick={() => router.push(`/projects/update-project/${row.original._id}`)}
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
  ];

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">All Projects</h1>
      <div className="overflow-x-auto">
        <PortfolioTable columns={columns} data={projects || []} />
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

export default AllProjectsTable;
