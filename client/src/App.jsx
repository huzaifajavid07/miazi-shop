import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from './components/Header';
import Footer from './components/Footer';

import HomePage from './pages/HomePage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CategoryPage from './pages/CategoryPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ShippingPage from './pages/ShippingPage';
import PlaceOrderPage from './pages/PlaceOrderPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import MyOrdersPage from './pages/MyOrdersPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

function App() {
    return (
        <Router>
            <div className="flex flex-col min-h-screen bg-[#f5f5f5]">
                <Header />
                <main className="flex-grow">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/category/:slug" element={<CategoryPage />} />
                        <Route path="/product/:id" element={<ProductDetailsPage />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/shipping" element={<ShippingPage />} />
                        <Route path="/placeorder" element={<PlaceOrderPage />} />
                        <Route path="/order/:id" element={<OrderDetailsPage />} />
                        <Route path="/myorders" element={<MyOrdersPage />} />
                        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                    </Routes>
                </main>
                <Footer />
                <ToastContainer position="bottom-right" autoClose={3000} />
            </div>
        </Router>
    );
}

export default App;
