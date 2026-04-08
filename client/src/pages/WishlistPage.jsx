import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getWishlist, toggleWishlist } from '../slices/wishlistSlice';
import { addToCart } from '../slices/cartSlice';
import { Trash2, ShoppingCart, Heart, ChevronRight, ShoppingBag } from 'lucide-react';
import { BASE_URL } from '../utils/axiosConfig';
import { toast } from 'react-toastify';

const WishlistPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { wishlistItems, loading, error } = useSelector((state) => state.wishlist);
    const { userInfo } = useSelector((state) => state.auth);

    useEffect(() => {
        if (!userInfo) {
            navigate('/login');
        } else {
            dispatch(getWishlist());
        }
    }, [dispatch, userInfo, navigate]);

    const addToCartHandler = (product) => {
        dispatch(addToCart({ ...product, qty: 1 }));
        toast.success(`${product.name} added to cart!`);
    };

    const removeHandler = (productId) => {
        dispatch(toggleWishlist(productId));
        toast.info('Removed from wishlist');
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Favorites...</div>;

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200 mb-8">
                <div className="container-custom py-4 flex items-center gap-2 text-sm text-gray-500">
                    <Link to="/" className="hover:text-blue-600">Home</Link>
                    <ChevronRight size={14} />
                    <span className="text-gray-800 font-bold">My Wishlist</span>
                </div>
            </div>

            <div className="container-custom">
                <div className="flex items-center gap-3 mb-8">
                    <Heart className="text-red-500 fill-red-500" size={28} />
                    <h1 className="text-2xl font-bold text-gray-800 uppercase tracking-tight">My Wishlist</h1>
                </div>

                {wishlistItems.length === 0 ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-16 text-center shadow-sm">
                        <div className="flex justify-center mb-6 text-gray-200">
                            <Heart size={64} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">No favorites yet</h2>
                        <p className="text-gray-500 mb-8 text-sm">Products you save as favorites will appear here.</p>
                        <Link to="/" className="btn-electro inline-flex gap-2">
                             Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {wishlistItems.map((item) => (
                            <div key={item._id} className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all">
                                <Link to={`/product/${item.slug}`} className="block relative aspect-square bg-gray-50 p-6 overflow-hidden">
                                    <img 
                                        src={item.images?.[0] ? (item.images[0].startsWith('http') ? item.images[0] : `${BASE_URL}${item.images[0]}`) : 'https://placehold.co/300x300'} 
                                        alt={item.name} 
                                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500" 
                                    />
                                    <div className="absolute top-2 left-2 px-2 py-1 bg-white/80 backdrop-blur rounded text-[10px] font-bold text-gray-500 uppercase">
                                        {item.category?.name || 'Category'}
                                    </div>
                                </Link>
                                
                                <div className="p-4 border-t border-gray-100">
                                    <Link to={`/product/${item.slug}`} className="text-sm font-bold text-gray-800 hover:text-blue-600 truncate block mb-1">
                                        {item.name}
                                    </Link>
                                    <p className="text-lg font-bold text-gray-900 mb-4">৳{item.price.toLocaleString()}</p>
                                    
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => addToCartHandler(item)}
                                            className="flex-1 bg-yellow-400 text-gray-900 text-xs font-bold uppercase py-2.5 rounded-full flex items-center justify-center gap-2 hover:bg-gray-800 hover:text-white transition-all"
                                        >
                                            <ShoppingBag size={14} /> Add to Cart
                                        </button>
                                        <button 
                                            onClick={() => removeHandler(item._id)}
                                            className="w-10 h-10 border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all"
                                            title="Remove from favorites"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WishlistPage;
