import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Set user after login form submit or after /me query succeeds
        loginSuccess: (state, action) => {
            state.user = action.payload;
        },
        // Clear user on logout or 401 interceptor
        forceLogout: (state) => {
            state.user = null;
        }
    },
});

export const { loginSuccess, forceLogout } = authSlice.actions;

export default authSlice.reducer;
