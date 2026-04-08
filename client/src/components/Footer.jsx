import React from 'react';
import { Link } from 'react-router-dom';
import { 
    FiSend, 
    FiHeadphones, 
    FiFacebook, 
    FiTwitter, 
    FiGithub, 
    FiChevronUp 
} from 'react-icons/fi';
import { FaGoogle, FaCcVisa, FaCcMastercard, FaCcDiscover, FaCcStripe, FaCcPaypal } from 'react-icons/fa6';

const Footer = () => {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="w-full font-sans bg-[#f5f5f5] text-[#333e48]">
            {/* 1. YELLOW NEWSLETTER STRIP - RESTORED */}
            <div className="bg-[#fed700] py-4">
                <div className="max-w-[1200px] mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <FiSend size={28} className="opacity-60" />
                        <h3 className="text-xl font-medium text-[#333e48]">Sign up to Newsletter</h3>
                        <p className="hidden lg:block text-sm ml-6 text-[#333e48]">
                            ...and receive <span className="font-bold">$20 coupon for first shopping.</span>
                        </p>
                    </div>
                    
                    <div className="w-full max-w-md">
                        <form className="flex rounded-full overflow-hidden bg-white shadow-sm">
                            <input 
                                type="email" 
                                placeholder="Email address" 
                                className="w-full px-6 py-3 text-sm outline-none bg-transparent"
                                required
                            />
                            <button className="bg-[#333e48] text-white px-10 font-bold text-sm hover:bg-black transition-colors rounded-full m-1">
                                Sign Up
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* 2. MAIN FOOTER CONTENT - RESTORED ORIGINAL BRANDING */}
            <div className="max-w-[1200px] mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
                    
                    {/* Left Column: Logo & Contact */}
                    <div className="lg:col-span-4">
                        <Link to="/" className="inline-block mb-8 group">
                            <div className="flex items-baseline tracking-tighter leading-none">
                                <span className="text-5xl font-black text-orange-500">M</span>
                                <span className="text-4xl font-extrabold text-blue-700">iazi</span>
                                <span className="ml-1 w-3 h-3 bg-yellow-400 rounded-full"></span>
                            </div>
                        </Link>

                        <div className="flex items-center gap-4 mb-8">
                            <FiHeadphones size={45} className="text-[#fed700]" strokeWidth={1} />
                            <div>
                                <p className="text-sm text-gray-500">Got questions? Call us 24/7!</p>
                                <p className="text-xl md:text-2xl font-normal text-[#333e48]">
                                    (800) 8001-8588, (0600) 874 548
                                </p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h4 className="text-base font-bold text-[#333e48] mb-3">Contact info</h4>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                17 Princess Road, London, Greater London NW1 8JR, UK
                            </p>
                        </div>

                        <div className="flex gap-6 text-gray-500">
                            <a href="#" className="hover:text-[#fed700] transition-colors"><FiFacebook size={20} /></a>
                            <a href="#" className="hover:text-[#fed700] transition-colors"><FaGoogle size={18} /></a>
                            <a href="#" className="hover:text-[#fed700] transition-colors"><FiTwitter size={20} /></a>
                            <a href="#" className="hover:text-[#fed700] transition-colors"><FiGithub size={20} /></a>
                        </div>
                    </div>

                    {/* Middle Column: Find it Fast */}
                    <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <h4 className="text-lg font-bold text-[#333e48] mb-6">Find it Fast</h4>
                            <ul className="space-y-3 text-sm text-gray-600">
                                {['Laptops & Computers', 'Cameras & Photography', 'Smart Phones & Tablets', 'Video Games & Consoles', 'TV & Audio', 'Gadgets', 'Car Electronic & GPS'].map(item => (
                                    <li key={item}><Link to="/" className="hover:text-[#1e1c13]">{item}</Link></li>
                                ))}
                            </ul>
                        </div>
                        <div className="mt-12">
                            <ul className="space-y-3 text-sm text-gray-600">
                                {['Printers & Ink', 'Software', 'Office Supplies', 'Computer Components', 'Accessories'].map(item => (
                                    <li key={item}><Link to="/" className="hover:text-[#1e1c13]">{item}</Link></li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Right Column: Customer Care */}
                    <div className="lg:col-span-3">
                        <h4 className="text-lg font-bold text-[#333e48] mb-6">Customer Care</h4>
                        <ul className="space-y-3 text-sm text-gray-600">
                            {['My Account', 'Order Tracking', 'Wish List', 'Customer Service', 'Returns / Exchange', 'FAQs', 'Product Support'].map(item => (
                                <li key={item}><Link to="/" className="hover:text-[#1e1c13]">{item}</Link></li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* 3. BOTTOM COPYRIGHT BAR */}
            <div className="bg-[#ebebeb] py-6 relative">
                <div className="max-w-[1200px] mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-600">
                        &copy; <span className="font-bold text-[#333e48]">Miazi</span> - All rights Reserved
                    </p>
                    
                    <div className="flex gap-2 items-center">
                        <FaCcVisa size={32} className="text-gray-400 hover:text-[#1a1f71] cursor-pointer bg-white rounded p-1" />
                        <FaCcMastercard size={32} className="text-gray-400 hover:text-[#eb001b] cursor-pointer bg-white rounded p-1" />
                        <FaCcDiscover size={32} className="text-gray-400 hover:text-[#ff6000] cursor-pointer bg-white rounded p-1" />
                        <FaCcStripe size={32} className="text-gray-400 hover:text-[#6772e5] cursor-pointer bg-white rounded p-1" />
                        <FaCcPaypal size={32} className="text-gray-400 hover:text-[#003087] cursor-pointer bg-white rounded p-1" />
                    </div>
                </div>

                <button 
                    onClick={scrollToTop}
                    className="absolute right-6 -top-5 bg-[#fed700] p-3 shadow-lg hover:bg-[#333e48] hover:text-white transition-all rounded-sm group"
                >
                    <FiChevronUp size={24} />
                </button>
            </div>
        </footer>
    );
};

export default Footer;