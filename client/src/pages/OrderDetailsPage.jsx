import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api, { BASE_URL } from '../utils/axiosConfig';
import { Loader, ChevronRight, Package, Truck, Calendar, User, MapPin, Receipt, CheckCircle2, Clock, AlertCircle, Globe, Zap, Plus, Mail } from 'lucide-react';

const OrderDetailsPage = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { userInfo } = useSelector((state) => state.auth);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                const { data } = await api.get(`/api/orders/${id}`);
                setOrder(data);
                setError(null);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };

        if (userInfo) {
            fetchOrder();
        }
    }, [id, userInfo]);

    if (loading) return (
        <div className="flex flex-col justify-center items-center py-64 bg-electro-bg h-screen">
            <Loader size={40} className="animate-spin text-electro-yellow mb-4" />
            <span className="text-electro-text font-bold animate-pulse">Fetching Order Data...</span>
        </div>
    );

    if (error) return (
        <div className="container-custom py-20 px-4 text-center">
            <div className="bg-red-50 text-red-600 p-6 md:p-10 rounded-2xl border border-red-100 max-w-2xl mx-auto shadow-sm">
                <AlertCircle size={48} className="mx-auto mb-6 opacity-20" />
                <h2 className="text-xl md:text-2xl font-bold mb-4 uppercase tracking-tight">Order Recognition Failed</h2>
                <p className="mb-10 text-sm font-medium">{error}</p>
                <Link to="/myorders" className="bg-electro-dark text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-black transition-colors inline-block">Return To History</Link>
            </div>
        </div>
    );

    if (!order) return null;

    return (
        <div className="bg-electro-bg min-h-screen pb-20 md:pb-32">
            {/* BREADCRUMB */}
            <div className="border-b border-gray-200 bg-white shadow-sm mb-12">
                <div className="container-custom py-4 flex items-center gap-2 text-sm text-gray-500">
                    <Link to="/" className="hover:text-black transition-colors">Home</Link>
                    <ChevronRight size={12} className="opacity-30" />
                    <Link to="/myorders" className="text-electro-dark hover:text-black font-bold">My Orders</Link>
                    <ChevronRight size={12} className="opacity-30" />
                    <span className="text-electro-dark font-bold">Order Details</span>
                </div>
            </div>

            <div className="container-custom px-4">
                {/* STATUS BAR */}
                <div className="bg-white border border-gray-100 rounded-2xl md:rounded-[2rem] shadow-xl p-6 md:p-8 mb-8 flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-10 overflow-hidden relative group">
                    <div className="absolute top-0 left-0 w-full h-1 lg:w-2 lg:h-full bg-electro-yellow shadow-[0_0_20px_#fed700]"></div>

                    <div className="flex flex-col md:flex-row items-center text-center md:text-left gap-4 md:gap-8 relative z-10">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 rounded-2xl md:rounded-3xl flex items-center justify-center text-electro-dark shadow-inner border border-gray-100 group-hover:bg-electro-yellow transition-colors duration-700">
                            <Package size={28} className="md:size-36 group-hover:scale-110 transition-transform duration-700" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-1">Order ID</p>
                            <h1 className="text-xl md:text-3xl lg:text-4xl font-black text-electro-dark tracking-tighter uppercase">#{order._id.toUpperCase()}</h1>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-center relative z-10 w-full lg:w-auto">
                        <div className={`w-full sm:w-auto px-6 py-2.5 rounded-full font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 border-2 transition-all duration-700 ${order.isPaid ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600 animate-pulse'}`}>
                            {order.isPaid ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                            {order.isPaid ? `Paid: ${new Date(order.paidAt).toLocaleDateString()}` : 'Payment Pending'}
                        </div>
                        <div className={`w-full sm:w-auto px-6 py-2.5 rounded-full font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 border-2 transition-all duration-700 ${order.isDelivered ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-yellow-50 border-yellow-100 text-electro-dark'}`}>
                            <Truck size={14} className={!order.isDelivered ? 'animate-bounce' : ''} />
                            {order.isDelivered ? `Delivered: ${new Date(order.deliveredAt).toLocaleDateString()}` : 'In Transit'}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16 items-start">

                    {/* LEFT SIDE: DETAILS */}
                    <div className="lg:col-span-8 space-y-8 md:space-y-12 order-2 lg:order-1 pb-10">

                        {/* CUSTOMER INFO LEDGER */}
                        <div className="bg-white border border-gray-100 rounded-2xl md:rounded-[2.5rem] shadow-xl overflow-hidden relative">
                            <div className="bg-slate-50 px-6 md:px-10 py-5 md:py-6 border-b border-gray-100">
                                <h2 className="text-xl md:text-2xl font-black text-electro-dark flex items-center gap-4 uppercase tracking-tighter">
                                    <Receipt size={20} className="text-yellow-500" /> Logistics <span className="text-yellow-500">Manifest</span>
                                </h2>
                            </div>
                            <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-gray-400 shrink-0 border border-gray-100"><User size={18} /></div>
                                        <div>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Customer</p>
                                            <p className="text-base font-black text-electro-dark">{order.user.name}</p>
                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mt-1 lowercase">
                                                <Mail size={12} /> {order.user.email}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-gray-400 shrink-0 border border-gray-100"><MapPin size={18} /></div>
                                        <div className="flex-1">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Shipping Destination</p>
                                            <p className="text-sm font-black text-electro-dark leading-relaxed">
                                                {order.shippingAddress.address}, {order.shippingAddress.city} {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                                            </p>
                                            {order.shippingAddress.address.startsWith('http') && (
                                                <a href={order.shippingAddress.address} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all">
                                                    <Globe size={12} /> Map View
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-gray-400 shrink-0 border border-gray-100"><Calendar size={18} /></div>
                                        <div>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Deployment Date</p>
                                            <p className="text-base font-black text-electro-dark">{new Date(order.createdAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-gray-400 shrink-0 border border-gray-100"><Zap size={18} /></div>
                                        <div>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Method</p>
                                            <p className="text-base font-black text-electro-dark">{order.paymentMethod}</p>
                                            {order.paymentScreenshot && (
                                                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-gray-100">
                                                    <img
                                                        src={order.paymentScreenshot.startsWith('http') ? order.paymentScreenshot : `${BASE_URL}${order.paymentScreenshot}`}
                                                        alt="Receipt"
                                                        className="max-w-full h-24 object-contain rounded shadow-sm cursor-zoom-in"
                                                        onClick={() => window.open(order.paymentScreenshot.startsWith('http') ? order.paymentScreenshot : `${BASE_URL}${order.paymentScreenshot}`, '_blank')}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ORDER ITEMS */}
                        <div className="bg-white border border-gray-100 rounded-2xl md:rounded-[2.5rem] shadow-xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left min-w-[500px]">
                                    <thead>
                                        <tr className="bg-slate-50 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">
                                            <th className="py-6 px-6 md:px-10">Product Unit</th>
                                            <th className="py-6 px-4 text-center">Unit Price</th>
                                            <th className="py-6 px-4 text-center">Qty</th>
                                            <th className="py-6 px-6 md:px-10 text-right">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {order.orderItems.map((item, i) => (
                                            <tr key={i} className="group hover:bg-slate-50/50 transition-all">
                                                <td className="py-6 px-6 md:px-10">
                                                    <div className="flex items-center gap-4 md:gap-6">
                                                        <div className="w-12 h-12 md:w-16 md:h-16 bg-white border border-gray-100 rounded-xl p-2 flex items-center justify-center shrink-0">
                                                            <img src={item.image.startsWith('http') ? item.image : `${BASE_URL}${item.image}`} alt={item.name} className="max-w-full max-h-full object-contain" />
                                                        </div>
                                                        <Link to={`/product/${item.slug}`} className="text-xs md:text-sm font-black text-electro-dark hover:text-yellow-500 uppercase tracking-tight leading-tight line-clamp-2">
                                                            {item.name}
                                                        </Link>
                                                    </div>
                                                </td>
                                                <td className="py-6 px-4 text-center text-[10px] md:text-xs font-black text-gray-400">৳{item.price.toLocaleString()}</td>
                                                <td className="py-6 px-4 text-center">
                                                    <span className="text-[9px] font-black text-electro-dark bg-electro-yellow/10 px-3 py-1 rounded-full uppercase">x{item.qty}</span>
                                                </td>
                                                <td className="py-6 px-6 md:px-10 text-right font-black text-electro-dark text-sm md:text-base font-mono">৳{(item.qty * item.price).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE: SUMMARY */}
                    <div className="lg:col-span-4 h-fit lg:sticky lg:top-10 order-1 lg:order-2 w-full">
                        <div className="bg-electro-dark text-white p-8 md:p-12 rounded-2xl md:rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/5 relative">
                            <h2 className="text-xl md:text-2xl font-black text-white tracking-tighter mb-8 pb-6 border-b border-white/5 uppercase flex items-center gap-4">
                                <Receipt size={22} className="text-electro-yellow" /> Total <span className="text-electro-yellow">Value</span>
                            </h2>

                            <div className="space-y-6 mb-10">
                                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-gray-400">
                                    <span>Inventory Base</span>
                                    <span className="text-white">৳{order.itemsPrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-gray-400">
                                    <span>Logistics Fee</span>
                                    <span className="text-white">৳{order.shippingPrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-gray-400">
                                    <span>System Tax</span>
                                    <span className="text-white">৳{order.taxPrice.toLocaleString()}</span>
                                </div>
                                <div className="pt-8 border-t border-white/5 space-y-4">
                                    <p className="text-[9px] font-black text-electro-yellow uppercase tracking-[0.3em]">Net Acquisition Cost</p>
                                    <div className="flex justify-between items-end">
                                        <p className="text-4xl md:text-5xl font-black text-electro-yellow tracking-tighter leading-none">৳{order.totalPrice.toLocaleString()}</p>
                                        <Zap size={24} className="text-electro-yellow fill-electro-yellow mb-1 animate-pulse" />
                                    </div>
                                </div>
                            </div>

                            <button onClick={() => window.print()} className="w-full bg-white/5 text-white hover:bg-white hover:text-electro-dark py-5 rounded-full font-black uppercase tracking-widest text-[9px] border border-white/10 transition-all active:scale-95 flex items-center justify-center gap-3 group">
                                <Plus size={16} className="group-hover:rotate-90 transition-transform duration-500" /> Export Statement
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsPage;