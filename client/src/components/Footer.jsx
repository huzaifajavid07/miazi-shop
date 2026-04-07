import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Headphones, CreditCard, PhoneCall } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-[#333e48] text-gray-300 pt-12 pb-0 mt-16">
            <div className="container-custom">
                {/* Newsletter */}
                <div className="bg-[#fed700] rounded-xl p-6 md:p-8 mb-10 flex flex-col md:flex-row items-center justify-between gap-4 -mt-20 shadow-lg">
                    <div className="flex items-center gap-4">
                        <Mail size={36} className="text-[#333e48]" />
                        <div>
                            <h3 className="text-lg font-bold text-[#333e48]">Sign up to Newsletter</h3>
                            <p className="text-[#333e48] text-sm">...and receive ৳500 coupon for first shopping.</p>
                        </div>
                    </div>
                    <div className="w-full md:w-1/2 flex rounded-full overflow-hidden shadow-inner">
                        <input type="email" placeholder="Enter your email address" className="w-full px-5 py-3 outline-none text-sm text-gray-700" />
                        <button className="bg-[#333e48] text-white px-6 py-3 font-bold text-sm hover:bg-black transition whitespace-nowrap">Sign Up</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
                    <div>
                        <Link to="/">
                            <img src="/logo.png" alt="MIAZI SHOP" className="h-12 object-contain mb-4 brightness-200" />
                        </Link>
                        <div className="flex items-center gap-3 mb-4">
                            <PhoneCall size={28} className="text-[#fed700]" />
                            <div>
                                <p className="text-xs text-gray-400">Got Questions? Call us 24/7!</p>
                                <p className="text-white font-bold text-lg">+880 1612-893871</p>
                            </div>
                        </div>
                        <div className="text-sm text-gray-400">
                            <p className="font-bold text-white mb-1">Contact Info</p>
                            <p>Dhaka, Bangladesh</p>
                            <p>saad489254@gmail.com</p>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Find It Fast</h4>
                        <ul className="flex flex-col gap-2 text-sm text-gray-400">
                            <li><Link to="/" className="hover:text-[#fed700] transition">Laptops & Computers</Link></li>
                            <li><Link to="/" className="hover:text-[#fed700] transition">Cameras & Photography</Link></li>
                            <li><Link to="/" className="hover:text-[#fed700] transition">Smart Phones & Tablets</Link></li>
                            <li><Link to="/" className="hover:text-[#fed700] transition">Video Games & Consoles</Link></li>
                            <li><Link to="/" className="hover:text-[#fed700] transition">TV & Audio</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Customer Care</h4>
                        <ul className="flex flex-col gap-2 text-sm text-gray-400">
                            <li><Link to="/login" className="hover:text-[#fed700] transition">My Account</Link></li>
                            <li><Link to="/myorders" className="hover:text-[#fed700] transition">Order History</Link></li>
                            <li><Link to="/cart" className="hover:text-[#fed700] transition">Shopping Cart</Link></li>
                            <li><Link to="/" className="hover:text-[#fed700] transition">Returns & Refunds</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">About Us</h4>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            MIAZI SHOP is your trusted online electronics store in Bangladesh. We provide genuine products with warranty and fast delivery across the country.
                        </p>
                    </div>
                </div>
            </div>
            <div className="bg-[#2a3038] py-4">
                <div className="container-custom flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-2">
                    <p>&copy; 2026 MIAZI SHOP. All Rights Reserved.</p>
                    <div className="flex gap-3 items-center text-gray-400">
                        <CreditCard size={20} /> <span>Secure Payment</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
