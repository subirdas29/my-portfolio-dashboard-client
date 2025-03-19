"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Trash } from "lucide-react";
import Image from "next/image";
import { useState } from "react";


import CreateSkillModal from "./AddSkillsModal";
import { PortfolioTable } from "@/components/ui/core/PortfolioTable";
import DeleteConfirmationModal from "@/components/ui/core/PortfolioModal/DeleteConfirmationModal";
import { TSkill } from "@/types/skills";
import { deleteSkill } from "@/services/Skills";
import { toast } from "sonner";

type TSkillProps = {
    skills: TSkill[];
  };

const ManageSkills = ({ skills }:TSkillProps) => {
    console.log(skills)
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const handleDelete = (data: TSkill) => {
    console.log(data);
    setSelectedId(data?._id ?? null);
    setSelectedItem(data?.title);
    setModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (selectedId) {
        console.log(selectedId,'id-deleted')
        const res = await deleteSkill(selectedId);
        console.log(res);
        if (res.success) {
          toast.success(res.message);
          setModalOpen(false);
        } else {
          toast.error(res.message);
        }
      }
    } catch (err: any) {
      console.error(err?.message);
    }
  };

  const columns: ColumnDef<TSkill>[]= [
    {
      accessorKey: "skill",
      header: () => <div>Skill Name</div>,
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <Image
            src={row.original.logo[0]}
            alt={row.original.title}
            width={40}
            height={40}
            className="w-8 h-8 rounded-full"
          />
          <span className="truncate">{row.original.title}</span>
        </div>
      ),
    },

    {
      accessorKey: "action",
      header: () => <div>Action</div>,
      cell: ({ row }) => (
        <button
          className="text-red-500"
          title="Delete"
          onClick={() => handleDelete(row.original)}
        >
          <Trash className="w-5 h-5" />
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold ">Manage Brands</h1>

        <CreateSkillModal />
      </div>
      <PortfolioTable columns={columns} data={skills || []} />

      <DeleteConfirmationModal
        name={selectedItem}
        isOpen={isModalOpen}
        onOpenChange={setModalOpen}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default ManageSkills;