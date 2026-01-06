"use client";

import React from "react";
import { flexRender, Table as ReactTable } from "@tanstack/react-table";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Draggable Row Component
const DraggableRow = ({ row }: { row: any }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.original._id });

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

// Main Table Component
export const PortfolioTable = ({ table }: { table: ReactTable<any> }) => {
  return (
    <div className="rounded-md border bg-white dark:bg-slate-900 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="border-b bg-gray-50 dark:bg-slate-800">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="h-12 px-4 text-left font-bold text-gray-700 dark:text-gray-200">
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <DraggableRow key={row.id} row={row} />
          ))}
        </tbody>
      </table>
    </div>
  );
};