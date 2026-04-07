import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProductDetails } from '../slices/productSlice';
import { addToCart } from '../slices/cartSlice';
import { toast } from 'react-toastify';
import { Star, ShoppingBag, ArrowLeft, Loader } from 'lucide-react';
import api, { BASE_URL } from '../utils/axiosConfig';

const ProductDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [qty, setQty] = useState(1);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [reviewLoading, setReviewLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);

    const { loading, error, productDetails: product } = useSelector((state) => state.product);
    const { userInfo } = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(getProductDetails(id));
    }, [dispatch, id]);

    const addToCartHandler = () => {
        if (product && product.countInStock > 0) {
            dispatch(addToCart({ ...product, qty }));
            toast.success('Added to Cart!');
            navigate('/cart');
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        if (!rating) { toast.error('Please select a rating'); return; }
        try {
            setReviewLoading(true);
            await api.post(`/api/products/${id}/reviews`, { rating, comment });
            dispatch(getProductDetails(id));
            toast.success('Review Submitted!');
            setRating(0);
            setComment('');
        } catch (err) {
            toast.error(err.response?.data?.message || err.message);
        } finally {
            setReviewLoading(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center py-32">
            <Loader size={40} className="animate-spin text-[#fed700]" />
        </div>
    );
    if (error) return <div className="container-custom py-16 text-center text-red-500 font-bold">{error}</div>;
    if (!product) return null;

    return (
        <div className="container-custom py-8">
            <Link to="/" className="text-gray-500 hover:text-[#333e48] transition mb-6 inline-flex items-center gap-2 text-sm font-semibold">
                <ArrowLeft size={16} /> Back to Products
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-4">
                {/* Images */}
                <div className="bg-white rounded-xl border p-6">
                    <div className="flex items-center justify-center aspect-square bg-gray-50 rounded-xl overflow-hidden mb-4 p-4">
                        <img 
                            src={product.images?.[selectedImage]?.startsWith('http') ? product.images[selectedImage] : `${BASE_URL}${product.images?.[selectedImage]}` || 'https://via.placeholder.com/400'} 
                            alt={product.name} 
                            className="max-w-full max-h-full object-contain"
                        />
                    </div>
                    {product.images?.length > 1 && (
                        <div className="flex gap-2 justify-center">
                            {product.images.map((img, idx) => (
                                <button key={idx} onClick={() => setSelectedImage(idx)}
                                    className={`w-16 h-16 border-2 rounded-lg overflow-hidden ${selectedImage === idx ? 'border-[#fed700]' : 'border-gray-200'}`}>
                                    <img src={img?.startsWith('http') ? img : `${BASE_URL}${img}`} alt="" className="w-full h-full object-contain" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div>
                    <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">{product.brand} | {product.category?.name}</p>
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-[#333e48] mb-3">{product.name}</h1>
                    
                    <div className="flex items-center gap-2 mb-4">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={16} className={i < Math.round(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
                        ))}
                        <span className="text-gray-500 text-sm">({product.numReviews} reviews)</span>
                    </div>

                    <div className="flex items-end gap-3 mb-6">
                        {product.discountPrice > 0 ? (
                            <>
                                <span className="text-3xl font-extrabold text-[#333e48]">৳{product.discountPrice.toLocaleString()}</span>
                                <span className="text-lg text-gray-400 line-through">৳{product.price.toLocaleString()}</span>
                                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                    {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                                </span>
                            </>
                        ) : (
                            <span className="text-3xl font-extrabold text-[#333e48]">৳{product.price.toLocaleString()}</span>
                        )}
                    </div>

                    <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

                    {/* Status */}
                    <div className="mb-4 p-3 border rounded-lg bg-gray-50 flex items-center justify-between">
                        <span className="font-semibold text-gray-700">Availability:</span>
                        <span className={product.countInStock > 0 ? "text-green-600 font-bold" : "text-red-500 font-bold"}>
                            {product.countInStock > 0 ? `In Stock (${product.countInStock})` : 'Out Of Stock'}
                        </span>
                    </div>

                    {/* Quantity + Add to Cart */}
                    {product.countInStock > 0 && (
                        <div className="flex items-center gap-4 mb-6">
                            <label className="font-semibold text-gray-700">Qty:</label>
                            <select className="border rounded-lg px-4 py-2 outline-none" value={qty} onChange={(e) => setQty(Number(e.target.value))}>
                                {[...Array(Math.min(product.countInStock, 10)).keys()].map((x) => (
                                    <option key={x + 1} value={x + 1}>{x + 1}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <button onClick={addToCartHandler} disabled={product.countInStock === 0}
                        className="w-full bg-[#fed700] text-[#333e48] font-extrabold py-4 rounded-full hover:bg-yellow-500 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-md text-lg flex items-center justify-center gap-2">
                        <ShoppingBag size={20} /> Add to Cart
                    </button>
                </div>
            </div>

            {/* Reviews */}
            <div className="mt-12">
                <h2 className="text-xl font-extrabold border-b-2 border-[#fed700] pb-2 inline-block mb-6">Customer Reviews</h2>
                
                {product.reviews.length === 0 && (
                    <p className="text-gray-400 bg-gray-50 p-4 rounded-lg mb-6">No reviews yet. Be the first to review this product!</p>
                )}

                <div className="flex flex-col gap-4 mb-8">
                    {product.reviews.map((review) => (
                        <div key={review._id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                                <strong>{review.name}</strong>
                                <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} size={14} className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />)}</div>
                            </div>
                            <p className="text-gray-500 text-xs mb-2">{new Date(review.createdAt).toLocaleDateString()}</p>
                            <p className="text-gray-700">{review.comment}</p>
                        </div>
                    ))}
                </div>

                {userInfo ? (
                    <div className="bg-gray-50 p-6 rounded-xl border">
                        <h3 className="font-bold mb-4">Write a Review</h3>
                        <form onSubmit={submitHandler} className="flex flex-col gap-4">
                            <select className="border p-3 rounded-lg outline-none" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                                <option value="">Select Rating...</option>
                                <option value="1">1 - Poor</option>
                                <option value="2">2 - Fair</option>
                                <option value="3">3 - Good</option>
                                <option value="4">4 - Very Good</option>
                                <option value="5">5 - Excellent</option>
                            </select>
                            <textarea className="border p-3 rounded-lg outline-none h-24" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Your review..."></textarea>
                            <button disabled={reviewLoading} className="bg-[#333e48] text-white px-6 py-3 rounded-full font-bold self-start hover:bg-black transition disabled:opacity-50">
                                {reviewLoading ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </form>
                    </div>
                ) : (
                    <p className="bg-gray-50 p-4 rounded-lg">Please <Link to="/login" className="text-blue-600 font-bold hover:underline">sign in</Link> to write a review.</p>
                )}
            </div>
        </div>
    );
};

export default ProductDetailsPage;
