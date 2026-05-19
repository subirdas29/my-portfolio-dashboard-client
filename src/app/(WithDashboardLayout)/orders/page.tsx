import { getAllOrders, getRevenueByMonth } from "@/services/Orders";
import { getAllClients } from "@/services/Clients";
import OrdersPage from "@/components/modules/Orders/OrdersPage";
import { TOrder, TRevenueMonth } from "@/types/order";
import { TClient } from "@/types/client";

const OrdersPageRoute = async () => {
  const [ordersRes, revenueRes, clientsRes] = await Promise.all([
    getAllOrders().catch(() => ({ data: { result: [], meta: {} } })),
    getRevenueByMonth(6).catch(() => ({ data: [] })),
    getAllClients().catch(() => ({ data: { result: [] } })),
  ]);

  const orders: TOrder[] = Array.isArray(ordersRes?.data?.result)
    ? ordersRes.data.result
    : [];
  const revenueData: TRevenueMonth[] = Array.isArray(revenueRes?.data)
    ? revenueRes.data
    : [];
  const clients: TClient[] = Array.isArray(clientsRes?.data?.result)
    ? clientsRes.data.result
    : [];
  const ordersMeta = ordersRes?.data?.meta ?? {};

  return (
    <OrdersPage
      orders={orders}
      revenueData={revenueData}
      clients={clients}
      ordersMeta={ordersMeta}
    />
  );
};

export default OrdersPageRoute;
