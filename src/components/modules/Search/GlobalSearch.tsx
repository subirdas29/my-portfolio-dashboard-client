"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  FolderKanban,
  FileText,
  Users,
  ShoppingBag,
  Mail,
  Globe,
  Target,
  Star,
  Wrench,
  LayoutDashboard,
  Search,
} from "lucide-react";

type SearchItem = {
  id: string;
  label: string;
  sub?: string;
  href: string;
  icon: React.ReactNode;
  group: string;
};

const STATIC_PAGES: SearchItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/", icon: <LayoutDashboard className="h-4 w-4" />, group: "Pages" },
  { id: "traffic", label: "Traffic Analytics", href: "/traffic", icon: <Globe className="h-4 w-4" />, group: "Pages" },
  { id: "goals", label: "Goal Tracker", href: "/goals", icon: <Target className="h-4 w-4" />, group: "Pages" },
  { id: "clients", label: "Clients CRM", href: "/clients", icon: <Users className="h-4 w-4" />, group: "Pages" },
  { id: "orders", label: "Orders", href: "/orders", icon: <ShoppingBag className="h-4 w-4" />, group: "Pages" },
  { id: "contact", label: "Contact Messages", href: "/contact", icon: <Mail className="h-4 w-4" />, group: "Pages" },
  { id: "blog-analytics", label: "Blog Analytics", href: "/blogs/analytics", icon: <FileText className="h-4 w-4" />, group: "Pages" },
  { id: "all-projects", label: "All Projects", href: "/projects/all-projects", icon: <FolderKanban className="h-4 w-4" />, group: "Pages" },
  { id: "add-project", label: "Add Project", href: "/projects/add-projects", icon: <FolderKanban className="h-4 w-4" />, group: "Pages" },
  { id: "all-blogs", label: "All Blogs", href: "/blogs/all-blogs", icon: <FileText className="h-4 w-4" />, group: "Pages" },
  { id: "add-blog", label: "Add Blog", href: "/blogs/add-blog", icon: <FileText className="h-4 w-4" />, group: "Pages" },
  { id: "skills", label: "Skills", href: "/skills/add-skills", icon: <Wrench className="h-4 w-4" />, group: "Pages" },
  { id: "testimonials", label: "Testimonials", href: "/testimonials", icon: <Star className="h-4 w-4" />, group: "Pages" },
];

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [dynamicItems, setDynamicItems] = useState<SearchItem[]>([]);
  const router = useRouter();

  const baseApi = process.env.NEXT_PUBLIC_BASE_API;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const fetchDynamic = useCallback(async (q: string) => {
    if (!q || q.length < 2 || !baseApi) return;
    try {
      const [projRes, blogRes, clientRes, orderRes] = await Promise.all([
        fetch(`${baseApi}/projects?searchTerm=${q}&limit=3`).then((r) => r.json()),
        fetch(`${baseApi}/blogs?searchTerm=${q}&limit=3`).then((r) => r.json()),
        fetch(`${baseApi}/clients?searchTerm=${q}&limit=3`).then((r) => r.json()),
        fetch(`${baseApi}/orders?searchTerm=${q}&limit=3`).then((r) => r.json()),
      ]);

      const items: SearchItem[] = [
        ...(projRes?.data || []).map((p: { _id: string; title: string; projectType: string; slug: string }) => ({
          id: `proj-${p._id}`,
          label: p.title,
          sub: p.projectType,
          href: `/projects/update-project/${p.slug}`,
          icon: <FolderKanban className="h-4 w-4" />,
          group: "Projects",
        })),
        ...(blogRes?.data || []).map((b: { _id: string; title: string; status: string; slug: string }) => ({
          id: `blog-${b._id}`,
          label: b.title,
          sub: b.status,
          href: `/blogs/update-blog/${b.slug}`,
          icon: <FileText className="h-4 w-4" />,
          group: "Blogs",
        })),
        ...(clientRes?.data?.result || []).map((c: { _id: string; name: string; email: string }) => ({
          id: `client-${c._id}`,
          label: c.name,
          sub: c.email,
          href: `/clients`,
          icon: <Users className="h-4 w-4" />,
          group: "Clients",
        })),
        ...(orderRes?.data?.result || []).map((o: { _id: string; title: string; status: string }) => ({
          id: `order-${o._id}`,
          label: o.title,
          sub: o.status,
          href: `/orders/${o._id}`,
          icon: <ShoppingBag className="h-4 w-4" />,
          group: "Orders",
        })),
      ];
      setDynamicItems(items);
    } catch {}
  }, [baseApi]);

  useEffect(() => {
    const t = setTimeout(() => fetchDynamic(query), 300);
    return () => clearTimeout(t);
  }, [query, fetchDynamic]);

  const allItems = query.length >= 2 ? dynamicItems : STATIC_PAGES;

  const groups = Array.from(new Set(allItems.map((i) => i.group)));

  const handleSelect = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm text-muted-foreground hover:bg-muted transition-colors"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Search...</span>
        <kbd className="ml-2 pointer-events-none hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
          ⌘K
        </kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <div className="relative z-50 w-full max-w-xl">
        <Command
          className="rounded-xl border shadow-2xl bg-background overflow-hidden"
          shouldFilter={false}
        >
          <div className="flex items-center border-b px-4 gap-2">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Search projects, blogs, clients, orders..."
              className="flex h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              autoFocus
            />
            <kbd
              className="pointer-events-none shrink-0 inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground cursor-pointer"
              onClick={() => setOpen(false)}
            >
              ESC
            </kbd>
          </div>
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
              {query.length >= 2 ? "No results found." : "Type to search..."}
            </Command.Empty>
            {groups.map((group) => (
              <Command.Group key={group} heading={group} className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted-foreground">
                {allItems
                  .filter((i) => i.group === group)
                  .map((item) => (
                    <Command.Item
                      key={item.id}
                      value={item.id}
                      onSelect={() => handleSelect(item.href)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm hover:bg-muted data-[selected=true]:bg-muted transition-colors"
                    >
                      <div className="text-muted-foreground shrink-0">{item.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.label}</p>
                        {item.sub && (
                          <p className="text-xs text-muted-foreground truncate">{item.sub}</p>
                        )}
                      </div>
                    </Command.Item>
                  ))}
              </Command.Group>
            ))}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
