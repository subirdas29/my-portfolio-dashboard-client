import { getAllProjects } from "@/services/Projects";
import { getAllBlogs } from "@/services/Blogs";
import { getAllSkills } from "@/services/Skills";
import { getAllContacts } from "@/services/contacts";
import DashboardOverview from "@/components/modules/Dashboard/DashboardOverview";
import { TProjects } from "@/types/projects";
import { TBlogs } from "@/types/blogs";
import { TSkill } from "@/types/skills";
import { TContact } from "@/types/contacts";

const AdminHomePage = async () => {
  const [projectsRes, blogsRes, skillsRes, contactsRes] = await Promise.all([
    getAllProjects().catch(() => ({ data: [] })),
    getAllBlogs().catch(() => ({ data: [] })),
    getAllSkills().catch(() => ({ data: [] })),
    getAllContacts({}).catch(() => ({ data: [] })),
  ]);

  const projects: TProjects[] = Array.isArray(projectsRes?.data) ? projectsRes.data : [];
  const blogs: TBlogs[] = Array.isArray(blogsRes?.data) ? blogsRes.data : [];
  const skills: TSkill[] = Array.isArray(skillsRes?.data) ? skillsRes.data : [];
 const contacts: TContact[] = Array.isArray(contactsRes?.data?.result)? contactsRes.data.result: [];




  return (
    <DashboardOverview
      projects={projects}
      blogs={blogs}
      skills={skills}
      contacts={contacts}
    />
  );
};

export default AdminHomePage;
