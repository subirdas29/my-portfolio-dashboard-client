"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
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
} from "recharts";
import { Eye, Heart, FileText, TrendingUp, ExternalLink } from "lucide-react";

type TBlogStat = {
  _id: string;
  title: string;
  slug: string;
  status?: string;
  category?: string;
  publishedAt?: string;
  meta?: { views: number; likes: number };
};

type TBlogAnalyticsData = {
  topByViews: TBlogStat[];
  topByLikes: TBlogStat[];
  publishedVsDraft: { status: string; count: number; views: number; likes: number }[];
  recentActivity: TBlogStat[];
  summary: { totalViews: number; totalLikes: number };
};

const STATUS_COLORS: Record<string, string> = {
  published: "#10b981",
  draft: "#f59e0b",
};

export default function BlogAnalyticsPage({
  data,
}: {
  data: TBlogAnalyticsData | null;
}) {
  const totalBlogs = data?.publishedVsDraft?.reduce((s, p) => s + p.count, 0) ?? 0;

  if (!data || totalBlogs === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Blog Analytics</h1>
        <div className="text-center py-20 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>No blogs found in database yet.</p>
        </div>
      </div>
    );
  }

  const publishedCount =
    data.publishedVsDraft.find((s) => s.status === "published")?.count ?? 0;
  const draftCount =
    data.publishedVsDraft.find((s) => s.status === "draft")?.count ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Views, likes, and engagement across all blog posts.
          </p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatTile
          icon={<Eye className="h-5 w-5" />}
          label="Total Views"
          value={data.summary.totalViews.toLocaleString()}
          color="text-blue-500"
          bg="bg-blue-500/10"
        />
        <StatTile
          icon={<Heart className="h-5 w-5" />}
          label="Total Likes"
          value={data.summary.totalLikes.toLocaleString()}
          color="text-pink-500"
          bg="bg-pink-500/10"
        />
        <StatTile
          icon={<FileText className="h-5 w-5" />}
          label="Published"
          value={String(publishedCount)}
          color="text-emerald-500"
          bg="bg-emerald-500/10"
        />
        <StatTile
          icon={<TrendingUp className="h-5 w-5" />}
          label="Drafts"
          value={String(draftCount)}
          color="text-amber-500"
          bg="bg-amber-500/10"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top Blogs by Views */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              Top Blogs by Views
            </CardTitle>
            <CardDescription>Most viewed published posts</CardDescription>
          </CardHeader>
          <CardContent>
            {data.topByViews.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.topByViews.slice(0, 7)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis
                    dataKey="title"
                    type="category"
                    tick={{ fontSize: 10 }}
                    width={120}
                    tickFormatter={(v) =>
                      v.length > 18 ? v.slice(0, 18) + "…" : v
                    }
                  />
                  <Tooltip
                    contentStyle={{ fontSize: 12 }}
                    formatter={(val) => [val, "Views"]}
                  />
                  <Bar
                    dataKey="meta.views"
                    fill="#6366f1"
                    radius={[0, 4, 4, 0]}
                    name="Views"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No view data yet.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Published vs Draft Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              Published vs Draft
            </CardTitle>
            <CardDescription>Blog post status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie
                    data={data.publishedVsDraft}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={65}
                  >
                    {data.publishedVsDraft.map((e) => (
                      <Cell
                        key={e.status}
                        fill={STATUS_COLORS[e.status] || "#94a3b8"}
                      />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3 flex-1">
                {data.publishedVsDraft.map((s) => (
                  <div key={s.status} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{
                            background: STATUS_COLORS[s.status] || "#94a3b8",
                          }}
                        />
                        <span className="capitalize text-muted-foreground">
                          {s.status}
                        </span>
                      </div>
                      <span className="font-medium">{s.count}</span>
                    </div>
                    <div className="flex gap-3 text-xs text-muted-foreground pl-4">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {s.views.toLocaleString()} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {s.likes} likes
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top by Likes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Heart className="h-4 w-4 text-muted-foreground" />
              Top Blogs by Likes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topByLikes.map((blog, i) => (
                <div
                  key={blog._id}
                  className="flex items-center gap-3 group"
                >
                  <span className="text-lg font-bold text-muted-foreground w-5 shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{blog.title}</p>
                    <div className="flex gap-3 text-xs text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3 text-pink-500" />
                        {blog.meta?.likes ?? 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {blog.meta?.views ?? 0}
                      </span>
                    </div>
                  </div>
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Link href={`/blogs/update-blog/${blog.slug}`}>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Recent Blogs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentActivity.map((blog) => (
                <div
                  key={blog._id}
                  className="flex items-center justify-between group"
                >
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/blogs/update-blog/${blog.slug}`}
                      className="text-sm font-medium hover:underline line-clamp-1"
                    >
                      {blog.title}
                    </Link>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <Badge
                        variant="outline"
                        className={`text-xs py-0 ${blog.status === "published" ? "text-emerald-600 border-emerald-200" : "text-amber-600 border-amber-200"}`}
                      >
                        {blog.status ?? "draft"}
                      </Badge>
                      {blog.category && (
                        <Badge variant="outline" className="text-xs py-0">
                          {blog.category}
                        </Badge>
                      )}
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {blog.meta?.views ?? 0}
                      </span>
                      {blog.publishedAt && (
                        <span>
                          {new Date(blog.publishedAt).toLocaleDateString(
                            "en-GB",
                            { day: "numeric", month: "short" }
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  bg: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <div className={`p-2 rounded-lg ${bg} ${color}`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
