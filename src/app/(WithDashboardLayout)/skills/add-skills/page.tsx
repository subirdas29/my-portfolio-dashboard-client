
import ManageSkills from "@/components/modules/Skills/AddSkills"
import { getAllSkills } from "@/services/Skills"



const AddSkillPage = async() => {
 
      const {data} = await getAllSkills()

  return (
    <div>
      <ManageSkills skills = {data}/>
    </div>
  )
}

export default AddSkillPage
