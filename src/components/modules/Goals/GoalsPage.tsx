"use client";

import { useState, useTransition } from "react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Target,
  Plus,
  RefreshCw,
  Trash2,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  FileText,
  Users,
  ShoppingBag,
  Pencil,
} from "lucide-react";
import { TGoal, TGoalType, TGoalPeriod } from "@/types/goal";
import { createGoal, updateGoal, deleteGoal, syncGoals } from "@/services/Goals";
import { toast } from "sonner";

const TYPE_ICONS: Record<TGoalType, React.ReactNode> = {
  revenue: <DollarSign className="h-4 w-4" />,
  blog_posts: <FileText className="h-4 w-4" />,
  clients: <Users className="h-4 w-4" />,
  orders: <ShoppingBag className="h-4 w-4" />,
  custom: <Target className="h-4 w-4" />,
};

const TYPE_COLORS: Record<TGoalType, string> = {
  revenue: "text-emerald-500",
  blog_posts: "text-blue-500",
  clients: "text-violet-500",
  orders: "text-amber-500",
  custom: "text-pink-500",
};

const TYPE_BG: Record<TGoalType, string> = {
  revenue: "bg-emerald-500",
  blog_posts: "bg-blue-500",
  clients: "bg-violet-500",
  orders: "bg-amber-500",
  custom: "bg-pink-500",
};

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export default function GoalsPage({
  goals: initialGoals,
  currentYear,
}: {
  goals: TGoal[];
  currentYear: number;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [goals, setGoals] = useState(initialGoals);
  const [addOpen, setAddOpen] = useState(false);
  const [editGoal, setEditGoal] = useState<TGoal | null>(null);
  const [syncing, setSyncing] = useState(false);

  const completedCount = goals.filter((g) => g.completed).length;
  const inProgressCount = goals.filter((g) => !g.completed).length;

  const handleSync = async () => {
    setSyncing(true);
    await syncGoals();
    toast.success("Goals synced with latest data");
    setSyncing(false);
    startTransition(() => router.refresh());
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      title: fd.get("title") as string,
      type: fd.get("type") as TGoalType,
      period: fd.get("period") as TGoalPeriod,
      target: Number(fd.get("target")),
      current: Number(fd.get("current") || 0),
      unit: fd.get("unit") as string,
      year: Number(fd.get("year") || currentYear),
      month: fd.get("month") ? Number(fd.get("month")) : undefined,
      notes: fd.get("notes") as string,
    };
    const res = await createGoal(payload);
    if (res?.success !== false) {
      toast.success("Goal created");
      setAddOpen(false);
      startTransition(() => router.refresh());
    } else {
      toast.error("Failed to create goal");
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editGoal) return;
    const fd = new FormData(e.currentTarget);
    const currentVal = Number(fd.get("current"));
    const targetVal = Number(fd.get("target"));
    await updateGoal(editGoal._id, {
      current: currentVal,
      target: targetVal,
      notes: fd.get("notes") as string,
      completed: currentVal >= targetVal,
    });
    toast.success("Goal updated");
    setEditGoal(null);
    startTransition(() => router.refresh());
  };

  const handleToggleComplete = async (goal: TGoal) => {
    await updateGoal(goal._id, { completed: !goal.completed });
    toast.success(goal.completed ? "Marked as in progress" : "Marked as completed!");
    startTransition(() => router.refresh());
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this goal?")) return;
    await deleteGoal(id);
    setGoals((prev) => prev.filter((g) => g._id !== id));
    toast.success("Goal deleted");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Goal Tracker</h1>
          <p className="text-muted-foreground mt-1">
            Set monthly/quarterly targets — revenue, blogs, clients, orders.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={syncing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
            Sync
          </Button>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Goal</DialogTitle>
              </DialogHeader>
              <GoalForm onSubmit={handleCreate} submitLabel="Create Goal" currentYear={currentYear} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{completedCount}</p>
              <p className="text-xs text-muted-foreground">Goals Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{inProgressCount}</p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-500">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{goals.length}</p>
              <p className="text-xs text-muted-foreground">Total Goals {currentYear}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-muted-foreground mb-4">
              No goals yet. Set your first target!
            </p>
            <Button onClick={() => setAddOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create First Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const pct = Math.min(
              Math.round((goal.current / goal.target) * 100),
              100,
            );
            return (
              <Card
                key={goal._id}
                className={`relative overflow-hidden ${goal.completed ? "opacity-80" : ""}`}
              >
                {goal.completed && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-emerald-500/10 text-emerald-600 text-xs">
                      ✓ Done
                    </Badge>
                  </div>
                )}
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg bg-opacity-10 ${TYPE_COLORS[goal.type]} bg-current/10`}
                    >
                      {TYPE_ICONS[goal.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm font-medium leading-tight">
                        {goal.title}
                      </CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        {goal.period === "monthly" && goal.month
                          ? `${MONTHS[goal.month - 1]} ${goal.year}`
                          : `${goal.period} ${goal.year}`}
                        {goal.unit && ` · ${goal.unit}`}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Progress */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {goal.current} / {goal.target}
                        {goal.unit && ` ${goal.unit}`}
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${TYPE_BG[goal.type]} transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-right text-muted-foreground">
                      {pct}% complete
                    </p>
                  </div>

                  {goal.notes && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {goal.notes}
                    </p>
                  )}

                  <Separator />
                  <div className="flex gap-2">
                    <Dialog
                      open={editGoal?._id === goal._id}
                      onOpenChange={(o) => !o && setEditGoal(null)}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-7 text-xs"
                          onClick={() => setEditGoal(goal)}
                        >
                          <Pencil className="h-3 w-3 mr-1" />
                          Update
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Update Goal — {goal.title}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleUpdate} className="space-y-4">
                          <div className="space-y-1">
                            <Label>Current Progress</Label>
                            <Input name="current" type="number" defaultValue={goal.current} min={0} />
                          </div>
                          <div className="space-y-1">
                            <Label>Target</Label>
                            <Input name="target" type="number" defaultValue={goal.target} min={1} />
                          </div>
                          <div className="space-y-1">
                            <Label>Notes</Label>
                            <Input name="notes" defaultValue={goal.notes} placeholder="Optional notes..." />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            💡 Goal auto-marks completed when current ≥ target
                          </p>
                          <Button type="submit" className="w-full">Save Changes</Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant={goal.completed ? "outline" : "ghost"}
                      size="sm"
                      title={goal.completed ? "Mark as In Progress" : "Mark as Completed"}
                      className={`h-7 w-7 p-0 ${goal.completed ? "text-emerald-600 border-emerald-300" : "text-muted-foreground hover:text-emerald-600"}`}
                      onClick={() => handleToggleComplete(goal)}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-red-500"
                      onClick={() => handleDelete(goal._id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function GoalForm({
  onSubmit,
  submitLabel,
  currentYear,
}: {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  submitLabel: string;
  currentYear: number;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="title">Goal Title *</Label>
        <Input id="title" name="title" placeholder="e.g. Earn $2000 this month" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="type">Type</Label>
          <select id="type" name="type" className="w-full h-9 px-3 rounded-md border bg-background text-sm">
            <option value="revenue">Revenue ($)</option>
            <option value="blog_posts">Blog Posts</option>
            <option value="clients">New Clients</option>
            <option value="orders">Orders</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="period">Period</Label>
          <select id="period" name="period" className="w-full h-9 px-3 rounded-md border bg-background text-sm">
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="target">Target *</Label>
          <Input id="target" name="target" type="number" placeholder="e.g. 2000" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="unit">Unit</Label>
          <Input id="unit" name="unit" placeholder="USD / posts / clients" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="year">Year</Label>
          <Input id="year" name="year" type="number" defaultValue={currentYear} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="month">Month (1-12)</Label>
          <Input id="month" name="month" type="number" min={1} max={12} placeholder={String(new Date().getMonth() + 1)} />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="notes">Notes</Label>
        <Input id="notes" name="notes" placeholder="Optional notes..." />
      </div>
      <Button type="submit" className="w-full">{submitLabel}</Button>
    </form>
  );
}
