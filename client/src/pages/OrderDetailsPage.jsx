import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import api, { BASE_URL } from '../utils/axiosConfig';
import { Loader, ChevronRight, Package, Truck, CreditCard, Calendar, User, MapPin, Receipt, ShieldCheck, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

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
        <div className="container-custom py-20 text-center">
            <div className="bg-red-50 text-red-600 p-10 rounded-2xl border border-red-100 max-w-2xl mx-auto shadow-sm">
                <AlertCircle size={48} className="mx-auto mb-6 opacity-20" />
                <h2 className="text-2xl font-bold mb-4 uppercase tracking-tight">Order Recognition Failed</h2>
                <p className="mb-10 text-sm font-medium">{error}</p>
                <Link to="/myorders" className="bg-electro-dark text-white px-10 py-3 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-black transition-colors">Return To History</Link>
            </div>
        </div>
    );

    if (!order) return null;

    return (
        <div className="bg-electro-bg min-h-screen pb-32">
            <div className="bg-white border-b border-gray-100 shadow-sm mb-16">
                <div className="container-custom py-5 flex items-center gap-3 text-[10px] md:text-sm text-gray-400">
                    <Link to="/" className="hover:text-electro-blue transition-colors uppercase font-black tracking-widest leading-none">Catalog</Link>
                    <ChevronRight size={14} className="opacity-30" />
                    <Link to="/myorders" className="hover:text-electro-blue transition-colors uppercase font-black tracking-widest leading-none">Deployment History</Link>
                    <ChevronRight size={14} className="opacity-30" />
                    <span className="text-electro-dark font-black uppercase tracking-widest border-b-2 border-electro-yellow leading-none">Registry Snapshot</span>
                </div>
            </div>

            <div className="container-custom">
                {/* STATUS BAR - TECHNICAL OVERWRITE */}
                <div className="bg-white border border-gray-100 rounded-[2rem] shadow-2xl p-8 mb-12 flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden relative group">
                    <div className="absolute top-0 left-0 w-2 h-full bg-electro-yellow shadow-[0_0_20px_#fed700]"></div>
                    <div className="flex items-center gap-8 relative z-10">
                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-electro-dark shadow-inner border border-gray-100 group-hover:bg-electro-yellow transition-colors duration-700">
                           <Package size={36} className="group-hover:scale-110 transition-transform duration-700" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Registry Identifier</p>
                            <h1 className="text-3xl md:text-4xl font-black text-electro-dark tracking-tighter uppercase font-display italic">#{order._id.toUpperCase()}</h1>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-5 items-center relative z-10">
                        <div className={`px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 border-2 transition-all duration-700 ${order.isPaid ? 'bg-green-50 border-green-100 text-green-600 shadow-lg shadow-green-100/50' : 'bg-red-50 border-red-100 text-red-600 animate-pulse'}`}>
                            {order.isPaid ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                            {order.isPaid ? `Payment Authorized: ${new Date(order.paidAt).toLocaleDateString()}` : 'Payment Verification Pending'}
                        </div>
                        <div className={`px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 border-2 transition-all duration-700 ${order.isDelivered ? 'bg-blue-50 border-blue-100 text-electro-blue shadow-lg shadow-blue-100/50' : 'bg-yellow-50 border-yellow-100 text-electro-dark shadow-lg shadow-yellow-100/20'}`}>
                           <Truck size={16} className={!order.isDelivered ? 'animate-bounce' : ''} />
                           {order.isDelivered ? `Decommissioned: ${new Date(order.deliveredAt).toLocaleDateString()}` : 'In Deployment Pipeline'}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                    
                    {/* LEFT SIDE: DETAILS COMMAND */}
                    <div className="lg:col-span-8 space-y-12">
                        
                        {/* CUSTOMER INFO LEDGER - ELECTRO STYLE */}
                        <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-electro-blue/5 rounded-bl-full"></div>
                            
                            <div className="bg-slate-50 px-10 py-6 border-b border-gray-100">
                                <h2 className="text-2xl font-black text-electro-dark flex items-center gap-4 uppercase tracking-tighter font-display italic">
                                   <Receipt size={24} className="text-electro-blue" /> Logistics <span className="text-electro-yellow">Metadata</span>
                                </h2>
                            </div>
                            <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                                <div className="space-y-6">
                                    <div className="flex items-start gap-5 group">
                                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-gray-400 bg-white shadow-sm border border-gray-100 group-hover:bg-electro-blue group-hover:text-white transition-all"><User size={20} /></div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Authorized Recipient</p>
                                            <p className="text-lg font-black text-electro-dark font-display">{order.user.name}</p>
                                            <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-tight opacity-60">ID: {order.user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-5 group">
                                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-gray-400 bg-white shadow-sm border border-gray-100 group-hover:bg-electro-blue group-hover:text-white transition-all"><MapPin size={20} /></div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Deployment Coordinates</p>
                                            <p className="text-base font-black text-electro-dark leading-relaxed italic font-display">
                                                {order.shippingAddress.address}, {order.shippingAddress.city} {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="flex items-start gap-5 group">
                                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-gray-400 bg-white shadow-sm border border-gray-100 group-hover:bg-electro-blue group-hover:text-white transition-all"><Calendar size={20} /></div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Registry Initialized</p>
                                            <p className="text-lg font-black text-electro-dark font-display">{new Date(order.createdAt).toLocaleString()}</p>
                                            <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mt-1 opacity-40 italic">TIMESTAMP_VERIFIED</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-5 group">
                                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-gray-400 bg-white shadow-sm border border-gray-100 group-hover:bg-electro-blue group-hover:text-white transition-all"><CreditCard size={20} /></div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Financial Protocol</p>
                                            <p className="text-lg font-black text-electro-dark font-display">{order.paymentMethod}</p>
                                            <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mt-1 opacity-40 italic">SECURE_GATEWAY_AUTH</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ORDER ITEMS TABLE - ELECTRO STYLE */}
                        <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-xl overflow-hidden overflow-x-auto">
                            <table className="w-full text-left min-w-[600px]">
                                <thead>
                                    <tr className="bg-slate-50 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] border-b border-gray-100">
                                        <th className="py-8 px-10 italic">Hardware Registry</th>
                                        <th className="py-8 px-10 text-center italic">Unit Value</th>
                                        <th className="py-8 px-10 text-center italic">Deployment Qty</th>
                                        <th className="py-8 px-10 text-right italic">Registry Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {order.orderItems.map((item, i) => (
                                        <tr key={i} className="group hover:bg-slate-50/50 transition-all duration-700">
                                            <td className="py-10 px-10">
                                                <div className="flex items-center gap-8">
                                                    <div className="w-20 h-20 bg-white border border-gray-100 rounded-2xl p-3 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-110 group-hover:shadow-2xl transition-all duration-700 relative shadow-sm">
                                                        <img src={item.image.startsWith('http') ? item.image : `${BASE_URL}${item.image}`} alt={item.name} className="max-w-full max-h-full object-contain mix-blend-multiply drop-shadow-sm" />
                                                    </div>
                                                    <Link to={`/product/${item.slug}`} className="text-lg font-black text-electro-dark hover:text-electro-blue transition-colors line-clamp-2 uppercase font-display tracking-tight leading-none">{item.name}</Link>
                                                </div>
                                            </td>
                                            <td className="py-10 px-10 text-center text-sm font-black text-gray-400 font-mono italic">৳{item.price.toLocaleString()}</td>
                                            <td className="py-10 px-10 text-center">
                                                <span className="text-xs font-black text-electro-dark bg-electro-yellow/10 border border-electro-yellow/20 px-4 py-1.5 rounded-full uppercase tracking-tighter">[{item.qty} UNITS]</span>
                                            </td>
                                            <td className="py-10 px-10 text-right font-black text-electro-dark italic text-xl font-display">৳{(item.qty * item.price).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* RIGHT SIDE: SUMMARY LEDGER COMMAND */}
                    <div className="lg:col-span-4 h-fit sticky top-10">
                        <div className="bg-electro-dark text-white p-10 md:p-14 rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/5 relative group">
                            {/* Decorative Corner Shadow */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-electro-yellow/5 rounded-bl-full"></div>
                            <div className="absolute top-0 right-10 w-20 h-1 bg-electro-yellow shadow-[0_0_20px_#fed700] rounded-b-full"></div>

                            <h2 className="text-3xl font-black text-white tracking-tighter mb-12 pb-8 border-b border-white/5 uppercase font-display italic flex items-center gap-5">
                                <Receipt size={28} className="text-electro-yellow" /> Final <span className="text-electro-yellow">Ledger</span>
                            </h2>
                            
                            <div className="space-y-8 mb-16">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 opacity-60">
                                    <span>Inventory Value</span>
                                    <span className="text-white text-sm font-display italic">৳{order.itemsPrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 opacity-60">
                                    <span>Logistics Surcharge</span>
                                    <span className="text-white text-sm font-display italic">৳{order.shippingPrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 opacity-60">
                                    <span>Protocol Tax</span>
                                    <span className="text-white text-sm font-display italic">৳{order.taxPrice.toLocaleString()}</span>
                                </div>
                                <div className="pt-10 border-t border-white/5 flex flex-col gap-5">
                                    <p className="text-[10px] font-black text-electro-blue uppercase tracking-[0.4em]">AUTHORIZED TOTAL DEBIT</p>
                                    <div className="flex justify-between items-end">
                                        <p className="text-5xl md:text-6xl font-black text-electro-yellow tracking-tighter italic leading-none shadow-[0_0_30px_rgba(254,215,0,0.15)] font-display">৳{order.totalPrice.toLocaleString()}</p>
                                        <Zap size={32} className="text-electro-yellow fill-electro-yellow mb-1 animate-pulse" />
                                    </div>
                                </div>
                            </div>

                            <button onClick={() => window.print()} className="w-full bg-white/5 text-white hover:bg-white hover:text-electro-dark py-6 rounded-full font-black uppercase tracking-[0.2em] text-[10px] border border-white/10 transition-all duration-700 active:scale-95 shadow-xl flex items-center justify-center gap-4 group/print">
                                <Plus size={18} className="group-hover/print:rotate-90 transition-transform duration-700" /> Print Digital Statement
                            </button>
                        </div>
                        
                        <div className="mt-10 p-8 bg-slate-50 border border-gray-100 rounded-3xl text-center shadow-inner relative overflow-hidden group">
                           <div className="absolute top-0 left-0 w-1 h-full bg-electro-yellow scale-y-0 group-hover:scale-y-100 transition-transform duration-700"></div>
                           <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-300 leading-relaxed italic group-hover:text-gray-400 transition-colors">Logistics record authorized and verified by MIAZI SHOP Encryption Protocols. This document serves as a verified snapshot of the inventory decommissioning registry.</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default OrderDetailsPage;
