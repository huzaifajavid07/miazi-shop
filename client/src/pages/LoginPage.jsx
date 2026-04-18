import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, googleLogin } from '../slices/authSlice';
import { toast } from 'react-toastify';
import { Loader, User, Lock, Mail, ChevronRight, LogIn, Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { userInfo, loading, error } = useSelector((state) => state.auth);

    const { search } = useLocation();
    const sp = new URLSearchParams(search);
    const redirect = sp.get('redirect') || '/';

    useEffect(() => {
        if (userInfo) {
            // Check if toast already exists to prevent double firing during redirect
            if (userInfo.isAdmin) {
                navigate('/admin/dashboard', { replace: true });
            } else {
                navigate(redirect, { replace: true });
            }
        }
    }, [navigate, redirect, userInfo]);

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            // Dismiss all existing toasts before firing a new one
            toast.dismiss(); 
            await dispatch(login({ email, password })).unwrap();
            toast.success('Successfully logged in.');
        } catch (err) {
            toast.error(err?.data?.message || err.message || 'Invalid credentials');
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        const decoded = jwtDecode(credentialResponse.credential);
        try {
            toast.dismiss(); 
            await dispatch(googleLogin({
                name: decoded.name,
                email: decoded.email,
                googleId: decoded.sub,
                image: decoded.picture
            })).unwrap();
            toast.success('Successfully logged in via Google.');
        } catch (err) {
            toast.error(err?.data?.message || err.message || 'Google Login failed');
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-20 font-sans">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200 mb-12">
                <div className="container-custom py-4 flex items-center gap-2 text-sm text-gray-500">
                    <Link to="/" className="hover:text-yellow-500">Home</Link>
                    <ChevronRight size={14} />
                    <span className="text-gray-800 font-bold">Sign In</span>
                </div>
            </div>

            <div className="container-custom">
                <div className="max-w-md mx-auto">
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50">
                            <h1 className="text-xl font-bold text-gray-800 uppercase tracking-tight flex items-center gap-2">
                                <LogIn size={20} className="text-yellow-500" /> Account Login
                            </h1>
                        </div>
                        
                        <div className="p-8">
                            {/* Display Redux Error if it exists and we aren't loading */}
                            {error && !loading && (
                                <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-[10px] font-bold uppercase">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={submitHandler} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                            <Mail size={16} />
                                        </div>
                                        <input
                                            type="email"
                                            className="w-full bg-white border border-gray-200 p-3 pl-10 rounded-lg outline-none focus:border-yellow-400 text-sm font-semibold transition-all"
                                            placeholder="name@example.com"
                                            value={email}
                                            required
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Password</label>
                                        <Link to="/forgot-password" size={10} className="text-[10px] text-blue-600 font-bold uppercase hover:underline">Forgot?</Link>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                            <Lock size={16} />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            className="w-full bg-white border border-gray-200 p-3 pl-10 pr-10 rounded-lg outline-none focus:border-yellow-400 text-sm font-semibold transition-all"
                                            placeholder="••••••••"
                                            value={password}
                                            required
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-slate-600 focus:outline-none"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-slate-900 text-white w-full h-12 uppercase font-black text-xs tracking-widest flex items-center justify-center gap-3 disabled:opacity-50 hover:bg-yellow-500 hover:text-slate-900 transition-all shadow-xl shadow-slate-100 mt-4 rounded-lg"
                                >
                                    {loading ? <Loader size={20} className="animate-spin" /> : 'Sign In Now'}
                                </button>
                            </form>

                            <div className="mt-8">
                                <div className="relative flex items-center justify-center mb-8">
                                    <div className="border-t border-gray-100 absolute w-full" />
                                    <span className="bg-white px-4 text-[11px] font-bold text-gray-400 uppercase relative z-10">Social Access</span>
                                </div>
                                
                                <div className="flex justify-center">
                                    <GoogleLogin 
                                        onSuccess={handleGoogleSuccess}
                                        onError={() => toast.error('Google Access Denied')}
                                        useOneTap
                                        theme="outline"
                                        shape="pill"
                                        width="350"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-8 text-center bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                        <p className="text-sm text-gray-500 mb-2 font-medium uppercase tracking-wide">New To Miazi Shop?</p>
                        <Link 
                            to={redirect ? `/register?redirect=${redirect}` : '/register'} 
                            className="text-xs font-black text-blue-600 uppercase hover:underline inline-block border-2 border-blue-600 px-8 py-2 rounded-full hover:bg-blue-600 hover:text-white transition-all"
                        >
                            Construct My Account
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;