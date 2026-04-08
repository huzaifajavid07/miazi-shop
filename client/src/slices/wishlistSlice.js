import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/axiosConfig';
import { toast } from 'react-toastify';

export const getWishlist = createAsyncThunk('wishlist/getWishlist', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('/api/users/wishlist');
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const toggleWishlist = createAsyncThunk('wishlist/toggleWishlist', async (productId, { rejectWithValue, dispatch }) => {
    try {
        const response = await api.post('/api/users/wishlist', { productId });
        // After toggle, we can either update the local state with returned IDs 
        // or re-fetch populated wishlist
        dispatch(getWishlist()); 
        return response.data; // This is the array of IDs
    } catch (error) {
        const message = error.response?.data?.message || error.message;
        toast.error(message === 'Not authorized, no token' ? 'Please login to add to wishlist' : message);
        return rejectWithValue(message);
    }
});

const initialState = {
    wishlistItems: [],
    wishlistIds: [], // Keep track of IDs for quick lookup (heart fill state)
    loading: false,
    error: null,
};

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        resetWishlist: (state) => {
            state.wishlistItems = [];
            state.wishlistIds = [];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getWishlist.pending, (state) => {
                state.loading = true;
            })
            .addCase(getWishlist.fulfilled, (state, action) => {
                state.loading = false;
                state.wishlistItems = action.payload;
                state.wishlistIds = action.payload.map(item => item._id);
            })
            .addCase(getWishlist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(toggleWishlist.fulfilled, (state, action) => {
                state.wishlistIds = action.payload;
            });
    },
});

export const { resetWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
