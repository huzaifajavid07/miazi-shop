import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../utils/axiosConfig';
import { Loader, Package, ChevronRight, Calendar, CreditCard, Truck, Eye, ArrowRight, ShoppingCart, Info, CheckCircle2, Clock } from 'lucide-react';

const MyOrdersPage = () => {
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

        // Only fetch if userInfo exists
        if (userInfo) {
            fetchOrders();
        }
    }, [userInfo]);

    // NEW: Guard Clause for Unauthenticated Users
    if (!userInfo) {
        return (
            <div className="container-custom py-32 text-center">
                <div className="bg-white border border-gray-200 rounded-3xl p-12 md:p-20 shadow-sm max-w-2xl mx-auto">
                    <div className="w-20 h-20 bg-electro-bg rounded-full flex items-center justify-center mx-auto mb-8">
                        <Info size={40} className="text-electro-dark" />
                    </div>
                    <h2 className="text-3xl font-bold text-electro-dark mb-4">Authentication Required</h2>
                    <p className="text-gray-500 mb-10 leading-relaxed">
                        Please log in to your account or continue as a guest to view your premium tech deployment history.
                    </p>
                    <div className="flex flex-col md:flex-row gap-4 justify-center">
                        <Link 
                            to="/login?redirect=/myorders" 
                            className="bg-electro-yellow text-electro-dark px-10 py-4 rounded-full font-black uppercase tracking-widest text-xs hover:shadow-lg transition-all"
                        >
                            Login to Account
                        </Link>
                       
                    </div>
                </div>
            </div>
        );
    }
    if (loading) return (
        <div className="flex flex-col justify-center items-center py-64 bg-electro-bg h-screen text-center">
            <Loader size={40} className="animate-spin text-electro-yellow mb-4" />
            <span className="text-electro-text font-bold animate-pulse">Accessing Order Registry...</span>
        </div>
    );

    if (error) return (
        <div className="container-custom py-20 text-center">
            <div className="bg-red-50 text-red-600 p-12 rounded-2xl border border-red-100 max-w-2xl mx-auto shadow-sm">
                <Info size={48} className="mx-auto mb-6 opacity-20" />
                <h2 className="text-2xl font-bold mb-4 uppercase tracking-tight">Access Denied / Failure</h2>
                <p className="mb-10 text-sm font-medium">{error}</p>
                <Link to="/" className="bg-electro-dark text-white px-10 py-3 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-black transition-colors inline-block">Return To Store</Link>
            </div>
        </div>
    );

    return (
        <div className="bg-electro-bg min-h-screen pb-32">
            {/* BREADCRUMB */}
            <div className="border-b border-gray-200 bg-white shadow-sm mb-12">
                <div className="container-custom py-4 flex items-center gap-2 text-sm text-gray-500">
                    <Link to="/" className="hover:text-black transition-colors">Home</Link>
                    <ChevronRight size={14} />
                    <span className="text-electro-dark font-bold">Order History</span>
                </div>
            </div>

            <div className="container-custom">
                <header className="mb-12 text-center md:text-left relative">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-electro-yellow rounded-full flex items-center justify-center text-electro-dark shadow-sm">
                           <Package size={24} />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-electro-dark tracking-tight">Order History</h1>
                    </div>
                    <p className="text-sm font-medium text-gray-400 uppercase tracking-widest ml-1">Review and track your premium tech deployments.</p>
                </header>

                {orders.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-3xl p-12 md:p-20 text-center shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-20 opacity-[0.02] pointer-events-none rotate-12">
                           <ShoppingCart size={300} />
                        </div>
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-10 border border-gray-100">
                           <ShoppingCart size={40} className="text-gray-200" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-electro-dark mb-4">No order data found.</h2>
                        <p className="text-gray-500 mb-10 max-w-md mx-auto leading-relaxed text-sm">It looks like you haven't initialized any logistics dispatches yet. Visit the catalog to begin your premium tech acquisition journey.</p>
                        <Link to="/" className="btn-electro bg-electro-yellow text-electro-dark px-12 py-4 rounded-full font-bold shadow-md hover:shadow-lg transition flex items-center gap-4 mx-auto w-fit">
                            Return To Shop <ArrowRight size={18} />
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* DESKTOP TABLE VIEW */}
                        <div className="hidden md:block bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
                            <table className="w-full text-left min-w-[800px]">
                                <thead>
                                    <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200">
                                        <th className="py-6 px-10">Deployment ID</th>
                                        <th className="py-6 px-10">Timestamp</th>
                                        <th className="py-6 px-10">Logistics Total</th>
                                        <th className="py-6 px-10">Payment Condition</th>
                                        <th className="py-6 px-10">Delivery Status</th>
                                        <th className="py-6 px-10 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {orders.map((order) => (
                                        <tr key={order._id} className="group hover:bg-gray-50/30 transition-colors">
                                            <td className="py-6 px-10">
                                                <span className="font-bold text-electro-dark tracking-tighter">#{order._id.toUpperCase()}</span>
                                            </td>
                                            <td className="py-6 px-10">
                                                <div className="flex items-center gap-3 text-gray-500 font-bold">
                                                    <Calendar size={14} className="text-gray-300" />
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="py-6 px-10">
                                                <span className="font-black text-electro-dark text-lg">৳{order.totalPrice.toLocaleString()}</span>
                                            </td>
                                            <td className="py-6 px-10 text-xs">
                                                {order.isPaid ? (
                                                    <div className="flex items-center gap-2 text-green-600 font-black bg-green-50 px-3 py-1.5 rounded-full w-fit border border-green-100 uppercase tracking-widest text-[9px]">
                                                        <CheckCircle2 size={12} /> Completed
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-red-500 font-black bg-red-50 px-3 py-1.5 rounded-full w-fit border border-red-100 uppercase tracking-widest text-[9px]">
                                                        <Clock size={12} /> Pending
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-6 px-10 text-xs">
                                                {order.isDelivered ? (
                                                    <div className="flex items-center gap-2 text-electro-blue font-black bg-blue-50 px-3 py-1.5 rounded-full w-fit border border-blue-100 uppercase tracking-widest text-[9px]">
                                                        <Truck size={12} /> Arrived
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-amber-600 font-black bg-amber-50 px-3 py-1.5 rounded-full w-fit border border-amber-100 uppercase tracking-widest text-[9px]">
                                                            <Truck size={12} className="animate-pulse" /> Shipping
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-6 px-10 text-right">
                                                <Link 
                                                    to={`/order/${order._id}`} 
                                                    className="inline-flex items-center gap-2 bg-slate-50 group-hover:bg-electro-yellow text-slate-400 group-hover:text-electro-dark px-6 py-2.5 rounded-full font-black uppercase tracking-widest text-[10px] transition-all duration-300 border border-slate-100"
                                                >
                                                    Details <Eye size={12} />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* MOBILE CARD VIEW */}
                        <div className="md:hidden space-y-4">
                            {orders.map((order) => (
                                <div key={order._id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm active:scale-[0.98] transition-all">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Order Registry ID</p>
                                            <p className="font-black text-slate-800 tracking-tight text-sm">#{order._id.toUpperCase()}</p>
                                        </div>
                                        {order.isPaid ? (
                                            <CheckCircle2 size={18} className="text-green-500" />
                                        ) : (
                                            <Clock size={18} className="text-amber-500" />
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                <Calendar size={10} /> Date
                                            </p>
                                            <p className="text-xs font-bold text-slate-600">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                <CreditCard size={10} /> Value
                                            </p>
                                            <p className="text-sm font-black text-slate-900">
                                                ৳{order.totalPrice.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tracking Status</p>
                                            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${order.isDelivered ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                                                {order.isDelivered ? 'Arrived' : 'In Transit'}
                                            </span>
                                        </div>
                                        <Link 
                                            to={`/order/${order._id}`} 
                                            className="h-10 px-6 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-200"
                                        >
                                            Logistics <Eye size={12} />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default MyOrdersPage;
