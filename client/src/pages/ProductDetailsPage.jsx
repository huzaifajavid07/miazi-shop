import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProductDetails } from '../slices/productSlice';
import { addToCart } from '../slices/cartSlice';
import { toast } from 'react-toastify';
import { Star, ShoppingBag, ChevronRight, Truck, ShieldCheck, Heart, Info, Loader, User, MessageCircle } from 'lucide-react';
import api, { BASE_URL } from '../utils/axiosConfig';

const ProductDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [qty, setQty] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [reviewLoading, setReviewLoading] = useState(false);

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

    const submitReviewHandler = async (e) => {
        e.preventDefault();
        if (rating === 0) return toast.error('Please select a rating');
        setReviewLoading(true);
        try {
            await api.post(`/api/products/${id}/reviews`, { rating, comment });
            toast.success('Review submitted successfully');
            setRating(0);
            setComment('');
            dispatch(getProductDetails(id)); // Refresh product details to show new review
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setReviewLoading(false);
        }
    };

    if (loading) return (
        <div className="container-custom py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
                <div className="bg-slate-100 aspect-square rounded-3xl" />
                <div className="space-y-6">
                    <div className="h-4 bg-slate-100 w-1/4 rounded" />
                    <div className="h-10 bg-slate-100 w-3/4 rounded" />
                    <div className="h-6 bg-slate-100 w-1/3 rounded" />
                    <div className="h-32 bg-slate-100 w-full rounded" />
                    <div className="h-12 bg-slate-100 w-full rounded-full" />
                </div>
            </div>
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
    <div className="container-custom py-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
        <Link to="/" className="hover:text-yellow-500">Home</Link>
        <ChevronRight size={14} />
        
        {/* Link updated to use the ID-based route */}
        <Link 
            to={`/category/${product.category?._id}`} 
            className="hover:text-yellow-500"
        >
            {product.category?.name}
        </Link>
        
        <ChevronRight size={14} />
        <span className="text-slate-800">{product.name}</span>
    </div>
</div>

            <div className="container-custom">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 md:p-12 mb-10 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                        
                        {/* Images */}
                        {/* Images & Video */}
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

                            {/* Video Player Section (if exists) */}
                            {product.videoUrl && (
                                <div className="mt-10 pt-10 border-t border-gray-100">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full" /> Product Experience Video
                                    </h3>
                                    <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-100 bg-gray-950 aspect-video group relative">
                                        <video 
                                            src={product.videoUrl} 
                                            controls 
                                            className="w-full h-full object-cover"
                                            poster={product.images?.[0]?.startsWith('http') ? product.images[0] : `${BASE_URL}${product.images?.[0]}`}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex flex-col">
                            <div className="mb-6 pb-6 border-b border-gray-100">
                                <p className="text-yellow-600 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{product.category?.name}</p>
                                <h1 className="text-2xl md:text-4xl font-black text-slate-800 mb-4 tracking-tight">{product.name}</h1>
                                
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
                                    <Link to={`/category/${product.category?._id}`} className="text-sm font-bold text-slate-800 hover:text-yellow-600 transition-colors uppercase">{product.category?.name || 'N/A'}</Link>
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
                                            className="flex-2 h-12 bg-yellow-400 text-gray-800 font-bold rounded-full flex items-center justify-center gap-2 hover:bg-yellow-500 transition-colors text-sm py-2"
                                        >
                                            <ShoppingBag size={18} /> Add to Cart
                                        </button>
                                        <button 
                                            onClick={() => {
                                                dispatch(addToCart({ ...product, qty }));
                                                navigate('/shipping');
                                            }}
                                            className="flex-1 h-12 bg-gray-800 text-white font-bold rounded-full flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors text-sm py-2"
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

                {/* MOBILE FLOATING ACTION BAR */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 z-50 flex items-center gap-3 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
                    <div className="flex flex-col flex-1 text-left">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Price</span>
                        <span className="text-lg font-black text-slate-800">৳{product.price?.toLocaleString()}</span>
                    </div>
                    {product.countInStock > 0 ? (
                        <>
                            <button 
                                onClick={addToCartHandler}
                                className="w-12 h-12 bg-slate-50 text-slate-800 rounded-2xl flex items-center justify-center shrink-0"
                            >
                                <ShoppingBag size={20} />
                            </button>
                            <button 
                                onClick={() => {
                                    dispatch(addToCart({ ...product, qty }));
                                    navigate('/shipping');
                                }}
                                className="flex-[2] h-12 bg-yellow-400 text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-yellow-100"
                            >
                                Buy Now
                            </button>
                        </>
                    ) : (
                        <div className="flex-1 text-center py-3 bg-slate-50 text-red-600 text-[10px] font-black uppercase rounded-2xl">
                            Out of Stock
                        </div>
                    )}
                </div>
            </div>

            {/* REVIEWS SECTION */}
            <div className="container-custom py-12 border-t border-gray-200">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3 mb-8">
                        <MessageCircle size={28} className="text-yellow-500" />
                        Customer Reviews
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Review Form */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 uppercase mb-4">Write a Review</h3>
                            {userInfo ? (
                                <form onSubmit={submitReviewHandler} className="space-y-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Rating</label>
                                        <select 
                                            value={rating} 
                                            onChange={(e) => setRating(Number(e.target.value))}
                                            className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg outline-none focus:border-yellow-400 text-sm font-semibold"
                                        >
                                            <option value="">Select...</option>
                                            <option value="1">1 - Poor</option>
                                            <option value="2">2 - Fair</option>
                                            <option value="3">3 - Good</option>
                                            <option value="4">4 - Very Good</option>
                                            <option value="5">5 - Excellent</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Comment</label>
                                        <textarea 
                                            rows="4" 
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            required
                                            className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg outline-none focus:border-yellow-400 text-sm resize-none"
                                            placeholder="What did you like about this product?"
                                        ></textarea>
                                    </div>
                                    <button 
                                        type="submit" 
                                        disabled={reviewLoading}
                                        className="w-full bg-gray-900 text-white font-bold py-3 rounded-lg uppercase tracking-wider text-xs hover:bg-yellow-500 hover:text-gray-900 transition-colors disabled:opacity-50"
                                    >
                                        {reviewLoading ? 'Submitting...' : 'Submit Review'}
                                    </button>
                                </form>
                            ) : (
                                <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl text-center">
                                    <p className="text-sm text-yellow-800 font-medium mb-4">You must be logged in to write a review.</p>
                                    <Link to="/login" className="inline-block bg-yellow-400 text-gray-900 font-bold px-6 py-2 rounded-full hover:bg-yellow-500 transition-colors text-sm">
                                        Login Now
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Reviews List */}
                        <div className="space-y-6">
                            {product.reviews.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                    <MessageCircle size={40} className="mx-auto text-gray-300 mb-3" />
                                    <h3 className="text-gray-500 font-medium">No reviews yet.</h3>
                                    <p className="text-xs text-gray-400">Be the first to review this product!</p>
                                </div>
                            ) : (
                                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                    {product.reviews.map((review) => (
                                        <div key={review._id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                                                        <User size={16} />
                                                    </div>
                                                    <span className="font-bold text-sm text-gray-800">{review.name}</span>
                                                </div>
                                                <span className="text-xs text-gray-400">{review.createdAt.substring(0, 10)}</span>
                                            </div>
                                            <div className="flex items-center gap-1 mb-2">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star 
                                                        key={i} 
                                                        size={14} 
                                                        className={i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} 
                                                    />
                                                ))}
                                            </div>
                                            <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailsPage;
