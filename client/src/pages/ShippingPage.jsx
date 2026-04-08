import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { saveShippingAddress } from '../slices/cartSlice';
import { ChevronRight, Truck, MapPin, CheckCircle2 } from 'lucide-react';

const ShippingPage = () => {
    const cart = useSelector((state) => state.cart);
    const { shippingAddress } = cart;

    const [address, setAddress] = useState(shippingAddress.address || '');
    const [city, setCity] = useState(shippingAddress.city || '');
    const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || '');
    const [country, setCountry] = useState(shippingAddress.country || '');
    const [phone, setPhone] = useState(shippingAddress.phone || '');

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const submitHandler = (e) => {
        e.preventDefault();
        dispatch(saveShippingAddress({ address, city, postalCode, country, phone }));
        navigate('/placeorder');
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200 mb-8">
                <div className="container-custom py-4 flex items-center gap-2 text-sm text-gray-500">
                    <Link to="/" className="hover:text-blue-600">Home</Link>
                    <ChevronRight size={14} />
                    <Link to="/cart" className="hover:text-blue-600">Cart</Link>
                    <ChevronRight size={14} />
                    <span className="text-gray-800 font-bold">Shipping</span>
                </div>
            </div>

            <div className="container-custom">
                {/* Checkout Steps */}
                <div className="flex justify-center mb-12">
                    <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest">
                        <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 size={16} /> <span>Cart</span>
                        </div>
                        <div className="w-12 h-px bg-gray-200" />
                        <div className="flex items-center gap-2 text-blue-600">
                            <MapPin size={16} /> <span>Shipping</span>
                        </div>
                        <div className="w-12 h-px bg-gray-200" />
                        <div className="flex items-center gap-2 text-gray-300">
                            <span className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-[10px]">3</span> <span>Place Order</span>
                        </div>
                    </div>
                </div>

                <div className="max-w-xl mx-auto">
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-200 bg-gray-50">
                            <h1 className="text-xl font-bold text-gray-800 uppercase tracking-tight flex items-center gap-2">
                                <Truck size={20} /> Shipping Details
                            </h1>
                        </div>
                        <div className="p-8">
                            <form onSubmit={submitHandler} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-gray-500">Address</label>
                                    <input
                                        type="text"
                                        placeholder="Enter address"
                                        className="w-full bg-white border border-gray-200 p-3 rounded-lg outline-none focus:border-yellow-400 text-sm"
                                        value={address}
                                        required
                                        onChange={(e) => setAddress(e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-gray-500">City</label>
                                        <input
                                            type="text"
                                            placeholder="Enter city"
                                            className="w-full bg-white border border-gray-200 p-3 rounded-lg outline-none focus:border-yellow-400 text-sm"
                                            value={city}
                                            required
                                            onChange={(e) => setCity(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-gray-500">Postal Code</label>
                                        <input
                                            type="text"
                                            placeholder="Enter postal code"
                                            className="w-full bg-white border border-gray-200 p-3 rounded-lg outline-none focus:border-yellow-400 text-sm"
                                            value={postalCode}
                                            required
                                            onChange={(e) => setPostalCode(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-gray-500">Country</label>
                                    <input
                                        type="text"
                                        placeholder="Enter country"
                                        className="w-full bg-white border border-gray-200 p-3 rounded-lg outline-none focus:border-yellow-400 text-sm"
                                        value={country}
                                        required
                                        onChange={(e) => setCountry(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-gray-500">Phone Number</label>
                                    <input
                                        type="text"
                                        placeholder="Enter phone number"
                                        className="w-full bg-white border border-gray-200 p-3 rounded-lg outline-none focus:border-yellow-400 text-sm"
                                        value={phone}
                                        required
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="btn-electro w-full h-12 uppercase mt-6"
                                >
                                    Continue to Order Review
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShippingPage;
