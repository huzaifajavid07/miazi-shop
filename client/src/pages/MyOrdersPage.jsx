import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../utils/axiosConfig';
import { Loader, Package } from 'lucide-react';

const MyOrdersPage = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userInfo) { navigate('/login'); return; }
        const fetchOrders = async () => {
            try {
                const { data } = await api.get('/api/orders/myorders');
                setOrders(data);
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };
        fetchOrders();
    }, [userInfo, navigate]);

    if (loading) return <div className="flex justify-center py-32"><Loader size={40} className="animate-spin text-[#fed700]" /></div>;

    return (
        <div className="container-custom py-8">
            <h1 className="text-2xl font-extrabold mb-6 flex items-center gap-3"><Package size={28} className="text-[#fed700]" /> My Orders</h1>
            {orders.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-xl border">
                    <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
                    <Link to="/" className="inline-block bg-[#fed700] text-[#333e48] font-bold px-8 py-3 rounded-full hover:bg-yellow-500 transition">Start Shopping</Link>
                </div>
            ) : (
                <div className="bg-white border rounded-xl overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-3">Order ID</th>
                                <th className="p-3">Date</th>
                                <th className="p-3">Total</th>
                                <th className="p-3">Paid</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(o => (
                                <tr key={o._id} className="border-t hover:bg-gray-50">
                                    <td className="p-3 font-mono text-xs">{o._id.slice(-8)}</td>
                                    <td className="p-3 text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                                    <td className="p-3 font-bold">৳{o.totalPrice?.toLocaleString()}</td>
                                    <td className="p-3">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${o.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                            {o.isPaid ? 'Paid' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                            o.orderStatus === 'Delivered' ? 'bg-green-100 text-green-700' :
                                            o.orderStatus === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>{o.orderStatus || 'Processing'}</span>
                                    </td>
                                    <td className="p-3">
                                        <Link to={`/order/${o._id}`} className="text-blue-600 hover:underline font-semibold text-xs">View</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MyOrdersPage;
