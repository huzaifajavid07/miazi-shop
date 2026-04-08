import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import productReducer from './slices/productSlice';
import categoryReducer from './slices/categorySlice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        cart: cartReducer,
        product: productReducer,
        category: categoryReducer,
    },
    devTools: true,
});

export default store;
