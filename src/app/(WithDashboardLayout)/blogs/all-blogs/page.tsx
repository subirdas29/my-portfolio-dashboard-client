import AllBlogsTable from '@/components/modules/Blogs/AllBlogs'
import { getAllBlogs } from '@/services/Blogs'
import React from 'react'

const AllBlogPage = async() => {

    const {data:blogs} = await getAllBlogs()
  return (
    <div>
      <AllBlogsTable blogs={blogs}/>
    </div>
  )
}

export default AllBlogPage
