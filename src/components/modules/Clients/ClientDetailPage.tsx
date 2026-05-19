"use client";

import Link from "next/link";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, Mail, Phone, Building2, Globe, DollarSign,
  ShoppingBag, CheckCircle2, Clock, MessageSquare, ExternalLink,
} from "lucide-react";
import { TClient, TClientStatus } from "@/types/client";
import { TOrder } from "@/types/order";
import { format } from "date-fns";

const STATUS_COLORS: Record<TClientStatus, string> = {
  Lead: "bg-amber-500/10 text-amber-600",
  Active: "bg-emerald-500/10 text-emerald-600",
  Completed: "bg-blue-500/10 text-blue-600",
  Churned: "bg-red-500/10 text-red-600",
};

const ORDER_STATUS_COLORS: Record<string, string> = {
  Pending: "bg-amber-500/10 text-amber-600",
  "In Progress": "bg-blue-500/10 text-blue-600",
  Review: "bg-violet-500/10 text-violet-600",
  Completed: "bg-emerald-500/10 text-emerald-600",
  Cancelled: "bg-red-500/10 text-red-600",
};

type ClientStats = {
  totalRevenue: number;
  totalBudget: number;
  activeOrders: number;
  completedOrders: number;
  totalOrders: number;
};

type LinkedMessage = {
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
};

export default function ClientDetailPage({
  data,
}: {
  data: { client: TClient; orders: TOrder[]; stats: ClientStats; linkedMessage?: LinkedMessage };
}) {
  const { client, orders, stats, linkedMessage } = data;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
          <Link href="/clients">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Clients
          </Link>
        </Button>
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white text-2xl font-bold shrink-0">
            {client.name[0]?.toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{client.name}</h1>
              <Badge className={STATUS_COLORS[client.status]} variant="outline">
                {client.status}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1 flex-wrap">
              <span className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" /> {client.email}
              </span>
              {client.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" /> {client.phone}
                </span>
              )}
              {client.company && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" /> {client.company}
                </span>
              )}
              {client.country && (
                <span className="flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5" /> {client.country}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-emerald-500 mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs">Revenue</span>
            </div>
            <p className="text-xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">of ${stats.totalBudget.toLocaleString()} budget</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-blue-500 mb-1">
              <ShoppingBag className="h-4 w-4" />
              <span className="text-xs">Orders</span>
            </div>
            <p className="text-xl font-bold">{stats.totalOrders}</p>
            <p className="text-xs text-muted-foreground">{stats.activeOrders} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-violet-500 mb-1">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xs">Completed</span>
            </div>
            <p className="text-xl font-bold">{stats.completedOrders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-amber-500 mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs">Member Since</span>
            </div>
            <p className="text-sm font-bold">
              {client.createdAt ? format(new Date(client.createdAt), "MMM d, yyyy") : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Client Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Client Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Source</span>
              <span className="capitalize">{client.source?.replace("_", " ") || "—"}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tags</span>
              <div className="flex gap-1 flex-wrap justify-end">
                {client.tags?.length ? client.tags.map((t) => (
                  <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                )) : <span>—</span>}
              </div>
            </div>
            {client.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-muted-foreground mb-1">Notes</p>
                  <p className="text-xs leading-relaxed">{client.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Original Message */}
        {linkedMessage && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Original Contact Message
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">{linkedMessage.subject}</p>
              <p className="text-xs text-muted-foreground line-clamp-4 leading-relaxed">
                {linkedMessage.message}
              </p>
              <p className="text-xs text-muted-foreground">
                {linkedMessage.createdAt
                  ? format(new Date(linkedMessage.createdAt), "MMM d, yyyy")
                  : ""}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Orders</CardTitle>
            <CardDescription>{orders.length} total orders</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/orders">
              <ExternalLink className="h-4 w-4 mr-1" />
              All Orders
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No orders yet.</p>
          ) : (
            <div className="divide-y">
              {orders.map((order) => (
                <div key={order._id} className="flex items-center justify-between py-3 gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/orders/${order._id}`}
                        className="text-sm font-medium hover:underline truncate"
                      >
                        {order.title}
                      </Link>
                      <Badge
                        className={ORDER_STATUS_COLORS[order.status] || "bg-gray-500/10 text-gray-600"}
                        variant="outline"
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span>${order.paidAmount} / ${order.budget ?? 0} {order.currency}</span>
                      {order.deadline && (
                        <span>Due {format(new Date(order.deadline), "MMM d, yyyy")}</span>
                      )}
                      <span>
                        {order.milestones.filter((m) => m.done).length}/{order.milestones.length} milestones
                      </span>
                    </div>
                  </div>
                  <Button asChild variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                    <Link href={`/orders/${order._id}`}>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
