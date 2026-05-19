import { getAllOrders } from "@/services/Orders";
import { getAllGoals } from "@/services/Goals";
import CalendarPage from "@/components/modules/Calendar/CalendarPage";
import { TOrder } from "@/types/order";
import { TGoal } from "@/types/goal";

const CalendarPageRoute = async () => {
  const [ordersRes, goalsRes] = await Promise.all([
    getAllOrders().catch(() => ({ data: { result: [] } })),
    getAllGoals(new Date().getFullYear()).catch(() => ({ data: [] })),
  ]);

  const orders: TOrder[] = Array.isArray(ordersRes?.data?.result) ? ordersRes.data.result : [];
  const goals: TGoal[] = Array.isArray(goalsRes?.data) ? goalsRes.data : [];

  return <CalendarPage orders={orders} goals={goals} />;
};

export default CalendarPageRoute;
