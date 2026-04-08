import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/axiosConfig';

export const listProducts = createAsyncThunk(
    'product/list',
    async ({ keyword = '', pageNumber = '', category = '', isTrending = '', isDeals = '' } = {}, { rejectWithValue }) => {
        try {
            const { data } = await api.get(
                `/api/products?keyword=${keyword}&pageNumber=${pageNumber}&category=${category}&isTrending=${isTrending}&isDeals=${isDeals}`
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

export const createProduct = createAsyncThunk(
    'product/create',
    async (productData, { rejectWithValue }) => {
        try {
            const { data } = await api.post('/api/products', productData);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const updateProduct = createAsyncThunk(
    'product/update',
    async ({ id, ...productData }, { rejectWithValue }) => {
        try {
            const { data } = await api.put(`/api/products/${id}`, productData);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const deleteProduct = createAsyncThunk(
    'product/delete',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/api/products/${id}`);
            return id;
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
            })
            // Create Product
            .addCase(createProduct.fulfilled, (state, action) => {
                state.products.unshift(action.payload);
            })
            // Update Product
            .addCase(updateProduct.fulfilled, (state, action) => {
                const index = state.products.findIndex(p => p._id === action.payload._id);
                if (index !== -1) {
                    state.products[index] = action.payload;
                }
                if (state.productDetails?._id === action.payload._id) {
                    state.productDetails = action.payload;
                }
            })
            // Delete Product
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.products = state.products.filter(p => p._id !== action.payload);
            });
    },
});

export default productSlice.reducer;
