"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import { Star, Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { TTestimonial } from "@/types/testimonial";
import {
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from "@/services/Testimonials";
import { toast } from "sonner";

const StarRating = ({ rating, onChange }: { rating: number; onChange?: (r: number) => void }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        className={`h-4 w-4 ${s <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"} ${onChange ? "cursor-pointer" : ""}`}
        onClick={() => onChange?.(s)}
      />
    ))}
  </div>
);

export default function TestimonialsPage({
  testimonials: initial,
}: {
  testimonials: TTestimonial[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [testimonials, setTestimonials] = useState(initial);
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<TTestimonial | null>(null);
  const [formRating, setFormRating] = useState(5);
  const [editRating, setEditRating] = useState(5);

  const featuredCount = testimonials.filter((t) => t.featured).length;

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name") as string,
      role: fd.get("role") as string,
      company: fd.get("company") as string,
      content: fd.get("content") as string,
      rating: formRating,
      projectName: fd.get("projectName") as string,
      featured: false,
      order: testimonials.length,
    };
    const res = await createTestimonial(payload);
    if (res?.success !== false) {
      toast.success("Testimonial added");
      setAddOpen(false);
      setFormRating(5);
      startTransition(() => router.refresh());
    } else {
      toast.error("Failed to add testimonial");
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editItem) return;
    const fd = new FormData(e.currentTarget);
    await updateTestimonial(editItem._id, {
      name: fd.get("name") as string,
      role: fd.get("role") as string,
      company: fd.get("company") as string,
      content: fd.get("content") as string,
      rating: editRating,
      projectName: fd.get("projectName") as string,
    });
    toast.success("Testimonial updated");
    setEditItem(null);
    startTransition(() => router.refresh());
  };

  const toggleFeatured = async (t: TTestimonial) => {
    await updateTestimonial(t._id, { featured: !t.featured });
    setTestimonials((prev) =>
      prev.map((item) =>
        item._id === t._id ? { ...item, featured: !item.featured } : item
      )
    );
    toast.success(t.featured ? "Removed from featured" : "Added to featured");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    await deleteTestimonial(id);
    setTestimonials((prev) => prev.filter((t) => t._id !== id));
    toast.success("Testimonial deleted");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Testimonials</h1>
          <p className="text-muted-foreground mt-1">
            Manage client reviews — {featuredCount} featured on portfolio.
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Testimonial
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Testimonial</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" name="role" placeholder="CEO, Developer..." />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" name="company" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="projectName">Project</Label>
                  <Input id="projectName" name="projectName" />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Rating</Label>
                <StarRating rating={formRating} onChange={setFormRating} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="content">Review *</Label>
                <Textarea id="content" name="content" rows={4} required />
              </div>
              <Button type="submit" className="w-full">Add Testimonial</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {testimonials.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Star className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-muted-foreground mb-4">No testimonials yet.</p>
            <Button onClick={() => setAddOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add First Testimonial
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <Card
              key={t._id}
              className={`relative ${t.featured ? "ring-2 ring-amber-400/50" : ""}`}
            >
              {t.featured && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-amber-500/10 text-amber-600 text-xs">
                    ⭐ Featured
                  </Badge>
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                    {t.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <CardTitle className="text-sm">{t.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {[t.role, t.company].filter(Boolean).join(" · ")}
                    </p>
                    <StarRating rating={t.rating} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground italic line-clamp-4">
                  &ldquo;{t.content}&rdquo;
                </p>
                {t.projectName && (
                  <p className="text-xs text-muted-foreground">
                    Project: <span className="font-medium">{t.projectName}</span>
                  </p>
                )}
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-7 text-xs"
                    onClick={() => toggleFeatured(t)}
                  >
                    {t.featured ? (
                      <><EyeOff className="h-3 w-3 mr-1" />Unfeature</>
                    ) : (
                      <><Eye className="h-3 w-3 mr-1" />Feature</>
                    )}
                  </Button>
                  <Dialog
                    open={editItem?._id === t._id}
                    onOpenChange={(o) => { if (!o) setEditItem(null); }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => { setEditItem(t); setEditRating(t.rating); }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Testimonial</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleUpdate} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label>Name</Label>
                            <Input name="name" defaultValue={t.name} required />
                          </div>
                          <div className="space-y-1">
                            <Label>Role</Label>
                            <Input name="role" defaultValue={t.role} />
                          </div>
                          <div className="space-y-1">
                            <Label>Company</Label>
                            <Input name="company" defaultValue={t.company} />
                          </div>
                          <div className="space-y-1">
                            <Label>Project</Label>
                            <Input name="projectName" defaultValue={t.projectName} />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label>Rating</Label>
                          <StarRating rating={editRating} onChange={setEditRating} />
                        </div>
                        <div className="space-y-1">
                          <Label>Review</Label>
                          <Textarea name="content" defaultValue={t.content} rows={4} required />
                        </div>
                        <Button type="submit" className="w-full">Update</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 hover:text-red-500"
                    onClick={() => handleDelete(t._id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
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
