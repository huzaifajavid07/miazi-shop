import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { listProducts } from '../slices/productSlice';
import { listCategories } from '../slices/categorySlice';
import { addToCart } from '../slices/cartSlice';
import { Link, useParams } from 'react-router-dom';
import { Plus, ChevronRight, Tag } from 'lucide-react';
import { BASE_URL } from '../utils/axiosConfig';
import { toast } from 'react-toastify';
import { ProductSkeleton } from '../components/Skeleton';

const CategoryPage = () => {
    const dispatch = useDispatch();
    const { slug } = useParams();
    const { products, loading } = useSelector((state) => state.product);
    const { categories } = useSelector((state) => state.category);

    const currentCategory = categories.find(c => c.slug === slug || c._id === slug);

    useEffect(() => {
        dispatch(listCategories());
    }, [dispatch]);

    useEffect(() => {
        if (currentCategory) {
            dispatch(listProducts({ category: currentCategory._id }));
        }
    }, [dispatch, currentCategory]);

    const addToCartHandler = (product) => {
        dispatch(addToCart({ ...product, qty: 1 }));
        toast.success(`${product.name} added to cart!`);
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
                    <Link to="/" className="hover:text-yellow-500">Home</Link>
                    <ChevronRight size={12} />
                    <Link to="/category/69d5d89d456ed47be418a903" className="hover:text-yellow-500">Categories</Link>
                    <ChevronRight size={12} />
                    <span className="text-gray-800 font-bold">{currentCategory?.name || 'All'}</span>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar - All Categories */}
                    <aside className="w-full lg:w-56 shrink-0">
                        <div className="bg-gray-800 text-white px-4 py-3 rounded-t-lg text-sm font-bold uppercase flex items-center gap-2">
                            <Tag size={14} /> Categories
                        </div>
                        <div className="border border-gray-200 rounded-b-lg overflow-hidden">
                            {categories.map(cat => (
                                <Link 
                                    key={cat._id} 
                                    to={`/category/${cat._id}`}
                                    className={`block px-4 py-3 text-sm border-b border-gray-100 hover:bg-yellow-50 hover:text-yellow-600 transition-colors ${currentCategory?._id === cat._id ? 'bg-yellow-50 text-yellow-600 font-bold' : 'text-gray-600'}`}
                                >
                                    {cat.name}
                                </Link>
                            ))}
                            {categories.length === 0 && (
                                <p className="px-4 py-6 text-xs text-gray-400 text-center">No categories yet</p>
                            )}
                        </div>
                    </aside>

                    {/* Products Grid */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-6 border-b-2 border-gray-200 pb-3">
                            <h1 className="text-lg font-bold text-gray-800">{currentCategory?.name || 'Category'}</h1>
                            <span className="text-xs text-gray-400">{products.length} product(s)</span>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
                            </div>
                        ) : products.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {products.map(p => (
                                    <div key={p._id} className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg hover:border-yellow-400 transition-all duration-300">
                                        <div className="relative bg-gray-50 p-4 aspect-square">
                                            <img 
                                                src={p.images?.[0] ? (p.images[0].startsWith('http') ? p.images[0] : `${BASE_URL}${p.images[0]}`) : 'https://placehold.co/300x300'} 
                                                alt={p.name} 
                                                className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500" 
                                            />
                                            <button onClick={() => addToCartHandler(p)}
                                                className="absolute bottom-2 right-2 w-8 h-8 bg-yellow-400 rounded-full shadow flex items-center justify-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all hover:bg-gray-800 hover:text-white">
                                                <Plus className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <div className="p-3">
                                            <p className="text-[10px] text-gray-400 uppercase mb-1">{p.category?.name || 'Electronics'}</p>
                                            <Link to={`/product/${p.slug}`}>
                                                <h3 className="text-sm font-medium text-slate-800 hover:text-yellow-600 line-clamp-2 mb-2 min-h-[2.5rem] transition-colors">{p.name}</h3>
                                            </Link>
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-bold text-gray-800">৳{p.price?.toLocaleString()}</span>
                                                {p.discountPrice > 0 && (
                                                    <span className="text-xs text-gray-400 line-through">৳{p.discountPrice?.toLocaleString()}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 text-gray-400">
                                <Tag size={48} className="mx-auto mb-4 text-gray-200" />
                                <p className="text-sm font-bold">No products in this category yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryPage;
