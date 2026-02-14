import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const AppContext=createContext();

export const AppContextProvider=(props)=>{
    const backendUrl="http://localhost:4000";
    const [IsloggeIn,setIsloggedIn]=useState(false);
    const getAuthState=async()=>{
        try{
            const {data}=await axios.post(backendUrl+'/api/auth/is-auth');
        }catch(error){
            toast.error(error.message,
                {
                    position:"top-center"
                });
        }
    }
    useEffect(()=>{
        getAuthState();
    },[]);
    const value={backendUrl,IsloggeIn};

    return <AppContext.Provider value={value}>
        {props.children}
    </AppContext.Provider>
}