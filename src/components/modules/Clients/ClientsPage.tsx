"use client";

import { useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Users, Plus, Search, Building2, Mail, Phone, Pencil, Trash2, ExternalLink, Download } from "lucide-react";
import Link from "next/link";
import { exportToCsv } from "@/lib/exportCsv";
import { TClient, TClientStatus } from "@/types/client";
import { createClient, updateClient, deleteClient } from "@/services/Clients";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

const STATUS_COLORS: Record<TClientStatus, string> = {
  Lead: "bg-amber-500/10 text-amber-600",
  Active: "bg-emerald-500/10 text-emerald-600",
  Completed: "bg-blue-500/10 text-blue-600",
  Churned: "bg-red-500/10 text-red-600",
};

const STATUSES: TClientStatus[] = ["Lead", "Active", "Completed", "Churned"];

export default function ClientsPage({
  clients,
  statusCounts,
}: {
  clients: TClient[];
  statusCounts: { status: string; count: number }[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [editClient, setEditClient] = useState<TClient | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const filtered = clients.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.company || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name") as string,
      email: fd.get("email") as string,
      phone: fd.get("phone") as string,
      company: fd.get("company") as string,
      country: fd.get("country") as string,
      status: (fd.get("status") as TClientStatus) || "Lead",
      source: (fd.get("source") as TClient["source"]) || "other",
      notes: fd.get("notes") as string,
    };
    const res = await createClient(payload);
    if (res?.success !== false) {
      toast.success("Client created");
      setAddOpen(false);
      startTransition(() => router.refresh());
    } else {
      toast.error(res?.message || "Failed to create client");
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editClient) return;
    const fd = new FormData(e.currentTarget);
    const payload = {
      status: fd.get("status") as TClientStatus,
      notes: fd.get("notes") as string,
      phone: fd.get("phone") as string,
      company: fd.get("company") as string,
    };
    const res = await updateClient(editClient._id, payload);
    if (res?.success !== false) {
      toast.success("Client updated");
      setEditClient(null);
      startTransition(() => router.refresh());
    } else {
      toast.error("Failed to update");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this client? This cannot be undone.")) return;
    await deleteClient(id);
    toast.success("Client deleted");
    startTransition(() => router.refresh());
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground mt-1">CRM — manage leads & clients.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToCsv("clients.csv", clients.map((c) => ({
              Name: c.name, Email: c.email, Phone: c.phone ?? "",
              Company: c.company ?? "", Country: c.country ?? "",
              Status: c.status, Source: c.source ?? "", Date: c.createdAt,
            })))}
          >
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
            </DialogHeader>
            <ClientForm onSubmit={handleCreate} submitLabel="Create Client" />
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Status counts */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        {STATUSES.map((s) => {
          const count = statusCounts.find((sc) => sc.status === s)?.count ?? 0;
          return (
            <Card
              key={s}
              className="cursor-pointer"
              onClick={() => setFilterStatus(filterStatus === s ? "all" : s)}
            >
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center justify-between">
                  <Badge className={STATUS_COLORS[s]}>{s}</Badge>
                  <span className="text-2xl font-bold">{count}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, company..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            {filtered.length} client{filtered.length !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              {clients.length === 0
                ? "No clients yet. Add your first client!"
                : "No clients match your search."}
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map((client) => (
                <div
                  key={client._id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0 text-sm font-semibold">
                    {client.name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium">{client.name}</p>
                      <Badge className={STATUS_COLORS[client.status]} variant="outline">
                        {client.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {client.email}
                      </span>
                      {client.company && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Building2 className="h-3 w-3" /> {client.company}
                        </span>
                      )}
                      {client.phone && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {client.phone}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Added {format(new Date(client.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                      <Link href={`/clients/${client._id}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Dialog
                      open={editClient?._id === client._id}
                      onOpenChange={(o) => !o && setEditClient(null)}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditClient(client)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Client — {client.name}</DialogTitle>
                        </DialogHeader>
                        <ClientForm
                          onSubmit={handleUpdate}
                          submitLabel="Update Client"
                          defaultValues={client}
                        />
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-red-500"
                      onClick={() => handleDelete(client._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit dialog (rendered outside loop for currently editing client) */}
    </div>
  );
}

function ClientForm({
  onSubmit,
  submitLabel,
  defaultValues,
}: {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  submitLabel: string;
  defaultValues?: Partial<TClient>;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="name">Name *</Label>
          <Input id="name" name="name" defaultValue={defaultValues?.name} required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" name="email" type="email" defaultValue={defaultValues?.email} required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" defaultValue={defaultValues?.phone} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="company">Company</Label>
          <Input id="company" name="company" defaultValue={defaultValues?.company} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="country">Country</Label>
          <Input id="country" name="country" defaultValue={defaultValues?.country} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={defaultValues?.status || "Lead"}
            className="w-full h-9 px-3 rounded-md border bg-background text-sm"
          >
            <option value="Lead">Lead</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Churned">Churned</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="source">Source</Label>
          <select
            id="source"
            name="source"
            defaultValue={defaultValues?.source || "other"}
            className="w-full h-9 px-3 rounded-md border bg-background text-sm"
          >
            <option value="contact_form">Contact Form</option>
            <option value="referral">Referral</option>
            <option value="social">Social</option>
            <option value="direct">Direct</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" defaultValue={defaultValues?.notes} rows={3} />
      </div>
      <Button type="submit" className="w-full">{submitLabel}</Button>
    </form>
  );
}
