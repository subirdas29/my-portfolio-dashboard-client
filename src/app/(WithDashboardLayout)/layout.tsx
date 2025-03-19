
// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbList,
//   BreadcrumbPage,
//   BreadcrumbSeparator,
// } from "@/components/ui/breadcrumb";
// import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "@/components/modules/sidebar/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
// import { getMe } from "@/services/User";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
//   const {data} = await getMe()
  return (
    <SidebarProvider>
      <AppSidebar
    //    userData={data}
       />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
          </div>
        </header>
        <div className="p-4 pt-0 min-h-screen">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}