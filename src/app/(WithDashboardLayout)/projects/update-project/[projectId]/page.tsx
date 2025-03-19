import UpdateProjectForm from '@/components/modules/Projects/UpdateProjects'
import { getSingleProject } from '@/services/Projects'
import React from 'react'

const UpdateProjectPage = async({params}:{params:Promise<{projectId:string}>}) => {

  const {projectId} = await params 

  const {data} = await getSingleProject(projectId)
  return (
    <div>
      <UpdateProjectForm project = {data}/>
    </div>
  )
}

export default UpdateProjectPage
