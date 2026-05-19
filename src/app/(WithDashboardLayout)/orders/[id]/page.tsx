import { getOrderById } from "@/services/Orders";
import { getAllClients } from "@/services/Clients";
import OrderDetailPage from "@/components/modules/Orders/OrderDetailPage";
import { notFound } from "next/navigation";
import { TClient } from "@/types/client";

const OrderDetailRoute = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const [orderRes, clientsRes] = await Promise.all([
    getOrderById(id).catch(() => ({ data: null })),
    getAllClients().catch(() => ({ data: { result: [] } })),
  ]);

  if (!orderRes?.data) return notFound();

  const clients: TClient[] = Array.isArray(clientsRes?.data?.result)
    ? clientsRes.data.result
    : [];

  return <OrderDetailPage order={orderRes.data} clients={clients} />;
};

export default OrderDetailRoute;
