import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { saveShippingAddress } from '../slices/cartSlice';

const ShippingPage = () => {
    const { shippingAddress } = useSelector((state) => state.cart);
    const { userInfo } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState({
        fullName: shippingAddress?.fullName || userInfo?.name || '',
        email: shippingAddress?.email || userInfo?.email || '',
        phone: shippingAddress?.phone || '',
        address: shippingAddress?.address || '',
        city: shippingAddress?.city || '',
        postalCode: shippingAddress?.postalCode || '',
        country: shippingAddress?.country || 'Bangladesh',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const submitHandler = (e) => {
        e.preventDefault();
        dispatch(saveShippingAddress(formData));
        navigate('/placeorder');
    };

    if (!userInfo) {
        navigate('/login?redirect=/shipping');
        return null;
    }

    return (
        <div className="container-custom py-10 max-w-xl mx-auto">
            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-2 mb-8 text-sm font-semibold">
                <span className="text-green-600">Cart ✓</span>
                <span className="w-8 h-px bg-gray-300"></span>
                <span className="text-[#333e48] bg-[#fed700] px-3 py-1 rounded-full">Shipping</span>
                <span className="w-8 h-px bg-gray-300"></span>
                <span className="text-gray-400">Payment</span>
                <span className="w-8 h-px bg-gray-300"></span>
                <span className="text-gray-400">Confirm</span>
            </div>

            <h1 className="text-2xl font-extrabold mb-6 text-center">Shipping & Billing</h1>
            <form onSubmit={submitHandler} className="bg-white p-6 rounded-xl border flex flex-col gap-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
                    <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} className="w-full border p-3 rounded-lg outline-none focus:border-[#fed700] transition" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                        <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full border p-3 rounded-lg outline-none focus:border-[#fed700] transition" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Phone *</label>
                        <input type="text" name="phone" required placeholder="+880..." value={formData.phone} onChange={handleChange} className="w-full border p-3 rounded-lg outline-none focus:border-[#fed700] transition" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Full Address *</label>
                    <input type="text" name="address" required placeholder="House, Road, Area" value={formData.address} onChange={handleChange} className="w-full border p-3 rounded-lg outline-none focus:border-[#fed700] transition" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">City *</label>
                        <input type="text" name="city" required value={formData.city} onChange={handleChange} className="w-full border p-3 rounded-lg outline-none focus:border-[#fed700] transition" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Postal Code</label>
                        <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} className="w-full border p-3 rounded-lg outline-none focus:border-[#fed700] transition" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Country</label>
                        <input type="text" name="country" value={formData.country} onChange={handleChange} className="w-full border p-3 rounded-lg outline-none focus:border-[#fed700] transition" />
                    </div>
                </div>
                <button type="submit" className="w-full bg-[#fed700] text-[#333e48] font-extrabold py-3 rounded-full mt-2 hover:bg-yellow-500 transition shadow text-base">
                    Continue to Payment
                </button>
            </form>
        </div>
    );
};

export default ShippingPage;
