"use client";

import { useEffect, useState, useCallback } from "react";
import { Bell, Mail, ShoppingBag, CheckCheck, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

type TNotification = {
  _id: string;
  type: string;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: string;
};

const ICON_MAP: Record<string, React.ReactNode> = {
  new_message: <Mail className="h-4 w-4" />,
  new_order: <ShoppingBag className="h-4 w-4" />,
  order_completed: <CheckCheck className="h-4 w-4" />,
  milestone_due: <AlertCircle className="h-4 w-4" />,
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<TNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const baseApi = process.env.NEXT_PUBLIC_BASE_API;

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(`${baseApi}/notifications?limit=20`);
      const data = await res.json();
      if (data?.data?.notifications) {
        setNotifications(data.data.notifications);
        setUnread(data.data.unreadCount);
      }
    } catch {}
  }, [baseApi]);

  useEffect(() => {
    fetchNotifications();

    // SSE for real-time
    if (!baseApi) return;
    const es = new EventSource(`${baseApi}/notifications/stream`);
    es.onmessage = (e) => {
      const payload = JSON.parse(e.data);
      if (payload.type === "notification") {
        setNotifications((prev) => [payload.data, ...prev].slice(0, 20));
        setUnread((u) => u + 1);
      }
    };
    return () => es.close();
  }, [baseApi, fetchNotifications]);

  const markAllRead = async () => {
    await fetch(`${baseApi}/notifications/read-all`, { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
  };

  const markRead = async (id: string) => {
    await fetch(`${baseApi}/notifications/${id}/read`, { method: "PATCH" });
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
    setUnread((u) => Math.max(0, u - 1));
  };

  const deleteNotif = async (id: string, wasRead: boolean) => {
    await fetch(`${baseApi}/notifications/${id}`, { method: "DELETE" });
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    if (!wasRead) setUnread((u) => Math.max(0, u - 1));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unread > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={markAllRead}>
              Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No notifications yet.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                className={`flex items-start gap-3 px-4 py-3 border-b last:border-0 transition-colors ${
                  !n.read ? "bg-muted/40" : ""
                }`}
              >
                <div
                  className={`mt-0.5 p-1.5 rounded-full shrink-0 ${
                    n.type === "new_message"
                      ? "bg-amber-500/10 text-amber-500"
                      : n.type === "new_order"
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-blue-500/10 text-blue-500"
                  }`}
                >
                  {ICON_MAP[n.type] || <Bell className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0" onClick={() => markRead(n._id)}>
                  <p className={`text-xs font-medium ${!n.read ? "" : "text-muted-foreground"}`}>
                    {n.title}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{n.body}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {format(new Date(n.createdAt), "MMM d, h:mm a")}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 text-muted-foreground hover:text-red-500"
                  onClick={() => deleteNotif(n._id, n.read)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
