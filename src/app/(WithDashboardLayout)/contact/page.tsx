import ManageContacts from "@/components/modules/Contacts";
import { getAllContacts } from "@/services/contacts";

const ContactPage = async ({ 
    searchParams 
}: { 
    searchParams: Promise<{ page?: string; status?: string; createdAt?: string; range?: string }> 
}) => {
    const params = await searchParams;
    

    const query: Record<string, string> = {
        page: params.page || "1",
        limit: "10",
    };

   
    if (params.status) query.status = params.status;
    if (params.createdAt) query.createdAt = params.createdAt;
    if (params.range) query.range = params.range; 

    const response = await getAllContacts(query);

   
    const contact = response?.data?.result || response?.data || [];
    const meta = response?.data?.meta || response?.meta || { total: 0, page: 1, limit: 10 };

    return (
        <div>
            <ManageContacts 
                contact={contact} 
                meta={meta} 
            />
        </div>
    );
};

export default ContactPage;