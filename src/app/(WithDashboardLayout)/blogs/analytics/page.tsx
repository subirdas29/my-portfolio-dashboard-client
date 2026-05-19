import { getBlogAnalytics } from "@/services/BlogAnalytics";
import BlogAnalyticsPage from "@/components/modules/BlogAnalytics/BlogAnalyticsPage";

const BlogAnalyticsRoute = async () => {
  const res = await getBlogAnalytics().catch(() => ({ data: null }));
  return <BlogAnalyticsPage data={res?.data ?? null} />;
};

export default BlogAnalyticsRoute;
