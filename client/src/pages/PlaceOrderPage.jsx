import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearCartItems } from '../slices/cartSlice';
import api, { BASE_URL } from '../utils/axiosConfig';
import { toast } from 'react-toastify';
import { ChevronRight, MapPin, CreditCard, ShoppingBag, CheckCircle2, Package, Loader, Zap, Globe } from 'lucide-react';

const PlaceOrderPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isPlacing, setIsPlacing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [orderId, setOrderId] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('COD'); // Default to COD
    const [image, setImage] = useState('');
    const [uploading, setUploading] = useState(false);

    const cart = useSelector((state) => state.cart);
    const { userInfo } = useSelector((state) => state.auth);

    useEffect(() => {
        if (!userInfo) {
            navigate('/login?redirect=/placeorder');
        } else if (!cart.shippingAddress.address) {
            navigate('/shipping');
        }
    }, [userInfo, cart.shippingAddress.address, navigate]);

    // Calculate prices
    const itemsPrice = cart.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    const shippingPrice = itemsPrice > 50000 ? 0 : 500;
    const codSurcharge = paymentMethod === 'COD' ? Math.round(0.03 * itemsPrice) : 0;
    const totalPrice = itemsPrice + shippingPrice + codSurcharge;

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);
        setUploading(true);

        try {
            const { data } = await api.post('/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setImage(data.image);
            toast.success('Receipt uploaded successfully');
        } catch (err) {
            toast.error(err.response?.data?.message || err.message);
        } finally {
            setUploading(false);
        }
    };

    const placeOrderHandler = async () => {
        try {
            setIsPlacing(true);

            if (paymentMethod === 'Online' && !image) {
                toast.error('Please upload your payment screenshot first');
                setIsPlacing(false);
                return;
            }

            const { data } = await api.post('/api/orders', {
                orderItems: cart.cartItems.map(item => ({
                    name: item.name,
                    qty: item.qty,
                    image: item.images?.[0],
                    price: item.price,
                    product: item._id
                })),
                shippingAddress: cart.shippingAddress,
                paymentMethod: paymentMethod === 'Online' ? 'bKash/Nagad Manual' : 'Cash on Delivery',
                itemsPrice,
                taxPrice: codSurcharge, // Using taxPrice field for the 3% surcharge
                shippingPrice,
                totalPrice,
                paymentScreenshot: image || null
            });

            if (paymentMethod === 'COD') {
                // For COD, we still need to initialize payment status in some way if needed
                await api.put(`/api/orders/${data._id}/pay`, {
                    id: 'COD_SYSTEM_AUTO',
                    status: 'PENDING_COD',
                    update_time: new Date().toISOString(),
                    email_address: userInfo.email,
                });
            }

            setOrderId(data._id);
            dispatch(clearCartItems());
            setShowSuccess(true);
            toast.success('Order Successfully Placed!');
        } catch (err) {
            toast.error(err.response?.data?.message || err.message);
        } finally {
            setIsPlacing(false);
        }
    };

    if (showSuccess) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-12 text-center border-4 border-slate-100 animate-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-200">
                        <CheckCircle2 size={48} className="text-white" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter mb-4 italic">Congratulations!</h2>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8 uppercase tracking-widest px-4">
                        Order <span className="text-indigo-600 font-bold">#{orderId.slice(-8).toUpperCase()}</span> has been successfully transmitted to our dispatch unit.
                    </p>
                    <div className="space-y-4">
                        <Link to={`/order/${orderId}`} className="block w-full bg-slate-900 text-white rounded-2xl py-5 text-xs font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-lg">Track Logistics</Link>
                        <Link to="/" className="block w-full text-slate-400 text-[10px] font-black uppercase tracking-widest pt-4">Return To Emporium</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#f8fafc] min-h-screen font-sans pb-20">
            {/* Header / Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 pt-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">Checkout Protocol <span className="text-blue-600">v1.2</span></h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">Manifest Finalization & Logistics Prep</p>
                    </div>
                    <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-2 text-green-600 px-4 py-2 bg-green-50 rounded-xl">
                            <CheckCircle2 size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Cart Verified</span>
                        </div>
                        <div className="w-8 h-px bg-slate-100" />
                        <div className="flex items-center gap-2 text-blue-600 px-4 py-2 bg-blue-50 rounded-xl">
                            <ShoppingBag size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Place Order</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    <div className="lg:col-span-8 space-y-8">
                        {/* Delivery Coordination */}
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                            <div className="p-8 border-b border-slate-50 flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Logistics Destination</h4>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Courier Dispatch Point</p>
                                </div>
                            </div>
                            <div className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Recipient</p>
                                            <p className="text-sm font-bold text-slate-700">{cart.shippingAddress.fullName || userInfo?.name}</p>
                                        </div>
                                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Primary Contact</p>
                                            <p className="text-sm font-bold text-slate-700">{cart.shippingAddress.phone || 'Contact Required'}</p>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex flex-col justify-center">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Shipping Location</p>
                                        <p className="text-sm font-bold text-slate-700 leading-relaxed">
                                            {cart.shippingAddress.address},<br/>
                                            {cart.shippingAddress.city} {cart.shippingAddress.postalCode},<br/>
                                            {cart.shippingAddress.country}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Selection */}
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                            <div className="p-8 border-b border-slate-50 flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                                    <CreditCard size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Financial Protocol</h4>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Select Payment Method</p>
                                </div>
                            </div>
                            <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button 
                                    onClick={() => setPaymentMethod('COD')}
                                    className={`p-6 border-2 rounded-[2rem] flex items-center gap-5 transition-all text-left group ${paymentMethod === 'COD' ? 'border-amber-400 bg-amber-50/50 shadow-lg shadow-amber-100' : 'border-slate-50 hover:border-slate-200 bg-white'}`}
                                >
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${paymentMethod === 'COD' ? 'bg-amber-400 text-white rotate-6' : 'bg-slate-100 text-slate-400'}`}>
                                        <Package size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">Cash On Delivery</p>
                                            <div className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-black rounded uppercase">+3% Fee</div>
                                        </div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1 italic">Slow Verification Flow</p>
                                    </div>
                                </button>

                                <button 
                                    onClick={() => setPaymentMethod('Online')}
                                    className={`p-6 border-2 rounded-[2rem] flex items-center gap-5 transition-all text-left group ${paymentMethod === 'Online' ? 'border-indigo-600 bg-indigo-50/50 shadow-lg shadow-indigo-100' : 'border-slate-50 hover:border-slate-200 bg-white'}`}
                                >
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${paymentMethod === 'Online' ? 'bg-indigo-600 text-white -rotate-6 shadow-xl shadow-indigo-200' : 'bg-slate-100 text-slate-400'}`}>
                                        <Zap size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">bKash / Nagad</p>
                                            <div className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] font-black rounded uppercase italic">SAVE 3%</div>
                                        </div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1 italic">Manual Direct Protocol</p>
                                    </div>
                                </button>
                            </div>

                            {paymentMethod === 'Online' && (
                                <div className="p-8 border-t border-slate-50 bg-slate-50/50 animate-in slide-in-from-top-4 duration-500">
                                    <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32"></div>
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-3 mb-8">
                                                <div className="w-10 h-1 gap-2 flex flex-col justify-center">
                                                    <div className="h-0.5 bg-yellow-400 w-full"></div>
                                                    <div className="h-0.5 bg-yellow-400 w-2/3"></div>
                                                </div>
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-500">Manual Transfer Key</h4>
                                            </div>
                                            
                                            <div className="space-y-8 mb-10">
                                                <div className="flex items-start gap-6">
                                                    <span className="text-5xl font-black text-white/10 italic">01</span>
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Send Exact Amount</p>
                                                        <p className="text-3xl font-black text-white italic tracking-tighter">৳{totalPrice.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-6">
                                                    <span className="text-5xl font-black text-white/10 italic">02</span>
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Merchant Number</p>
                                                        <p className="text-2xl font-black text-yellow-400 tracking-[0.1em] underline underline-offset-8 decoration-white/20">+880 1612-893871</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-6">
                                                    <span className="text-5xl font-black text-white/10 italic">03</span>
                                                    <div className="flex-1">
                                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Transmission Receipt</p>
                                                        <label className={`w-full h-20 border-2 border-dashed rounded-3xl flex items-center justify-center cursor-pointer transition-all ${image ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/20 hover:border-white/40 bg-white/5'}`}>
                                                            <input type="file" onChange={uploadFileHandler} className="hidden" />
                                                            {uploading ? <Loader className="animate-spin text-yellow-400" /> : (
                                                                <div className="flex items-center gap-3">
                                                                    {image ? <><CheckCircle2 size={24} className="text-emerald-400" /> <span className="text-[10px] font-black uppercase tracking-[0.2em]">Verified Upload</span></> : <><ShoppingBag size={20} className="opacity-40" /> <span className="text-[10px] font-black uppercase tracking-[0.2em]">Attach Screenshot</span></>}
                                                                </div>
                                                            )}
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Ordered Items */}
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-50 text-slate-800 rounded-2xl flex items-center justify-center">
                                        <ShoppingBag size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Ordered Manifest</h4>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Inventory List</p>
                                    </div>
                                </div>
                                <span className="bg-slate-100 px-4 py-1.5 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-widest italic">{cart.cartItems.length} Units</span>
                            </div>
                            <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
                                {cart.cartItems.map((item, index) => (
                                    <div key={index} className="p-8 flex items-center gap-8 group hover:bg-slate-50/50 transition-colors">
                                        <div className="w-24 h-24 bg-white border border-slate-100 rounded-3xl p-2 flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden">
                                            <div className="absolute inset-0 bg-slate-100 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                                            <img src={item.images?.[0]?.startsWith('http') ? item.images[0] : `${BASE_URL}${item.images?.[0]}`} alt={item.name} className="max-w-full max-h-full object-contain mix-blend-multiply relative z-10" />
                                        </div>
                                        <div className="flex-1">
                                            <Link to={`/product/${item.slug}`} className="text-sm font-black text-slate-800 hover:text-indigo-600 transition-colors uppercase italic">{item.name}</Link>
                                            <div className="flex items-center gap-4 mt-3">
                                                <div className="px-3 py-1 bg-slate-100 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest">QTY: {item.qty}</div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unit: ৳{item.price.toLocaleString()}</div>
                                            </div>
                                        </div>
                                        <div className="text-base font-black text-slate-800 italic tracking-tighter">৳{(item.qty * item.price).toLocaleString()}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Summary Section */}
                    <div className="lg:col-span-4 sticky top-8">
                        <div className="bg-slate-900 rounded-[3rem] shadow-2xl shadow-indigo-200/50 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                            
                            <div className="p-10 border-b border-white/5">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-2">Billing Matrix</h2>
                                <h3 className="text-2xl font-black text-white italic tracking-tighter">Summary Data</h3>
                            </div>

                            <div className="p-10 space-y-6">
                                <div className="flex justify-between items-center group">
                                    <span className="uppercase tracking-[0.2em] text-[9px] font-black text-gray-500 group-hover:text-white transition-colors duration-300">Net Product Subtotal</span>
                                    <span className="text-white font-black font-sans text-sm italic tracking-tighter">৳{itemsPrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center group">
                                    <span className="uppercase tracking-[0.2em] text-[9px] font-black text-gray-500 group-hover:text-white transition-colors duration-300">Logistic Coordination</span>
                                    <span className="text-white font-black font-sans text-sm italic tracking-tighter">৳{shippingPrice.toLocaleString()}</span>
                                </div>
                                
                                {paymentMethod === 'COD' && (
                                    <div className="flex justify-between items-center bg-amber-500/10 p-5 rounded-2xl border border-amber-500/20 animate-in zoom-in duration-300">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-amber-400 rounded-xl flex items-center justify-center text-slate-900 shadow-lg shadow-amber-400/20">
                                                <Package size={14} />
                                            </div>
                                            <span className="uppercase tracking-widest text-[9px] font-black text-amber-400">COD Handling Fee (3%)</span>
                                        </div>
                                        <span className="text-amber-400 font-black font-sans text-base italic tracking-tighter">৳{codSurcharge.toLocaleString()}</span>
                                    </div>
                                )}

                                <div className="pt-10 border-t border-white/10 flex flex-col gap-4">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-2 italic">Total Authorized Amount</p>
                                            <p className="text-5xl font-black text-white italic tracking-tighter">৳{totalPrice.toLocaleString()}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-indigo-400 mb-2">
                                            <Globe size={24} />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={placeOrderHandler}
                                    disabled={cart.cartItems.length === 0 || isPlacing}
                                    className={`w-full py-6 mt-8 flex items-center justify-center gap-3 disabled:opacity-50 font-black text-[10px] tracking-[0.4em] uppercase rounded-[2rem] transition-all relative group overflow-hidden ${paymentMethod === 'Online' ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/40' : 'bg-white hover:bg-yellow-400 text-slate-900 shadow-xl'}`}
                                >
                                    <span className="relative z-10">{isPlacing ? <Loader className="animate-spin" size={20}/> : 'Execute Transaction'}</span>
                                    <ChevronRight size={18} className="relative z-10 group-hover:translate-x-2 transition-transform" />
                                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                                </button>
                                
                                <div className="flex items-center justify-center gap-2 pt-6">
                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{paymentMethod === 'Online' ? 'Requires Admin Audit' : 'Instant Transmission Ready'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlaceOrderPage;
