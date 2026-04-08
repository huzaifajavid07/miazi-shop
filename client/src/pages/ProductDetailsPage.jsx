import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProductDetails } from '../slices/productSlice';
import { addToCart } from '../slices/cartSlice';
import { toast } from 'react-toastify';
import { Star, ShoppingBag, ChevronRight, Truck, ShieldCheck, Heart, Info, Loader } from 'lucide-react';
import { BASE_URL } from '../utils/axiosConfig';

const ProductDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [qty, setQty] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);

    const { loading, error, productDetails: product } = useSelector((state) => state.product);
    const { userInfo } = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(getProductDetails(id));
        window.scrollTo(0, 0);
    }, [dispatch, id]);

    const addToCartHandler = () => {
        if (product && product.countInStock > 0) {
            dispatch(addToCart({ ...product, qty }));
            toast.success('Product added to cart!');
            navigate('/cart');
        }
    };

    if (loading) return (
        <div className="flex flex-col justify-center items-center py-64">
            <Loader size={40} className="animate-spin text-yellow-400 mb-4" />
            <span className="text-gray-500 font-bold">Loading Product Details...</span>
        </div>
    );
    
    if (error) return (
        <div className="container-custom py-20 text-center">
            <div className="bg-red-50 text-red-600 p-10 rounded-lg border border-red-100 max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-4">Error</h2>
                <p className="mb-6">{error}</p>
                <Link to="/" className="btn-electro">Go Back Home</Link>
            </div>
        </div>
    );

    if (!product) return null;

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200 mb-8">
                <div className="container-custom py-4 flex items-center gap-2 text-sm text-gray-500">
                    <Link to="/" className="hover:text-blue-600">Home</Link>
                    <ChevronRight size={14} />
                    <Link to={`/?category=${product.category?.name}`} className="hover:text-blue-600">{product.category?.name}</Link>
                    <ChevronRight size={14} />
                    <span className="text-gray-800 font-bold">{product.name}</span>
                </div>
            </div>

            <div className="container-custom">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 md:p-12 mb-10 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                        
                        {/* Images */}
                        <div className="space-y-6">
                            <div className="bg-white border border-gray-100 rounded-lg p-8 flex items-center justify-center h-[400px] md:h-[500px]">
                                <img 
                                    src={product.images?.[selectedImage]?.startsWith('http') ? product.images[selectedImage] : `${BASE_URL}${product.images?.[selectedImage]}`} 
                                    alt={product.name} 
                                    className="max-w-full max-h-full object-contain mix-blend-multiply" 
                                />
                            </div>
                            
                            {product.images?.length > 1 && (
                                <div className="flex gap-4 overflow-x-auto pb-2">
                                    {product.images.map((img, idx) => (
                                        <button 
                                            key={idx} 
                                            onClick={() => setSelectedImage(idx)}
                                            className={`w-20 h-20 bg-white border-2 rounded transition-all p-2 flex items-center justify-center shrink-0 ${selectedImage === idx ? 'border-yellow-400 shadow-md' : 'border-gray-100 opacity-60 hover:opacity-100'}`}
                                        >
                                            <img src={img?.startsWith('http') ? img : `${BASE_URL}${img}`} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex flex-col">
                            <div className="mb-6 pb-6 border-b border-gray-100">
                                <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-2">{product.category?.name}</p>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>
                                
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={16} className={i < Math.round(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'} />
                                        ))}
                                    </div>
                                    <span className="text-xs text-gray-400">({product.numReviews} Reviews)</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="text-3xl font-bold text-gray-800">৳{product.price?.toLocaleString()}</span>
                                    {product.discountPrice > 0 && (
                                        <span className="text-lg text-gray-400 line-through">৳{product.discountPrice?.toLocaleString()}</span>
                                    )}
                                </div>
                            </div>

                            <p className="text-gray-600 mb-6 leading-relaxed text-sm">
                                {product.description}
                            </p>

                            {/* Product Meta */}
                            <div className="space-y-3 mb-6 pb-6 border-b border-gray-100">
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-bold text-gray-400 uppercase w-24">Brand:</span>
                                    <span className="text-sm font-bold text-gray-700">{product.brand || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-bold text-gray-400 uppercase w-24">Category:</span>
                                    <Link to={`/category/${product.category?._id}`} className="text-sm font-bold text-blue-600 hover:underline">{product.category?.name || 'N/A'}</Link>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-bold text-gray-400 uppercase w-24">Availability:</span>
                                    <span className={`text-sm font-bold ${product.countInStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {product.countInStock > 0 ? `In Stock (${product.countInStock} available)` : 'Out of Stock'}
                                    </span>
                                </div>
                            </div>

                            {/* Quantity & Buttons */}
                            {product.countInStock > 0 && (
                                <div className="space-y-4 mb-8">
                                    {/* Quantity Selector */}
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs font-bold text-gray-400 uppercase w-24">Quantity:</span>
                                        <div className="flex items-center border border-gray-200 rounded-full h-11 w-32 px-2">
                                            <button onClick={() => qty > 1 && setQty(qty - 1)} className="flex-1 font-bold text-gray-400 text-lg hover:text-gray-800">-</button>
                                            <span className="flex-1 text-center font-bold text-gray-800">{qty}</span>
                                            <button onClick={() => qty < product.countInStock && setQty(qty + 1)} className="flex-1 font-bold text-gray-400 text-lg hover:text-gray-800">+</button>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <button 
                                            onClick={addToCartHandler}
                                            className="flex-1 h-12 bg-yellow-400 text-gray-800 font-bold rounded-full flex items-center justify-center gap-2 hover:bg-yellow-500 transition-colors text-sm"
                                        >
                                            <ShoppingBag size={18} /> Add to Cart
                                        </button>
                                        <button 
                                            onClick={() => {
                                                dispatch(addToCart({ ...product, qty }));
                                                navigate('/shipping');
                                            }}
                                            className="flex-1 h-12 bg-gray-800 text-white font-bold rounded-full flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors text-sm"
                                        >
                                             Buy Now
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Trust Badges */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-auto">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Truck size={20} className="text-yellow-500 shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-800 uppercase">Fast Delivery</p>
                                        <p className="text-[10px] text-gray-400">Nationwide shipping</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <ShieldCheck size={20} className="text-yellow-500 shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-800 uppercase">Genuine Product</p>
                                        <p className="text-[10px] text-gray-400">100% authentic</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Info size={20} className="text-yellow-500 shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-800 uppercase">Easy Returns</p>
                                        <p className="text-[10px] text-gray-400">7-day return policy</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailsPage;
