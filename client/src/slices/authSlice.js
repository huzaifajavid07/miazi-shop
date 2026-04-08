import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/axiosConfig';
import { toast } from 'react-toastify';

export const login = createAsyncThunk('auth/login', async (userData, { rejectWithValue }) => {
    try {
        const response = await api.post('/api/users/login', userData);
        localStorage.setItem('userInfo', JSON.stringify(response.data));
        toast.success('Login Successful');
        return response.data;
    } catch (error) {
        toast.error(error.response?.data?.message || error.message);
        return rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
    try {
        const response = await api.post('/api/users', userData);
        localStorage.setItem('userInfo', JSON.stringify(response.data));
        toast.success('Registration Successful');
        return response.data;
    } catch (error) {
        toast.error(error.response?.data?.message || error.message);
        return rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
    try {
        await api.post('/api/users/logout');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('cartItems'); // clear cart on logout
        toast.info('Logged out');
        return null; // Return null so payload acts to clear state
    } catch (error) {
         toast.error(error.response?.data?.message || error.message);
         return rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const googleLogin = createAsyncThunk('auth/googleLogin', async (googleData, { rejectWithValue }) => {
    try {
        const response = await api.post('/api/users/google-login', googleData);
        localStorage.setItem('userInfo', JSON.stringify(response.data));
        toast.success('Google Login Successful');
        return response.data;
    } catch (error) {
        toast.error(error.response?.data?.message || error.message);
        return rejectWithValue(error.response?.data?.message || error.message);
    }
});


const userInfoFromStorage = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;

const initialState = {
    userInfo: userInfoFromStorage,
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.userInfo = action.payload;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Register
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.loading = false;
                state.userInfo = action.payload;
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Logout
            .addCase(logout.fulfilled, (state) => {
                state.userInfo = null;
            })
            // Google Login
            .addCase(googleLogin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(googleLogin.fulfilled, (state, action) => {
                state.loading = false;
                state.userInfo = action.payload;
            })
            .addCase(googleLogin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default authSlice.reducer;
