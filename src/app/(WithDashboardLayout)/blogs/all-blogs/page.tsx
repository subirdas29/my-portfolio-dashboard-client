import AllBlogsTable from '@/components/modules/Blogs/AllBlogs'
import { getAllBlogs } from '@/services/Blogs'
import React from 'react'

const AllBlogPage = async() => {

    const {data} = await getAllBlogs()
  return (
    <div>
      <AllBlogsTable blogs={data}/>
    </div>
  )
}

export default AllBlogPage
