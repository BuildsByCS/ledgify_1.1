"use client";


import { useRef, useEffect } from "react";
import createStore from "@/lib/store";
import { Provider } from "react-redux";
import { checkAuth } from "@/lib/features/auth/authSlice";


export default function StoreProvider({ children }){

    const storeRef = useRef(null);

    if(!storeRef.current){
        storeRef.current = createStore();
    }

    useEffect(() => {
        storeRef.current.dispatch(checkAuth());
    }, []);

    return (
        <Provider store={storeRef.current} >
            {children}
        </Provider>
    )
}