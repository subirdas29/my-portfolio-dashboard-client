import { getCurrentUser } from "@/services/AuthService";
import { IUser } from "@/types/user";

import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from "react"

interface IUserProviderValues {
    user: IUser | null;
    isLoading: boolean;
    setUser: (user: IUser | null) => void;
    setIsLoading:Dispatch<SetStateAction<boolean>>;
  }

const UserContext = createContext<IUserProviderValues|undefined>(undefined)

const UserProvider = ({children}: {children:React.ReactNode})=>{
    const [user,setUser] = useState<IUser | null>(null);
    const [isLoading,setIsLoading] = useState(true)
    const handleUser = async() =>{
        const user = await getCurrentUser()
        setUser(user)
        setIsLoading(false)
    }

    useEffect(()=>{
        handleUser()
    },[isLoading])

     
//   if (isLoading) {
//     return (
//         <div className="flex justify-center items-center h-screen">
//         <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
//       </div>
//     );
//   }
    
    return(
        <UserContext.Provider value={{user,setUser,isLoading,setIsLoading}}>
            
            {children}
        </UserContext.Provider>
    )
}

export const useUser = () =>{
    const context = useContext(UserContext)
    if(context === undefined){
        throw new Error ('useUser must be used within the UserProvider context')
    }
    return context
}

export default UserProvider