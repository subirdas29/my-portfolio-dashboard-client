import { AppSidebar } from "@/components/modules/sidebar/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import NotificationBell from "@/components/modules/Notifications/NotificationBell";
import GlobalSearch from "@/components/modules/Search/GlobalSearch";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <span className="text-sm font-medium text-muted-foreground hidden sm:block">
              Portfolio Dashboard
            </span>
          </div>
          <div className="flex items-center gap-2">
            <GlobalSearch />
            <NotificationBell />
          </div>
        </header>
        <div className="p-4 md:p-6 lg:p-8 min-h-screen">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}