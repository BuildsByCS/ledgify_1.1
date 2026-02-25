import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./features/auth/authSlice";

const createStore = () => {
    return configureStore({
        reducer: {
            auth: authSlice
        }
    })
}

export default createStore;

