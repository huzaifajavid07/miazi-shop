import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, register } from '../slices/authSlice';
import { Loader } from 'lucide-react';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { search } = useLocation();
    const redirect = new URLSearchParams(search).get('redirect') || '/';

    const { userInfo, loading, error } = useSelector((state) => state.auth);

    useEffect(() => {
        if (userInfo) {
            navigate(redirect);
        }
    }, [navigate, userInfo, redirect]);

    const submitHandler = (e) => {
        e.preventDefault();
        if (isRegistering) {
            dispatch(register({ name, email, password }));
        } else {
            dispatch(login({ email, password }));
        }
    };

    return (
        <div className="container-custom py-12 max-w-md mx-auto">
            <h1 className="text-2xl font-extrabold mb-6 text-center">{isRegistering ? 'Create Account' : 'Sign In'}</h1>
            <form onSubmit={submitHandler} className="bg-white p-6 rounded-xl border flex flex-col gap-4">
                {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm font-semibold">{error}</div>}
                
                {isRegistering && (
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                        <input type="text" required placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)}
                            className="w-full border p-3 rounded-lg outline-none focus:border-[#fed700] transition" />
                    </div>
                )}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                    <input type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                        className="w-full border p-3 rounded-lg outline-none focus:border-[#fed700] transition" />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                    <input type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
                        className="w-full border p-3 rounded-lg outline-none focus:border-[#fed700] transition" />
                </div>
                <button disabled={loading} type="submit"
                    className="w-full bg-[#fed700] text-[#333e48] font-extrabold py-3 rounded-full mt-2 hover:bg-yellow-500 transition shadow disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading && <Loader size={18} className="animate-spin" />}
                    {loading ? 'Please wait...' : (isRegistering ? 'Create Account' : 'Sign In')}
                </button>
                <div className="text-center mt-2 text-sm text-gray-600">
                    {isRegistering ? 'Already have an account? ' : 'New here? '}
                    <button type="button" onClick={() => { setIsRegistering(!isRegistering); }}
                        className="text-blue-600 font-bold hover:underline">
                        {isRegistering ? 'Sign In' : 'Create Account'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default LoginPage;
