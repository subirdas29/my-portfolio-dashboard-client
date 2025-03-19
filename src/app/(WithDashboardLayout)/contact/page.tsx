import ManageContacts from "@/components/modules/Contacts"
import { getAllContacts } from "@/services/contacts"


const ContactPage = async() => {
    const {data} = await getAllContacts()
  return (
    <div>
      <ManageContacts contact = {data}/>
    </div>
  )
}

export default ContactPage
