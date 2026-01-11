import UpdateProjectForm from '@/components/modules/Projects/UpdateProjects'
import { getSingleProject } from '@/services/Projects'
import React from 'react'

const UpdateProjectPage = async({params}:{params:Promise<{slug:string}>}) => {

  const {slug} = await params 

  const {data} = await getSingleProject(slug)
  console.log("Fetched Project Data:", data);
  return (
    <div>
      <UpdateProjectForm project = {data}/>
    </div>
  )
}

export default UpdateProjectPage
