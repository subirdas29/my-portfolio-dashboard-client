"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, ShoppingBag, Target, AlertCircle } from "lucide-react";
import { TOrder } from "@/types/order";
import { TGoal } from "@/types/goal";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, isToday, addMonths, subMonths } from "date-fns";

type CalEvent = {
  date: Date;
  label: string;
  type: "deadline" | "milestone" | "goal";
  href: string;
  overdue?: boolean;
};

const TYPE_STYLES = {
  deadline: "bg-red-500/10 text-red-600 border-red-200",
  milestone: "bg-blue-500/10 text-blue-600 border-blue-200",
  goal: "bg-violet-500/10 text-violet-600 border-violet-200",
};

const TYPE_ICONS = {
  deadline: <ShoppingBag className="h-3 w-3" />,
  milestone: <AlertCircle className="h-3 w-3" />,
  goal: <Target className="h-3 w-3" />,
};

export default function CalendarPage({ orders, goals }: { orders: TOrder[]; goals: TGoal[] }) {
  const [current, setCurrent] = useState(new Date());
  const [selected, setSelected] = useState<Date | null>(null);

  const now = new Date();

  const events = useMemo<CalEvent[]>(() => {
    const evs: CalEvent[] = [];

    orders.forEach((o) => {
      if (o.deadline) {
        evs.push({
          date: new Date(o.deadline),
          label: `📦 ${o.title}`,
          type: "deadline",
          href: `/orders/${o._id}`,
          overdue: new Date(o.deadline) < now && o.status !== "Completed",
        });
      }
      o.milestones.forEach((m) => {
        if (m.dueDate && !m.done) {
          evs.push({
            date: new Date(m.dueDate),
            label: `✓ ${m.title}`,
            type: "milestone",
            href: `/orders/${o._id}`,
            overdue: new Date(m.dueDate) < now,
          });
        }
      });
    });

    goals.forEach((g) => {
      if (g.month && g.year && !g.completed) {
        const goalDate = new Date(g.year, g.month - 1, 1);
        evs.push({
          date: goalDate,
          label: `🎯 ${g.title}`,
          type: "goal",
          href: "/goals",
        });
      }
    });

    return evs;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, goals]);

  const monthStart = startOfMonth(current);
  const monthEnd = endOfMonth(current);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad start of grid
  const startPad = monthStart.getDay();
  const padDays = Array.from({ length: startPad });

  const eventsOnDate = (date: Date) => events.filter((e) => isSameDay(e.date, date));
  const selectedEvents = selected ? eventsOnDate(selected) : [];

  // Upcoming events sorted
  const upcoming = events
    .filter((e) => e.date >= now)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 8);

  const overdue = events.filter((e) => e.overdue).sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground mt-1">Order deadlines, milestones & goal targets.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm"><Link href="/orders">Orders</Link></Button>
          <Button asChild variant="outline" size="sm"><Link href="/goals">Goals</Link></Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{format(current, "MMMM yyyy")}</CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrent(subMonths(current, 1))}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setCurrent(new Date())}>
                    Today
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrent(addMonths(current, 1))}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Day headers */}
              <div className="grid grid-cols-7 mb-1">
                {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
                  <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
                ))}
              </div>
              {/* Grid */}
              <div className="grid grid-cols-7 gap-px">
                {padDays.map((_, i) => <div key={`pad-${i}`} />)}
                {days.map((day) => {
                  const dayEvents = eventsOnDate(day);
                  const isSelected = selected && isSameDay(day, selected);
                  const today = isToday(day);
                  return (
                    <div
                      key={day.toISOString()}
                      onClick={() => setSelected(isSameDay(day, selected ?? new Date(0)) ? null : day)}
                      className={`min-h-[60px] p-1 rounded-lg cursor-pointer transition-colors border ${
                        isSelected ? "bg-primary/10 border-primary" :
                        today ? "border-primary/40 bg-primary/5" :
                        "border-transparent hover:bg-muted"
                      }`}
                    >
                      <div className={`text-xs font-medium mb-1 w-5 h-5 flex items-center justify-center rounded-full ${
                        today ? "bg-primary text-primary-foreground" : "text-foreground"
                      }`}>
                        {format(day, "d")}
                      </div>
                      <div className="space-y-0.5">
                        {dayEvents.slice(0, 2).map((ev, i) => (
                          <div key={i} className={`text-[9px] px-1 py-0.5 rounded truncate border ${
                            ev.overdue ? "bg-red-500/10 text-red-600 border-red-200" : TYPE_STYLES[ev.type]
                          }`}>
                            {ev.label}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-[9px] text-muted-foreground">+{dayEvents.length - 2} more</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected day events */}
              {selected && selectedEvents.length > 0 && (
                <div className="mt-4 pt-4 border-t space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">{format(selected, "EEEE, MMMM d")}</p>
                  {selectedEvents.map((ev, i) => (
                    <Link key={i} href={ev.href} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors">
                      <div className={`p-1 rounded ${TYPE_STYLES[ev.type]}`}>{TYPE_ICONS[ev.type]}</div>
                      <span className="text-sm flex-1 truncate">{ev.label}</span>
                      {ev.overdue && <Badge className="bg-red-500/10 text-red-600 text-xs">Overdue</Badge>}
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Overdue */}
          {overdue.length > 0 && (
            <Card className="border-red-200 dark:border-red-900/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-red-600 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Overdue ({overdue.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {overdue.slice(0, 4).map((ev, i) => (
                  <Link key={i} href={ev.href} className="flex items-center gap-2 text-sm hover:underline">
                    <div className="p-1 rounded bg-red-500/10 text-red-500 shrink-0">{TYPE_ICONS[ev.type]}</div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs font-medium">{ev.label}</p>
                      <p className="text-xs text-muted-foreground">{format(ev.date, "MMM d")}</p>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Upcoming */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {upcoming.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming deadlines.</p>
              ) : upcoming.map((ev, i) => (
                <Link key={i} href={ev.href} className="flex items-center gap-2 hover:bg-muted rounded-lg p-1.5 transition-colors">
                  <div className={`p-1 rounded shrink-0 ${TYPE_STYLES[ev.type]}`}>{TYPE_ICONS[ev.type]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{ev.label}</p>
                    <p className="text-xs text-muted-foreground">{format(ev.date, "MMM d, yyyy")}</p>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Legend */}
          <Card>
            <CardContent className="pt-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Legend</p>
              {(["deadline","milestone","goal"] as const).map((t) => (
                <div key={t} className="flex items-center gap-2 text-xs">
                  <div className={`p-1 rounded ${TYPE_STYLES[t]}`}>{TYPE_ICONS[t]}</div>
                  <span className="capitalize">{t}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
