import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { XCircle, RefreshCw, AlertCircle, ShoppingCart, ArrowLeft } from 'lucide-react';

const PaymentFailPage = () => {
    const [searchParams] = useSearchParams();
    const error = searchParams.get('error');

    return (
        <div className="bg-gray-50 min-h-screen py-20 font-sans">
            <div className="container-custom">
                <div className="max-w-xl mx-auto">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden p-12 text-center">
                        <div className="w-24 h-24 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                            <XCircle size={56} strokeWidth={1.5} />
                        </div>
                        
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic mb-4">Transaction Denied</h1>
                        <p className="text-gray-500 font-medium leading-relaxed mb-8">
                            We were unable to verify your financial protocol with <span className="text-red-600 font-bold uppercase tracking-widest text-[10px]">SSLCommerz</span>. Your order attempt has been logged but not authorized.
                        </p>

                        {error && (
                            <div className="mb-8 p-4 bg-red-50/50 rounded-xl border border-red-100 flex items-center gap-3 text-red-600 text-xs font-bold uppercase tracking-widest">
                                <AlertCircle size={16} /> Error Signature: {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <Link to="/cart" className="flex items-center justify-center gap-3 bg-slate-900 text-white w-full h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-100">
                                <RefreshCw size={16} /> Re-Initialize Transaction
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

export default PaymentFailPage;
