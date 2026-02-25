import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../app/components/lib/api';

// Async thunk to check if the user is authenticated on initial load
export const checkAuth = createAsyncThunk(
    'auth/checkAuth',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/api/auth/me');
            return response.data?.user || response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Not authenticated');
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, { rejectWithValue }) => {
        try {
            await api.post('/api/auth/logout');
            return null;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Logout failed');
        }
    }
);

const initialState = {
    user: null,
    loading: true, // start loading as true so we can verify auth status
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Synchronous login for when user actually submit the login form
        loginSuccess: (state, action) => {
            state.user = action.payload;
            state.loading = false;
            state.error = null;
        },
        // Forced logout, used e.g. by interceptor
        forceLogout: (state) => {
            state.user = null;
            state.loading = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // checkAuth
            .addCase(checkAuth.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.user = action.payload;
                state.loading = false;
            })
            .addCase(checkAuth.rejected, (state, action) => {
                state.user = null;
                state.loading = false;
                state.error = action.payload;
            })
            // logoutUser
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.loading = false;
                // Hard redirect to clear any residual state/cookies if needed
                if (typeof window !== 'undefined') {
                    window.location.href = '/';
                }
            })
            .addCase(logoutUser.rejected, (state) => {
                state.user = null;
                state.loading = false;
                if (typeof window !== 'undefined') {
                    window.location.href = '/';
                }
            });
    }
});

export const { loginSuccess, forceLogout } = authSlice.actions;

export default authSlice.reducer;
