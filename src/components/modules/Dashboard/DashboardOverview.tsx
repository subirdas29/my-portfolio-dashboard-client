"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  FolderKanban,
  FileText,
  Wrench,
  Mail,
  Plus,
  ArrowRight,
  TrendingUp,
  Eye,
  Heart,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ExternalLink,
  Users,
  ShoppingBag,
  DollarSign,
  BarChart3,
  Activity,
  Globe,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import AIInsightsWidget from "./AIInsightsWidget";
import ServerHealthWidget from "./ServerHealthWidget";
import GitHubWidget from "./GitHubWidget";
import { TProjects } from "@/types/projects";
import { TBlogs } from "@/types/blogs";
import { TSkill } from "@/types/skills";
import { TContact } from "@/types/contacts";
import { TClient } from "@/types/client";
import { TOrder, TRevenueMonth } from "@/types/order";
import { TAnalyticsStats } from "@/types/analytics";
import { TGoal } from "@/types/goal";
import { format } from "date-fns";

interface DashboardOverviewProps {
  projects: TProjects[];
  blogs: TBlogs[];
  skills: TSkill[];
  contacts: TContact[];
  clients: TClient[];
  orders: TOrder[];
  revenueData: TRevenueMonth[];
  analyticsStats: TAnalyticsStats | null;
  funnelData: { stage: string; count: number; description: string }[];
  goals: TGoal[];
  ordersMeta: {
    revenueStats?: { totalBudget: number; totalPaid: number; totalOrders: number };
    statusCounts?: { status: string; count: number }[];
  };
}

const DEVICE_COLORS: Record<string, string> = {
  desktop: "#6366f1",
  mobile: "#f59e0b",
  tablet: "#10b981",
};

export default function DashboardOverview({
  projects: rawProjects,
  blogs: rawBlogs,
  skills: rawSkills,
  contacts: rawContacts,
  clients: rawClients,
  orders: rawOrders,
  revenueData,
  analyticsStats,
  funnelData,
  goals,
  ordersMeta,
}: DashboardOverviewProps) {
  const projects = Array.isArray(rawProjects) ? rawProjects : [];
  const blogs = Array.isArray(rawBlogs) ? rawBlogs : [];
  const skills = Array.isArray(rawSkills) ? rawSkills : [];
  const contacts = Array.isArray(rawContacts) ? rawContacts : [];
  const clients = Array.isArray(rawClients) ? rawClients : [];
  const orders = Array.isArray(rawOrders) ? rawOrders : [];

  const totalProjects = projects.length;
  const totalBlogs = blogs.length;
  const totalSkills = skills.length;
  const totalContacts = contacts.length;
  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.status === "Active").length;
  const leadClients = clients.filter((c) => c.status === "Lead").length;

  const publishedBlogs = blogs.filter((b) => b.status === "published").length;
  const draftBlogs = blogs.filter((b) => b.status === "draft").length;

  const fullStackProjects = projects.filter(
    (p) => p.projectType === "Full-Stack"
  ).length;
  const frontEndProjects = projects.filter(
    (p) => p.projectType === "Front-End"
  ).length;

  const pendingContacts = contacts.filter((c) => c.status === "Pending").length;
  const dealingContacts = contacts.filter((c) => c.status === "Dealing").length;
  const bookedContacts = contacts.filter((c) => c.status === "Booked").length;
  const closedContacts = contacts.filter((c) => c.status === "Closed").length;
  const noResponseContacts = contacts.filter(
    (c) => c.status === "No Response"
  ).length;
  const repliedContacts = contacts.filter((c) => c.status === "Replied").length;

  const totalBlogViews = blogs.reduce((sum, b) => sum + (b.meta?.views || 0), 0);
  const totalBlogLikes = blogs.reduce((sum, b) => sum + (b.meta?.likes || 0), 0);

  const totalRevenue = ordersMeta?.revenueStats?.totalPaid ?? 0;
  const activeOrders = orders.filter(
    (o) => o.status === "In Progress" || o.status === "Pending" || o.status === "Review"
  ).length;

  const recentProjects = [...projects].slice(0, 5);
  const recentBlogs = [...blogs].slice(0, 5);
  const recentContacts = [...contacts].slice(0, 5);

  const allTechnologies = projects.flatMap((p) => p.technologies || []);
  const uniqueTechnologies = [...new Set(allTechnologies)];

  // Activity feed: merge recent contacts + orders + blogs, sort by date
  const activityItems = [
    ...contacts.slice(0, 3).map((c) => ({
      type: "contact" as const,
      title: `New message from ${c.name}`,
      sub: c.subject,
      time: c.createdAt,
      href: "/contact",
    })),
    ...orders.slice(0, 3).map((o) => ({
      type: "order" as const,
      title: `Order: ${o.title}`,
      sub: o.status,
      time: o.createdAt,
      href: "/orders",
    })),
    ...blogs
      .filter((b) => b.status === "published")
      .slice(0, 2)
      .map((b) => ({
        type: "blog" as const,
        title: `Published: ${b.title}`,
        sub: b.category || "Blog",
        time: b.publishedAt || b.createdAt,
        href: `/blogs/update-blog/${b.slug}`,
      })),
  ]
    .filter((a) => a.time)
    .sort((a, b) => new Date(b.time!).getTime() - new Date(a.time!).getTime())
    .slice(0, 8);

  const visitorChartData = analyticsStats?.dailyViews?.slice(-14) ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Full command center — portfolio, clients, revenue & traffic.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm">
            <Link href="/projects/add-projects">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/blogs/add-blog">
              <Plus className="mr-2 h-4 w-4" />
              New Blog
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          description={`${activeOrders} active orders`}
          icon={<DollarSign className="h-5 w-5" />}
          href="/orders"
          color="text-emerald-500"
          bgColor="bg-emerald-500/10"
        />
        <KPICard
          title="Active Clients"
          value={activeClients}
          description={`${leadClients} leads · ${totalClients} total`}
          icon={<Users className="h-5 w-5" />}
          href="/clients"
          color="text-blue-500"
          bgColor="bg-blue-500/10"
        />
        <KPICard
          title="New Contacts"
          value={pendingContacts}
          description={`${totalContacts} total · ${bookedContacts} booked`}
          icon={<Mail className="h-5 w-5" />}
          href="/contact"
          color="text-amber-500"
          bgColor="bg-amber-500/10"
        />
        <KPICard
          title="Visitors Today"
          value={analyticsStats?.todayViews ?? 0}
          description={`${analyticsStats?.realtimeCount ?? 0} active now`}
          icon={<Globe className="h-5 w-5" />}
          href="/traffic"
          color="text-violet-500"
          bgColor="bg-violet-500/10"
        />
      </div>

      {/* Secondary Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Projects"
          value={totalProjects}
          description={`${fullStackProjects} Full-Stack · ${frontEndProjects} Front-End`}
          icon={<FolderKanban className="h-5 w-5" />}
          href="/projects/all-projects"
          color="text-blue-500"
          bgColor="bg-blue-500/10"
        />
        <StatCard
          title="Blogs"
          value={totalBlogs}
          description={`${publishedBlogs} Published · ${draftBlogs} Drafts`}
          icon={<FileText className="h-5 w-5" />}
          href="/blogs/all-blogs"
          color="text-cyan-500"
          bgColor="bg-cyan-500/10"
        />
        <StatCard
          title="Total Views"
          value={totalBlogViews}
          description={`${totalBlogLikes} likes · ${publishedBlogs} published blogs`}
          icon={<Eye className="h-5 w-5" />}
          href="/blogs/all-blogs"
          color="text-pink-500"
          bgColor="bg-pink-500/10"
        />
        <StatCard
          title="Skills"
          value={totalSkills}
          description={`${uniqueTechnologies.length} unique technologies`}
          icon={<Wrench className="h-5 w-5" />}
          href="/skills/add-skills"
          color="text-orange-500"
          bgColor="bg-orange-500/10"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Visitor Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              Visitors — Last 14 Days
            </CardTitle>
            <CardDescription>
              {analyticsStats
                ? `${analyticsStats.totalViews.toLocaleString()} total views (30d)`
                : "No data yet — analytics tracking active"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {visitorChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={visitorChartData}>
                  <defs>
                    <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => v.slice(5)}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    labelFormatter={(l) => `Date: ${l}`}
                    contentStyle={{ fontSize: 12 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke="#6366f1"
                    fill="url(#viewsGrad)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="unique"
                    stroke="#10b981"
                    fill="none"
                    strokeWidth={1.5}
                    strokeDasharray="4 2"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">
                Visitor data will appear once portfolio gets traffic.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              Revenue — Last 6 Months
            </CardTitle>
            <CardDescription>
              ${(ordersMeta?.revenueStats?.totalBudget ?? 0).toLocaleString()} total budget · $
              {totalRevenue.toLocaleString()} collected
            </CardDescription>
          </CardHeader>
          <CardContent>
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Bar dataKey="budget" fill="#6366f1" opacity={0.4} radius={[4, 4, 0, 0]} name="Budget" />
                  <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} name="Collected" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">
                Revenue data will appear once orders are created.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Funnel + Goals Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Conversion Funnel */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              Conversion Funnel
            </CardTitle>
            <CardDescription>Contact → Client → Order → Completed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {funnelData.length > 0 ? funnelData.map((stage, i) => {
              const maxCount = funnelData[0]?.count || 1;
              const pct = Math.round((stage.count / maxCount) * 100);
              const colors = ["bg-blue-500", "bg-violet-500", "bg-amber-500", "bg-emerald-500"];
              return (
                <div key={stage.stage} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{stage.stage}</span>
                    <span className="font-medium">{stage.count}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full ${colors[i] || "bg-gray-500"} transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            }) : (
              <p className="text-sm text-muted-foreground text-center py-4">No data yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Goals Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-medium">Goals — {new Date().getFullYear()}</CardTitle>
              <CardDescription>
                {goals.filter((g) => g.completed).length}/{goals.length} completed this year
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/goals">
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {goals.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-2">No goals set yet.</p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/goals"><Plus className="h-3.5 w-3.5 mr-1" />Set a Goal</Link>
                </Button>
              </div>
            ) : goals.slice(0, 3).map((goal) => {
              const pct = Math.min(Math.round((goal.current / goal.target) * 100), 100);
              const typeColors: Record<string, string> = { revenue: "bg-emerald-500", blog_posts: "bg-blue-500", clients: "bg-violet-500", orders: "bg-amber-500", custom: "bg-pink-500" };
              return (
                <div key={goal._id} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground truncate flex-1 mr-2">{goal.title}</span>
                    <span className="font-medium shrink-0">{goal.current}/{goal.target}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full ${typeColors[goal.type] || "bg-gray-500"} transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Device + Blog Engagement + Server Health + GitHub + Contact Pipeline */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {/* Device Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              Traffic Devices
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsStats?.deviceBreakdown?.length ? (
              <div className="space-y-3">
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie
                      data={analyticsStats.deviceBreakdown}
                      dataKey="count"
                      nameKey="device"
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={55}
                    >
                      {analyticsStats.deviceBreakdown.map((entry, i) => (
                        <Cell
                          key={`${entry.device}-${i}`}
                          fill={DEVICE_COLORS[entry.device] || "#94a3b8"}
                        />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                {analyticsStats.deviceBreakdown.map((d, i) => (
                  <div key={`${d.device}-${i}`} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: DEVICE_COLORS[d.device] || "#94a3b8" }}
                      />
                      <span className="capitalize text-muted-foreground">{d.device}</span>
                    </div>
                    <span className="font-medium">{d.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[160px] flex flex-col items-center justify-center gap-2 text-muted-foreground text-sm">
                <Globe className="h-8 w-8 opacity-30" />
                <p>No traffic data yet</p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/traffic">View Traffic</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Blog Engagement */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              Blog Engagement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Eye className="h-4 w-4" />
                Total Views
              </div>
              <span className="text-lg font-semibold">{totalBlogViews.toLocaleString()}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Heart className="h-4 w-4" />
                Total Likes
              </div>
              <span className="text-lg font-semibold">{totalBlogLikes.toLocaleString()}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                Published
              </div>
              <span className="text-lg font-semibold">{publishedBlogs}</span>
            </div>
            <Separator />
            <BreakdownBar
              label="Published"
              value={publishedBlogs}
              total={totalBlogs}
              color="bg-emerald-500"
            />
            <BreakdownBar
              label="Draft"
              value={draftBlogs}
              total={totalBlogs}
              color="bg-amber-500"
            />
          </CardContent>
        </Card>

        {/* Server Health */}
        <ServerHealthWidget />

        {/* GitHub Widget */}
        <GitHubWidget />

        {/* Contact Pipeline */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              Contact Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <ContactStatusRow label="Pending" count={pendingContacts} icon={<Clock className="h-3.5 w-3.5" />} color="text-amber-500" />
            <ContactStatusRow label="Dealing" count={dealingContacts} icon={<AlertCircle className="h-3.5 w-3.5" />} color="text-blue-500" />
            <ContactStatusRow label="Replied" count={repliedContacts} icon={<CheckCircle2 className="h-3.5 w-3.5" />} color="text-emerald-500" />
            <ContactStatusRow label="Booked" count={bookedContacts} icon={<CheckCircle2 className="h-3.5 w-3.5" />} color="text-violet-500" />
            <ContactStatusRow label="Closed" count={closedContacts} icon={<CheckCircle2 className="h-3.5 w-3.5" />} color="text-gray-500" />
            <ContactStatusRow label="No Response" count={noResponseContacts} icon={<AlertCircle className="h-3.5 w-3.5" />} color="text-red-500" />
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed + Recent Contacts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Activity Feed
            </CardTitle>
            <CardDescription>Latest events across all modules</CardDescription>
          </CardHeader>
          <CardContent>
            {activityItems.length > 0 ? (
              <div className="space-y-3">
                {activityItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${
                        item.type === "contact"
                          ? "bg-amber-500/10 text-amber-500"
                          : item.type === "order"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-blue-500/10 text-blue-500"
                      }`}
                    >
                      {item.type === "contact" ? (
                        <Mail className="h-3.5 w-3.5" />
                      ) : item.type === "order" ? (
                        <ShoppingBag className="h-3.5 w-3.5" />
                      ) : (
                        <FileText className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={item.href}
                        className="text-sm font-medium hover:underline line-clamp-1"
                      >
                        {item.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">{item.sub}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {item.time
                        ? format(new Date(item.time), "MMM d")
                        : ""}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Activity will appear here as you use the dashboard.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Contacts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Contacts</CardTitle>
              <CardDescription>Latest messages from visitors</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/contact">
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentContacts.length > 0 ? (
              <div className="space-y-3">
                {recentContacts.map((contact) => (
                  <div
                    key={contact._id}
                    className="flex items-center justify-between border rounded-lg p-2.5 gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium">{contact.name}</p>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getContactStatusColor(contact.status)}`}
                        >
                          {contact.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {contact.subject}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                message="No contacts yet"
                actionHref="/contact"
                actionLabel="View Contacts"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects + Blogs */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Projects</CardTitle>
              <CardDescription>Latest added projects</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/projects/all-projects">
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentProjects.length > 0 ? (
              <div className="space-y-3">
                {recentProjects.map((project) => (
                  <div
                    key={project._id}
                    className="flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <FolderKanban className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{project.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {project.projectType}
                        </p>
                      </div>
                    </div>
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                    >
                      <Link href={`/projects/update-project/${project.slug}`}>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                message="No projects yet"
                actionHref="/projects/add-projects"
                actionLabel="Add Project"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Blogs</CardTitle>
              <CardDescription>Latest blog posts</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/blogs/all-blogs">
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentBlogs.length > 0 ? (
              <div className="space-y-3">
                {recentBlogs.map((blog) => (
                  <div
                    key={blog._id}
                    className="flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{blog.title}</p>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded-full ${
                              blog.status === "published"
                                ? "bg-emerald-500/10 text-emerald-600"
                                : "bg-amber-500/10 text-amber-600"
                            }`}
                          >
                            {blog.status}
                          </span>
                          {blog.meta?.views !== undefined && (
                            <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                              <Eye className="h-3 w-3" />
                              {blog.meta.views}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                    >
                      <Link href={`/blogs/update-blog/${blog.slug}`}>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                message="No blogs yet"
                actionHref="/blogs/add-blog"
                actionLabel="Add Blog"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <AIInsightsWidget />

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
          <CardDescription>Common tasks at your fingertips</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <QuickAction href="/projects/add-projects" icon={<FolderKanban className="h-5 w-5" />} label="Add Project" description="Create a new portfolio project" />
            <QuickAction href="/blogs/add-blog" icon={<FileText className="h-5 w-5" />} label="Write Blog" description="Publish a new blog post" />
            <QuickAction href="/clients" icon={<Users className="h-5 w-5" />} label="Manage Clients" description="CRM — clients & leads" />
            <QuickAction href="/orders" icon={<ShoppingBag className="h-5 w-5" />} label="View Orders" description="Track active orders & revenue" />
            <QuickAction href="/traffic" icon={<Globe className="h-5 w-5" />} label="Traffic Analytics" description="Visitor stats & page views" />
            <QuickAction href="/skills/add-skills" icon={<Wrench className="h-5 w-5" />} label="Add Skill" description="Add a new skill to profile" />
            <QuickAction href="/contact" icon={<Mail className="h-5 w-5" />} label="View Messages" description="Check contact submissions" />
            <QuickAction href="/blogs/all-blogs" icon={<TrendingUp className="h-5 w-5" />} label="Blog Analytics" description="Views, likes & engagement" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function KPICard({
  title, value, description, icon, href, color, bgColor,
}: {
  title: string; value: string | number; description: string;
  icon: React.ReactNode; href: string; color: string; bgColor: string;
}) {
  return (
    <Link href={href}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4" style={{ borderLeftColor: "transparent" }}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className={`p-2 rounded-lg ${bgColor} ${color}`}>{icon}</div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function StatCard({
  title, value, description, icon, href, color, bgColor,
}: {
  title: string; value: number; description: string;
  icon: React.ReactNode; href: string; color: string; bgColor: string;
}) {
  return (
    <Link href={href}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className={`p-2 rounded-lg ${bgColor} ${color}`}>{icon}</div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function BreakdownBar({ label, value, total, color }: { label: string; value: number; total: number; color: string; }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value} ({pct.toFixed(0)}%)</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ContactStatusRow({ label, count, icon, color }: { label: string; count: number; icon: React.ReactNode; color: string; }) {
  return (
    <div className="flex items-center justify-between py-1">
      <div className={`flex items-center gap-2 text-sm ${color}`}>
        {icon}
        <span>{label}</span>
      </div>
      <span className="text-sm font-semibold">{count}</span>
    </div>
  );
}

function QuickAction({ href, icon, label, description }: { href: string; icon: React.ReactNode; label: string; description: string; }) {
  return (
    <Button asChild variant="outline" className="h-auto py-4 px-4 justify-start gap-3">
      <Link href={href}>
        <div className="p-2 rounded-lg bg-muted">{icon}</div>
        <div className="text-left">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </Link>
    </Button>
  );
}

function EmptyState({ message, actionHref, actionLabel }: { message: string; actionHref: string; actionLabel: string; }) {
  return (
    <div className="flex flex-col items-center justify-center py-6 text-center">
      <p className="text-sm text-muted-foreground mb-3">{message}</p>
      <Button asChild variant="outline" size="sm">
        <Link href={actionHref}>
          <Plus className="mr-1 h-3.5 w-3.5" />
          {actionLabel}
        </Link>
      </Button>
    </div>
  );
}

function getContactStatusColor(status: string) {
  switch (status) {
    case "Pending": return "bg-amber-500/10 text-amber-600";
    case "Replied": return "bg-emerald-500/10 text-emerald-600";
    case "Dealing": return "bg-blue-500/10 text-blue-600";
    case "Booked": return "bg-violet-500/10 text-violet-600";
    case "Closed": return "bg-gray-500/10 text-gray-600";
    case "No Response": return "bg-red-500/10 text-red-600";
    default: return "bg-gray-500/10 text-gray-600";
  }
}
