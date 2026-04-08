import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/axiosConfig';

export const listCategories = createAsyncThunk(
    'category/list',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get('/api/categories');
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const createCategory = createAsyncThunk(
    'category/create',
    async (categoryData, { rejectWithValue }) => {
        try {
            const { data } = await api.post('/api/categories', categoryData);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const updateCategory = createAsyncThunk(
    'category/update',
    async ({ id, ...categoryData }, { rejectWithValue }) => {
        try {
            const { data } = await api.put(`/api/categories/${id}`, categoryData);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const deleteCategory = createAsyncThunk(
    'category/delete',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/api/categories/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const initialState = {
    categories: [],
    loading: false,
    error: null,
};

const categorySlice = createSlice({
    name: 'category',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(listCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(listCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.categories = action.payload;
            })
            .addCase(listCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createCategory.fulfilled, (state, action) => {
                state.categories.push(action.payload);
            })
            .addCase(updateCategory.fulfilled, (state, action) => {
                const idx = state.categories.findIndex(c => c._id === action.payload._id);
                if (idx !== -1) state.categories[idx] = action.payload;
            })
            .addCase(deleteCategory.fulfilled, (state, action) => {
                state.categories = state.categories.filter(c => c._id !== action.payload);
            });
    },
});

export default categorySlice.reducer;
