import { getClientWithStats } from "@/services/Clients";
import ClientDetailPage from "@/components/modules/Clients/ClientDetailPage";
import { notFound } from "next/navigation";

const ClientDetailRoute = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const res = await getClientWithStats(id).catch(() => ({ data: null }));
  if (!res?.data) return notFound();
  return <ClientDetailPage data={res.data} />;
};

export default ClientDetailRoute;
