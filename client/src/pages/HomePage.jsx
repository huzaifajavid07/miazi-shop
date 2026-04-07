import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { listProducts } from '../slices/productSlice';
import { addToCart } from '../slices/cartSlice';
import { Link, useSearchParams } from 'react-router-dom';
import { ShoppingBag, Star, Loader } from 'lucide-react';
import { toast } from 'react-toastify';
import { BASE_URL } from '../utils/axiosConfig';

const HomePage = () => {
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const keyword = searchParams.get('keyword') || '';

    const { loading, error, products, pages, page } = useSelector((state) => state.product);

    useEffect(() => {
        dispatch(listProducts({ keyword }));
    }, [dispatch, keyword]);

    const handleAddToCart = (product) => {
        if (product.countInStock > 0) {
            dispatch(addToCart({ ...product, qty: 1 }));
            toast.success(`${product.name} added to cart!`);
        } else {
            toast.error('Out of stock!');
        }
    };

    return (
        <div className="font-sans text-[#333e48] min-h-screen">
            {/* Hero Banner */}
            {!keyword && (
                <div className="bg-gradient-to-r from-[#fed700] to-[#f5c800] py-12 lg:py-20 mb-8">
                    <div className="container-custom flex flex-col lg:flex-row items-center justify-between gap-8">
                        <div className="max-w-lg">
                            <p className="text-sm font-bold uppercase tracking-widest text-[#333e48] mb-2">MIAZI SHOP — Premium Electronics</p>
                            <h1 className="text-4xl lg:text-6xl font-black text-[#333e48] leading-tight mb-4">
                                Best Deals on <br />Electronics
                            </h1>
                            <p className="text-[#333e48] text-lg mb-6 opacity-80">
                                Shop the latest smartphones, laptops, cameras and more at unbeatable prices.
                            </p>
                            <Link to="/?keyword=" className="inline-block bg-[#333e48] text-white px-8 py-3 rounded-full font-bold hover:bg-black transition shadow-lg">
                                Shop Now
                            </Link>
                        </div>
                        <img 
                            src="https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=600&q=80" 
                            alt="Electronics" 
                            className="w-full max-w-md rounded-2xl shadow-2xl object-cover h-[300px]"
                        />
                    </div>
                </div>
            )}

            <div className="container-custom pb-16">
                {keyword && (
                    <div className="mb-6 flex items-center gap-4">
                        <h2 className="text-xl font-bold">Search results for: "{keyword}"</h2>
                        <Link to="/" className="text-sm text-blue-600 hover:underline">Clear Search</Link>
                    </div>
                )}

                <h2 className="text-2xl font-extrabold mb-6 border-b-2 border-[#fed700] pb-2 inline-block">
                    {keyword ? 'Results' : 'Featured Products'}
                </h2>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader size={40} className="animate-spin text-[#fed700]" />
                        <span className="ml-4 text-gray-500 font-semibold">Loading products...</span>
                    </div>
                ) : error ? (
                    <div className="text-center py-16 bg-red-50 rounded-xl border border-red-200">
                        <p className="text-red-500 font-bold text-lg mb-2">Failed to load products</p>
                        <p className="text-gray-500 text-sm">{error}</p>
                        <p className="text-gray-400 text-sm mt-4">Make sure the backend server is running on port 5000 and MongoDB is connected.</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-xl border">
                        <p className="text-gray-500 text-lg mb-2">No products found</p>
                        <p className="text-gray-400 text-sm">Products will appear here once added via the Admin Panel.</p>
                        {keyword && <Link to="/" className="text-blue-600 hover:underline mt-4 inline-block">Back to All Products</Link>}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                        {products.map((product) => (
                            <div key={product._id} className="bg-white border rounded-xl overflow-hidden group hover:shadow-lg transition-shadow duration-300">
                                {/* Product Image */}
                                <Link to={`/product/${product._id}`} className="block relative aspect-[4/3] bg-gray-50 overflow-hidden">
                                    <img 
                                        src={product.images?.[0]?.startsWith('http') ? product.images[0] : `${BASE_URL}${product.images?.[0]}` || 'https://via.placeholder.com/400x400?text=No+Image'}
                                        alt={product.name}
                                        className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                                    />
                                    {product.discountPrice > 0 && (
                                        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                            {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                                        </span>
                                    )}
                                    {product.countInStock === 0 && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <span className="bg-white text-red-500 font-bold px-4 py-2 rounded-full text-sm">Out of Stock</span>
                                        </div>
                                    )}
                                </Link>

                                {/* Product Info */}
                                <div className="p-4">
                                    <p className="text-[11px] text-gray-400 uppercase mb-1">{product.category?.name || 'Electronics'}</p>
                                    <Link to={`/product/${product._id}`} className="block">
                                        <h3 className="text-sm font-bold text-[#333e48] leading-tight mb-2 line-clamp-2 hover:text-blue-600 transition">{product.name}</h3>
                                    </Link>
                                    
                                    {/* Rating */}
                                    <div className="flex items-center gap-1 mb-2">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={12} className={i < Math.round(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
                                        ))}
                                        <span className="text-xs text-gray-400 ml-1">({product.numReviews})</span>
                                    </div>

                                    {/* Price */}
                                    <div className="flex items-center gap-2 mb-3">
                                        {product.discountPrice > 0 ? (
                                            <>
                                                <span className="text-lg font-extrabold text-[#333e48]">৳{product.discountPrice.toLocaleString()}</span>
                                                <span className="text-sm text-gray-400 line-through">৳{product.price.toLocaleString()}</span>
                                            </>
                                        ) : (
                                            <span className="text-lg font-extrabold text-[#333e48]">৳{product.price.toLocaleString()}</span>
                                        )}
                                    </div>

                                    {/* Add to Cart Button */}
                                    <button 
                                        onClick={() => handleAddToCart(product)}
                                        disabled={product.countInStock === 0}
                                        className="w-full bg-[#fed700] text-[#333e48] font-bold py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-yellow-500 transition disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                                    >
                                        <ShoppingBag size={16} /> Add to Cart
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomePage;
