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
import { ProductSkeleton } from '../components/Skeleton';

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
  const [activeDealCategory, setActiveDealCategory] = useState('Best Deals');

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
      img: "/slider-phone.png",
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
  // Use this instead of the hardcoded array to ensure names always match
  const bestDealCategories = ['Best Deals', ...categories.map(c => c.name)];
  const formatTime = (num) => num.toString().padStart(2, '0');
  // Find the product to link to (searching for "controller" in your products array)
  const specialOfferProduct = products?.find(p =>
    p.name.toLowerCase().includes('controller')
  ) || products?.[0];

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* HERO SECTION WITH SLIDER */}
      {!keyword && !category && (
        <section className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Hero Slider */}
            <div className={`flex-1 rounded-3xl overflow-hidden relative min-h-[520px] md:min-h-[460px] transition-colors duration-1000 ${slides[currentSlide].bg}`}>
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
                      <button onClick={() => document.getElementById('shop-section')?.scrollIntoView({ behavior: 'smooth' })} className="bg-yellow-400 text-gray-800 font-bold px-10 py-4 rounded-full hover:bg-gray-800 hover:text-white transition-all shadow-xl shadow-yellow-100">
                        Discover Now
                      </button>
                    </div>
                    <div className="flex-1 flex justify-center py-4 md:py-8 relative group w-full">
                      <img
                        src={slide.img}
                        alt={slide.highlight}
                        className="max-w-full h-[220px] md:h-[320px] object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700 animate-in zoom-in-95 duration-700 pointer-events-none"
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
                {/* Header */}
                <div className="bg-yellow-400 px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-800 uppercase">Special</p>
                    <p className="text-lg font-bold text-gray-800">Offer</p>
                  </div>
                  <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    Save<br />৳2,000
                  </div>
                </div>

                <div className="p-4 text-center">
                  {/* 1. Simple Image Tag (Not Clickable) */}
                  {/* 1. Simple Image Tag */}
                  {/* Added an onError handler to show a placeholder if the file is missing */}
                  <div className="relative mb-4 h-48 flex items-center justify-center bg-gray-50 rounded-lg">
                    <img
                      src="https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=300&q=80"
                      alt="Special Offer"
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/400x400?text=Gamepad+Missing';
                        e.target.onerror = null;
                      }}
                    />
                  </div>

                  {/* 2. Clickable Product Name */}
                  <Link to={specialOfferProduct ? `/product/${specialOfferProduct.slug}` : '#'}>
                    <h3 className="text-sm text-slate-800 font-bold mb-1 hover:text-yellow-600 transition-colors uppercase line-clamp-2 min-h-[2.5rem]">
                      {specialOfferProduct?.name || "Game Console Controller"}
                    </h3>
                  </Link>

                  {/* Pricing */}
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <span className="text-gray-400 line-through text-sm">
                      ৳{specialOfferProduct ? (specialOfferProduct.price + 2000).toLocaleString() : '9,900'}
                    </span>
                    <span className="text-red-600 font-bold text-xl">
                      ৳{specialOfferProduct?.price?.toLocaleString() || '7,900'}
                    </span>
                  </div>

                  {/* Timer Section */}
                  <div className="flex justify-center gap-2 pb-2">
                    {[
                      { val: formatTime(timeLeft.hours), label: 'HOURS' },
                      { val: formatTime(timeLeft.minutes), label: 'MINS' },
                      { val: formatTime(timeLeft.seconds), label: 'SECS' }
                    ].map((item, idx) => (
                      <div key={idx} className="text-center">
                        <div className="w-12 h-10 bg-gray-100 rounded flex items-center justify-center font-bold text-gray-800 mb-1">
                          {item.val}
                        </div>
                        <span className="text-[10px] text-gray-500 font-bold uppercase">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* RIGHT CONTENT - Product Tabs */}
          {/* RIGHT CONTENT - Product Tabs */}
          <div className="flex-1">
            <div className="flex items-center justify-between border-b-2 border-gray-200 mb-6 overflow-x-auto">
              <div className="flex gap-4 md:gap-8 min-w-max">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 text-sm font-bold transition-colors relative ${activeTab === tab ? 'text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    {tab}
                    {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400" />}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
              </div>
            ) : (() => {
              let filtered = [...products];

              // DYNAMIC FILTERING LOGIC
              if (activeTab === 'On Sale') {
                filtered = filtered.filter(p => p.discountPrice > 0 || p.countInStock > 10).sort((a, b) => b.countInStock - a.countInStock);
              } else if (activeTab === 'Top Rated') {
                // Sorts by rating (highest first) and filters out products with 0 reviews if you want
                filtered = filtered.filter(p => p.rating > 0).sort((a, b) => b.rating - a.rating);
              } else {
                // Featured: Sorted by number of reviews or a specific 'isFeatured' flag
                filtered = filtered.sort((a, b) => b.numReviews - a.numReviews);
              }

              const display = filtered.slice(0, 8);

              if (products.length === 0) {
                return (
                  <div className="col-span-full text-center py-20">
                    <Search size={48} className="mx-auto text-gray-200 mb-4" />
                    <h3 className="text-lg font-bold text-gray-600 mb-2">No Products Found</h3>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {display.map((p) => (
                    <div key={p._id} className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg hover:border-yellow-400 transition-all duration-300">
                      <div className="relative bg-gray-50 p-4 aspect-square">

                        {/* --- DYNAMIC BADGE OVERLAYS --- */}
                        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1.5">

                          {/* TOP RATED: Dynamic based on p.rating */}
                          {activeTab === 'Top Rated' && (
                            <div className="flex flex-col gap-1">
                              <span className="bg-gradient-to-r from-gray-900 to-gray-700 text-yellow-400 text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg border border-yellow-400/30 flex items-center gap-1 animate-in fade-in zoom-in duration-300">
                                <Star size={10} fill="#facc15" stroke="none" />
                                {p.rating > 0 ? p.rating.toFixed(1) : '5.0'}
                              </span>
                              <span className="text-[9px] font-bold text-gray-500 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full self-start shadow-sm border border-gray-100">
                                {p.numReviews} Reviews
                              </span>
                            </div>
                          )}

                          {/* ON SALE */}
                          {activeTab === 'On Sale' && (
                            <span className="bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md uppercase tracking-tighter animate-in slide-in-from-left-2 duration-300">
                              Hot Deal
                            </span>
                          )}

                          {/* FEATURED */}
                          {activeTab === 'Featured' && (
                            <span className="bg-yellow-400 text-gray-900 text-[10px] font-black px-2.5 py-1 rounded shadow-sm uppercase italic tracking-widest border-b-2 border-yellow-600">
                              Featured
                            </span>
                          )}
                        </div>

                        <img
                          src={p.images?.[0] ? (p.images[0].startsWith('http') ? p.images[0] : `${BASE_URL}${p.images[0]}`) : 'https://placehold.co/300x300'}
                          alt={p.name}
                          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                        />

                        <button
                          onClick={(e) => { e.preventDefault(); addToCartHandler(p); }}
                          className="absolute bottom-2 right-2 w-9 h-9 bg-yellow-400 rounded-full shadow-lg flex items-center justify-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all hover:bg-gray-800 hover:text-white"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="p-3">
                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-1 tracking-tight">
                          {p.category?.name || 'Electronics'}
                        </p>

                        <Link to={`/product/${p.slug}`}>
                          <h3 className="text-sm font-semibold text-slate-800 hover:text-yellow-600 line-clamp-2 mb-2 min-h-[2.5rem] transition-colors leading-tight">
                            {p.name}
                          </h3>
                        </Link>

                        <div className="flex items-center justify-between">
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-black text-gray-900">
                              ৳{p.price?.toLocaleString()}
                            </span>
                          </div>

                          {/* Visual Stars for Top Rated tab in the info section */}
                          {activeTab === 'Top Rated' && (
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={10}
                                  fill={i < Math.round(p.rating) ? "#facc15" : "#e2e8f0"}
                                  stroke="none"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      </section>

      {/* BEST DEALS SECTION */}
      {/* BEST DEALS SECTION */}
      {!keyword && !category && (
        <section className="max-w-7xl mx-auto px-4 py-8 border-t border-gray-200">
          <div className="flex items-center gap-6 mb-6 overflow-x-auto pb-2">
            <div className="flex gap-6 min-w-max">
              {bestDealCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveDealCategory(cat)}
                  className={`text-sm font-bold whitespace-nowrap pb-2 border-b-2 transition-colors ${activeDealCategory === cat
                      ? 'text-gray-800 border-yellow-400'
                      : 'text-gray-400 border-transparent hover:text-gray-600'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 pb-25">
            {products
              ?.filter((p) => {
                const productCatName = p.category?.name?.toLowerCase() || "";
                const activeLabel = activeDealCategory.toLowerCase();

                // 1. Default Deal logic
                if (activeLabel === 'best deals') {
                  return p.isDeals || p.discountPrice > 0 || p.rating >= 4;
                }

                // 2. Fuzzy matching (Handles "Audio" matching "Portable Audio" etc.)
                return productCatName.includes(activeLabel) || activeLabel.includes(productCatName);
              })
              .slice(0, 12)
              .map((p) => (
                <div key={p._id} className="group">
                  <div className="bg-gray-50 rounded-lg p-3 mb-2 aspect-square overflow-hidden relative">
                    <img
                      src={p.images?.[0] ? (p.images[0].startsWith('http') ? p.images[0] : `${BASE_URL}${p.images[0]}`) : 'https://placehold.co/200x200'}
                      alt={p.name}
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
                    />
                    <button
                      onClick={() => addToCartHandler(p)}
                      className="absolute bottom-2 right-2 w-7 h-7 bg-yellow-400 rounded-full shadow flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <Link to={`/product/${p.slug}`}>
                    <h4 className="text-xs font-medium text-slate-800 hover:text-yellow-600 line-clamp-2 mb-1 transition-colors">{p.name}</h4>
                  </Link>
                  <p className="text-sm font-bold text-gray-800">৳{p.price?.toLocaleString()}</p>
                </div>
              ))}
          </div>

          {/* DEBUG TOOL: Only shows if no products are found */}
          {products?.filter(p => {
            const productCatName = p.category?.name?.toLowerCase() || "";
            const activeLabel = activeDealCategory.toLowerCase();
            if (activeLabel === 'best deals') return true;
            return productCatName.includes(activeLabel) || activeLabel.includes(productCatName);
          }).length === 0 && (
              <div className="text-center py-10 bg-gray-50 rounded-xl mt-4">
                <p className="text-gray-500 text-sm mb-2">No products found for "{activeDealCategory}"</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                  Hint: Check if your database category names match the labels exactly.
                </p>
              </div>
            )}
        </section>
      )}
    </div>
  );
};

export default HomePage;