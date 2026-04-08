import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../slices/authSlice';
import { listCategories } from '../slices/categorySlice';
import api from '../utils/axiosConfig';
import {
    ShoppingBag, Search, Menu, User, MapPin,
    Truck, RefreshCw, Heart, ChevronDown, LayoutDashboard
} from 'lucide-react';
import { toast } from 'react-toastify';
import { BASE_URL } from '../utils/axiosConfig';

const Header = () => {
    const [keyword, setKeyword] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isDeptOpen, setIsDeptOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { cartItems } = useSelector((state) => state.cart);
    const { userInfo } = useSelector((state) => state.auth);
    const { categories } = useSelector((state) => state.category);

    useEffect(() => {
        dispatch(listCategories());
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
                    <div className=" h-16 w-16 rounded-full flex items-center justify-center shadow-md">
                        <img src="logo.png" alt="Logo" className="h-12 w-12 object-contain mix-blend-multiply" />
                    </div>
                </Link>

                {/* Mobile Icons */}
                <div className="flex items-center gap-3 md:hidden">
                    <Link to="/cart" className="relative text-gray-800">
                        <ShoppingBag size={24} />
                        {cartItems.length > 0 && (
                            <span className="absolute -top-1 -right-2 bg-yellow-400 text-gray-900 text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                {cartItems.reduce((a, c) => a + c.qty, 0)}
                            </span>
                        )}
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
                <div className="fixed inset-0 z-[100] md:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
                    <div className="absolute top-0 left-0 h-full w-72 bg-white shadow-2xl">
                        <div className="p-5 border-b border-gray-100 bg-yellow-400 flex justify-between items-center font-bold text-sm">MENU <button onClick={() => setIsMobileMenuOpen(false)}>X</button></div>
                        <ul className="p-4 space-y-4">
                            {departments.slice(0, 8).map(dept => (
                                <li key={dept.id}><Link onClick={() => setIsMobileMenuOpen(false)} to="/" className="text-sm font-medium block">{dept.name}</Link></li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;