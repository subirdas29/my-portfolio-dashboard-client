import { getAnalyticsStats } from "@/services/Analytics";
import TrafficDashboard from "@/components/modules/Traffic/TrafficDashboard";

const TrafficPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) => {
  const { days: daysParam } = await searchParams;
  const days = daysParam ? Number(daysParam) : 30;
  const res = await getAnalyticsStats(days).catch(() => ({ data: null }));

  return <TrafficDashboard stats={res?.data ?? null} days={days} />;
};

export default TrafficPage;
