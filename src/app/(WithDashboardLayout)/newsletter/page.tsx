import NewsletterPage from "@/components/modules/Newsletter/NewsletterPage";

const getSubscribers = async () => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/newsletter`, {
      next: { tags: ["Newsletter"] },
    });
    return await res.json();
  } catch {
    return { data: [] };
  }
};

const NewsletterPageRoute = async () => {
  const res = await getSubscribers().catch(() => ({ data: [] }));
  const subscribers = Array.isArray(res?.data) ? res.data : [];
  return <NewsletterPage subscribers={subscribers} />;
};

export default NewsletterPageRoute;
