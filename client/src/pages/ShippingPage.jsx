import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { saveShippingAddress } from '../slices/cartSlice';
import { ChevronRight, Truck, MapPin, CheckCircle2, Navigation, Loader } from 'lucide-react';
import { toast } from 'react-toastify';

const ShippingPage = () => {
    const cart = useSelector((state) => state.cart || {});
    const { shippingAddress = {} } = cart;

    const [address, setAddress] = useState(shippingAddress?.address || '');
    const [city, setCity] = useState(shippingAddress?.city || '');
    const [postalCode, setPostalCode] = useState(shippingAddress?.postalCode || '');
    const [country, setCountry] = useState(shippingAddress?.country || '');
    const [phone, setPhone] = useState(shippingAddress?.phone || '');
    const [lat, setLat] = useState(shippingAddress?.lat || null);
    const [lng, setLng] = useState(shippingAddress?.lng || null);
    const [detecting, setDetecting] = useState(false);
    const [isResolving, setIsResolving] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { userInfo } = useSelector((state) => state.auth);

    useEffect(() => {
        if (!userInfo) {
            navigate('/login?redirect=/shipping');
        }
    }, [userInfo, navigate]);

    const detectLocation = async () => {
        setDetecting(true);
        try {
            // First try IP-based location via freeipapi (No browser permission required, excellent CORS)
            const response = await fetch('https://freeipapi.com/api/json');
            if (!response.ok) throw new Error('IP lookup failed');
            const data = await response.json();

            setCity(data.cityName || '');
            setPostalCode(data.zipCode || '');
            setCountry(data.countryName || ''); 
            setLat(data.latitude || null);
            setLng(data.longitude || null);
            setAddress(`${data.cityName || ''}, ${data.regionName || ''}, ${data.countryName || ''}`);
            
            toast.success('Location detected automatically!');
            setDetecting(false);
        } catch (error) {
            console.error('IP Location failed, trying GPS:', error);
            // Fallback to Browser Geolocation if IP API fails
            if (!navigator.geolocation) {
                toast.error('Location detection failed. Please enter manually.');
                setDetecting(false);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
                    setAddress(mapsLink);
                    setLat(latitude);
                    setLng(longitude);
                    toast.success('GPS Location detected!');
                    setDetecting(false);
                },
                (err) => {
                    console.error('Geo error:', err);
                    if (err.code === 1) toast.error('Location Access Denied. Please enter manually.');
                    else if (err.code === 2) toast.error('Position Unavailable. Please enter manually.');
                    else if (err.code === 3) toast.error('Location Timeout. Connection might be slow.');
                    else toast.error('Could not detect location. Please enter manually.');
                    setDetecting(false);
                },
                { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
            );
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        
        let finalLat = lat;
        let finalLng = lng;

        // "Full Functional" Logic: If coordinates are missing, resolve them from the typed address
        if (!finalLat || !finalLng) {
            setIsResolving(true);
            try {
                const query = `${address}, ${city}, Bangladesh`.trim();
                const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=bd`, {
                    headers: {
                        'User-Agent': 'Miazii-Shop-Logistics-Bot'
                    }
                });
                const data = await response.json();

                if (data && data.length > 0) {
                    finalLat = parseFloat(data[0].lat);
                    finalLng = parseFloat(data[0].lon);
                    toast.success('Address coordinates resolved successfully!');
                } else {
                    // Fallback Tier 2: Search just the city
                    console.log('Tier 1 failed, trying Tier 2 (City only)');
                    const fallbackResponse = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city + ", Bangladesh")}&format=json&limit=1&countrycodes=bd`);
                    const fallbackData = await fallbackResponse.json();
                    
                    if (fallbackData && fallbackData.length > 0) {
                        finalLat = parseFloat(fallbackData[0].lat);
                        finalLng = parseFloat(fallbackData[0].lon);
                        toast.success('City coordinates resolved!');
                    } else {
                        toast.warning('Location too vague. Using standard rate.');
                    }
                }
            } catch (error) {
                console.error('Geo-Resolution Error:', error);
            } finally {
                setIsResolving(false);
            }
        }

        dispatch(saveShippingAddress({ address, city, postalCode, country, phone, lat: finalLat, lng: finalLng }));
        navigate('/placeorder');
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200 mb-8">
                <div className="container-custom py-4 flex items-center gap-2 text-sm text-gray-500">
                    <Link to="/" className="hover:text-blue-600">Home</Link>
                    <ChevronRight size={14} />
                    <Link to="/cart" className="hover:text-blue-600">Cart</Link>
                    <ChevronRight size={14} />
                    <span className="text-gray-800 font-bold">Shipping</span>
                </div>
            </div>

            <div className="container-custom">
                {/* Checkout Steps */}
                <div className="flex justify-center mb-12">
                    <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest">
                        <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 size={16} /> <span>Cart</span>
                        </div>
                        <div className="w-12 h-px bg-gray-200" />
                        <div className="flex items-center gap-2 text-blue-600">
                            <MapPin size={16} /> <span>Shipping</span>
                        </div>
                        <div className="w-12 h-px bg-gray-200" />
                        <div className="flex items-center gap-2 text-gray-300">
                            <span className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-[10px]">3</span> <span>Place Order</span>
                        </div>
                    </div>
                </div>

                <div className="max-w-xl mx-auto">
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-200 bg-gray-50">
                            <h1 className="text-xl font-bold text-gray-800 uppercase tracking-tight flex items-center gap-2">
                                <Truck size={20} /> Shipping Details
                            </h1>
                        </div>
                        <div className="p-8">
                            <form onSubmit={submitHandler} className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-bold uppercase text-gray-500">Address / Location Link</label>
                                        <button 
                                            type="button" 
                                            onClick={detectLocation}
                                            disabled={detecting}
                                            className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-1 hover:text-blue-700 disabled:opacity-50"
                                        >
                                            {detecting ? <Loader size={12} className="animate-spin" /> : <Navigation size={12} />}
                                            {detecting ? 'Detecting...' : 'Detect My Location'}
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Enter address or auto-detect link"
                                        className="w-full bg-white border border-gray-200 p-3 rounded-lg outline-none focus:border-yellow-400 text-sm font-semibold"
                                        value={address}
                                        required
                                        onChange={(e) => {
                                            setAddress(e.target.value);
                                            setLat(null); // Clear coords when user types manually
                                            setLng(null);
                                        }}
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-gray-500">City</label>
                                        <input
                                            type="text"
                                            placeholder="Enter city"
                                            className="w-full bg-white border border-gray-200 p-3 rounded-lg outline-none focus:border-yellow-400 text-sm"
                                            value={city}
                                            required
                                            onChange={(e) => {
                                                setCity(e.target.value);
                                                setLat(null);
                                                setLng(null);
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-gray-500">Postal Code</label>
                                        <input
                                            type="text"
                                            placeholder="Enter postal code"
                                            className="w-full bg-white border border-gray-200 p-3 rounded-lg outline-none focus:border-yellow-400 text-sm"
                                            value={postalCode}
                                            required
                                            onChange={(e) => setPostalCode(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-gray-500">Country</label>
                                    <input
                                        type="text"
                                        placeholder="Enter country"
                                        className="w-full bg-white border border-gray-200 p-3 rounded-lg outline-none focus:border-yellow-400 text-sm"
                                        value={country}
                                        required
                                        onChange={(e) => setCountry(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-gray-500">Phone Number</label>
                                    <input
                                        type="text"
                                        placeholder="Enter phone number"
                                        className="w-full bg-white border border-gray-200 p-3 rounded-lg outline-none focus:border-yellow-400 text-sm"
                                        value={phone}
                                        required
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isResolving}
                                    className="btn-electro w-full h-12 uppercase mt-6 flex items-center justify-center gap-2"
                                >
                                    {isResolving ? (
                                        <>
                                            <Loader size={18} className="animate-spin" />
                                            <span>Analyzing Logistics...</span>
                                        </>
                                    ) : (
                                        'Continue to Order Review'
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShippingPage;
