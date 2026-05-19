import { getAllClients } from "@/services/Clients";
import ClientsPage from "@/components/modules/Clients/ClientsPage";
import { TClient } from "@/types/client";

const ClientsPageRoute = async () => {
  const res = await getAllClients().catch(() => ({ data: { result: [] } }));
  const clients: TClient[] = Array.isArray(res?.data?.result)
    ? res.data.result
    : [];
  const statusCounts = res?.data?.meta?.statusCounts ?? [];

  return <ClientsPage clients={clients} statusCounts={statusCounts} />;
};

export default ClientsPageRoute;
