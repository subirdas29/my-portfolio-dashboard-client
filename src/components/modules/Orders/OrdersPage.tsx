"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { exportToCsv } from "@/lib/exportCsv";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ShoppingBag,
  Plus,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Pencil,
  CheckSquare,
  Square,
  Download,
} from "lucide-react";
import { TOrder, TOrderStatus, TRevenueMonth } from "@/types/order";
import { TClient } from "@/types/client";
import {
  createOrder,
  updateOrder,
  updateMilestone,
  deleteOrder,
} from "@/services/Orders";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

const STATUS_COLS: TOrderStatus[] = [
  "Pending",
  "In Progress",
  "Review",
  "Completed",
  "Cancelled",
];

const STATUS_STYLES: Record<TOrderStatus, string> = {
  Pending: "bg-amber-500/10 text-amber-600 border-amber-200",
  "In Progress": "bg-blue-500/10 text-blue-600 border-blue-200",
  Review: "bg-violet-500/10 text-violet-600 border-violet-200",
  Completed: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  Cancelled: "bg-red-500/10 text-red-600 border-red-200",
};

const STATUS_ICONS: Record<TOrderStatus, React.ReactNode> = {
  Pending: <Clock className="h-3.5 w-3.5" />,
  "In Progress": <ShoppingBag className="h-3.5 w-3.5" />,
  Review: <Eye className="h-3.5 w-3.5" />,
  Completed: <CheckCircle2 className="h-3.5 w-3.5" />,
  Cancelled: <XCircle className="h-3.5 w-3.5" />,
};

export default function OrdersPage({
  orders,
  revenueData,
  clients,
  ordersMeta,
}: {
  orders: TOrder[];
  revenueData: TRevenueMonth[];
  clients: TClient[];
  ordersMeta: {
    revenueStats?: { totalBudget: number; totalPaid: number; totalOrders: number };
    statusCounts?: { status: string; count: number }[];
  };
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [addOpen, setAddOpen] = useState(false);
  const [viewOrder, setViewOrder] = useState<TOrder | null>(null);
  const [editOrder, setEditOrder] = useState<TOrder | null>(null);

  const totalRevenue = ordersMeta?.revenueStats?.totalPaid ?? 0;
  const totalBudget = ordersMeta?.revenueStats?.totalBudget ?? 0;
  const activeCount = orders.filter(
    (o) => o.status === "In Progress" || o.status === "Pending"
  ).length;
  const completedCount = orders.filter((o) => o.status === "Completed").length;

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const milestonesRaw = (fd.get("milestones") as string)
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((title) => ({ title, done: false }));

    const payload = {
      clientId: fd.get("clientId") as string,
      title: fd.get("title") as string,
      description: fd.get("description") as string,
      status: (fd.get("status") as TOrderStatus) || "Pending",
      budget: fd.get("budget") ? Number(fd.get("budget")) : undefined,
      currency: (fd.get("currency") as string) || "USD",
      paidAmount: Number(fd.get("paidAmount") || 0),
      deadline: fd.get("deadline") as string,
      milestones: milestonesRaw,
    };
    const res = await createOrder(payload as Parameters<typeof createOrder>[0]);
    if (res?.success !== false) {
      toast.success("Order created");
      setAddOpen(false);
      startTransition(() => router.refresh());
    } else {
      toast.error(res?.message || "Failed to create order");
    }
  };

  const handleStatusChange = async (order: TOrder, status: TOrderStatus) => {
    await updateOrder(order._id, { status });
    toast.success(`Order moved to ${status}`);
    startTransition(() => router.refresh());
  };

  const handleMilestoneToggle = async (
    orderId: string,
    milestoneId: string,
    done: boolean
  ) => {
    await updateMilestone(orderId, milestoneId, done);
    startTransition(() => router.refresh());
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this order?")) return;
    await deleteOrder(id);
    toast.success("Order deleted");
    startTransition(() => router.refresh());
  };

  const getClientName = (order: TOrder) => {
    if (typeof order.clientId === "object" && order.clientId !== null) {
      return (order.clientId as { name: string }).name;
    }
    const c = clients.find((cl) => cl._id === order.clientId);
    return c?.name ?? "Unknown";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground mt-1">
            Track client orders, milestones & revenue.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToCsv("orders.csv", orders.map((o) => ({
              Title: o.title, Status: o.status,
              Budget: o.budget ?? 0, Paid: o.paidAmount, Currency: o.currency,
              Deadline: o.deadline ?? "", Completed: o.completedAt ?? "",
              Milestones: o.milestones.length, Done: o.milestones.filter(m => m.done).length,
            })))}
          >
            <Download className="h-4 w-4 mr-2" />Export CSV
          </Button>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Order</DialogTitle>
            </DialogHeader>
            <OrderForm
              clients={clients}
              onSubmit={handleCreate}
              submitLabel="Create Order"
            />
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Revenue KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-emerald-500 mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs font-medium">Total Collected</span>
            </div>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-blue-500 mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs font-medium">Total Budget</span>
            </div>
            <div className="text-2xl font-bold">${totalBudget.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-amber-500 mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-medium">Active Orders</span>
            </div>
            <div className="text-2xl font-bold">{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-violet-500 mb-1">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xs font-medium">Completed</span>
            </div>
            <div className="text-2xl font-bold">{completedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      {revenueData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revenue by Month</CardTitle>
            <CardDescription>Budget vs Collected</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="budget" fill="#6366f1" opacity={0.4} radius={[4, 4, 0, 0]} name="Budget" />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} name="Collected" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Kanban Board */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-5">
        {STATUS_COLS.map((status) => {
          const colOrders = orders.filter((o) => o.status === status);
          return (
            <div key={status} className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className={STATUS_STYLES[status]} variant="outline">
                  <span className="flex items-center gap-1">
                    {STATUS_ICONS[status]}
                    {status}
                  </span>
                </Badge>
                <span className="text-xs text-muted-foreground">({colOrders.length})</span>
              </div>
              <div className="space-y-2 min-h-[60px]">
                {colOrders.map((order) => (
                  <Card
                    key={order._id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start justify-between gap-1">
                        <p className="text-sm font-medium line-clamp-2">{order.title}</p>
                        <div className="flex gap-1 shrink-0">
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                          >
                            <Link href={`/orders/${order._id}`}>
                              <Eye className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:text-red-500"
                            onClick={() => handleDelete(order._id)}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{getClientName(order)}</p>
                      {order.budget && (
                        <p className="text-xs font-medium text-emerald-600">
                          ${order.paidAmount} / ${order.budget} {order.currency}
                        </p>
                      )}
                      {order.deadline && (
                        <p className="text-xs text-muted-foreground">
                          Due {format(new Date(order.deadline), "MMM d")}
                        </p>
                      )}
                      {order.milestones.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          {order.milestones.filter((m) => m.done).length}/
                          {order.milestones.length} milestones
                        </div>
                      )}
                      {/* Move to next status */}
                      {status !== "Completed" && status !== "Cancelled" && (
                        <select
                          className="w-full h-7 text-xs px-2 rounded border bg-background"
                          value={status}
                          onChange={(e) =>
                            handleStatusChange(order, e.target.value as TOrderStatus)
                          }
                        >
                          {STATUS_COLS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {colOrders.length === 0 && (
                  <div className="border border-dashed rounded-lg h-16 flex items-center justify-center text-xs text-muted-foreground">
                    Empty
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Detail Dialog */}
      {viewOrder && (
        <Dialog open={!!viewOrder} onOpenChange={() => setViewOrder(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{viewOrder.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Client</p>
                  <p className="font-medium">{getClientName(viewOrder)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Status</p>
                  <Badge className={STATUS_STYLES[viewOrder.status]} variant="outline">
                    {viewOrder.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Budget</p>
                  <p className="font-medium">
                    ${viewOrder.paidAmount} / ${viewOrder.budget ?? 0} {viewOrder.currency}
                  </p>
                </div>
                {viewOrder.deadline && (
                  <div>
                    <p className="text-muted-foreground text-xs">Deadline</p>
                    <p className="font-medium">
                      {format(new Date(viewOrder.deadline), "MMM d, yyyy")}
                    </p>
                  </div>
                )}
              </div>
              {viewOrder.description && (
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Description</p>
                  <p className="text-sm">{viewOrder.description}</p>
                </div>
              )}
              {viewOrder.milestones.length > 0 && (
                <div>
                  <p className="text-muted-foreground text-xs mb-2">Milestones</p>
                  <div className="space-y-2">
                    {viewOrder.milestones.map((m) => (
                      <div
                        key={m._id}
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() =>
                          handleMilestoneToggle(viewOrder._id, m._id, !m.done)
                        }
                      >
                        {m.done ? (
                          <CheckSquare className="h-4 w-4 text-emerald-500 shrink-0" />
                        ) : (
                          <Square className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        <span
                          className={`text-sm ${m.done ? "line-through text-muted-foreground" : ""}`}
                        >
                          {m.title}
                        </span>
                        {m.dueDate && (
                          <span className="text-xs text-muted-foreground ml-auto">
                            {format(new Date(m.dueDate), "MMM d")}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" size="sm" onClick={() => setViewOrder(null)}>
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setViewOrder(null);
                    setEditOrder(viewOrder);
                  }}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Order Dialog */}
      {editOrder && (
        <Dialog open={!!editOrder} onOpenChange={() => setEditOrder(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Order</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                await updateOrder(editOrder._id, {
                  status: fd.get("status") as TOrderStatus,
                  paidAmount: Number(fd.get("paidAmount")),
                  description: fd.get("description") as string,
                });
                toast.success("Order updated");
                setEditOrder(null);
                startTransition(() => router.refresh());
              }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  defaultValue={editOrder.status}
                  className="w-full h-9 px-3 rounded-md border bg-background text-sm"
                >
                  {STATUS_COLS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="paidAmount">Paid Amount ({editOrder.currency})</Label>
                <Input id="paidAmount" name="paidAmount" type="number" defaultValue={editOrder.paidAmount} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" defaultValue={editOrder.description} rows={3} />
              </div>
              <Button type="submit" className="w-full">Update Order</Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function OrderForm({
  clients,
  onSubmit,
  submitLabel,
}: {
  clients: TClient[];
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  submitLabel: string;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div className="space-y-1">
        <Label htmlFor="clientId">Client *</Label>
        <select
          id="clientId"
          name="clientId"
          required
          className="w-full h-9 px-3 rounded-md border bg-background text-sm"
        >
          <option value="">Select a client</option>
          {clients.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name} {c.company ? `(${c.company})` : ""}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="title">Order Title *</Label>
        <Input id="title" name="title" required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={2} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="budget">Budget</Label>
          <Input id="budget" name="budget" type="number" placeholder="0" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="currency">Currency</Label>
          <select id="currency" name="currency" defaultValue="USD" className="w-full h-9 px-3 rounded-md border bg-background text-sm">
            <option>USD</option>
            <option>BDT</option>
            <option>EUR</option>
            <option>GBP</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="paidAmount">Paid So Far</Label>
          <Input id="paidAmount" name="paidAmount" type="number" defaultValue={0} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="deadline">Deadline</Label>
          <Input id="deadline" name="deadline" type="date" />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="milestones">Milestones (one per line)</Label>
        <Textarea id="milestones" name="milestones" rows={3} placeholder={"Design mockups\nFrontend development\nBackend API\nDeployment"} />
      </div>
      <Button type="submit" className="w-full">{submitLabel}</Button>
    </form>
  );
}
