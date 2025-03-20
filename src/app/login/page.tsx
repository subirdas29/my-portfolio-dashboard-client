import LoginForm from "@/components/modules/Auth/Login/LoginForm"
import { Suspense } from "react"
import Loader from "../loading"




const LoginPage = () => {
  return (
   
        <Suspense fallback={<div><Loader/></div>}>
    <LoginForm/>
    </Suspense>

  )
}

export default LoginPage
