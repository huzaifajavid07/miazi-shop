import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/axiosConfig';

export const listProducts = createAsyncThunk(
    'product/list',
    async ({ keyword = '', pageNumber = '', category = '' } = {}, { rejectWithValue }) => {
        try {
            const { data } = await api.get(
                `/api/products?keyword=${keyword}&pageNumber=${pageNumber}&category=${category}`
            );
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const getProductDetails = createAsyncThunk(
    'product/details',
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await api.get(`/api/products/${id}`);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const initialState = {
    products: [],
    productDetails: null,
    loading: false,
    error: null,
    page: 1,
    pages: 1,
};

const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // List Products
            .addCase(listProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(listProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.products = action.payload.products;
                state.pages = action.payload.pages;
                state.page = action.payload.page;
            })
            .addCase(listProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Product Details
            .addCase(getProductDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getProductDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.productDetails = action.payload;
            })
            .addCase(getProductDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default productSlice.reducer;
