"use client";

import * as React from "react";
import {
  LayoutDashboard,
  FolderKanban,
  Wrench,
  FileText,
  Mail,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";

import Link from "next/link";
import { NavUser } from "./nav-user";



const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Manage Projects",
      url: "/projects/all-projects",
      icon: FolderKanban,
      items: [
        {
          title: "All Projects",
          url: "/projects/all-projects",
        },
        {
          title: "Add Projects",
          url: "/projects/add-projects",
        },
      ],
    },
    {
      title: "Manage Skills",
      url: "/skills/add-skills",
      icon: Wrench,
      items: [
        {
          title: "Skills",
          url: "/skills/add-skills",
        },
      ],
    },
    {
      title: "Manage Blogs",
      url: "/blogs/all-blogs",
      icon: FileText,
      items: [
        {
          title: "All Blogs",
          url: "/blogs/all-blogs",
        },
        {
          title: "Add Blogs",
          url: "/blogs/add-blog",
        },
      ],
    },
    {
      title: "Manage Contacts",
      url: "/contact",
      icon: Mail,
      items: [
        {
          title: "All Contacts",
          url: "/contact",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex items-center justify-center">
                  {/* <Logo /> */}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <h2 className="font-bold text-xl">Portfolio-Dashboard</h2>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}