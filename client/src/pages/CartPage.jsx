import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeFromCart } from '../slices/cartSlice';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { BASE_URL } from '../utils/axiosConfig';

const CartPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { cartItems, itemsPrice, shippingPrice, taxPrice, totalPrice } = useSelector((state) => state.cart);

    const updateQtyHandler = (product, qty) => {
        dispatch(addToCart({ ...product, qty }));
    };

    const removeHandler = (id) => {
        dispatch(removeFromCart(id));
    };

    const checkoutHandler = () => {
        navigate('/shipping');
    };

    return (
        <div className="container-custom py-8">
            <h1 className="text-2xl font-extrabold mb-6 flex items-center gap-3">
                <ShoppingBag size={28} className="text-[#fed700]" /> Shopping Cart
            </h1>
            {cartItems.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-xl border">
                    <ShoppingBag size={60} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
                    <Link to="/" className="inline-block bg-[#fed700] text-[#333e48] font-bold px-8 py-3 rounded-full hover:bg-yellow-500 transition">
                        Continue Shopping
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 flex flex-col gap-3">
                        {cartItems.map((item) => (
                            <div key={item._id} className="flex gap-4 border rounded-xl p-4 items-center bg-white">
                                <Link to={`/product/${item._id}`}>
                                    <img src={item.images?.[0]?.startsWith('http') ? item.images[0] : `${BASE_URL}${item.images?.[0]}` || 'https://via.placeholder.com/100'} alt={item.name} className="w-20 h-20 object-contain rounded-lg border p-1" />
                                </Link>
                                <div className="flex-1 min-w-0">
                                    <Link to={`/product/${item._id}`} className="font-bold text-sm hover:text-blue-600 transition line-clamp-2">{item.name}</Link>
                                    <div className="text-lg font-bold text-[#333e48] mt-1">৳{(item.discountPrice > 0 ? item.discountPrice : item.price).toLocaleString()}</div>
                                </div>
                                <div className="flex items-center gap-2 border rounded-lg">
                                    <button onClick={() => item.qty > 1 && updateQtyHandler(item, item.qty - 1)} className="p-2 hover:bg-gray-100 transition rounded-l-lg"><Minus size={14} /></button>
                                    <span className="px-3 font-bold">{item.qty}</span>
                                    <button onClick={() => item.qty < item.countInStock && updateQtyHandler(item, item.qty + 1)} className="p-2 hover:bg-gray-100 transition rounded-r-lg"><Plus size={14} /></button>
                                </div>
                                <div className="text-lg font-extrabold text-[#333e48] w-24 text-right">
                                    ৳{((item.discountPrice > 0 ? item.discountPrice : item.price) * item.qty).toLocaleString()}
                                </div>
                                <button onClick={() => removeHandler(item._id)} className="text-gray-400 hover:text-red-500 p-2 rounded-full transition">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                        <Link to="/" className="text-sm text-gray-500 hover:text-[#333e48] transition inline-flex items-center gap-2 mt-2">
                            <ArrowLeft size={14} /> Continue Shopping
                        </Link>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-white border rounded-xl p-6 h-fit sticky top-24">
                        <h2 className="text-lg font-extrabold border-b pb-3 mb-4">Order Summary</h2>
                        <div className="flex justify-between mb-2 text-sm"><span className="text-gray-500">Items ({cartItems.reduce((a, c) => a + c.qty, 0)}):</span><span className="font-bold">৳{itemsPrice}</span></div>
                        <div className="flex justify-between mb-2 text-sm"><span className="text-gray-500">Shipping:</span><span className="font-bold">৳{shippingPrice}</span></div>
                        <div className="flex justify-between mb-4 text-sm border-b pb-4"><span className="text-gray-500">Tax:</span><span className="font-bold">৳{taxPrice}</span></div>
                        <div className="flex justify-between mb-6 text-lg"><span className="font-extrabold">Total:</span><span className="font-extrabold text-[#333e48]">৳{totalPrice}</span></div>
                        
                        <button onClick={checkoutHandler} className="w-full bg-[#fed700] text-[#333e48] font-extrabold py-3 rounded-full hover:bg-yellow-500 transition shadow text-base">
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;
