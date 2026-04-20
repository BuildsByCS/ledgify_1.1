"use client";

import { useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import createStore from "@/lib/store";
import { loginSuccess } from "@/lib/features/auth/authSlice";
import api from "@/app/components/lib/api";

// Stable QueryClient instance (created once outside component)
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false, // Don't retry on 401, user is just not logged in
            staleTime: 5 * 60 * 1000, // Treat /me response as fresh for 5 minutes
        },
    },
});

// Inner component needs to be inside Redux Provider to access useDispatch
function AuthBootstrap({ children }) {
    const dispatch = useDispatch();

    // v5 removed onSuccess so we use useEffect for watching data instead
    const { data, isSuccess } = useQuery({
        queryKey: ["auth", "me"],
        queryFn: async () => {
            const response = await api.get("/api/auth/me");
            return response.data?.user || response.data;
        },
    });

    useEffect(() => {
        if (isSuccess && data) {
            // Feed the result into Redux so all useSelector(state.auth.user)
            // consumers across the app continue to work with zero changes
            dispatch(loginSuccess(data));
        }
    }, [isSuccess, data, dispatch]);

    return children;
}

export default function StoreProvider({ children }) {
    const storeRef = useRef(null);

    if (!storeRef.current) {
        storeRef.current = createStore();
    }

    return (
        <QueryClientProvider client={queryClient}>
            <Provider store={storeRef.current}>
                <AuthBootstrap>
                    {children}
                </AuthBootstrap>
            </Provider>
        </QueryClientProvider>
    );
}
