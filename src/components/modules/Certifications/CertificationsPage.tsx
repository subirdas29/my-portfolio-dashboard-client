"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, ExternalLink, Award } from "lucide-react";
import { TCertification } from "@/types/certification";
import { createCertification, updateCertification, deleteCertification } from "@/services/Certifications";
import { toast } from "sonner";
import Image from "next/image";

export default function CertificationsPage({ certifications: initial }: { certifications: TCertification[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [certifications, setCertifications] = useState(initial);
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<TCertification | null>(null);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      title: fd.get("title") as string,
      issuer: fd.get("issuer") as string,
      issueDate: (fd.get("issueDate") as string) || undefined,
      expiryDate: (fd.get("expiryDate") as string) || undefined,
      credentialUrl: (fd.get("credentialUrl") as string) || undefined,
      badgeImage: (fd.get("badgeImage") as string) || undefined,
    };
    const res = await createCertification(payload);
    if (res?.success !== false) {
      toast.success("Certification added");
      setAddOpen(false);
      startTransition(() => router.refresh());
    } else {
      toast.error(res?.message || "Failed to add");
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editItem) return;
    const fd = new FormData(e.currentTarget);
    const payload = {
      title: fd.get("title") as string,
      issuer: fd.get("issuer") as string,
      issueDate: (fd.get("issueDate") as string) || undefined,
      expiryDate: (fd.get("expiryDate") as string) || undefined,
      credentialUrl: (fd.get("credentialUrl") as string) || undefined,
      badgeImage: (fd.get("badgeImage") as string) || undefined,
    };
    const res = await updateCertification(editItem._id, payload);
    if (res?.success !== false) {
      toast.success("Updated");
      setCertifications((prev) => prev.map((c) => (c._id === editItem._id ? { ...c, ...payload } : c)));
      setEditItem(null);
      startTransition(() => router.refresh());
    } else {
      toast.error("Failed to update");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this certification?")) return;
    await deleteCertification(id);
    setCertifications((prev) => prev.filter((c) => c._id !== id));
    toast.success("Deleted");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Certifications</h1>
          <p className="text-muted-foreground mt-1">Manage your certifications & achievements shown on the portfolio.</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Certification</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Certification</DialogTitle></DialogHeader>
            <CertForm onSubmit={handleCreate} submitLabel="Add" />
          </DialogContent>
        </Dialog>
      </div>

      {certifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Award className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No certifications yet. Add your first one!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {certifications.map((cert) => (
            <Card key={cert._id} className="group relative">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  {cert.badgeImage ? (
                    <div className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden border">
                      <Image src={cert.badgeImage} alt={cert.title} fill className="object-contain p-1" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 shrink-0 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <Award className="h-6 w-6 text-amber-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm leading-tight line-clamp-2">{cert.title}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">{cert.issuer}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="flex gap-2 text-xs text-muted-foreground">
                  {cert.issueDate && <span>Issued: {cert.issueDate}</span>}
                  {cert.expiryDate && <span>· Expires: {cert.expiryDate}</span>}
                </div>
                <div className="flex gap-2">
                  {cert.credentialUrl && (
                    <Button variant="outline" size="sm" asChild className="h-7 text-xs">
                      <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" /> View
                      </a>
                    </Button>
                  )}
                  <Dialog open={editItem?._id === cert._id} onOpenChange={(o) => !o && setEditItem(null)}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setEditItem(cert)}>
                        <Pencil className="h-3 w-3 mr-1" /> Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Edit Certification</DialogTitle></DialogHeader>
                      <CertForm onSubmit={handleUpdate} submitLabel="Save" defaultValues={cert} />
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" size="sm" className="h-7 text-xs text-destructive hover:text-destructive" onClick={() => handleDelete(cert._id)}>
                    <Trash2 className="h-3 w-3 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function CertForm({ onSubmit, submitLabel, defaultValues }: {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  submitLabel: string;
  defaultValues?: Partial<TCertification>;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="title">Title *</Label>
        <Input id="title" name="title" defaultValue={defaultValues?.title} required placeholder="AWS Certified Developer" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="issuer">Issuer *</Label>
        <Input id="issuer" name="issuer" defaultValue={defaultValues?.issuer} required placeholder="Amazon Web Services" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="issueDate">Issue Date</Label>
          <Input id="issueDate" name="issueDate" defaultValue={defaultValues?.issueDate} placeholder="Jan 2024" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="expiryDate">Expiry Date</Label>
          <Input id="expiryDate" name="expiryDate" defaultValue={defaultValues?.expiryDate} placeholder="Jan 2027" />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="credentialUrl">Credential URL</Label>
        <Input id="credentialUrl" name="credentialUrl" type="url" defaultValue={defaultValues?.credentialUrl} placeholder="https://..." />
      </div>
      <div className="space-y-1">
        <Label htmlFor="badgeImage">Badge Image URL</Label>
        <Input id="badgeImage" name="badgeImage" type="url" defaultValue={defaultValues?.badgeImage} placeholder="https://..." />
      </div>
      <Button type="submit" className="w-full">{submitLabel}</Button>
    </form>
  );
}
