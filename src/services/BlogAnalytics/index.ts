'use server';

export const getBlogAnalytics = async () => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/blogs/analytics`, {
      next: { tags: ['BlogAnalytics'] },
    });
    return await res.json();
  } catch {
    return { data: null };
  }
};
