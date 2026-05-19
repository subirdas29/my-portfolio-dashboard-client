"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  CheckSquare,
  Square,
  ArrowLeft,
  DollarSign,
  Calendar,
  User,
  Building2,
  Plus,
  Trash2,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { TOrder, TOrderStatus, TMilestone, TNote } from "@/types/order";
import InvoiceGenerator from "./InvoiceGenerator";
import { addOrderNote, deleteOrderNote } from "@/services/Orders";
import { TClient } from "@/types/client";
import { updateOrder, updateMilestone } from "@/services/Orders";
import { toast } from "sonner";
import { format } from "date-fns";

const STATUS_STYLES: Record<TOrderStatus, string> = {
  Pending: "bg-amber-500/10 text-amber-600",
  "In Progress": "bg-blue-500/10 text-blue-600",
  Review: "bg-violet-500/10 text-violet-600",
  Completed: "bg-emerald-500/10 text-emerald-600",
  Cancelled: "bg-red-500/10 text-red-600",
};

const STATUS_COLS: TOrderStatus[] = [
  "Pending",
  "In Progress",
  "Review",
  "Completed",
  "Cancelled",
];

export default function OrderDetailPage({
  order: initialOrder,
  clients,
}: {
  order: TOrder;
  clients: TClient[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [order, setOrder] = useState(initialOrder);
  const [newMilestone, setNewMilestone] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  const getClientName = () => {
    if (typeof order.clientId === "object" && order.clientId !== null) {
      return (order.clientId as { name: string; email: string; company?: string });
    }
    const c = clients.find((cl) => cl._id === order.clientId);
    return c ? { name: c.name, email: c.email, company: c.company } : { name: "Unknown", email: "" };
  };

  const client = getClientName();
  const completedMilestones = order.milestones.filter((m) => m.done).length;
  const progress =
    order.milestones.length > 0
      ? Math.round((completedMilestones / order.milestones.length) * 100)
      : 0;
  const paidPercent =
    order.budget && order.budget > 0
      ? Math.round((order.paidAmount / order.budget) * 100)
      : 0;

  const handleMilestoneToggle = async (milestone: TMilestone) => {
    const updated = await updateMilestone(order._id, milestone._id, !milestone.done);
    if (updated?.data) {
      setOrder(updated.data as TOrder);
    } else {
      startTransition(() => router.refresh());
    }
  };

  const handleAddMilestone = async () => {
    if (!newMilestone.trim()) return;
    const updatedMilestones = [
      ...order.milestones,
      { title: newMilestone.trim(), done: false } as TMilestone,
    ];
    const res = await updateOrder(order._id, { milestones: updatedMilestones });
    if (res?.data) {
      setOrder((prev) => ({ ...prev, milestones: updatedMilestones }));
      setNewMilestone("");
      toast.success("Milestone added");
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    const updatedMilestones = order.milestones.filter((m) => m._id !== milestoneId);
    await updateOrder(order._id, { milestones: updatedMilestones });
    setOrder((prev) => ({ ...prev, milestones: updatedMilestones }));
    toast.success("Milestone removed");
  };

  const handleStatusChange = async (status: TOrderStatus) => {
    setSavingStatus(true);
    await updateOrder(order._id, { status });
    setOrder((prev) => ({ ...prev, status }));
    toast.success(`Status → ${status}`);
    setSavingStatus(false);
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setAddingNote(true);
    const res = await addOrderNote(order._id, newNote.trim());
    if (res?.data) {
      setOrder(res.data as TOrder);
      setNewNote("");
      toast.success("Note added");
    }
    setAddingNote(false);
  };

  const handleDeleteNote = async (index: number) => {
    const res = await deleteOrderNote(order._id, index);
    if (res?.data) {
      setOrder(res.data as TOrder);
      toast.success("Note deleted");
    }
  };

  const handlePaidUpdate = async (paidAmount: number) => {
    await updateOrder(order._id, { paidAmount });
    setOrder((prev) => ({ ...prev, paidAmount }));
    toast.success("Payment updated");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
            <Link href="/orders">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Orders
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{order.title}</h1>
          {order.description && (
            <p className="text-muted-foreground mt-1">{order.description}</p>
          )}
        </div>
        <Badge className={STATUS_STYLES[order.status]} variant="outline">
          {order.status}
        </Badge>
      </div>

      {/* Info Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Client Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Client
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="font-medium">{client.name}</p>
            <p className="text-xs text-muted-foreground">{client.email}</p>
            {client.company && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {client.company}
              </p>
            )}
            <Button asChild variant="outline" size="sm" className="mt-2 w-full">
              <Link href="/clients">View Clients</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Payment */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Budget</span>
              <span className="font-medium">
                {order.budget ? `$${order.budget} ${order.currency}` : "Not set"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Collected</span>
              <span className="font-medium text-emerald-600">
                ${order.paidAmount} {order.currency}
              </span>
            </div>
            {order.budget && (
              <div className="space-y-1">
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${Math.min(paidPercent, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-right">
                  {paidPercent}% collected
                </p>
              </div>
            )}
            <div className="flex gap-2 mt-2">
              <Input
                type="number"
                defaultValue={order.paidAmount}
                className="h-8 text-sm"
                onBlur={(e) => handlePaidUpdate(Number(e.target.value))}
              />
              <span className="text-xs text-muted-foreground self-center">{order.currency}</span>
            </div>
          </CardContent>
        </Card>

        {/* Dates & Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {order.startDate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Start</span>
                <span>{format(new Date(order.startDate), "MMM d, yyyy")}</span>
              </div>
            )}
            {order.deadline && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Deadline</span>
                <span
                  className={
                    new Date(order.deadline) < new Date() &&
                    order.status !== "Completed"
                      ? "text-red-500 font-medium"
                      : ""
                  }
                >
                  {format(new Date(order.deadline), "MMM d, yyyy")}
                </span>
              </div>
            )}
            {order.completedAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completed</span>
                <span className="text-emerald-600">
                  {format(new Date(order.completedAt), "MMM d, yyyy")}
                </span>
              </div>
            )}
            <Separator />
            <div className="space-y-1">
              <Label className="text-xs">Change Status</Label>
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(e.target.value as TOrderStatus)}
                disabled={savingStatus}
                className="w-full h-8 px-2 rounded-md border bg-background text-sm"
              >
                {STATUS_COLS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Milestones Timeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Milestones
              </CardTitle>
              <CardDescription>
                {completedMilestones}/{order.milestones.length} completed
                {order.milestones.length > 0 && ` — ${progress}%`}
              </CardDescription>
            </div>
          </div>
          {order.milestones.length > 0 && (
            <div className="h-2 rounded-full bg-muted overflow-hidden mt-2">
              <div
                className="h-full rounded-full bg-violet-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {order.milestones.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No milestones yet. Add your first below.
            </p>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-3.5 top-0 bottom-0 w-px bg-border" />
              <div className="space-y-3">
                {order.milestones.map((m, i) => (
                  <div key={m._id || i} className="flex items-start gap-4 relative">
                    <button
                      onClick={() => handleMilestoneToggle(m)}
                      className={`relative z-10 h-7 w-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        m.done
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "bg-background border-border hover:border-violet-400"
                      }`}
                    >
                      {m.done ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <span className="text-xs font-bold text-muted-foreground">
                          {i + 1}
                        </span>
                      )}
                    </button>
                    <div className="flex-1 pb-3 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`text-sm font-medium ${
                            m.done ? "line-through text-muted-foreground" : ""
                          }`}
                        >
                          {m.title}
                        </p>
                        <div className="flex items-center gap-1 shrink-0">
                          {m.dueDate && (
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(m.dueDate), "MMM d")}
                            </span>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:text-red-500"
                            onClick={() => handleDeleteMilestone(m._id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add milestone */}
          <Separator />
          <div className="flex gap-2">
            <Input
              placeholder="Add a milestone..."
              value={newMilestone}
              onChange={(e) => setNewMilestone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddMilestone()}
              className="h-8 text-sm"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={handleAddMilestone}
              disabled={!newMilestone.trim()}
              className="h-8 shrink-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notes / Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Notes & Activity
          </CardTitle>
          <CardDescription>Internal notes about this order</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Existing notes */}
          {(order.notes ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No notes yet.</p>
          ) : (
            <div className="space-y-2">
              {(order.notes ?? []).map((note: TNote, i: number) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {note.createdAt ? format(new Date(note.createdAt), "MMM d, yyyy · h:mm a") : ""}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                    onClick={() => handleDeleteNote(i)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          {/* Add note */}
          <Separator />
          <div className="space-y-2">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a note..."
              rows={2}
              className="w-full text-sm px-3 py-2 rounded-lg border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button size="sm" onClick={handleAddNote} disabled={addingNote || !newNote.trim()}>
              {addingNote ? "Adding..." : "Add Note"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Generator */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Invoice</CardTitle>
        </CardHeader>
        <CardContent>
          <InvoiceGenerator order={order} />
        </CardContent>
      </Card>

      {/* Invoice / Contract URLs */}
      {(order.invoiceUrl || order.contractUrl) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-3 flex-wrap">
            {order.invoiceUrl && (
              <Button asChild variant="outline" size="sm">
                <a href={order.invoiceUrl} target="_blank" rel="noopener noreferrer">
                  Invoice
                </a>
              </Button>
            )}
            {order.contractUrl && (
              <Button asChild variant="outline" size="sm">
                <a href={order.contractUrl} target="_blank" rel="noopener noreferrer">
                  Contract
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
