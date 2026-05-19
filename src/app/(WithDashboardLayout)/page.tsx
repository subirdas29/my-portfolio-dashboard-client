import { getAllProjects } from "@/services/Projects";
import { getAllBlogs } from "@/services/Blogs";
import { getAllSkills } from "@/services/Skills";
import { getAllContacts } from "@/services/contacts";
import { getAllClients } from "@/services/Clients";
import { getAllOrders, getRevenueByMonth } from "@/services/Orders";
import { getAnalyticsStats, getConversionFunnel } from "@/services/Analytics";
import { getAllGoals } from "@/services/Goals";
import DashboardOverview from "@/components/modules/Dashboard/DashboardOverview";
import { TProjects } from "@/types/projects";
import { TBlogs } from "@/types/blogs";
import { TSkill } from "@/types/skills";
import { TContact } from "@/types/contacts";
import { TClient } from "@/types/client";
import { TOrder, TRevenueMonth } from "@/types/order";
import { TAnalyticsStats } from "@/types/analytics";
import { TGoal } from "@/types/goal";

const AdminHomePage = async () => {
  const [
    projectsRes,
    blogsRes,
    skillsRes,
    contactsRes,
    clientsRes,
    ordersRes,
    revenueRes,
    analyticsRes,
    funnelRes,
    goalsRes,
  ] = await Promise.all([
    getAllProjects().catch(() => ({ data: [] })),
    getAllBlogs().catch(() => ({ data: [] })),
    getAllSkills().catch(() => ({ data: [] })),
    getAllContacts({}).catch(() => ({ data: [] })),
    getAllClients().catch(() => ({ data: { result: [] } })),
    getAllOrders().catch(() => ({ data: { result: [], meta: {} } })),
    getRevenueByMonth(6).catch(() => ({ data: [] })),
    getAnalyticsStats(30).catch(() => ({ data: null })),
    getConversionFunnel().catch(() => ({ data: [] })),
    getAllGoals(new Date().getFullYear()).catch(() => ({ data: [] })),
  ]);

  const projects: TProjects[] = Array.isArray(projectsRes?.data)
    ? projectsRes.data
    : [];
  const blogs: TBlogs[] = Array.isArray(blogsRes?.data) ? blogsRes.data : [];
  const skills: TSkill[] = Array.isArray(skillsRes?.data)
    ? skillsRes.data
    : [];
  const contacts: TContact[] = Array.isArray(contactsRes?.data?.result)
    ? contactsRes.data.result
    : [];
  const clients: TClient[] = Array.isArray(clientsRes?.data?.result)
    ? clientsRes.data.result
    : [];
  const orders: TOrder[] = Array.isArray(ordersRes?.data?.result)
    ? ordersRes.data.result
    : [];
  const revenueData: TRevenueMonth[] = Array.isArray(revenueRes?.data)
    ? revenueRes.data
    : [];
  const analyticsStats: TAnalyticsStats | null = analyticsRes?.data ?? null;
  const ordersMeta = ordersRes?.data?.meta ?? {};
  const funnelData = Array.isArray(funnelRes?.data) ? funnelRes.data : [];
  const goals: TGoal[] = Array.isArray(goalsRes?.data) ? goalsRes.data : [];

  return (
    <DashboardOverview
      projects={projects}
      blogs={blogs}
      skills={skills}
      contacts={contacts}
      clients={clients}
      orders={orders}
      revenueData={revenueData}
      analyticsStats={analyticsStats}
      ordersMeta={ordersMeta}
      funnelData={funnelData}
      goals={goals}
    />
  );
};

export default AdminHomePage;
