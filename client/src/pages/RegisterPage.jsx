import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, googleLogin } from '../slices/authSlice';
import { toast } from 'react-toastify';
import { Loader, User, Lock, Mail, ChevronRight, UserPlus } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { userInfo, loading, error } = useSelector((state) => state.auth);

    const { search } = useLocation();
    const sp = new URLSearchParams(search);
    const redirect = sp.get('redirect') || '/';

    useEffect(() => {
        if (userInfo) {
            navigate(redirect);
        }
    }, [navigate, redirect, userInfo]);

    const submitHandler = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        try {
            await dispatch(register({ name, email, password })).unwrap();
            toast.success('Account created successfully!');
        } catch (err) {
            toast.error(err.message || 'Registration failed');
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        const decoded = jwtDecode(credentialResponse.credential);
        try {
            await dispatch(googleLogin({
                name: decoded.name,
                email: decoded.email,
                googleId: decoded.sub,
                image: decoded.picture
            })).unwrap();
            toast.success('Successfully registered via Google.');
        } catch (err) {
            toast.error(err.message || 'Google signup failed');
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-20 font-sans">
            {/* Breadcrumb - Restored Original Style */}
            <div className="bg-white border-b border-gray-200 mb-12">
                <div className="container-custom py-4 flex items-center gap-2 text-sm text-gray-500">
                    <Link to="/" className="hover:text-yellow-500">Home</Link>
                    <ChevronRight size={14} />
                    <span className="text-gray-800 font-bold">Register</span>
                </div>
            </div>

            <div className="container-custom">
                <div className="max-w-md mx-auto">
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50">
                            <h1 className="text-xl font-bold text-gray-800 uppercase tracking-tight flex items-center gap-2">
                                <UserPlus size={20} className="text-yellow-500" /> Create Account
                            </h1>
                        </div>
                        <div className="p-8">
                            <form onSubmit={submitHandler} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Full Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                            <User size={16} />
                                        </div>
                                        <input
                                            type="text"
                                            className="w-full bg-white border border-gray-200 p-3 pl-10 rounded-lg outline-none focus:border-yellow-400 text-sm font-semibold transition-all shadow-sm placeholder:text-gray-300"
                                            placeholder="John Doe"
                                            value={name}
                                            required
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Email Coordinates</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                            <Mail size={16} />
                                        </div>
                                        <input
                                            type="email"
                                            className="w-full bg-white border border-gray-200 p-3 pl-10 rounded-lg outline-none focus:border-yellow-400 text-sm font-semibold transition-all shadow-sm placeholder:text-gray-300"
                                            placeholder="name@example.com"
                                            value={email}
                                            required
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Access Credentials</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                            <Lock size={16} />
                                        </div>
                                        <input
                                            type="password"
                                            className="w-full bg-white border border-gray-200 p-3 pl-10 rounded-lg outline-none focus:border-yellow-400 text-sm font-semibold transition-all shadow-sm placeholder:text-gray-300"
                                            placeholder="••••••••"
                                            value={password}
                                            required
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Confirm Authorization</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                            <Lock size={16} />
                                        </div>
                                        <input
                                            type="password"
                                            className="w-full bg-white border border-gray-200 p-3 pl-10 rounded-lg outline-none focus:border-yellow-400 text-sm font-semibold transition-all shadow-sm placeholder:text-gray-300"
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            required
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-slate-900 text-white w-full h-12 uppercase font-black text-xs tracking-widest flex items-center justify-center gap-3 disabled:opacity-50 hover:bg-yellow-500 hover:text-slate-900 transition-all shadow-xl shadow-slate-100 mt-4 rounded-lg"
                                >
                                    {loading ? <Loader size={20} className="animate-spin" /> : 'Register Now'}
                                </button>
                            </form>

                            <div className="mt-8">
                                <div className="relative flex items-center justify-center mb-8">
                                    <div className="border-t border-gray-100 absolute w-full" />
                                    <span className="bg-white px-4 text-[11px] font-bold text-gray-400 uppercase relative z-10">Instant Cloud Access</span>
                                </div>
                                
                                <div className="flex justify-center">
                                    <GoogleLogin 
                                        onSuccess={handleGoogleSuccess}
                                        onError={() => toast.error('Cloud Access Denied')}
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
                        <p className="text-sm text-gray-500 mb-2 font-medium uppercase tracking-wide">Already an Associate?</p>
                        <Link 
                            to={redirect ? `/login?redirect=${redirect}` : '/login'} 
                            className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                        >
                            Return To Log In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
