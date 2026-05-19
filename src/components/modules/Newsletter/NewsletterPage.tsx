"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

type TSubscriber = { _id: string; email: string; createdAt: string; active: boolean };

const deleteSubscriber = async (id: string) => {
  await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/newsletter/${id}`, { method: "DELETE" });
};

export default function NewsletterPage({ subscribers: initial }: { subscribers: TSubscriber[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [subscribers, setSubscribers] = useState(initial);

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this subscriber?")) return;
    await deleteSubscriber(id);
    setSubscribers((prev) => prev.filter((s) => s._id !== id));
    toast.success("Removed");
    startTransition(() => router.refresh());
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Newsletter</h1>
          <p className="text-muted-foreground mt-1">
            {subscribers.length} active subscriber{subscribers.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {subscribers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Mail className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No subscribers yet.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" /> Subscribers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {subscribers.map((s) => (
                <div key={s._id} className="flex items-center justify-between px-6 py-3 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                      <Mail className="h-4 w-4 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{s.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.createdAt ? format(new Date(s.createdAt), "MMM d, yyyy") : "—"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive h-8 w-8 p-0"
                    onClick={() => handleDelete(s._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
