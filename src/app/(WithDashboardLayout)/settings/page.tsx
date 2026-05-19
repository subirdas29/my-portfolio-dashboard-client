import { getSettings } from "@/services/Settings";
import SettingsPage from "@/components/modules/Settings/SettingsPage";

const SettingsPageRoute = async () => {
  const res = await getSettings().catch(() => ({ data: null }));
  return <SettingsPage settings={res?.data ?? null} />;
};

export default SettingsPageRoute;
