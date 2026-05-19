'use server';

import { TAnalyticsStats } from '@/types/analytics';

export const getConversionFunnel = async () => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/analytics/funnel`, {
      next: { tags: ['Analytics'], revalidate: 300 },
    });
    return await res.json();
  } catch {
    return { data: [] };
  }
};

export const getAnalyticsStats = async (days = 30): Promise<{ data: TAnalyticsStats | null }> => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API}/analytics/stats?days=${days}`,
      { next: { tags: ['Analytics'], revalidate: 60 } },
    );
    return await res.json();
  } catch {
    return { data: null };
  }
};
