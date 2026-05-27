"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Globe, Eye, Users, Activity, Wifi, Timer, MousePointerClick } from "lucide-react";
import { TAnalyticsStats } from "@/types/analytics";

const DEVICE_COLORS: Record<string, string> = {
  desktop: "#6366f1",
  mobile: "#f59e0b",
  tablet: "#10b981",
};

export default function TrafficDashboard({
  stats,
  days,
}: {
  stats: TAnalyticsStats | null;
  days: number;
}) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Traffic Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Portfolio visitor stats — page views, devices, referrers.
          </p>
        </div>
        <div className="flex gap-2">
          {[7, 14, 30].map((d) => (
            <Button
              key={d}
              variant={days === d ? "default" : "outline"}
              size="sm"
              onClick={() => router.push(`/traffic?days=${d}`)}
            >
              {d}d
            </Button>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatTile
          icon={<Eye className="h-5 w-5" />}
          label="Total Views"
          value={(stats?.totalViews ?? 0).toLocaleString()}
          sub={`Last ${days} days`}
          color="text-blue-500"
          bg="bg-blue-500/10"
        />
        <StatTile
          icon={<Activity className="h-5 w-5" />}
          label="Today Views"
          value={(stats?.todayViews ?? 0).toLocaleString()}
          sub="Since midnight"
          color="text-emerald-500"
          bg="bg-emerald-500/10"
        />
        <StatTile
          icon={<Users className="h-5 w-5" />}
          label="Unique Today"
          value={(stats?.uniqueVisitorsToday ?? 0).toLocaleString()}
          sub="Distinct IPs today"
          color="text-violet-500"
          bg="bg-violet-500/10"
        />
        <StatTile
          icon={<Wifi className="h-5 w-5" />}
          label="Active Now"
          value={(stats?.realtimeCount ?? 0).toLocaleString()}
          sub="Last 5 minutes"
          color="text-amber-500"
          bg="bg-amber-500/10"
        />
        <StatTile
          icon={<Timer className="h-5 w-5" />}
          label="Avg Session"
          value={stats?.avgSessionDuration ? `${stats.avgSessionDuration}s` : "—"}
          sub="Avg time on page"
          color="text-pink-500"
          bg="bg-pink-500/10"
        />
        <StatTile
          icon={<MousePointerClick className="h-5 w-5" />}
          label="Avg Scroll"
          value={stats?.avgScrollDepth ? `${stats.avgScrollDepth}%` : "—"}
          sub={`Max: ${stats?.maxScrollDepth ?? 0}%`}
          color="text-indigo-500"
          bg="bg-indigo-500/10"
        />
      </div>

      {/* Daily Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Daily Visitors</CardTitle>
          <CardDescription>Page views & unique visitors per day</CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.dailyViews?.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={stats.dailyViews}>
                <defs>
                  <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Legend />
                <Area type="monotone" dataKey="views" stroke="#6366f1" fill="url(#grad1)" strokeWidth={2} name="Views" />
                <Area type="monotone" dataKey="unique" stroke="#10b981" fill="url(#grad2)" strokeWidth={2} name="Unique" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <NoData label="Visit your portfolio to start collecting data." />
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Top Pages</CardTitle>
            <CardDescription>Most visited URLs</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.topPages?.length ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.topPages} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis
                    dataKey="url"
                    type="category"
                    tick={{ fontSize: 10 }}
                    width={100}
                    tickFormatter={(v) => (v.length > 14 ? v.slice(0, 14) + "…" : v)}
                  />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} name="Views" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <NoData label="No page view data yet." />
            )}
          </CardContent>
        </Card>

        {/* Device + Referrers */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Device Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.deviceBreakdown?.length ? (
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width={120} height={120}>
                    <PieChart>
                      <Pie data={stats.deviceBreakdown} dataKey="count" nameKey="device" cx="50%" cy="50%" innerRadius={30} outerRadius={55}>
                        {stats.deviceBreakdown.map((e, i) => (
                          <Cell key={`${e.device}-${i}`} fill={DEVICE_COLORS[e.device] || "#94a3b8"} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 flex-1">
                    {stats.deviceBreakdown.map((d, i) => (
                      <div key={`${d.device}-${i}`} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: DEVICE_COLORS[d.device] || "#94a3b8" }} />
                          <span className="capitalize text-muted-foreground">{d.device}</span>
                        </div>
                        <span className="font-medium">{d.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <NoData label="No device data yet." />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Top Referrers</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.referrerBreakdown?.length ? (
                <div className="space-y-2">
                  {stats.referrerBreakdown.slice(0, 5).map((r, i) => (
                    <div key={`${r.referrer}-${i}`} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground truncate max-w-[180px]">
                        {r.referrer || "Direct"}
                      </span>
                      <span className="font-medium shrink-0">{r.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <NoData label="No referrer data yet." />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatTile({ icon, label, value, sub, color, bg }: {
  icon: React.ReactNode; label: string; value: string; sub: string; color: string; bg: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <div className={`p-2 rounded-lg ${bg} ${color}`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}

function NoData({ label }: { label: string }) {
  return (
    <div className="h-32 flex flex-col items-center justify-center gap-2 text-muted-foreground">
      <Globe className="h-8 w-8 opacity-30" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
