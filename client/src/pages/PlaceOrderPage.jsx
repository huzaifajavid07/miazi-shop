import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearCartItems } from '../slices/cartSlice';
import api, { BASE_URL } from '../utils/axiosConfig';
import { toast } from 'react-toastify';
import { ChevronRight, MapPin, CreditCard, ShoppingBag, CheckCircle2, CheckCircle,Package,Upload, Loader, Zap, Globe } from 'lucide-react';

const PlaceOrderPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isPlacing, setIsPlacing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [orderId, setOrderId] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('COD'); // Default to COD
    const [image, setImage] = useState('');
    const [uploading, setUploading] = useState(false);

    const cart = useSelector((state) => state.cart || {});
    const { userInfo } = useSelector((state) => state.auth);
    const { cartItems = [], shippingAddress = {} } = cart;

    useEffect(() => {
        if (!userInfo) {
            navigate('/login?redirect=/placeorder');
        } else if (!shippingAddress?.address) {
            navigate('/shipping');
        }
    }, [userInfo, shippingAddress?.address, navigate]);

    // Store Reference: Tatua Chowrasta
    const storeLocation = { lat: 23.4055098, lng: 90.739426 };

    // Distance Calculation (Haversine Formula)
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d;
    };

    const userDistance = (cart.shippingAddress?.lat && cart.shippingAddress?.lng)
        ? calculateDistance(storeLocation.lat, storeLocation.lng, cart.shippingAddress.lat, cart.shippingAddress.lng)
        : null;

    // Distance-based shipping fee brackets
    const calculateShippingFee = (distance) => {
        if (distance === null || distance === undefined) return 150; // Manual entry fallback
        if (distance <= 10) return 50;
        if (distance <= 20) return 80;
        if (distance <= 30) return 120;
        return 150; // Premium delivery for long distances (>30km)
    };

    // 1. First, calculate the cost of all items in the cart
    const itemsPrice = cart.cartItems.reduce(
        (acc, item) => acc + item.price * item.qty,
        0
    );

    // 2. Now these will work because itemsPrice exists
    const shippingPrice = calculateShippingFee(userDistance);

    const codSurcharge = paymentMethod === 'COD'
        ? Math.round(0.03 * itemsPrice)
        : 0;

    const totalPrice = itemsPrice + shippingPrice + codSurcharge;

    const uploadFileHandler = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Ensure it's an image
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        // Limit size to 5MB for Base64 (approx 3.75MB raw)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB');
            return;
        }

        setUploading(true);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            setImage(reader.result);
            setUploading(false);
            toast.success('Screenshot captured successfully');
        };
        reader.onerror = (error) => {
            toast.error('Error reading file');
            setUploading(false);
        };
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
                    <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter mb-4">Congratulations!</h2>
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
                        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Order Review</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">Verify items & Delivery Information</p>
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
                                            {cart.shippingAddress.address},<br />
                                            {cart.shippingAddress.city} {cart.shippingAddress.postalCode},<br />
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
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">Slow Verification Flow</p>
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
                                            <div className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] font-black rounded uppercase">SAVE 3%</div>
                                        </div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">Manual Direct Protocol</p>
                                    </div>
                                </button>
                            </div>

                           {paymentMethod === 'Online' && (
  <div className="mt-10 bg-white rounded-3xl shadow-sm border border-slate-100 p-8 animate-in fade-in duration-500">
    
    {/* Header */}
    <div className="flex items-center justify-between mb-10">
      <h4 className="text-sm font-bold text-slate-800 tracking-wide">
        Manual Payment
      </h4>
      <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-semibold">
        Secure
      </span>
    </div>

    {/* Grid */}
    <div className="grid md:grid-cols-3 gap-6">

      {/* Step 1 */}
      <div className="bg-slate-50 rounded-2xl p-6 hover:shadow-md transition">
        <p className="text-xs text-slate-400 mb-2">Amount Due</p>
        <h2 className="text-2xl font-bold text-slate-900">
          ৳{totalPrice.toLocaleString()}
        </h2>
        <p className="text-xs text-yellow-600 mt-1">
          +3% fee if applicable
        </p>
      </div>

      {/* Step 2 */}
      <div className="bg-slate-50 rounded-2xl p-6 hover:shadow-md transition">
        <p className="text-xs text-slate-400 mb-4">Send To</p>

        <div className="space-y-3">
          <div>
            <p className="text-[11px] text-slate-400">Personal</p>
            <p className="font-semibold text-slate-800">
              +880 1612-893871
            </p>
          </div>

          <div>
            <p className="text-[11px] text-slate-400">Agent</p>
            <p className="font-semibold text-slate-800">
              +880 1905-507895
            </p>
          </div>
        </div>
      </div>

      {/* Step 3 */}
      <div className="bg-slate-50 rounded-2xl p-6 hover:shadow-md transition">
        <p className="text-xs text-slate-400 mb-4">Upload Receipt</p>

        <label
          className={`w-full h-28 flex flex-col items-center justify-center rounded-xl cursor-pointer transition border-2 ${
            image
              ? "border-yellow-400 bg-yellow-50"
              : "border-dashed border-slate-300 hover:border-yellow-400 hover:bg-yellow-50"
          }`}
        >
          <input type="file" onChange={uploadFileHandler} className="hidden" />

          {uploading ? (
            <Loader className="animate-spin text-yellow-500" />
          ) : image ? (
            <>
              <CheckCircle className="text-yellow-500" />
              <p className="text-xs font-semibold text-yellow-700 mt-1">
                Uploaded
              </p>
            </>
          ) : (
            <>
              <Upload className="text-slate-400" />
              <p className="text-xs text-slate-500 mt-1">
                Click to upload
              </p>
            </>
          )}
        </label>
      </div>
    </div>

    {/* Footer */}
    <div className="mt-8 bg-yellow-50 border border-yellow-100 rounded-xl p-4 flex items-center gap-2">
      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
      <p className="text-xs text-yellow-700 font-medium">
        Payments are verified manually within 15–30 minutes
      </p>
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
                                <span className="bg-slate-100 px-4 py-1.5 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-widest">{cart.cartItems.length} Units</span>
                            </div>
                            <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
                                {cart.cartItems.map((item, index) => (
                                    <div key={index} className="p-8 flex items-center gap-8 group hover:bg-slate-50/50 transition-colors">
                                        <div className="w-24 h-24 bg-white border border-slate-100 rounded-3xl p-2 flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden">
                                            <div className="absolute inset-0 bg-slate-100 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                                            <img src={item.images?.[0]?.startsWith('http') ? item.images[0] : `${BASE_URL}${item.images?.[0]}`} alt={item.name} className="max-w-full max-h-full object-contain mix-blend-multiply relative z-10" />
                                        </div>
                                        <div className="flex-1">
                                            <Link to={`/product/${item.slug}`} className="text-sm font-black text-slate-800 hover:text-indigo-600 transition-colors uppercase">{item.name}</Link>
                                            <div className="flex items-center gap-4 mt-3">
                                                <div className="px-3 py-1 bg-slate-100 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest">QTY: {item.qty}</div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unit: ৳{item.price.toLocaleString()}</div>
                                            </div>
                                        </div>
                                        <div className="text-base font-black text-slate-800 tracking-tighter">৳{(item.qty * item.price).toLocaleString()}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Summary Section */}
                    <div className="lg:col-span-4 sticky top-8">
                        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-slate-100 bg-slate-50/30">
                                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Order Summary</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Final Price Calculations</p>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Items Total</span>
                                    <span className="text-slate-800 font-black text-sm">৳{itemsPrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Delivery Charge</span>
                                        {userDistance && (
                                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Distance: {userDistance.toFixed(1)} KM</span>
                                        )}
                                    </div>
                                    <span className="text-slate-800 font-black text-sm">৳{shippingPrice.toLocaleString()}</span>
                                </div>

                                {paymentMethod === 'COD' && (
                                    <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                                        <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Cash Collection Fee (3%)</span>
                                        <span className="text-amber-600 font-black text-sm">৳{codSurcharge.toLocaleString()}</span>
                                    </div>
                                )}

                                <div className="pt-8 border-t border-slate-100">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Grand Total</p>
                                            <p className="text-4xl font-black text-slate-900 tracking-tighter">৳{totalPrice.toLocaleString()}</p>
                                        </div>
                                        <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-100">
                                            <Zap size={20} className="text-slate-900" />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={placeOrderHandler}
                                    disabled={cart.cartItems.length === 0 || isPlacing}
                                    className="w-full py-5 mt-6 bg-yellow-400 hover:bg-slate-900 hover:text-white text-slate-900 font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-yellow-100 transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
                                >
                                    {isPlacing ? <Loader className="animate-spin" size={20} /> : 'Place Order'}
                                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>

                                <div className="text-center pt-4">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                        Secure Transaction Point
                                    </p>
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
