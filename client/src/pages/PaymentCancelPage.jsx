import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ShoppingCart, ArrowLeft, RefreshCw } from 'lucide-react';

const PaymentCancelPage = () => {
    return (
        <div className="bg-gray-50 min-h-screen py-20 font-sans">
            <div className="container-custom">
                <div className="max-w-xl mx-auto">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden p-12 text-center">
                        <div className="w-24 h-24 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                            <AlertCircle size={56} strokeWidth={1.5} />
                        </div>
                        
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic mb-4">Registry Aborted</h1>
                        <p className="text-gray-500 font-medium leading-relaxed mb-8">
                            The financial authorization protocol was terminated by the user. No funds have been captured, and your manifest remains in the cart pending further instruction.
                        </p>

                        <div className="space-y-4">
                            <Link to="/cart" className="flex items-center justify-center gap-3 bg-indigo-600 text-white w-full h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
                                <RefreshCw size={16} /> Resume Checkout Protocol
                            </Link>
                            <Link to="/" className="flex items-center justify-center gap-3 text-gray-400 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest transition-all">
                                <ArrowLeft size={16} /> Return To Storefront
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentCancelPage;
