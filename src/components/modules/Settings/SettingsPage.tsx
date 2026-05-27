"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { User, Link2, DollarSign, Globe, Save, CheckCircle2 } from "lucide-react";
import { TSettings, updateSettings } from "@/services/Settings";
import { toast } from "sonner";

export default function SettingsPage({ settings }: { settings: TSettings | null }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [available, setAvailable] = useState(settings?.availableForWork ?? true);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);

    const payload: Partial<TSettings> = {
      ownerName: fd.get("ownerName") as string,
      ownerEmail: fd.get("ownerEmail") as string,
      ownerPhone: fd.get("ownerPhone") as string,
      ownerTitle: fd.get("ownerTitle") as string,
      ownerBio: fd.get("ownerBio") as string,
      avatarUrl: fd.get("avatarUrl") as string,
      resumeUrl: fd.get("resumeUrl") as string,
      githubUrl: fd.get("githubUrl") as string,
      linkedinUrl: fd.get("linkedinUrl") as string,
      twitterUrl: fd.get("twitterUrl") as string,
      websiteUrl: fd.get("websiteUrl") as string,
      hourlyRate: fd.get("hourlyRate") ? Number(fd.get("hourlyRate")) : undefined,
      currency: fd.get("currency") as string,
      timezone: fd.get("timezone") as string,
      siteTitle: fd.get("siteTitle") as string,
      siteDescription: fd.get("siteDescription") as string,
      availableForWork: available,
    };

    const res = await updateSettings(payload);
    if (res?.success !== false) {
      toast.success("Settings saved successfully");
      startTransition(() => router.refresh());
    } else {
      toast.error("Failed to save settings");
    }
    setSaving(false);
  };

  const s = settings;

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">Portfolio profile & site configuration.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            className={available ? "bg-emerald-500/10 text-emerald-600 cursor-pointer" : "bg-gray-500/10 text-gray-600 cursor-pointer"}
            onClick={() => setAvailable((v) => !v)}
          >
            {available ? <><CheckCircle2 className="h-3 w-3 mr-1" />Available for Work</> : "Not Available"}
          </Badge>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile Info
            </CardTitle>
            <CardDescription>Your name, title, bio shown on dashboard & portfolio.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="ownerName">Full Name</Label>
                <Input id="ownerName" name="ownerName" defaultValue={s?.ownerName ?? "Subir Das"} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ownerTitle">Title / Role</Label>
                <Input id="ownerTitle" name="ownerTitle" defaultValue={s?.ownerTitle ?? "Full Stack Developer"} placeholder="Full Stack Developer" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ownerEmail">Email</Label>
                <Input id="ownerEmail" name="ownerEmail" type="email" defaultValue={s?.ownerEmail} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ownerPhone">Phone</Label>
                <Input id="ownerPhone" name="ownerPhone" defaultValue={s?.ownerPhone} />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="ownerBio">Bio</Label>
              <Textarea id="ownerBio" name="ownerBio" rows={3} defaultValue={s?.ownerBio} placeholder="Short bio shown on your portfolio..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="avatarUrl">Avatar URL</Label>
                <Input id="avatarUrl" name="avatarUrl" defaultValue={s?.avatarUrl} placeholder="https://..." />
              </div>
              <div className="space-y-1">
                <Label htmlFor="resumeUrl">Resume URL</Label>
                <Input id="resumeUrl" name="resumeUrl" defaultValue={s?.resumeUrl} placeholder="https://..." />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Social Links
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="githubUrl">GitHub</Label>
              <Input id="githubUrl" name="githubUrl" defaultValue={s?.githubUrl} placeholder="https://github.com/..." />
            </div>
            <div className="space-y-1">
              <Label htmlFor="linkedinUrl">LinkedIn</Label>
              <Input id="linkedinUrl" name="linkedinUrl" defaultValue={s?.linkedinUrl} placeholder="https://linkedin.com/in/..." />
            </div>
            <div className="space-y-1">
              <Label htmlFor="twitterUrl">Twitter / X</Label>
              <Input id="twitterUrl" name="twitterUrl" defaultValue={s?.twitterUrl} placeholder="https://twitter.com/..." />
            </div>
            <div className="space-y-1">
              <Label htmlFor="websiteUrl">Website</Label>
              <Input id="websiteUrl" name="websiteUrl" defaultValue={s?.websiteUrl} placeholder="https://..." />
            </div>
          </CardContent>
        </Card>

        {/* Business */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Business Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label htmlFor="hourlyRate">Hourly Rate</Label>
              <Input id="hourlyRate" name="hourlyRate" type="number" defaultValue={s?.hourlyRate} placeholder="e.g. 50" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="currency">Currency</Label>
              <select id="currency" name="currency" defaultValue={s?.currency ?? "USD"} className="w-full h-9 px-3 rounded-md border bg-background text-sm">
                <option>USD</option><option>BDT</option><option>EUR</option><option>GBP</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" name="timezone" defaultValue={s?.timezone ?? "Asia/Dhaka"} />
            </div>
            <div className="col-span-3 pt-1">
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  className={`relative w-10 h-5 rounded-full transition-colors ${available ? "bg-emerald-500" : "bg-muted"}`}
                  onClick={() => setAvailable((v) => !v)}
                >
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${available ? "translate-x-5" : ""}`} />
                </div>
                <span className="text-sm">Available for new projects</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* SEO */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Site Config
            </CardTitle>
            <CardDescription>Metadata used across the portfolio.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="siteTitle">Site Title</Label>
              <Input id="siteTitle" name="siteTitle" defaultValue={s?.siteTitle} placeholder="Subir Das — Full Stack Developer" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="siteDescription">Site Description</Label>
              <Textarea id="siteDescription" name="siteDescription" rows={2} defaultValue={s?.siteDescription} placeholder="Portfolio description for SEO..." />
            </div>
          </CardContent>
        </Card>

        <Separator />
        <Button type="submit" disabled={saving} className="w-full md:w-auto">
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </form>
    </div>
  );
}
