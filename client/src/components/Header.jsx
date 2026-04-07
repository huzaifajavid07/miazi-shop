import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingBag, Heart, Search, Menu, User, PhoneCall, ChevronDown, X } from 'lucide-react';
import { logout } from '../slices/authSlice';

const Header = () => {
    const { cartItems } = useSelector((state) => state.cart);
    const { userInfo } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [keyword, setKeyword] = useState('');
    const [mobileMenu, setMobileMenu] = useState(false);
    const [userDropdown, setUserDropdown] = useState(false);

    const logoutHandler = () => {
        dispatch(logout());
        setUserDropdown(false);
        navigate('/');
    };

    const searchHandler = (e) => {
        e.preventDefault();
        if (keyword.trim()) {
            navigate(`/?keyword=${keyword}`);
        } else {
            navigate('/');
        }
    };

    const cartQty = cartItems.reduce((a, c) => a + c.qty, 0);
    const cartTotal = cartItems.reduce((a, c) => a + c.qty * c.price, 0).toFixed(2);

    return (
        <header className="w-full font-sans bg-white sticky top-0 z-50 shadow-sm">
            {/* Top Bar */}
            <div className="bg-[#333e48] text-xs text-gray-300 hidden md:block">
                <div className="container-custom flex justify-between items-center h-9">
                    <div>Welcome to MIAZI SHOP — Your One-Stop Electronics Store</div>
                    <div className="flex gap-4 items-center">
                        <span className="flex items-center gap-1">
                            <PhoneCall size={12} /> +880 1612-893871
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <div className="py-4 border-b bg-white">
                <div className="container-custom flex items-center justify-between gap-6">
                    {/* Logo */}
                    <Link to="/" className="flex items-center min-w-[160px] shrink-0">
                        <img src="/logo.png" alt="MIAZI SHOP" className="h-[50px] object-contain" />
                    </Link>

                    {/* Search Bar */}
                    <form onSubmit={searchHandler} className="hidden md:flex flex-grow max-w-2xl items-center border-2 border-[#fed700] rounded-full overflow-hidden bg-white h-11">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            className="w-full px-5 py-2 outline-none text-gray-700 text-sm"
                        />
                        <button type="submit" className="bg-[#fed700] text-[#333e48] px-6 h-full flex justify-center items-center font-bold hover:bg-yellow-500 transition">
                            <Search size={18} />
                        </button>
                    </form>

                    {/* Right Icons */}
                    <div className="flex items-center gap-5">
                        {/* User Account */}
                        <div className="relative">
                            {userInfo ? (
                                <>
                                    <button onClick={() => setUserDropdown(!userDropdown)} className="flex items-center gap-2 text-[#333e48] hover:text-[#fed700] transition">
                                        <User size={22} />
                                        <span className="hidden lg:block text-sm font-semibold">{userInfo.name.split(' ')[0]}</span>
                                        <ChevronDown size={14} />
                                    </button>
                                    {userDropdown && (
                                        <div className="absolute right-0 top-10 bg-white border rounded-lg shadow-xl w-48 py-2 z-50">
                                            <Link to="/profile" onClick={() => setUserDropdown(false)} className="block px-4 py-2 text-sm hover:bg-gray-50 transition">My Profile</Link>
                                            <Link to="/myorders" onClick={() => setUserDropdown(false)} className="block px-4 py-2 text-sm hover:bg-gray-50 transition">My Orders</Link>
                                            {userInfo.isAdmin && (
                                                <Link to="/admin/dashboard" onClick={() => setUserDropdown(false)} className="block px-4 py-2 text-sm hover:bg-gray-50 transition font-bold text-blue-600">Admin Panel</Link>
                                            )}
                                            <hr className="my-1" />
                                            <button onClick={logoutHandler} className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition">Logout</button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <Link to="/login" className="flex items-center gap-2 text-[#333e48] hover:text-[#fed700] transition">
                                    <User size={22} />
                                    <span className="hidden lg:block text-sm font-semibold">Login</span>
                                </Link>
                            )}
                        </div>

                        {/* Cart */}
                        <Link to="/cart" className="flex items-center gap-2">
                            <div className="relative text-[#333e48] hover:text-[#fed700] transition">
                                <ShoppingBag size={24} />
                                {cartQty > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-[#fed700] text-[#333e48] text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">{cartQty}</span>
                                )}
                            </div>
                            <span className="hidden lg:block text-sm font-bold text-[#333e48]">৳{cartTotal}</span>
                        </Link>

                        {/* Mobile menu toggle */}
                        <button className="md:hidden text-[#333e48]" onClick={() => setMobileMenu(!mobileMenu)}>
                            {mobileMenu ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="bg-[#fed700] hidden md:block">
                <div className="container-custom flex items-center h-12 text-[#333e48] font-semibold text-sm gap-8">
                    <Link to="/" className="hover:text-white transition">Home</Link>
                    <Link to="/?keyword=" className="hover:text-white transition">All Products</Link>
                    <Link to="/cart" className="hover:text-white transition">Cart</Link>
                    {userInfo && <Link to="/myorders" className="hover:text-white transition">My Orders</Link>}
                    {userInfo?.isAdmin && <Link to="/admin/dashboard" className="hover:text-white transition font-bold">Admin Panel</Link>}
                    <div className="ml-auto text-xs font-bold">Free Shipping on Orders ৳5000+</div>
                </div>
            </nav>

            {/* Mobile Menu */}
            {mobileMenu && (
                <div className="md:hidden bg-white border-t shadow-lg p-4 flex flex-col gap-3">
                    <form onSubmit={(e) => { searchHandler(e); setMobileMenu(false); }} className="flex border rounded-full overflow-hidden">
                        <input type="text" placeholder="Search..." value={keyword} onChange={(e) => setKeyword(e.target.value)} className="w-full px-4 py-2 outline-none text-sm" />
                        <button type="submit" className="bg-[#fed700] px-4"><Search size={16} /></button>
                    </form>
                    <Link to="/" onClick={() => setMobileMenu(false)} className="py-2 font-semibold">Home</Link>
                    <Link to="/cart" onClick={() => setMobileMenu(false)} className="py-2 font-semibold">Cart ({cartQty})</Link>
                    {userInfo ? (
                        <>
                            <Link to="/myorders" onClick={() => setMobileMenu(false)} className="py-2 font-semibold">My Orders</Link>
                            {userInfo.isAdmin && <Link to="/admin/dashboard" onClick={() => setMobileMenu(false)} className="py-2 font-bold text-blue-600">Admin Panel</Link>}
                            <button onClick={() => { logoutHandler(); setMobileMenu(false); }} className="py-2 text-red-500 font-semibold text-left">Logout</button>
                        </>
                    ) : (
                        <Link to="/login" onClick={() => setMobileMenu(false)} className="py-2 font-semibold">Login / Register</Link>
                    )}
                </div>
            )}
        </header>
    );
};

export default Header;
