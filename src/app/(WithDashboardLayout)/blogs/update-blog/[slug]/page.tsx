
import UpdateBlog from "@/components/modules/Blogs/UpdateBlogs/UpdateBlog"
import { getSingleBlog } from "@/services/Blogs"




const blogDetailPage= async({params}:{params:Promise<{slug:string}>}) => {
    const {slug} = await params

    const {data:blog} = await getSingleBlog(slug)
    console.log(blog,'blog')

  return (
    <div >
      <UpdateBlog blog={blog}/>
    </div>
  )
}

export default blogDetailPage
