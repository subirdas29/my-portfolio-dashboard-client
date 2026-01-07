"use client";

import React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ১. ড্র্যাগেবল রো কম্পোনেন্ট (শুধুমাত্র তখনই কাজ করবে যখন id থাকবে)
const DraggableRow = ({ row, isSortable }: { row: any; isSortable: boolean }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: row.original._id || row.id,
    disabled: !isSortable // ড্র্যাগ অপশন অফ থাকলে এটি কাজ করবে না
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: isDragging ? "rgba(245, 158, 11, 0.05)" : "transparent",
    position: "relative",
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="border-b transition-colors hover:bg-muted/50"
    >
      {row.getVisibleCells().map((cell: any) => (
        <td key={cell.id} className="p-4 align-middle">
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  );
};

// ২. মেইন পোর্টফোলিও টেবিল
interface PortfolioTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isSortable?: boolean; // নতুন প্রপস: ড্র্যাগ হবে কি হবে না
}

export function PortfolioTable<TData, TValue>({
  columns,
  data,
  isSortable = false, // ডিফল্টভাবে ড্র্যাগ অফ থাকবে
}: PortfolioTableProps<TData, TValue>) {
  
  // তানস্ট্যাক টেবিল ইন্সট্যান্স এখানে তৈরি করা হয়েছে 
  // যাতে আপনার পুরনো পেজগুলোতে (Blogs/Projects) কোনো পরিবর্তন না করতে হয়
  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row: any) => row._id, 
  });

  return (
    <div className="rounded-md border bg-white dark:bg-slate-900 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="border-b bg-gray-100 dark:bg-slate-800">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="h-12 px-4 text-left font-bold text-gray-700 dark:text-gray-200"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <DraggableRow 
                key={row.id} 
                row={row} 
                isSortable={isSortable} 
              />
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="h-24 text-center">
                No results.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}