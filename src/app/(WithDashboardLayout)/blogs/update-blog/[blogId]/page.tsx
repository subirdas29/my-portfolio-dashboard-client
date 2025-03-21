
import UpdateBlog from "@/components/modules/Blogs/UpdateBlogs/UpdateBlog"
import { getSingleBlog } from "@/services/Blogs"




const blogDetailPage= async({params}:{params:Promise<{blogId:string}>}) => {
    const {blogId} = await params

    const {data:blog} = await getSingleBlog(blogId)
    console.log(blog,'blog')

  return (
    <div >
      <UpdateBlog blog={blog}/>
    </div>
  )
}

export default blogDetailPage
