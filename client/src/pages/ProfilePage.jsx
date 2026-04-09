import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../utils/axiosConfig';
import { Loader, Package, Mail, Calendar, CreditCard, ChevronRight, Eye, Info, Clock, CheckCircle2, User } from 'lucide-react';

const ProfilePage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { userInfo } = useSelector((state) => state.auth);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const { data } = await api.get('/api/orders/myorders');
                setOrders(data);
                setError(null);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };

        if (userInfo) {
            fetchOrders();
        }
    }, [userInfo]);

    if (loading) return (
        <div className="flex flex-col justify-center items-center py-64 bg-slate-50 h-screen text-center">
            <Loader size={40} className="animate-spin text-yellow-500 mb-4" />
            <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Synchronizing Account Data...</p>
        </div>
    );

    return (
        <div className="bg-slate-50 min-h-screen pb-32 font-sans">
            {/* CLEAN HEADER SECTION */}
            <div className="bg-white border-b border-gray-100 shadow-sm relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-yellow-400 rounded-3xl flex items-center justify-center text-slate-900 font-black text-3xl shadow-2xl shadow-yellow-100 border-4 border-white">
                            {userInfo?.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                                <User size={24} className="text-yellow-500" /> User Profile
                            </h1>
                            <div className="flex items-center gap-2 mt-1 text-gray-500">
                                <Mail size={14} className="text-yellow-500" />
                                <span className="text-sm font-bold tracking-tight uppercase">{userInfo?.email}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 mt-12">
                {/* ORDER HISTORY SECTION */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-slate-800 text-white rounded-xl flex items-center justify-center">
                        <Package size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Order Registry</h2>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Deployment Tracking & History</p>
                    </div>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-white border border-gray-100 rounded-3xl p-20 text-center shadow-sm">
                        <p className="text-xs font-black text-gray-300 uppercase tracking-widest mb-2">Registry Empty</p>
                        <p className="text-sm text-gray-400">No previous order history found in our database.</p>
                        <Link to="/" className="mt-8 inline-block px-10 py-3 bg-yellow-400 text-slate-900 rounded-full font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-transform">Initialize Acquisition</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {orders.map((order) => (
                            <div key={order._id} className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-xl hover:border-yellow-100 transition-all group overflow-hidden relative">
                                <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Deployment ID</p>
                                            <h3 className="font-black text-slate-800 tracking-tighter text-lg uppercase">#{order._id}</h3>
                                        </div>
                                        <div className="flex flex-wrap gap-4">
                                            <div className="flex items-center gap-2 text-gray-400 font-bold text-[11px]">
                                                <Calendar size={14} className="text-yellow-500" />
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-400 font-bold text-[11px]">
                                                <CreditCard size={14} className="text-yellow-500" />
                                                ৳{order.totalPrice.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                                        <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border ${order.isPaid ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-500 border-red-100'}`}>
                                            {order.isPaid ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                            {order.isPaid ? 'Payment Confirmed' : 'Payment Awaiting'}
                                        </div>
                                        <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border ${order.isDelivered ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                                            {order.isDelivered ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                            {order.isDelivered ? 'Delivered' : 'In Transit'}
                                        </div>
                                        <Link 
                                            to={`/order/${order._id}`}
                                            className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-yellow-500 hover:text-slate-900 transition-all flex items-center gap-2 ml-auto md:ml-0"
                                        >
                                            View Report <ChevronRight size={14} />
                                        </Link>
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:rotate-12 transition-transform duration-700">
                                    <Package size={120} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
