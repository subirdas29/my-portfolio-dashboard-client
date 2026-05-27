"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, ExternalLink, Award, Upload, X, FileText, ImageIcon, Loader2 } from "lucide-react";
import { TCertification } from "@/types/certification";
import { createCertification, updateCertification, deleteCertification } from "@/services/Certifications";
import { toast } from "sonner";
import Image from "next/image";

const BASE_API = process.env.NEXT_PUBLIC_BASE_API;

async function uploadImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${BASE_API}/upload/image`, { method: "POST", body: fd });
  const data = await res.json();
  if (!data?.data) throw new Error("Image upload failed");
  return data.data as string;
}

async function uploadRaw(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${BASE_API}/upload/upload-raw`, { method: "POST", body: fd });
  const data = await res.json();
  if (!data?.data) throw new Error("File upload failed");
  return data.data as string;
}

export default function CertificationsPage({ certifications: initial }: { certifications: TCertification[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [certifications, setCertifications] = useState(initial);
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<TCertification | null>(null);

  const buildPayload = async (
    fd: FormData,
    badgeFile: File | null,
    certFile: File | null,
    existingBadge?: string,
    existingCertFile?: string,
  ) => {
    let badgeImage = existingBadge;
    let certificateFile = existingCertFile;

    if (badgeFile) badgeImage = await uploadImage(badgeFile);
    if (certFile) certificateFile = await uploadRaw(certFile);

    return {
      title: fd.get("title") as string,
      issuer: fd.get("issuer") as string,
      issueDate: (fd.get("issueDate") as string) || undefined,
      expiryDate: (fd.get("expiryDate") as string) || undefined,
      credentialUrl: (fd.get("credentialUrl") as string) || undefined,
      badgeImage: badgeImage || undefined,
      certificateFile: certificateFile || undefined,
    };
  };

  const handleCreate = async (
    e: React.FormEvent<HTMLFormElement>,
    badgeFile: File | null,
    certFile: File | null,
  ) => {
    e.preventDefault();
    try {
      const payload = await buildPayload(new FormData(e.currentTarget), badgeFile, certFile);
      const res = await createCertification(payload);
      if (res?.success !== false) {
        toast.success("Certification added");
        setAddOpen(false);
        startTransition(() => router.refresh());
      } else {
        toast.error(res?.message || "Failed to add");
      }
    } catch {
      toast.error("Upload failed");
    }
  };

  const handleUpdate = async (
    e: React.FormEvent<HTMLFormElement>,
    badgeFile: File | null,
    certFile: File | null,
  ) => {
    e.preventDefault();
    if (!editItem) return;
    try {
      const payload = await buildPayload(
        new FormData(e.currentTarget),
        badgeFile,
        certFile,
        editItem.badgeImage,
        editItem.certificateFile,
      );
      const res = await updateCertification(editItem._id, payload);
      if (res?.success !== false) {
        toast.success("Updated");
        setCertifications((prev) => prev.map((c) => (c._id === editItem._id ? { ...c, ...payload } : c)));
        setEditItem(null);
        startTransition(() => router.refresh());
      } else {
        toast.error("Failed to update");
      }
    } catch {
      toast.error("Upload failed");
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
          <DialogContent className="max-h-[90vh] overflow-y-auto">
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
                <div className="flex flex-wrap gap-2">
                  {cert.credentialUrl && (
                    <Button variant="outline" size="sm" asChild className="h-7 text-xs">
                      <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" /> Credential
                      </a>
                    </Button>
                  )}
                  {cert.certificateFile && (
                    <Button variant="outline" size="sm" asChild className="h-7 text-xs">
                      <a href={cert.certificateFile} target="_blank" rel="noopener noreferrer">
                        <FileText className="h-3 w-3 mr-1" /> Certificate
                      </a>
                    </Button>
                  )}
                  <Dialog open={editItem?._id === cert._id} onOpenChange={(o) => !o && setEditItem(null)}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setEditItem(cert)}>
                        <Pencil className="h-3 w-3 mr-1" /> Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] overflow-y-auto">
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
  onSubmit: (e: React.FormEvent<HTMLFormElement>, badgeFile: File | null, certFile: File | null) => Promise<void>;
  submitLabel: string;
  defaultValues?: Partial<TCertification>;
}) {
  const [badgeFile, setBadgeFile] = useState<File | null>(null);
  const [badgePreview, setBadgePreview] = useState<string>(defaultValues?.badgeImage || "");
  const [certFile, setCertFile] = useState<File | null>(null);
  const [certFileName, setCertFileName] = useState<string>(
    defaultValues?.certificateFile ? "Existing file" : "",
  );
  const [loading, setLoading] = useState(false);
  const badgeRef = useRef<HTMLInputElement>(null);
  const certRef = useRef<HTMLInputElement>(null);

  const handleBadgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBadgeFile(file);
    setBadgePreview(URL.createObjectURL(file));
  };

  const handleCertFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCertFile(file);
    setCertFileName(file.name);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(e, badgeFile, certFile);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      {/* Badge Image Upload */}
      <div className="space-y-2">
        <Label>Badge Image</Label>
        <div className="flex items-center gap-3">
          {badgePreview ? (
            <div className="relative w-14 h-14 rounded-lg border overflow-hidden shrink-0">
              <Image src={badgePreview} alt="Badge preview" fill className="object-contain p-1" />
              <button
                type="button"
                onClick={() => { setBadgePreview(""); setBadgeFile(null); if (badgeRef.current) badgeRef.current.value = ""; }}
                className="absolute top-0 right-0 bg-destructive text-white rounded-bl p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div className="w-14 h-14 rounded-lg border border-dashed flex items-center justify-center bg-muted shrink-0">
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1">
            <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => badgeRef.current?.click()}>
              <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload Badge Image
            </Button>
            <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP, SVG</p>
            <input ref={badgeRef} type="file" accept="image/*" className="hidden" onChange={handleBadgeChange} />
          </div>
        </div>
      </div>

      {/* Certificate File Upload (PDF or Image) */}
      <div className="space-y-2">
        <Label>Certificate File</Label>
        <div className="flex items-center gap-3">
          {certFileName ? (
            <div className="flex items-center gap-2 flex-1 bg-muted rounded-lg px-3 py-2 min-w-0">
              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-xs truncate flex-1">{certFileName}</span>
              <button
                type="button"
                onClick={() => { setCertFileName(""); setCertFile(null); if (certRef.current) certRef.current.value = ""; }}
                className="text-muted-foreground hover:text-destructive shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => certRef.current?.click()}>
              <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload Certificate (PDF / Image)
            </Button>
          )}
          <input ref={certRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleCertFileChange} />
        </div>
        {defaultValues?.certificateFile && !certFileName && (
          <a href={defaultValues.certificateFile} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
            <ExternalLink className="h-3 w-3" /> View existing certificate
          </a>
        )}
        <p className="text-xs text-muted-foreground">PDF or image file — uploaded to Cloudinary</p>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        {submitLabel}
      </Button>
    </form>
  );
}
