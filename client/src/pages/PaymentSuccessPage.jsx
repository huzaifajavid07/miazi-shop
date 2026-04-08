import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Package, Calendar, Hash, ArrowRight, Printer } from 'lucide-react';

const PaymentSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId');
    const tranId = searchParams.get('tranId');

    return (
        <div className="bg-gray-50 min-h-screen py-20 font-sans">
            <div className="container-custom">
                <div className="max-w-3xl mx-auto">
                    {/* Header Card */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl shadow-indigo-100/50 overflow-hidden text-center p-12 relative">
                        <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner animate-in zoom-in-50 duration-500">
                            <CheckCircle2 size={56} strokeWidth={1.5} />
                        </div>
                        
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic mb-4">Transaction Authorized</h1>
                        <p className="text-gray-500 font-medium max-w-md mx-auto leading-relaxed">
                            Payment verified via <span className="text-indigo-600 font-bold uppercase tracking-widest text-xs">SSLCommerz Protocol</span>. Your order has been successfully initialized in our system.
                        </p>

                        {/* Grid Info */}
                        <div className="grid grid-cols-2 gap-4 mt-12 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                            <div className="text-left">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Registry ID</p>
                                <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <Hash size={14} className="text-indigo-600" /> #{orderId?.toString().slice(-8).toUpperCase()}
                                </p>
                            </div>
                            <div className="text-left border-l border-gray-200 pl-6">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Transmission Key</p>
                                <p className="text-sm font-bold text-slate-800 flex items-center gap-2 truncate">
                                    <Hash size={14} className="text-slate-400" /> {tranId}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                        <Link to="/profile" className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-slate-100 group transition-all hover:border-indigo-200">
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                                <Package size={24} />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">Track Deployment</h3>
                            <p className="text-sm text-gray-400 font-medium leading-relaxed mb-6">Monitor the status of your inventory fulfillment in your dashboard.</p>
                            <span className="text-indigo-600 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                                Access Dashboard <ArrowRight size={14} className="transition-transform group-hover:translate-x-2" />
                            </span>
                        </Link>

                        <div className="bg-slate-900 p-8 rounded-3xl shadow-xl shadow-slate-200 relative overflow-hidden group">
                           <div className="relative z-10 text-white">
                                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6">
                                    <Printer size={24} className="text-white" />
                                </div>
                                <h3 className="text-lg font-black uppercase tracking-tight mb-2">Manifest Receipt</h3>
                                <p className="text-sm text-gray-400 font-medium leading-relaxed mb-6">A digital confirmation has been dispatched to your registered email.</p>
                                <Link to="/" className="inline-block bg-white text-slate-900 px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-indigo-400 hover:text-white transition-all">
                                    Continue Shopping
                                </Link>
                           </div>
                           {/* Decoration */}
                           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        </div>
                    </div>

                    <div className="mt-12 text-center">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">
                            MIAZI SHOP — Secure Digital Economy Project <br />
                            Integration Verified: TLS 1.3 / SSLCommerz Gateway
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccessPage;
