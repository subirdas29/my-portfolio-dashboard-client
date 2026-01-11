/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { TProjects } from "@/types/projects";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash, Eye, GripVertical, Filter } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// DnD Kit Imports
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";

import DeleteConfirmationModal from "@/components/ui/core/PortfolioModal/DeleteConfirmationModal";
import { PortfolioTable } from "@/components/ui/core/PortfolioTable";
import { deleteProject, updateProjectOrder } from "@/services/Projects";

// Drag Handle Component
const DragHandle = ({ id, disabled }: { id: string; disabled: boolean }) => {
  const { attributes, listeners } = useSortable({ id, disabled });
  return (
    <div 
      {...attributes} 
      {...listeners} 
      className={disabled ? "opacity-20 cursor-not-allowed" : "cursor-grab active:cursor-grabbing p-1"}
    >
      <GripVertical className="text-gray-400 w-5 h-5 hover:text-amber-500 transition-colors" />
    </div>
  );
};

const AllProjectsTable = ({ projects: initialProjects }: { projects: TProjects[] }) => {
  const [data, setData] = useState<TProjects[]>(initialProjects || []);
  const [filterType, setFilterType] = useState<string>("All"); 
  
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  console.log(selectedId)
  
  const router = useRouter();

  useEffect(() => {
    setData(initialProjects);
  }, [initialProjects]);


  const filteredData = useMemo(() => {
    if (filterType === "All") return data;
    return data.filter((project) => project.projectType === filterType);
  }, [data, filterType]);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

  
    if (filterType !== "All") {
      toast.error("Please select 'All' projects to reorder!");
      return;
    }

    if (over && active.id !== over.id) {
      const oldIndex = data.findIndex((item) => item._id === active.id);
      const newIndex = data.findIndex((item) => item._id === over.id);

      const newData = arrayMove(data, oldIndex, newIndex);
      setData(newData); 

      const orderPayload = newData.map((project, index) => ({
        id: project._id as string,
        order: index,
      }));

      try {
        const res = await updateProjectOrder(orderPayload);
        if (res.success) {
          toast.success("Sequence updated!");
        }
      } catch (err:any) {
        toast.error("Order update failed");
      }
    }
  };

  const handleDeleteConfirm = async () => {
      try {
        if (selectedId) {
          const res = await deleteProject(selectedId);
          if (res.success) {
            toast.success(res.message);
            setModalOpen(false);
          }
        }
      } catch (err) {
        toast.error("Failed to delete Project.");
      }
    };

  const columns = useMemo<ColumnDef<TProjects>[]>(() => [
    {
      id: "drag-handle",
      header: () => <div className="w-8"></div>,
      cell: ({ row }) => (
        <DragHandle 
          id={row.original._id as string} 
          disabled={filterType !== "All"} 
        />
      ),
    },
    {
      accessorKey: "imageUrls",
      header: "Image",
      cell: ({ row }) => (
        <Image
          src={row.original.imageUrls[0]}
          alt={row.original.title}
          width={50}
          height={50}
          className="w-10 h-10 rounded-xl border object-cover"
        />
      ),
    },
    {
      accessorKey: "title",
      header: "Project Title",
    },
    {
      accessorKey: "projectType",
      header: "Type",
      cell: ({ row }) => (
        <span className="text-xs font-bold uppercase px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
          {row.original.projectType}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex space-x-3">
          <button className="text-yellow-600" onClick={() => window.open(row.original.liveLink, "_blank")}>
            <Eye className="w-5 h-5" />
          </button>
          <button className="text-green-500" onClick={() => router.push(`/projects/update-project/${row.original.slug}`)}>
            <Edit className="w-5 h-5" />
          </button>
          <button className="text-red-500" onClick={() => {
            setSelectedId(row.original._id as string);
            setSelectedTitle(row.original.title);
            setModalOpen(true);
          }}>
            <Trash className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ], [router, filterType]);

  return (
    <div className="p-4 bg-white dark:bg-gray-950 rounded-lg shadow">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-black">Project Management</h1>

     
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select 
            className="border rounded-md px-3 py-1.5 text-sm bg-transparent outline-none focus:ring-2 focus:ring-amber-500"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="All">All Projects</option>
            <option value="Full-Stack">Full-Stack</option>
            <option value="Front-End">Front-End</option>
          </select>
        </div>
      </div>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={filteredData.map((p) => p._id as string)}
          strategy={verticalListSortingStrategy}
        >
          <div className="overflow-x-auto">
       
            <PortfolioTable 
              columns={columns} 
              data={filteredData} 
              isSortable={filterType === "All"} 
            />
          </div>
        </SortableContext>
      </DndContext>

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