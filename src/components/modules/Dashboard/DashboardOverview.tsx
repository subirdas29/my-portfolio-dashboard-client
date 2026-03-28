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
} from "lucide-react";
import { TProjects } from "@/types/projects";
import { TBlogs } from "@/types/blogs";
import { TSkill } from "@/types/skills";
import { TContact } from "@/types/contacts";

interface DashboardOverviewProps {
  projects: TProjects[];
  blogs: TBlogs[];
  skills: TSkill[];
  contacts: TContact[];
}

export default function DashboardOverview({
  projects: rawProjects,
  blogs: rawBlogs,
  skills: rawSkills,
  contacts: rawContacts,
}: DashboardOverviewProps) {
  const projects = Array.isArray(rawProjects) ? rawProjects : [];
  const blogs = Array.isArray(rawBlogs) ? rawBlogs : [];
  const skills = Array.isArray(rawSkills) ? rawSkills : [];
  const contacts = Array.isArray(rawContacts) ? rawContacts : [];

  

  const totalProjects = projects.length;
  const totalBlogs = blogs.length;
  const totalSkills = skills.length;
  const totalContacts = contacts.length;

  const publishedBlogs = blogs.filter((b) => b.status === "published").length;
  const draftBlogs = blogs.filter((b) => b.status === "draft").length;

  const fullStackProjects = projects.filter(
    (p) => p.projectType === "Full-Stack"
  ).length;
  const frontEndProjects = projects.filter(
    (p) => p.projectType === "Front-End"
  ).length;

  const pendingContacts = contacts.filter((c) => c.status === "Pending").length;
  const repliedContacts = contacts.filter((c) => c.status === "Replied").length;
  const dealingContacts = contacts.filter((c) => c.status === "Dealing").length;
  const bookedContacts = contacts.filter((c) => c.status === "Booked").length;
  const closedContacts = contacts.filter((c) => c.status === "Closed").length;
  const noResponseContacts = contacts.filter(
    (c) => c.status === "No Response"
  ).length;

  const totalBlogViews = blogs.reduce(
    (sum, b) => sum + (b.meta?.views || 0),
    0
  );
  const totalBlogLikes = blogs.reduce(
    (sum, b) => sum + (b.meta?.likes || 0),
    0
  );

  const recentProjects = [...projects].slice(0, 5);
  const recentBlogs = [...blogs].slice(0, 5);
  const recentContacts = [...contacts].slice(0, 5);

  const allTechnologies = projects.flatMap((p) => p.technologies || []);
  const uniqueTechnologies = [...new Set(allTechnologies)];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here&apos;s your portfolio overview.
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

      {/* Main Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Projects"
          value={totalProjects}
          description={`${fullStackProjects} Full-Stack · ${frontEndProjects} Front-End`}
          icon={<FolderKanban className="h-5 w-5" />}
          href="/projects/all-projects"
          color="text-blue-500"
          bgColor="bg-blue-500/10"
        />
        <StatCard
          title="Total Blogs"
          value={totalBlogs}
          description={`${publishedBlogs} Published · ${draftBlogs} Drafts`}
          icon={<FileText className="h-5 w-5" />}
          href="/blogs/all-blogs"
          color="text-emerald-500"
          bgColor="bg-emerald-500/10"
        />
        <StatCard
          title="Total Skills"
          value={totalSkills}
          description={`${uniqueTechnologies.length} unique technologies`}
          icon={<Wrench className="h-5 w-5" />}
          href="/skills/add-skills"
          color="text-violet-500"
          bgColor="bg-violet-500/10"
        />
        <StatCard
          title="Total Contacts"
          value={totalContacts}
          description={`${pendingContacts} pending · ${dealingContacts} dealing`}
          icon={<Mail className="h-5 w-5" />}
          href="/contact"
          color="text-amber-500"
          bgColor="bg-amber-500/10"
        />
      </div>

      {/* Secondary Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
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
              <span className="text-lg font-semibold">
                {totalBlogViews.toLocaleString()}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Heart className="h-4 w-4" />
                Total Likes
              </div>
              <span className="text-lg font-semibold">
                {totalBlogLikes.toLocaleString()}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                Published
              </div>
              <span className="text-lg font-semibold">{publishedBlogs}</span>
            </div>
          </CardContent>
        </Card>

        {/* Project Types Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
              Project Types
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <BreakdownBar
              label="Full-Stack"
              value={fullStackProjects}
              total={totalProjects}
              color="bg-blue-500"
            />
            <BreakdownBar
              label="Front-End"
              value={frontEndProjects}
              total={totalProjects}
              color="bg-cyan-500"
            />
            {totalProjects === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No projects yet
              </p>
            )}
            <Separator />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Technologies Used</span>
              <span className="font-medium">
                {uniqueTechnologies.length} unique
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Contact Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              Contact Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <ContactStatusRow
              label="Pending"
              count={pendingContacts}
              icon={<Clock className="h-3.5 w-3.5" />}
              color="text-amber-500"
            />
            <ContactStatusRow
              label="Dealing"
              count={dealingContacts}
              icon={<AlertCircle className="h-3.5 w-3.5" />}
              color="text-blue-500"
            />
            <ContactStatusRow
              label="Replied"
              count={repliedContacts}
              icon={<CheckCircle2 className="h-3.5 w-3.5" />}
              color="text-emerald-500"
            />
            <ContactStatusRow
              label="Booked"
              count={bookedContacts}
              icon={<CheckCircle2 className="h-3.5 w-3.5" />}
              color="text-violet-500"
            />
            <ContactStatusRow
              label="Closed"
              count={closedContacts}
              icon={<CheckCircle2 className="h-3.5 w-3.5" />}
              color="text-gray-500"
            />
            <ContactStatusRow
              label="No Response"
              count={noResponseContacts}
              icon={<AlertCircle className="h-3.5 w-3.5" />}
              color="text-red-500"
            />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Projects */}
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
                        <p className="text-sm font-medium truncate">
                          {project.title}
                        </p>
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
                      <Link
                        href={`/projects/update-project/${project.slug}`}
                      >
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

        {/* Recent Blogs */}
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
                        <p className="text-sm font-medium truncate">
                          {blog.title}
                        </p>
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
                          {blog.category && (
                            <span className="text-xs text-muted-foreground">
                              {blog.category}
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
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {recentContacts.map((contact) => (
                <div
                  key={contact._id}
                  className="rounded-lg border p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{contact.name}</p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${getContactStatusColor(
                        contact.status
                      )}`}
                    >
                      {contact.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {contact.subject}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {contact.message}
                  </p>
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

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
          <CardDescription>Common tasks at your fingertips</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <QuickAction
              href="/projects/add-projects"
              icon={<FolderKanban className="h-5 w-5" />}
              label="Add Project"
              description="Create a new portfolio project"
            />
            <QuickAction
              href="/blogs/add-blog"
              icon={<FileText className="h-5 w-5" />}
              label="Write Blog"
              description="Publish a new blog post"
            />
            <QuickAction
              href="/skills/add-skills"
              icon={<Wrench className="h-5 w-5" />}
              label="Add Skill"
              description="Add a new skill to your profile"
            />
            <QuickAction
              href="/contact"
              icon={<Mail className="h-5 w-5" />}
              label="View Messages"
              description="Check contact submissions"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  icon,
  href,
  color,
  bgColor,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  bgColor: string;
}) {
  return (
    <Link href={href}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
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

function BreakdownBar({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
          {value} ({percentage.toFixed(0)}%)
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function ContactStatusRow({
  label,
  count,
  icon,
  color,
}: {
  label: string;
  count: number;
  icon: React.ReactNode;
  color: string;
}) {
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

function QuickAction({
  href,
  icon,
  label,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  description: string;
}) {
  return (
    <Button
      asChild
      variant="outline"
      className="h-auto py-4 px-4 justify-start gap-3"
    >
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

function EmptyState({
  message,
  actionHref,
  actionLabel,
}: {
  message: string;
  actionHref: string;
  actionLabel: string;
}) {
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
    case "Pending":
      return "bg-amber-500/10 text-amber-600";
    case "Replied":
      return "bg-emerald-500/10 text-emerald-600";
    case "Dealing":
      return "bg-blue-500/10 text-blue-600";
    case "Booked":
      return "bg-violet-500/10 text-violet-600";
    case "Closed":
      return "bg-gray-500/10 text-gray-600";
    case "No Response":
      return "bg-red-500/10 text-red-600";
    default:
      return "bg-gray-500/10 text-gray-600";
  }
}
