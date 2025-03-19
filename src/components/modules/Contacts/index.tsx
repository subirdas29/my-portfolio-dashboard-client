"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Trash } from "lucide-react";
import Image from "next/image";
import { useState } from "react";


import { PortfolioTable } from "@/components/ui/core/PortfolioTable";
import DeleteConfirmationModal from "@/components/ui/core/PortfolioModal/DeleteConfirmationModal";
import { TSkill } from "@/types/skills";
import { deleteSkill } from "@/services/Skills";
import { toast } from "sonner";
import { TContact } from "@/types/contacts";
import { deleteContact } from "@/services/contacts";

type TContactProps = {
    contact: TContact[];
  };

const ManageContacts = ({ contact }:TContactProps) => {
    console.log(contact)
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const handleDelete = (data: TContact) => {
    console.log(data);
    setSelectedId(data?._id ?? null);
    setSelectedItem(data?.name);
    setModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (selectedId) {
        console.log(selectedId,'id-deleted')
        const res = await deleteContact(selectedId);
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

  const columns: ColumnDef<TContact>[] = [
    {
        accessorKey: "name",
        header: "Client Name",
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
    {
        accessorKey: "email",
        header: "Client Email",
        cell: ({ row }) => <span className="font-medium">{row.original.email}</span>,
      },
    {
        accessorKey: "phone",
        header: "Client Phone",
        cell: ({ row }) => <span className="font-medium">{row.original.phone}</span>,
      },
    {
        accessorKey: "message",
        header: "Message",
        cell: ({ row }) => <span className="font-medium">{row.original.message}</span>,
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
     
      <PortfolioTable columns={columns} data={contact || []} />

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