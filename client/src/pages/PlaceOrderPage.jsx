import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearCartItems } from '../slices/cartSlice';
import api, { BASE_URL } from '../utils/axiosConfig';
import { toast } from 'react-toastify';
import { CheckCircle, Loader } from 'lucide-react';

const PlaceOrderPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const cart = useSelector((state) => state.cart);
    const { userInfo } = useSelector((state) => state.auth);
    const [paymentStep, setPaymentStep] = useState('review'); // review -> paying -> success
    const [loading, setLoading] = useState(false);

    if (!cart.shippingAddress?.address) {
        navigate('/shipping');
        return null;
    }
    if (!userInfo) {
        navigate('/login?redirect=/placeorder');
        return null;
    }

    const simulatePayment = async () => {
        setPaymentStep('paying');
        setLoading(true);
        // Simulate payment processing (2 seconds)
        await new Promise(resolve => setTimeout(resolve, 2000));
        setLoading(false);
        
        // Now place the actual order
        try {
            const res = await api.post('/api/orders', {
                orderItems: cart.cartItems.map(item => ({
                    name: item.name,
                    qty: item.qty,
                    image: item.images?.[0] || '',
                    price: item.discountPrice > 0 ? item.discountPrice : item.price,
                    product: item._id,
                })),
                shippingAddress: cart.shippingAddress,
                paymentMethod: 'Online Payment',
                itemsPrice: Number(cart.itemsPrice),
                shippingPrice: Number(cart.shippingPrice),
                taxPrice: Number(cart.taxPrice),
                totalPrice: Number(cart.totalPrice),
            });

            // Mark as paid immediately
            await api.put(`/api/orders/${res.data._id}/pay`, {
                id: 'PAY_' + Date.now(),
                status: 'COMPLETED',
                update_time: new Date().toISOString(),
                email_address: cart.shippingAddress.email,
            });

            dispatch(clearCartItems());
            setPaymentStep('success');
            toast.success('Order placed successfully!');
            
            // Redirect to order details after 3 seconds
            setTimeout(() => {
                navigate(`/order/${res.data._id}`);
            }, 3000);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Order failed. Please try again.');
            setPaymentStep('review');
        }
    };

    if (paymentStep === 'paying') {
        return (
            <div className="container-custom py-20 text-center">
                <Loader size={60} className="animate-spin text-[#fed700] mx-auto mb-6" />
                <h2 className="text-2xl font-extrabold mb-2">Processing Payment...</h2>
                <p className="text-gray-500">Please wait while we process your payment.</p>
            </div>
        );
    }

    if (paymentStep === 'success') {
        return (
            <div className="container-custom py-20 text-center">
                <CheckCircle size={80} className="text-green-500 mx-auto mb-6" />
                <h2 className="text-3xl font-extrabold mb-2 text-green-600">Payment Successful!</h2>
                <p className="text-gray-500 mb-4">Your order has been placed. You will receive an email confirmation shortly.</p>
                <p className="text-gray-400 text-sm">Redirecting to order details...</p>
            </div>
        );
    }

    return (
        <div className="container-custom py-8">
            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-2 mb-8 text-sm font-semibold">
                <span className="text-green-600">Cart ✓</span>
                <span className="w-8 h-px bg-gray-300"></span>
                <span className="text-green-600">Shipping ✓</span>
                <span className="w-8 h-px bg-gray-300"></span>
                <span className="text-[#333e48] bg-[#fed700] px-3 py-1 rounded-full">Confirm & Pay</span>
            </div>

            <h1 className="text-2xl font-extrabold mb-6 text-center">Review & Pay</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Shipping Info */}
                    <div className="border rounded-xl p-5 bg-white">
                        <h2 className="font-extrabold text-lg mb-3 border-b pb-2">Shipping Details</h2>
                        <p className="text-gray-700"><strong>Name:</strong> {cart.shippingAddress.fullName}</p>
                        <p className="text-gray-700"><strong>Email:</strong> {cart.shippingAddress.email}</p>
                        <p className="text-gray-700"><strong>Phone:</strong> {cart.shippingAddress.phone}</p>
                        <p className="text-gray-700"><strong>Address:</strong> {cart.shippingAddress.address}, {cart.shippingAddress.city} {cart.shippingAddress.postalCode}, {cart.shippingAddress.country}</p>
                    </div>

                    {/* Order Items */}
                    <div className="border rounded-xl p-5 bg-white">
                        <h2 className="font-extrabold text-lg mb-3 border-b pb-2">Order Items</h2>
                        {cart.cartItems.map((item, i) => (
                            <div key={i} className="flex items-center gap-4 py-3 border-b last:border-b-0">
                                <img src={item.images?.[0]?.startsWith('http') ? item.images[0] : `${BASE_URL}${item.images?.[0]}`} alt={item.name} className="w-14 h-14 object-contain rounded border p-1" />
                                <Link to={`/product/${item._id}`} className="flex-1 font-semibold text-sm hover:text-blue-600 transition">{item.name}</Link>
                                <span className="text-gray-600 text-sm">
                                    {item.qty} × ৳{(item.discountPrice > 0 ? item.discountPrice : item.price).toLocaleString()} = <strong className="text-[#333e48]">৳{((item.discountPrice > 0 ? item.discountPrice : item.price) * item.qty).toLocaleString()}</strong>
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payment Summary */}
                <div className="bg-white border rounded-xl p-6 h-fit sticky top-24">
                    <h2 className="font-extrabold text-lg mb-4 border-b pb-3">Payment Summary</h2>
                    <div className="flex justify-between mb-2 text-sm"><span className="text-gray-500">Items:</span><span>৳{cart.itemsPrice}</span></div>
                    <div className="flex justify-between mb-2 text-sm"><span className="text-gray-500">Shipping:</span><span>৳{cart.shippingPrice}</span></div>
                    <div className="flex justify-between mb-4 text-sm border-b pb-4"><span className="text-gray-500">Tax:</span><span>৳{cart.taxPrice}</span></div>
                    <div className="flex justify-between mb-6 text-xl"><span className="font-extrabold">Total:</span><span className="font-extrabold">৳{cart.totalPrice}</span></div>
                    
                    <button
                        onClick={simulatePayment}
                        disabled={cart.cartItems.length === 0 || loading}
                        className="w-full bg-green-600 text-white font-extrabold py-4 rounded-full hover:bg-green-700 transition shadow-lg text-base disabled:opacity-50"
                    >
                        Pay ৳{cart.totalPrice} Now
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-3">Secure payment — bKash/Nagad/Card supported</p>
                </div>
            </div>
        </div>
    );
};

export default PlaceOrderPage;
