/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ColumnDef } from "@tanstack/react-table"; 
import { Trash, GripVertical } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";

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

import CreateSkillModal from "./AddSkillsModal";
import { PortfolioTable } from "@/components/ui/core/PortfolioTable"; 
import DeleteConfirmationModal from "@/components/ui/core/PortfolioModal/DeleteConfirmationModal";
import { TSkill } from "@/types/skills";
import { deleteSkill, updateSkillOrder } from "@/services/Skills";

// Drag Handle Component
const DragHandle = ({ id }: { id: string }) => {
  const { attributes, listeners } = useSortable({ id });
  return (
    <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1">
      <GripVertical className="text-gray-400 w-5 h-5 hover:text-amber-500 transition-colors" />
    </div>
  );
};

const ManageSkills = ({ skills: initialSkills }: { skills: TSkill[] }) => {
  const [data, setData] = useState<TSkill[]>(initialSkills || []);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  useEffect(() => {
    setData(initialSkills);
  }, [initialSkills]);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = data.findIndex((item) => item._id === active.id);
      const newIndex = data.findIndex((item) => item._id === over.id);

      const newData = arrayMove(data, oldIndex, newIndex);
      setData(newData);

      const orderPayload = newData.map((item, index) => ({
        id: item._id as string,
        order: index,
      }));

      try {
        const res = await updateSkillOrder(orderPayload);
        if (res.success) toast.success("Order updated!");
      } catch (err:any) {
        toast.error("Failed to update order");
      }
    }
  };

  const columns = useMemo<ColumnDef<TSkill>[]>(() => [
    {
      id: "drag-handle",
      header: () => <div className="w-8"></div>,
      cell: ({ row }) => <DragHandle id={row.original._id as string} />,
    },
    {
      accessorKey: "title",
      header: "Skill Name",
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <Image 
            src={row.original.logo[0]} 
            alt={row.original.title} 
            width={32} 
            height={32} 
            className="rounded-full" 
          />
          <span className="font-medium">{row.original.title}</span>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <button className="text-red-500" onClick={() => {
          setSelectedId(row.original._id as string);
          setSelectedItem(row.original.title);
          setModalOpen(true);
        }}>
          <Trash className="w-5 h-5" />
        </button>
      ),
    },
  ], []);

  // এখানে আমরা আর আলাদা করে table ইন্সট্যান্স বানাচ্ছি না কারণ PortfolioTable এর ভেতর এটা বানানো আছে

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Manage Skills</h1>
        <CreateSkillModal />
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={data.map((d) => d._id as string)} strategy={verticalListSortingStrategy}>
          {/* গুরুত্বপূর্ণ পরিবর্তন: table={table} এর বদলে columns এবং data পাস করা হচ্ছে */}
          <PortfolioTable 
            columns={columns} 
            data={data} 
            isSortable={true} 
          />
        </SortableContext>
      </DndContext>

      <DeleteConfirmationModal
        name={selectedItem}
        isOpen={isModalOpen}
        onOpenChange={setModalOpen}
        onConfirm={async () => {
          if (selectedId) {
            const res = await deleteSkill(selectedId);
            if (res.success) {
              toast.success(res.message);
              setModalOpen(false);
            }
          }
        }}
      />
    </div>
  );
};

export default ManageSkills;