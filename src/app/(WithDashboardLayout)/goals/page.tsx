import { getAllGoals } from "@/services/Goals";
import GoalsPage from "@/components/modules/Goals/GoalsPage";
import { TGoal } from "@/types/goal";

const GoalsPageRoute = async () => {
  const year = new Date().getFullYear();
  const res = await getAllGoals(year).catch(() => ({ data: [] }));
  const goals: TGoal[] = Array.isArray(res?.data) ? res.data : [];
  return <GoalsPage goals={goals} currentYear={year} />;
};

export default GoalsPageRoute;
