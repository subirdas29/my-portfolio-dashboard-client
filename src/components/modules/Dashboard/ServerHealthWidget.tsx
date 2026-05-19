"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Server, Wifi, WifiOff, Clock, MemoryStick } from "lucide-react";

type HealthData = {
  status: string;
  timestamp: string;
  uptime: { human: string; hours: number; minutes: number };
  memory: { heapUsed: number; heapTotal: number; rss: number };
  nodeVersion: string;
};

export default function ServerHealthWidget() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(true);

  const baseApi = process.env.NEXT_PUBLIC_BASE_API;

  const ping = async () => {
    setChecking(true);
    const start = Date.now();
    try {
      const res = await fetch(
        `${baseApi?.replace("/api/v1", "")}/api/v1/health`,
        { cache: "no-store" }
      );
      const ms = Date.now() - start;
      const data = await res.json();
      setHealth(data);
      setLatency(ms);
      setError(false);
    } catch {
      setError(true);
      setLatency(null);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    ping();
    const interval = setInterval(ping, 60000); // ping every 60s
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const heapMB = health ? Math.round(health.memory.heapUsed / 1024 / 1024) : 0;
  const heapTotalMB = health ? Math.round(health.memory.heapTotal / 1024 / 1024) : 0;
  const heapPct = heapTotalMB > 0 ? Math.round((heapMB / heapTotalMB) * 100) : 0;

  const latencyColor =
    latency === null ? "text-muted-foreground"
    : latency < 300 ? "text-emerald-500"
    : latency < 800 ? "text-amber-500"
    : "text-red-500";

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Server className="h-4 w-4 text-muted-foreground" />
            Server Status
          </span>
          <div className="flex items-center gap-1.5">
            {checking ? (
              <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            ) : error ? (
              <div className="h-2 w-2 rounded-full bg-red-500" />
            ) : (
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
            )}
            <span className={`text-xs font-normal ${error ? "text-red-500" : "text-emerald-500"}`}>
              {checking ? "Checking..." : error ? "Offline" : "Online"}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {error ? (
          <div className="flex items-center gap-2 text-sm text-red-500">
            <WifiOff className="h-4 w-4" />
            Server unreachable
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Wifi className="h-4 w-4" />
                Latency
              </div>
              <span className={`font-medium ${latencyColor}`}>
                {latency !== null ? `${latency}ms` : "—"}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                Uptime
              </div>
              <span className="font-medium">{health?.uptime?.human || "—"}</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MemoryStick className="h-4 w-4" />
                  Heap Memory
                </div>
                <span className="font-medium text-xs">
                  {heapMB}MB / {heapTotalMB}MB
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    heapPct > 80 ? "bg-red-500" : heapPct > 60 ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${heapPct}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Node {health?.nodeVersion}</span>
              <button
                onClick={ping}
                className="hover:text-foreground transition-colors underline"
              >
                Refresh
              </button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
