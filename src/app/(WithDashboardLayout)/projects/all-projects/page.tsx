import AllProjectsTable from '@/components/modules/Projects/AllProjects'
import { getAllProjects } from '@/services/Projects'


const AllProjectsPage = async() => {
    const {data} = await getAllProjects()
  return (
    <div>
      <AllProjectsTable projects={data}/>
    </div>
  )
}

export default AllProjectsPage
