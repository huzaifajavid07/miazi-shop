import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeFromCart } from '../slices/cartSlice';
import { Trash2, ShoppingCart, ArrowLeft, ChevronRight, Plus, Minus } from 'lucide-react';
import { BASE_URL } from '../utils/axiosConfig';

const CartPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const cart = useSelector((state) => state.cart);
    const { cartItems } = cart;

    const addToCartHandler = (product, qty) => {
        dispatch(addToCart({ ...product, qty }));
    };

    const removeFromCartHandler = (id) => {
        dispatch(removeFromCart(id));
    };

    const checkoutHandler = () => {
        navigate('/login?redirect=/shipping');
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200 mb-8">
                <div className="container-custom py-4 flex items-center gap-2 text-sm text-gray-500">
                    <Link to="/" className="hover:text-blue-600">Home</Link>
                    <ChevronRight size={14} />
                    <span className="text-gray-800 font-bold">Shopping Cart</span>
                </div>
            </div>

            <div className="container-custom">
                <h1 className="text-2xl font-bold text-gray-800 mb-8 uppercase tracking-tight">Shopping Cart</h1>

                {cartItems.length === 0 ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-16 text-center shadow-sm">
                        <div className="flex justify-center mb-6">
                            <ShoppingCart size={64} className="text-gray-200" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
                        <p className="text-gray-500 mb-10">Look like you haven't added anything to your cart yet.</p>
                        <Link to="/" className="btn-electro inline-flex gap-2">
                             Go Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Cart Items List */}
                        <div className="lg:col-span-8 space-y-4">
                            {/* Desktop Header (Hidden on Mobile) */}
                            <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-4 bg-white border border-gray-200 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest shadow-sm">
                                <div className="col-span-6">Product Details</div>
                                <div className="col-span-2 text-center">Price</div>
                                <div className="col-span-2 text-center">Quantity</div>
                                <div className="col-span-2 text-right">Total</div>
                            </div>

                            {/* Items */}
                            <div className="space-y-4">
                                {cartItems.map((item) => (
                                    <div key={item._id} className="bg-white rounded-3xl border border-gray-100 p-4 md:p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                                        <div className="flex flex-col md:grid md:grid-cols-12 md:items-center gap-4 md:gap-6">
                                            {/* Info Group */}
                                            <div className="md:col-span-6 flex items-center gap-4 md:gap-6">
                                                <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-50 rounded-2xl p-2 flex items-center justify-center shrink-0 border border-gray-50 group-hover:scale-105 transition-transform">
                                                    <img src={item.image || (item.images?.[0]?.startsWith('http') ? item.images[0] : `${BASE_URL}${item.images?.[0]}`)} alt={item.name} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <Link to={`/product/${item.slug}`} className="text-sm md:text-base font-black text-slate-800 hover:text-blue-600 transition-colors line-clamp-1 uppercase italic tracking-tight">{item.name}</Link>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">/{item.category?.name || 'Item'}</p>
                                                    <button onClick={() => removeFromCartHandler(item._id)} className="mt-2 md:mt-4 text-[10px] font-black text-red-500 uppercase flex items-center gap-1.5 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-full w-max transition-colors">
                                                        <Trash2 size={12} /> Remove Item
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Price - Quantity - Total Group */}
                                            <div className="flex items-center justify-between md:contents pt-4 md:pt-0 border-t border-gray-50 md:border-0">
                                                {/* Price */}
                                                <div className="md:col-span-2 md:text-center">
                                                    <p className="md:hidden text-[9px] font-black text-gray-400 uppercase mb-1">Price</p>
                                                    <span className="text-sm font-black text-slate-800 italic">৳{item.price.toLocaleString()}</span>
                                                </div>

                                                {/* Quantity */}
                                                <div className="md:col-span-2 flex justify-center">
                                                    <div className="flex items-center bg-slate-50 rounded-2xl h-10 px-1 border border-slate-100">
                                                        <button 
                                                            onClick={() => addToCartHandler(item, item.qty > 1 ? item.qty - 1 : 1)} 
                                                            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
                                                        ><Minus size={14} /></button>
                                                        <span className="w-8 text-center font-black text-slate-800 text-xs">{item.qty}</span>
                                                        <button 
                                                            onClick={() => addToCartHandler(item, item.qty < item.countInStock ? item.qty + 1 : item.countInStock)} 
                                                            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
                                                        ><Plus size={14} /></button>
                                                    </div>
                                                </div>

                                                {/* Total */}
                                                <div className="md:col-span-2 md:text-right">
                                                    <p className="md:hidden text-[9px] font-black text-gray-400 uppercase mb-1 text-right">Subtotal</p>
                                                    <span className="text-lg md:text-base font-black text-indigo-600 block text-right font-sans italic tracking-tighter">৳{(item.qty * item.price).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-between">
                                <Link to="/" className="text-sm font-bold text-blue-600 flex items-center gap-2 hover:underline">
                                    <ArrowLeft size={16} /> Continue Shopping
                                </Link>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-4 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-bold text-gray-800 uppercase tracking-tight">Order Summary</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between items-center text-sm font-medium text-gray-600">
                                    <span>Items ({cartItems.reduce((acc, item) => acc + item.qty, 0)})</span>
                                    <span className="text-gray-800 font-bold">৳{cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-medium text-gray-600 pb-4">
                                    <span>Shipping</span>
                                    <span className="text-green-600 font-bold">Free</span>
                                </div>
                                <div className="pt-4 border-t border-gray-200 flex justify-between items-end">
                                    <span className="text-sm font-bold text-gray-800 uppercase">Total Amount</span>
                                    <span className="text-2xl font-bold text-gray-800">৳{cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="p-6 bg-gray-50">
                                <button 
                                    onClick={checkoutHandler}
                                    className="btn-electro w-full h-12 uppercase"
                                >
                                    Proceed to Checkout
                                </button>
                                <p className="text-[10px] text-gray-400 text-center mt-4 uppercase font-bold">Secure Checkout Powered by Electro</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPage;