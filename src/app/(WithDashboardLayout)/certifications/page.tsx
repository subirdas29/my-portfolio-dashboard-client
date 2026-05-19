import { getAllCertifications } from "@/services/Certifications";
import CertificationsPage from "@/components/modules/Certifications/CertificationsPage";
import { TCertification } from "@/types/certification";

const CertificationsPageRoute = async () => {
  const res = await getAllCertifications().catch(() => ({ data: [] }));
  const certifications: TCertification[] = Array.isArray(res?.data) ? res.data : [];
  return <CertificationsPage certifications={certifications} />;
};

export default CertificationsPageRoute;
