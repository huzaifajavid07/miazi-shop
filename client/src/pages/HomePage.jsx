import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { listProducts } from '../slices/productSlice';
import { addToCart } from '../slices/cartSlice'; 
import { listCategories } from '../slices/categorySlice';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, Search, Menu, ChevronDown, MapPin, 
  Smartphone, Laptop, Headphones, Watch, Camera, 
  Cpu, Zap, Award, ShieldCheck, ChevronLeft, ChevronRight,
  User, Heart, Star, List, Clock, 
  Truck, Shield, Headphones as HeadphoneIcon, Eye, Plus, Tag, ArrowRight
} from 'lucide-react';
import { BASE_URL } from '../utils/axiosConfig';
import { toast } from 'react-toastify'; 

const HomePage = () => {
  const dispatch = useDispatch();
  const [currentSlide, setCurrentSlide] = useState(0);
  const { products, loading, error } = useSelector((state) => state.product);
  const { categories } = useSelector((state) => state.category);
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const keyword = query.get('keyword');
  const category = query.get('category');
  const isTrending = query.get('isTrending');
  const isDeals = query.get('isDeals');
  const [activeTab, setActiveTab] = useState('Featured');
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  const slides = [
    {
      subtitle: "The New Standard",
      title: "Under Favorable",
      highlight: "Smartwatches",
      price: "749",
      img: "/hero_watch.png",
      bg: "bg-white"
    },
    {
      subtitle: "Unmatched Performance",
      title: "Latest Gen",
      highlight: "Flagship Phones",
      price: "1,299",
      img: "/hero_phone.png",
      bg: "bg-white"
    },
    {
      subtitle: "Professional Grade",
      title: "Master Your",
      highlight: "Work Space",
      price: "2,499",
      img: "/slider-laptop.png",
      bg: "bg-white"
    }
  ];

  // Auto-play slider
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(slideTimer);
  }, [slides.length]);

  // Add to Cart Handler
  const addToCartHandler = (product) => {
    dispatch(addToCart({ ...product, qty: 1 }));
    toast.success(`${product.name} added to cart!`, {
      position: "bottom-right",
      autoClose: 2000,
    });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      const diff = endOfDay - now;
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    dispatch(listProducts({ 
      keyword: keyword || '', 
      category: category || '', 
      isTrending: isTrending || '', 
      isDeals: isDeals || '' 
    }));
    dispatch(listCategories());
  }, [dispatch, keyword, category, isTrending, isDeals, userInfo]);



  const tabs = ['Featured', 'On Sale', 'Top Rated'];
  const bestDealCategories = ['Best Deals', 'TV & Video', 'Cameras', 'Audio', 'Smartphones', 'GPS & Navi', 'Computers', 'Portable Audio', 'Accessories'];
  const formatTime = (num) => num.toString().padStart(2, '0');

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* HERO SECTION WITH SLIDER */}
      {!keyword && !category && (
        <section className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Hero Slider */}
            <div className={`flex-1 rounded-3xl overflow-hidden relative min-h-[460px] transition-colors duration-1000 ${slides[currentSlide].bg}`}>
              {/* Slides Container */}
              <div className="relative h-full flex items-center transition-all duration-700 ease-in-out">
                {slides.map((slide, idx) => (
                  <div key={idx} className={`absolute inset-0 flex flex-col md:flex-row items-center px-8 md:px-16 py-12 md:py-0 transition-all duration-1000 ${currentSlide === idx ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12 pointer-events-none'}`}>
                    <div className="flex-1 max-w-md text-center md:text-left z-10">
                      <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2 animate-in slide-in-from-bottom-2 duration-500">{slide.subtitle}</p>
                      <h2 className="text-3xl md:text-5xl font-light text-gray-800 mb-2 leading-tight">
                        {slide.title} <br />
                        <span className="font-bold text-gray-900 underline decoration-yellow-400 decoration-4 underline-offset-8">{slide.highlight}</span>
                      </h2>
                      <div className="flex items-baseline gap-2 mb-8 justify-center md:justify-start">
                        <p className="text-2xl font-black text-gray-800 uppercase tracking-tighter">FROM ৳{slide.price}<sup className="text-sm ml-0.5">.99</sup></p>
                      </div>
                      <button className="bg-yellow-400 text-gray-800 font-bold px-10 py-4 rounded-full hover:bg-gray-800 hover:text-white transition-all shadow-xl shadow-yellow-100">
                        Discovery Now
                      </button>
                    </div>
                    <div className="flex-1 flex justify-center py-8 relative group">
                      <img 
                        src={slide.img} 
                        alt={slide.highlight} 
                        className="max-w-full h-[320px] object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700 animate-in zoom-in-95 duration-700 pointer-events-none" 
                      />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-80 h-80 bg-slate-50 rounded-full blur-[120px] opacity-40"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Slider Controls */}
              <div className="absolute bottom-10 left-8 md:left-16 flex items-center gap-4 z-20">
                <div className="flex gap-2">
                  {slides.map((_, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-1.5 rounded-full transition-all duration-500 ${currentSlide === idx ? 'w-8 bg-slate-900' : 'w-2 bg-slate-400/30'}`}
                    />
                  ))}
                </div>
                <div className="flex gap-1 ml-4 border-l border-slate-300/30 pl-4">
                  <button onClick={() => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length)} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-900 transition-all border border-transparent hover:border-slate-100 shadow-sm"><ChevronLeft size={16} /></button>
                  <button onClick={() => setCurrentSlide(prev => (prev + 1) % slides.length)} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-900 transition-all border border-transparent hover:border-slate-100 shadow-sm"><ChevronRight size={16} /></button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CATEGORY BANNERS */}
      {!keyword && !category && categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.slice(0, 4).map((cat) => (
              <Link key={cat._id} to={`/category/${cat._id}`} className="group bg-white border border-gray-200 rounded-lg p-5 flex items-center gap-4 hover:border-yellow-400 hover:shadow-md transition-all">
                <div className="w-11 h-11 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-yellow-50 transition-colors">
                  <Tag size={18} className="text-gray-400 group-hover:text-yellow-500 transition-colors" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] md:text-sm font-black text-slate-800 line-clamp-2 leading-tight uppercase tracking-tight">{cat.name}</p>
                  <span className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1 mt-0.5 group-hover:text-yellow-600 transition-colors">
                    Shop now <ArrowRight size={10} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* MAIN CONTENT AREA */}
      <section id="shop-section" className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* LEFT SIDEBAR - Special Offer */}
          {!keyword && !category && (
            <aside className="w-full lg:w-72 flex-shrink-0">
              <div className="bg-white border-2 border-yellow-400 rounded-xl overflow-hidden shadow-lg">
                <div className="bg-yellow-400 px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-800 uppercase">Special</p>
                    <p className="text-lg font-bold text-gray-800">Offer</p>
                  </div>
                  <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    Save<br/>$120
                  </div>
                </div>

                <div className="p-4 text-center">
                  <div className="relative mb-4">
                    <img src="/gamepad.png" alt="Game Console" className="w-full h-48 object-contain" onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=300&q=80'} />
                  </div>
                  <p className="text-xs text-blue-600 font-medium mb-1">Game Console Controller</p>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <span className="text-gray-400 line-through text-sm">$99.00</span>
                    <span className="text-red-600 font-bold text-xl">$79.00</span>
                  </div>
                  <div className="flex justify-center gap-2 mb-4">
                    {[{ val: formatTime(timeLeft.hours), label: 'HOURS' }, { val: formatTime(timeLeft.minutes), label: 'MINS' }, { val: formatTime(timeLeft.seconds), label: 'SECS' }].map((item, idx) => (
                      <div key={idx} className="text-center">
                        <div className="w-12 h-10 bg-gray-100 rounded flex items-center justify-center font-bold text-gray-800 mb-1">{item.val}</div>
                        <span className="text-[10px] text-gray-500">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* RIGHT CONTENT - Product Tabs */}
          <div className="flex-1">
            <div className="flex items-center justify-between border-b-2 border-gray-200 mb-6 overflow-x-auto">
              <div className="flex gap-4 md:gap-8 min-w-max">
                {tabs.map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 text-sm font-bold transition-colors relative ${activeTab === tab ? 'text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}>
                    {tab}
                    {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400" />}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => <div key={i} className="bg-gray-100 rounded-lg h-64 animate-pulse" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.slice(0, 8).map((p) => (
                  <div key={p._id} className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg hover:border-yellow-400 transition-all duration-300">
                    <div className="relative bg-gray-50 p-4 aspect-square">
                      <img src={p.images?.[0] ? (p.images[0].startsWith('http') ? p.images[0] : `${BASE_URL}${p.images[0]}`) : 'https://placehold.co/300x300'} alt={p.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500" />
                      
                      {/* ADD TO CART BUTTON */}
                      <button 
                        onClick={() => addToCartHandler(p)}
                        className="absolute bottom-2 right-2 w-8 h-8 bg-yellow-400 rounded-full shadow flex items-center justify-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all hover:bg-gray-800 hover:text-white"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="p-3">
                      <p className="text-[10px] text-gray-400 uppercase mb-1">{p.category?.name || 'Electronics'}</p>
                      <Link to={`/product/${p.slug}`}>
                        <h3 className="text-sm font-medium text-blue-600 hover:underline line-clamp-2 mb-2 min-h-[2.5rem]">{p.name}</h3>
                      </Link>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-800">${p.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* BEST DEALS SECTION */}
      {!keyword && !category && (
        <section className="max-w-7xl mx-auto px-4 py-8 border-t border-gray-200">
          <div className="flex items-center gap-6 mb-6 overflow-x-auto pb-2">
            <div className="flex gap-6 min-w-max">
              {bestDealCategories.map((cat, idx) => (
                <button key={cat} className={`text-sm font-bold whitespace-nowrap pb-2 border-b-2 transition-colors ${idx === 0 ? 'text-gray-800 border-yellow-400' : 'text-gray-400 border-transparent hover:text-gray-600'}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {products?.slice(0, 6).map((p) => (
              <div key={p._id} className="group">
                <div className="bg-gray-50 rounded-lg p-3 mb-2 aspect-square overflow-hidden relative">
                  <img src={p.images?.[0] ? (p.images[0].startsWith('http') ? p.images[0] : `${BASE_URL}${p.images[0]}`) : 'https://placehold.co/200x200'} alt={p.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform" />
                  
                  {/* MINI ADD TO CART BUTTON */}
                  <button 
                    onClick={() => addToCartHandler(p)}
                    className="absolute bottom-2 right-2 w-7 h-7 bg-yellow-400 rounded-full shadow flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <Link to={`/product/${p.slug}`}>
                  <h4 className="text-xs font-medium text-blue-600 hover:underline line-clamp-2 mb-1">{p.name}</h4>
                </Link>
                <p className="text-sm font-bold text-gray-800">${p.price}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;