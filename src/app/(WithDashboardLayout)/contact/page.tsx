import ManageContacts from "@/components/modules/Contacts";
import { getAllContacts } from "@/services/contacts";

const ContactPage = async () => {
    const { data:contact } = await getAllContacts(); 

    return (
        <div>
            <ManageContacts contact={contact} />
        </div>
    );
};

export default ContactPage;
