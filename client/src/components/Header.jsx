import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../slices/authSlice';
import { listCategories } from '../slices/categorySlice';
import api from '../utils/axiosConfig';
import {
    ShoppingBag, Search, Menu, User, MapPin,
    Truck, RefreshCw, Heart, ChevronDown, LayoutDashboard,
    Bell, Check, X as CloseIcon, Info, AlertTriangle, ChevronRight,
    Trash2
} from 'lucide-react';
import { fetchNotifications, resetCount, deleteNotification } from '../slices/notificationSlice';
import { toast } from 'react-toastify';
import { BASE_URL } from '../utils/axiosConfig';

const Header = () => {
    const [keyword, setKeyword] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isDeptOpen, setIsDeptOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { cartItems } = useSelector((state) => state.cart);
    const { userInfo } = useSelector((state) => state.auth);
    const { categories } = useSelector((state) => state.category);
    const { notifications, count } = useSelector((state) => state.notifications);

    useEffect(() => {
        dispatch(listCategories());
        dispatch(fetchNotifications());

        // Background poller for notifications every 2 mins
        const interval = setInterval(() => {
            dispatch(fetchNotifications());
        }, 120000);

        return () => clearInterval(interval);
    }, [dispatch]);

    // Debounced Search Suggestions
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (keyword.trim().length > 1) {
                try {
                    const { data } = await api.get(`/api/products/suggestions?keyword=${keyword}`);
                    setSuggestions(data);
                    setShowSuggestions(true);
                } catch (err) {
                    console.error(err);
                }
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        };

        const timer = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timer);
    }, [keyword]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (keyword.trim()) {
            navigate(`/?keyword=${keyword}`);
        } else {
            navigate('/');
        }
    };

    const logoutHandler = () => {
        dispatch(logout());
        navigate('/login');
        toast.info('Signed out successfully.');
    };

    const handleDeleteNotification = (e, id) => {
        e.stopPropagation();
        dispatch(deleteNotification(id));
        toast.success('Notification removed');
    };

    const departments = categories.length > 0
        ? categories.map(c => ({ name: c.name, id: c._id }))
        : [{ name: 'No categories yet', id: '' }];

    return (
        <header className="w-full bg-white font-sans">
            {/* TIER 1: TOP BAR */}
            <div className="border-b border-gray-100 hidden md:block">
                <div className="max-w-7xl mx-auto px-4 flex justify-between items-center py-2 text-[12px] text-gray-500">
                    <div>Welcome to Worldwide Electronics Store</div>
                    <div className="flex items-center gap-4">
                        <Link to="#" className="flex items-center gap-1 hover:text-yellow-500"><MapPin size={14} /> Store Locator</Link>
                        <span className="text-gray-200">|</span>
                        <Link to="/orders" className="flex items-center gap-1 hover:text-yellow-500"><Truck size={14} /> Track Your Order</Link>
                        <span className="text-gray-200">|</span>
                        <div className="flex items-center gap-1">Dollar (US) <ChevronDown size={10} /></div>
                        <span className="text-gray-200">|</span>
                        {userInfo ? (
                            <div className="flex items-center gap-2">
                                <span className="text-yellow-500 font-bold">{userInfo.email}</span>
                                <span className="text-gray-200">|</span>
                                <button onClick={logoutHandler} className="hover:text-yellow-500 font-bold">Logout</button>
                            </div>
                        ) : (
                            <Link to="/login" className="hover:text-yellow-600 font-bold transition-colors">Register or Sign in</Link>
                        )}
                    </div>
                </div>
            </div>

            {/* TIER 2: LOGO & SEARCH */}
            <div className="max-w-7xl mx-auto px-4 py-3 md:py-5 flex items-center justify-between gap-4 md:gap-10">
                {/* Logo Area */}
                <Link to="/" className="flex items-center flex-shrink-0 group">
                    <div className="h-16 md:h-20 flex items-center justify-center">
                        <img src="/logo.png" alt="Miazii Shop Logo" className="h-full w-auto object-contain drop-shadow-md group-hover:scale-105 transition-transform" />
                    </div>
                </Link>

                {/* Mobile Icons */}
                <div className="flex items-center gap-1 sm:gap-3 md:hidden">
                    {/* Mobile Notification Bell */}
                    <div className="relative">
                        <button 
                            onClick={() => { setIsNotifOpen(true); dispatch(resetCount()); }}
                            className="p-2 text-gray-700 hover:text-yellow-500 transition-colors"
                        >
                            <Bell size={22} />
                            {count > 0 && (
                                <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[8px] font-black w-3.5 h-3.5 flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                                    {count}
                                </span>
                            )}
                        </button>
                    </div>

                    <Link to="/cart" className="relative p-2 text-gray-800">
                        <ShoppingBag size={24} />
                        {cartItems.length > 0 && (
                            <span className="absolute -top-1 -right-2 bg-yellow-400 text-gray-900 text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                {cartItems.reduce((a, c) => a + c.qty, 0)}
                            </span>
                        )}
                    </Link>

                    <Link to={userInfo ? "/profile" : "/login"} className="p-2 text-gray-800 hover:text-yellow-500 transition-colors">
                        <User size={24} />
                    </Link>

                    <button onClick={() => setIsMobileMenuOpen(true)} className="text-gray-800 p-2"><Menu size={24} /></button>
                </div>

                {/* Main Search Bar - Restored Yellow Theme */}
                <div className="flex-1 max-w-2xl hidden md:block relative">
                    <form onSubmit={handleSearch} className="flex border-2 border-yellow-400 rounded-full h-11">
                        <input
                            type="text"
                            className="flex-1 bg-transparent px-5 text-sm focus:outline-none"
                            placeholder="Search for Products"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onFocus={() => keyword.length > 1 && setShowSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        />
                        <button type="submit" className="bg-yellow-400 px-6 rounded-r-full flex items-center justify-center hover:bg-gray-800 hover:text-white transition-colors">
                            <Search size={20} />
                        </button>
                    </form>

                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-white mt-1 border border-gray-100 shadow-2xl rounded-xl z-[100] overflow-hidden">
                            <div className="p-2 border-b border-gray-50 bg-gray-50 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Suggestions</span>
                                <span className="text-[10px] text-gray-400 px-2">{suggestions.length} found</span>
                            </div>
                            <ul>
                                {suggestions.map((p) => (
                                    <li key={p._id}>
                                        <button 
                                            onMouseDown={(e) => { e.preventDefault(); navigate(`/?category=${p.category?._id || p.category}&keyword=${p.name}`); setKeyword(''); setShowSuggestions(false); }}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-yellow-50 transition-colors text-left"
                                        >
                                            <div className="w-10 h-10 bg-gray-50 rounded flex items-center justify-center p-1 shrink-0">
                                                <img 
                                                    src={p.images?.[0] ? (p.images[0].startsWith('http') ? p.images[0] : `${BASE_URL}${p.images[0]}`) : 'https://placehold.co/100x100'} 
                                                    alt="" className="max-w-full max-h-full object-contain mix-blend-multiply" 
                                                />
                                            </div>
                                            <div className="min-w-0 text-left">
                                                <p className="text-sm font-bold text-gray-800 truncate">{p.name}</p>
                                                <p className="text-[10px] text-gray-400 uppercase font-bold">৳{p.price.toLocaleString()}</p>
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="hidden md:flex items-center gap-5 text-gray-700">
                    {/* Notification Bell */}
                    <div className="relative" onMouseEnter={() => { setIsNotifOpen(true); dispatch(resetCount()); }} onMouseLeave={() => setIsNotifOpen(false)}>
                        <button className="relative p-2 text-gray-700 hover:text-yellow-500 transition-colors group/bell">
                            <Bell size={22} className="group-hover/bell:animate-ring" />
                            {count > 0 && (
                                <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[8px] font-black w-3.5 h-3.5 flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                                    {count}
                                </span>
                            )}
                        </button>
                        
                        {/* Notification Drawer Overlay */}
                        {isNotifOpen && (
                            <div 
                                className="fixed inset-0 z-[600] bg-black/50 backdrop-blur-md transition-opacity duration-300"
                                onClick={() => setIsNotifOpen(false)}
                            />
                        )}

                        {/* Notification Drawer */}
                        <div className={`fixed top-0 right-0 h-full w-full sm:w-[350px] bg-white z-[601] shadow-2xl transform transition-transform duration-500 ease-out flex flex-col ${isNotifOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                            {/* Header */}
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-yellow-400 shrink-0">
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">Broadcast Center</h3>
                                    <p className="text-[10px] text-gray-800 font-bold mt-0.5">{notifications.length} Announcements Active</p>
                                </div>
                                <button 
                                    onClick={() => setIsNotifOpen(false)}
                                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                >
                                    <CloseIcon size={20} className="text-gray-900" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                {notifications.length > 0 ? (
                                    <div className="divide-y divide-gray-50">
                                        {notifications.map((n) => (
                                            <div key={n._id} className="p-6 hover:bg-slate-50 transition-colors group relative">
                                                <div className="flex gap-4">
                                                    <div className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center shadow-sm ${n.type === 'warning' ? 'bg-amber-100 text-amber-600' : n.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                                                        {n.type === 'warning' ? <AlertTriangle size={18} /> : n.type === 'success' ? <Check size={18} /> : <Info size={18} />}
                                                    </div>
                                                    <div className="flex-1 min-w-0 pr-6">
                                                        <div className="flex items-center justify-between">
                                                            <span className={`text-[9px] font-black uppercase tracking-widest ${n.type === 'warning' ? 'text-amber-500' : n.type === 'success' ? 'text-emerald-500' : 'text-blue-500'}`}>{n.type} ALERT</span>
                                                            <span className="text-[9px] text-gray-400 font-bold">{new Date(n.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                        <h4 className="text-sm font-black text-slate-800 mt-1 uppercase tracking-tight">{n.title}</h4>
                                                        <p className="text-xs text-slate-500 mt-2 leading-relaxed">{n.message}</p>
                                                    </div>
                                                </div>
                                                {/* Delete Button */}
                                                <button 
                                                    onClick={(e) => handleDeleteNotification(e, n._id)}
                                                    className="absolute top-6 right-6 p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0"
                                                    title="Remove Notification"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center p-10 text-center opacity-30">
                                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                            <Bell size={40} className="text-slate-300" />
                                        </div>
                                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">System is Quiet</p>
                                        <p className="text-[10px] text-slate-400 mt-2">No new broadcasts at this time.</p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            {notifications.length > 0 && (
                                <div className="p-4 border-t border-gray-50 bg-slate-50">
                                    <button 
                                        onClick={() => setIsNotifOpen(false)}
                                        className="w-full py-3 bg-gray-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-yellow-500 hover:text-gray-900 transition-all duration-300 shadow-lg shadow-gray-200"
                                    >
                                        Dismiss All
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <RefreshCw size={22} className="cursor-pointer hover:text-yellow-500" />
                    <div className="relative group flex items-center gap-4">
                        {userInfo && userInfo.isAdmin && (
                            <Link to="/admin/dashboard" className="hidden lg:flex items-center gap-2 bg-gray-800 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-yellow-500 transition-colors shadow-lg">
                                <LayoutDashboard size={14} /> Dashboard
                            </Link>
                        )}
                        <Link to="/profile">
                            <User size={22} className="cursor-pointer hover:text-yellow-500" />
                        </Link>
                    </div>
                    <Link to="/cart" className="flex items-center gap-2 group">
                        <div className="relative">
                            <ShoppingBag size={24} className="group-hover:text-yellow-500" />
                            <span className="absolute -top-1 -right-2 bg-yellow-400 text-gray-900 text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                                {cartItems.reduce((a, c) => a + c.qty, 0)}
                            </span>
                        </div>
                        <span className="font-bold text-sm text-gray-800 hidden lg:block">
                            ৳{cartItems.reduce((a, c) => a + c.price * c.qty, 0).toLocaleString()}
                        </span>
                    </Link>
                </div>
            </div>

            {/* TIER 3: NAV BAR */}
            <div className="border-t border-gray-100 hidden md:block">
                <div className="max-w-7xl mx-auto px-4 flex items-center h-12">
                    <div className="relative w-64 h-full" onMouseEnter={() => setIsDeptOpen(true)} onMouseLeave={() => setIsDeptOpen(false)}>
                        <button className="bg-yellow-400 w-full h-full flex items-center gap-3 px-5 font-bold text-sm text-gray-800 rounded-t-md">
                            <Menu size={18} /> All Departments
                        </button>
                        <div className={`absolute top-full left-0 w-full bg-white border border-gray-100 shadow-xl z-50 transition-all ${isDeptOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                            <ul className="py-2">
                                {departments.map(dept => (
                                    <li key={dept.id || dept.name}>
                                        <Link to={dept.id ? `/category/${dept.id}` : '#'} className="block px-5 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-yellow-600">
                                            {dept.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <nav className="flex-1 flex items-center gap-8 px-8 h-full">
                        <Link to="/" className="text-sm font-bold text-gray-700 hover:text-yellow-500">Products Inventory</Link>
                        <Link to="/" className="text-sm font-bold text-gray-700 hover:text-yellow-500">Featured Brands</Link>
                        <Link to="/?isTrending=true" className="text-sm font-bold text-gray-700 hover:text-yellow-500 transition-colors">Trending Styles</Link>
                        <Link to="/" className="text-sm font-bold text-gray-700 hover:text-yellow-500 transition-colors">Gift Cards</Link>
                    </nav>

                    <div className="text-sm font-bold text-gray-700">
                        Free Shipping on Orders <span className="text-red-500">৳50,000+</span>
                    </div>
                </div>
            </div>

            {/* MOBILE NAV */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[500] md:hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
                    <div className="absolute top-0 left-0 h-full w-80 bg-white shadow-2xl flex flex-col transform transition-transform duration-300">
                        {/* Mobile Menu Header */}
                        <div className="p-6 border-b border-gray-100 bg-yellow-400 flex justify-between items-center shrink-0">
                            <span className="text-xs font-black uppercase tracking-[0.3em] text-gray-900 italic">Navigation Manifest</span>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                                <CloseIcon size={20} className="text-gray-900" />
                            </button>
                        </div>

                        {/* User Account Section Mobile */}
                        <div className="px-6 py-8 border-b border-gray-50 bg-slate-50/50">
                            {userInfo ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center text-slate-900 font-black text-xl shadow-lg shadow-yellow-100">
                                            {userInfo.email.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Identified Operator</p>
                                            <p className="text-sm font-black text-slate-800 truncate mt-1">{userInfo.email}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Link 
                                            to="/profile" 
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-yellow-400 transition-all"
                                        >
                                            <User size={14} /> Profile
                                        </Link>
                                        <button 
                                            onClick={() => { setIsMobileMenuOpen(false); logoutHandler(); }}
                                            className="flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Protocol Authorization Required</p>
                                    <Link 
                                        to="/login" 
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="w-full h-12 bg-yellow-400 text-gray-900 rounded-xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center shadow-lg shadow-yellow-100 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    >
                                        Register or Sign in
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Departments List */}
                        <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Inventory Sections</p>
                            <ul className="space-y-2">
                                {departments.map(dept => (
                                    <li key={dept.id || dept.name}>
                                        <Link 
                                            onClick={() => setIsMobileMenuOpen(false)} 
                                            to={dept.id ? `/category/${dept.id}` : '#'} 
                                            className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-yellow-50 hover:text-yellow-600 transition-all text-xs font-bold text-gray-600"
                                        >
                                            {dept.name}
                                            <ChevronRight size={14} className="opacity-30" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Mobile Navigation Footer */}
                        <div className="p-6 border-t border-gray-50 bg-slate-50 flex flex-col gap-3">
                            <Link to="/orders" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-yellow-500 transition-colors">
                                <Truck size={14} /> Track Order Protocol
                            </Link>
                            <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-yellow-500 transition-colors">
                                <Heart size={14} /> Wishlist Archive
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;