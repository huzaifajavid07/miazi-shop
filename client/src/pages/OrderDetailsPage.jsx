import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api, { BASE_URL } from '../utils/axiosConfig';
import { Loader, CheckCircle, Clock, Package } from 'lucide-react';

const OrderDetailsPage = () => {
    const { id } = useParams();
    const { userInfo } = useSelector((state) => state.auth);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data } = await api.get(`/api/orders/${id}`);
                setOrder(data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load order');
            }
            setLoading(false);
        };
        fetchOrder();
    }, [id]);

    if (loading) return <div className="flex justify-center py-32"><Loader size={40} className="animate-spin text-[#fed700]" /></div>;
    if (error) return <div className="container-custom py-16 text-center text-red-500 font-bold">{error}</div>;
    if (!order) return null;

    return (
        <div className="container-custom py-8">
            <h1 className="text-xl font-extrabold mb-6">Order #{order._id.slice(-8)}</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 flex flex-col gap-4">
                    {/* Status Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className={`border rounded-xl p-4 flex items-center gap-3 ${order.isPaid ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                            {order.isPaid ? <CheckCircle size={24} className="text-green-600" /> : <Clock size={24} className="text-yellow-600" />}
                            <div>
                                <p className="font-bold text-sm">{order.isPaid ? 'Payment Confirmed' : 'Payment Pending'}</p>
                                {order.isPaid && <p className="text-xs text-gray-500">{new Date(order.paidAt).toLocaleString()}</p>}
                            </div>
                        </div>
                        <div className={`border rounded-xl p-4 flex items-center gap-3 ${order.isDelivered ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
                            <Package size={24} className={order.isDelivered ? 'text-green-600' : 'text-blue-600'} />
                            <div>
                                <p className="font-bold text-sm">{order.orderStatus || 'Processing'}</p>
                                {order.isDelivered && <p className="text-xs text-gray-500">{new Date(order.deliveredAt).toLocaleString()}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Shipping */}
                    <div className="border rounded-xl p-5 bg-white">
                        <h2 className="font-bold mb-3">Shipping Info</h2>
                        <p className="text-sm text-gray-700"><strong>Name:</strong> {order.shippingAddress?.fullName || order.user?.name}</p>
                        <p className="text-sm text-gray-700"><strong>Phone:</strong> {order.shippingAddress?.phone}</p>
                        <p className="text-sm text-gray-700"><strong>Address:</strong> {order.shippingAddress?.address}, {order.shippingAddress?.city} {order.shippingAddress?.postalCode}, {order.shippingAddress?.country}</p>
                    </div>

                    {/* Items */}
                    <div className="border rounded-xl p-5 bg-white">
                        <h2 className="font-bold mb-3">Order Items</h2>
                        {order.orderItems?.map((item, i) => (
                            <div key={i} className="flex items-center gap-4 py-3 border-b last:border-b-0">
                                <img src={item.image?.startsWith('http') ? item.image : `${BASE_URL}${item.image}`} alt={item.name} className="w-14 h-14 object-contain rounded border p-1" />
                                <span className="flex-1 font-semibold text-sm">{item.name}</span>
                                <span className="text-sm text-gray-600">{item.qty} × ৳{item.price?.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Summary */}
                <div className="bg-white border rounded-xl p-6 h-fit">
                    <h2 className="font-extrabold text-lg mb-4">Order Summary</h2>
                    <div className="flex justify-between mb-2 text-sm"><span className="text-gray-500">Items:</span><span>৳{order.itemsPrice?.toLocaleString()}</span></div>
                    <div className="flex justify-between mb-2 text-sm"><span className="text-gray-500">Shipping:</span><span>৳{order.shippingPrice?.toLocaleString()}</span></div>
                    <div className="flex justify-between mb-4 text-sm border-b pb-4"><span className="text-gray-500">Tax:</span><span>৳{order.taxPrice?.toLocaleString()}</span></div>
                    <div className="flex justify-between text-lg font-extrabold"><span>Total:</span><span>৳{order.totalPrice?.toLocaleString()}</span></div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsPage;
