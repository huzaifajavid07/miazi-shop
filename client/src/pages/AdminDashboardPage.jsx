import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { listProducts, deleteProduct, createProduct, updateProduct } from '../slices/productSlice';
import { listCategories, createCategory, deleteCategory } from '../slices/categorySlice';
import api, { BASE_URL } from '../utils/axiosConfig';
import { toast } from 'react-toastify';
import { 
    Package, List, ShoppingCart, 
    Plus, Edit, Trash2, X, Loader, 
    FolderPlus, Tag, Upload, Image,
    LayoutDashboard, TrendingUp, Users, DollarSign,
    Search, Filter, ChevronRight, MoreHorizontal, Zap
} from 'lucide-react';

const AdminDashboardPage = () => {
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState('payment approval');
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [uploadedImages, setUploadedImages] = useState([]);
    const [uploading, setUploading] = useState(false);
    
    // Filtering States
    const [productSearch, setProductSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    
    // Order Detail States
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        name: '', price: '', discountPrice: '', category: '', brand: '', countInStock: '', description: '', images: '', isFeatured: false, isTrending: false
    });

    const { products, loading: productsLoading } = useSelector((state) => state.product);
    const { categories } = useSelector((state) => state.category);

    useEffect(() => {
        dispatch(listProducts({}));
        dispatch(listCategories());
        fetchOrders();
        fetchUsers();
    }, [dispatch]);

    const fetchOrders = async () => {
        try {
            const { data } = await api.get('/api/orders');
            setOrders(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.put(`/api/orders/${id}/status`, { status });
            toast.success(`Order set to ${status}`);
            const { data } = await api.get('/api/orders');
            setOrders(data);
        } catch (err) {
            toast.error(err.message || 'Update failed');
        }
    };

    const handleApprovePayment = async (id) => {
        if (!window.confirm('Are you sure you want to approve this payment? This will mark the order as PAID and PROCESSING.')) return;
        try {
            await api.put(`/api/orders/${id}/approve-payment`);
            toast.success('Payment Approved!');
            const { data } = await api.get('/api/orders');
            setOrders(data);
        } catch (err) {
            toast.error(err.response?.data?.message || err.message);
        }
    };

    const handleRejectPayment = async (id) => {
        if (!window.confirm('Reject this payment request? User will be notified.')) return;
        try {
            await api.put(`/api/orders/${id}/reject-payment`);
            toast.success('Payment Rejected');
            const { data } = await api.get('/api/orders');
            setOrders(data);
        } catch (err) {
            toast.error(err.response?.data?.message || err.message);
        }
    };

    const handleDeleteOrder = async (id) => {
        if (!window.confirm('Are you sure you want to PERMANENTLY DELETE this order? This action cannot be undone.')) return;
        try {
            await api.delete(`/api/orders/${id}`);
            toast.success('Order Deleted Successfully');
            const { data } = await api.get('/api/orders');
            setOrders(data);
        } catch (err) {
            toast.error(err.response?.data?.message || err.message);
        }
    };

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/api/users');
            setUsers(data);
        } catch (err) {
            console.error(err);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', price: '', discountPrice: '', category: '', brand: '', countInStock: '', description: '', images: '', isFeatured: false, isTrending: false });
        setEditingProduct(null);
        setUploadedImages([]);
    };

    const uploadFileHandler = async (e) => {
        const files = Array.from(e.target.files);
        setUploading(true);
        try {
            for (const file of files) {
                const formDataUpload = new FormData();
                formDataUpload.append('image', file);
                const { data } = await api.post('/api/upload', formDataUpload, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setUploadedImages(prev => [...prev, data.image]);
            }
            toast.success('Image(s) uploaded!');
        } catch (err) {
            toast.error('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const removeUploadedImage = (idx) => {
        setUploadedImages(prev => prev.filter((_, i) => i !== idx));
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setUploadedImages(product.images || []);
        setFormData({
            name: product.name,
            price: product.price,
            discountPrice: product.discountPrice || '',
            category: product.category?._id || '',
            brand: product.brand,
            countInStock: product.countInStock || 0,
            description: product.description,
            images: product.images?.join(', ') || '',
            isFeatured: product.isFeatured || false,
            isTrending: product.isTrending || false,
        });
        setIsProductModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this product permanently?')) {
            try {
                await dispatch(deleteProduct(id)).unwrap();
                toast.success('Product removed');
            } catch (err) {
                toast.error(err.message || 'Delete failed');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const manualImages = formData.images ? formData.images.split(',').map(img => img.trim()).filter(img => img) : [];
            const allImages = [...uploadedImages, ...manualImages];
            const productData = { 
                ...formData, 
                images: allImages.length > 0 ? allImages : ['/uploads/placeholder.png']
            };
            
            if (editingProduct) {
                await dispatch(updateProduct({ id: editingProduct._id, ...productData })).unwrap();
                toast.success('Updated successfully');
            } else {
                await dispatch(createProduct(productData)).unwrap();
                toast.success('Created successfully');
            }
            setIsProductModalOpen(false);
            resetForm();
            dispatch(listProducts({}));
        } catch (err) {
            toast.error(err.message || 'Operation failed');
        }
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;
        try {
            const slug = newCategoryName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();
            await dispatch(createCategory({ name: newCategoryName.trim(), slug })).unwrap();
            toast.success('Category added');
            setNewCategoryName('');
            setIsCategoryModalOpen(false);
        } catch (err) {
            toast.error(err.message || 'Failed to add category');
        }
    };

    const handleDeleteCategory = async (id) => {
        if (window.confirm('Delete this category?')) {
            try {
                await dispatch(deleteCategory(id)).unwrap();
                toast.success('Category removed');
            } catch (err) {
                toast.error(err.message || 'Delete failed');
            }
        }
    };

    // Derived Data
    const totalRevenue = orders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);
    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.brand.toLowerCase().includes(productSearch.toLowerCase());
        const matchesCategory = categoryFilter === '' || p.category?._id === categoryFilter || p.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const sidebarItems = [
        { id: 'overview', name: 'Overview', icon: LayoutDashboard },
        { id: 'payment approval', name: 'Payment Requests', icon: Zap },
        { id: 'paid manifest', name: 'Shipment Manifest', icon: TrendingUp },
        { id: 'products', name: 'Products', icon: Package },
        { id: 'categories', name: 'Categories', icon: List },
        { id: 'orders history', name: 'Orders History', icon: ShoppingCart },
    ];

    return (
        <div className="flex min-h-screen bg-[#F8FAFC] font-sans scroll-smooth">
            {/* ========== SIDEBAR ========== */}
            <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col sticky top-0 h-screen">
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center shadow-lg shadow-yellow-200">
                            <TrendingUp size={18} className="text-gray-900" />
                        </div>
                        <span className="font-black text-lg tracking-tighter text-slate-800 uppercase">Electro <span className="text-yellow-500">Pro</span></span>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Admin Console</p>
                </div>
                
                <nav className="flex-1 px-4 space-y-1">
                    {sidebarItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold transition-all duration-300 rounded-xl ${activeTab === item.id ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                        >
                            <item.icon size={18} className={activeTab === item.id ? 'text-yellow-400' : ''} /> 
                            {item.name}
                        </button>
                    ))}
                </nav>

                <div className="p-6">
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Logged in as</p>
                        <p className="text-xs font-black text-slate-800 truncate">Administrator</p>
                        <button className="text-[10px] font-bold text-red-500 mt-2 hover:underline uppercase tracking-wider">Logout</button>
                    </div>
                </div>
            </aside>

            {/* Mobile Navigation */}
            <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md rounded-full px-6 py-3 flex gap-8 items-center border border-white/10 shadow-2xl z-[100]">
                {sidebarItems.map(item => (
                    <button key={item.id} onClick={() => setActiveTab(item.id)}
                        className={`transition-all ${activeTab === item.id ? 'text-yellow-400 scale-110' : 'text-white/40'}`}>
                        <item.icon size={20} />
                    </button>
                ))}
            </div>

            {/* ========== MAIN CONTENT ========== */}
            <main className="flex-1 min-w-0">
                {/* Top Nav */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                        <span>Console</span>
                        <ChevronRight size={14} />
                        <span className="text-slate-900 underline decoration-yellow-400 decoration-2 underline-offset-4 capitalize">{activeTab}</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center bg-slate-100 rounded-full px-4 py-2 border border-slate-200">
                            <Search size={14} className="text-slate-400 mr-2" />
                            <input type="text" placeholder="Global search..." className="bg-transparent border-none outline-none text-xs w-48 font-medium" />
                        </div>
                        <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white font-black text-xs ring-4 ring-slate-100">
                            AD
                        </div>
                    </div>
                </header>

                <div className="p-4 md:p-8 pb-32 lg:pb-8">
                    {/* ========== OVERVIEW TAB ========== */}
                    {activeTab === 'overview' && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { label: 'Total Revenue', value: `৳${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-emerald-500', trend: '+12.5%' },
                                    { label: 'Total Orders', value: orders.length, icon: ShoppingCart, color: 'bg-blue-500', trend: '+8.2%' },
                                    { label: 'Live Products', value: products.length, icon: Package, color: 'bg-amber-500', trend: 'Active' },
                                    { label: 'Total Users', value: users.length, icon: Users, color: 'bg-indigo-500', trend: '+45' },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200 transition-all duration-300 group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                                <stat.icon size={22} />
                                            </div>
                                            <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${stat.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                                                {stat.trend}
                                            </span>
                                        </div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                        <h3 className="text-2xl font-black text-slate-800">{stat.value}</h3>
                                    </div>
                                ))}
                            </div>

                            {/* Recent Activity Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-white rounded-3xl border border-slate-200 p-8">
                                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 border-b border-slate-100 pb-4 flex items-center gap-2">
                                        <TrendingUp size={16} className="text-emerald-500" /> Recent Sales Performance
                                    </h4>
                                    <div className="space-y-6">
                                        {orders.slice(0, 5).map(o => (
                                            <div key={o._id} className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                                        <Users size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-slate-800">{o.user?.name || 'Guest Customer'}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold tracking-tight">{new Date(o.createdAt).toDateString()}</p>
                                                    </div>
                                                </div>
                                                <p className="text-sm font-black text-slate-800">৳{o.totalPrice?.toLocaleString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-400">
                                    <div className="relative z-10">
                                        <h4 className="text-sm font-black uppercase tracking-widest mb-2 text-yellow-500">Inventory Status</h4>
                                        <p className="text-xs text-white/60 mb-8 max-w-[200px]">Keep track of your products and category performance effortlessly.</p>
                                        
                                        <div className="space-y-4">
                                            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                                <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                                                    <span>In Stock Products</span>
                                                    <span>{products.filter(p => p.countInStock > 0).length}/{products.length}</span>
                                                </div>
                                                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                                    <div className="h-full bg-yellow-500 transition-all duration-1000" style={{ width: `${(products.filter(p => p.countInStock > 0).length / products.length) * 100}%` }}></div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center">
                                                    <p className="text-[10px] font-black text-white/40 uppercase mb-1">Categories</p>
                                                    <p className="text-2xl font-black">{categories.length}</p>
                                                </div>
                                                <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center">
                                                    <p className="text-[10px] font-black text-white/40 uppercase mb-1">Out of Stock</p>
                                                    <p className="text-2xl font-black text-red-400">{products.filter(p => p.countInStock === 0).length}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ========== PRODUCTS TAB ========== */}
                    {activeTab === 'products' && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                            {/* Toolbar */}
                            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                                <div className="flex gap-3 w-full md:w-auto">
                                    <div className="relative flex-1 md:w-64">
                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input 
                                            type="text" 
                                            placeholder="Search products..." 
                                            className="w-full bg-white border border-slate-200 rounded-xl px-10 py-2.5 text-xs font-semibold focus:border-yellow-400 transition-all outline-none"
                                            value={productSearch}
                                            onChange={(e) => setProductSearch(e.target.value)}
                                        />
                                    </div>
                                    <div className="relative">
                                        <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <select 
                                            className="appearance-none bg-white border border-slate-200 rounded-xl px-10 py-2.5 text-xs font-black uppercase tracking-wider text-slate-600 focus:border-yellow-400 transition-all outline-none"
                                            value={categoryFilter}
                                            onChange={(e) => setCategoryFilter(e.target.value)}
                                        >
                                            <option value="">All Categories</option>
                                            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <button onClick={() => { resetForm(); setIsProductModalOpen(true); }}
                                    className="w-full md:w-auto bg-slate-900 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-yellow-500 transition-all shadow-xl shadow-slate-100 ring-4 ring-white">
                                    <Plus size={16} /> Add Product
                                </button>
                            </div>

                            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                                <th className="p-6">Product Information</th>
                                                <th className="p-6">Category</th>
                                                <th className="p-6">Pricing</th>
                                                <th className="p-6">Stock Status</th>
                                                <th className="p-6 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {filteredProducts.map(p => (
                                                <tr key={p._id} className="hover:bg-slate-50/30 transition-colors group">
                                                    <td className="p-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl p-1 shrink-0 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                                <img src={p.images?.[0]?.startsWith('http') ? p.images[0] : `${BASE_URL}${p.images?.[0]}`} alt="" className="max-w-full max-h-full object-contain mix-blend-multiply" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-black text-slate-800 truncate max-w-[200px]">{p.name}</p>
                                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{p.brand}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-6">
                                                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                                                            {p.category?.name || 'Uncategorized'}
                                                        </span>
                                                    </td>
                                                    <td className="p-6">
                                                        <p className="text-sm font-black text-slate-800">৳{p.price?.toLocaleString()}</p>
                                                        {p.discountPrice && <p className="text-[10px] text-slate-300 line-through">৳{p.discountPrice.toLocaleString()}</p>}
                                                    </td>
                                                    <td className="p-6">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-2 h-2 rounded-full ${p.countInStock > 10 ? 'bg-emerald-500 animate-pulse' : p.countInStock > 0 ? 'bg-amber-400' : 'bg-red-500'}`}></div>
                                                            <span className="text-xs font-black text-slate-600">{p.countInStock} Units</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-6 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <button onClick={() => handleEdit(p)} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-blue-600 rounded-xl transition-all"><Edit size={16} /></button>
                                                            <button onClick={() => handleDelete(p._id)} className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all ml-1"><Trash2 size={16} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {filteredProducts.length === 0 && (
                                    <div className="text-center py-20 bg-slate-50/20">
                                        <Package size={40} className="mx-auto text-slate-200 mb-4" />
                                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No matching products found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ========== PAYMENT APPROVAL CENTER ========== */}
                    {activeTab === 'payment approval' && (
                        <div className="space-y-8 animate-in slide-in-from-right duration-500">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Payment Approval Center</h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Verify Manual bKash/Nagad Receipts</p>
                                </div>
                                <div className="bg-slate-100 px-4 py-2 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest border border-slate-200">
                                    Debug: {orders.length} Total | {orders.filter(o => o.paymentStatus === 'Pending Approval').length} Pending
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {orders.filter(o => o.paymentStatus === 'Pending Approval').map(order => (
                                    <div key={order._id} className="bg-white rounded-[2.5rem] border-2 border-slate-100 p-8 flex flex-col xl:flex-row gap-8 hover:border-yellow-400 transition-all group overflow-hidden relative">
                                        <div className="absolute top-0 right-0 p-4 bg-slate-900 text-yellow-400 text-[10px] font-black uppercase tracking-widest rounded-bl-2xl">
                                            Request ID: {order._id.slice(-6).toUpperCase()}
                                        </div>

                                        {/* Screenshot Display */}
                                        <div className="w-full xl:w-80 shrink-0">
                                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <Zap size={10} className="text-yellow-500" /> Payment Proof
                                            </div>
                                            <div className="rounded-3xl border border-slate-100 p-2 bg-slate-50 relative group/img overflow-hidden cursor-zoom-in">
                                                <img 
                                                    src={order.paymentScreenshot?.startsWith('http') ? order.paymentScreenshot : `${BASE_URL}${order.paymentScreenshot}`} 
                                                    alt="Payment Receipt" 
                                                    className="w-full rounded-2xl aspect-video xl:aspect-square object-cover shadow-sm group-hover/img:scale-110 transition-transform duration-700" 
                                                />
                                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                                    <span className="text-[10px] font-black text-white uppercase tracking-widest bg-slate-900/60 px-4 py-2 rounded-full backdrop-blur-sm">Expand Image</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Financial & Customer Details */}
                                        <div className="flex-1 space-y-6 flex flex-col justify-between">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div>
                                                    <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Customer Identity</h4>
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-slate-900 text-yellow-400 rounded-2xl flex items-center justify-center font-black">
                                                            {(order.user?.name || 'G')[0]}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">{order.user?.name || 'Guest User'}</p>
                                                            <p className="text-[10px] text-slate-400 font-bold">{order.user?.email}</p>
                                                            <p className="text-[10px] text-indigo-500 font-bold mt-1">📞 {order.shippingAddress?.phone}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                                                    <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Transaction Valuation</h4>
                                                    <p className="text-3xl font-black text-slate-900 tracking-tighter">৳{order.totalPrice?.toLocaleString()}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Net Payable Amount</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100">
                                                <button 
                                                    onClick={() => handleApprovePayment(order._id)}
                                                    className="flex-1 min-w-[150px] bg-slate-900 text-white rounded-2xl py-4 text-xs font-black uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200"
                                                >
                                                    Approve Payment
                                                </button>
                                                <button 
                                                    onClick={() => handleRejectPayment(order._id)}
                                                    className="px-8 bg-white text-slate-400 border border-slate-200 rounded-2xl py-4 text-[10px] font-black uppercase tracking-[0.1em] hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all"
                                                >
                                                    Reject Proof
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {orders.filter(o => o.paymentStatus === 'Pending Approval').length === 0 && (
                                    <div className="py-32 text-center opacity-40">
                                        <Zap size={64} className="mx-auto mb-4 text-slate-300" />
                                        <p className="text-sm font-black uppercase tracking-widest text-slate-400">No pending payment verifications</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ========== CATEGORIES TAB ========== */}
                    {activeTab === 'categories' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in zoom-in-95 duration-500">
                            {categories.map(cat => (
                                <div key={cat._id} className="bg-white rounded-[2rem] border border-slate-200 p-8 flex flex-col items-center justify-center text-center group hover:bg-slate-900 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-slate-400">
                                    <div className="w-16 h-16 bg-yellow-400 rounded-3xl flex items-center justify-center text-slate-900 mb-6 shadow-xl shadow-yellow-200 group-hover:rotate-12 transition-transform">
                                        <Tag size={28} />
                                    </div>
                                    <h5 className="text-base font-black text-slate-800 group-hover:text-white mb-2">{cat.name}</h5>
                                    <p className="text-[10px] text-slate-400 group-hover:text-white/40 font-bold uppercase tracking-widest mb-6">/{cat.slug}</p>
                                    
                                    <div className="w-full flex items-center justify-between pt-6 border-t border-slate-100 group-hover:border-white/10">
                                        <span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-yellow-500">
                                            {products.filter(p => p.category?._id === cat._id || p.category === cat._id).length} Products
                                        </span>
                                        <button onClick={() => handleDeleteCategory(cat._id)} className="text-slate-300 hover:text-red-500 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => setIsCategoryModalOpen(true)}
                                className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-8 flex flex-col items-center justify-center text-slate-400 hover:border-yellow-400 hover:bg-yellow-50/30 transition-all group">
                                <Plus size={32} className="mb-4 group-hover:scale-125 transition-transform" />
                                <span className="text-xs font-black uppercase tracking-widest">Add New Category</span>
                            </button>
                        </div>
                    )}

                    {/* ========== PAID MANIFEST (FULFILLMENT CENTER) ========== */}
                    {activeTab === 'paid manifest' && (
                        <div className="space-y-8 animate-in slide-in-from-right duration-500">
                             <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Shipment Manifest</h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Pending Fulfillment — Verified Payments Only</p>
                                </div>
                                <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-200">
                                    {orders.filter(o => o.isPaid).length} Ready to Ship
                                </div>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
                                {orders.filter(o => o.isPaid).map(order => (
                                    <div key={order._id} className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 p-6 md:p-8 shadow-sm hover:shadow-2xl hover:shadow-slate-200 transition-all group flex flex-col md:flex-row gap-6 md:gap-8">
                                        {/* Left: Customer & Address */}
                                        <div className="flex-1 space-y-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-slate-900 text-yellow-400 rounded-3xl flex items-center justify-center text-xl font-black shadow-lg">
                                                    {(order.user?.name || 'G')[0]}
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">{order.user?.name || 'Guest User'}</h3>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{order.user?.email}</p>
                                                    <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-1 italic">
                                                        Placed: {new Date(order.createdAt).toLocaleDateString()} @ {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <label className="relative flex items-center cursor-pointer group">
                                                            <input 
                                                                type="checkbox" 
                                                                className="sr-only peer"
                                                                checked={order.isDelivered}
                                                                onChange={() => handleStatusUpdate(order._id, order.isDelivered ? 'Processing' : 'Delivered')}
                                                            />
                                                            <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                                            <span className="ms-3 text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-900 transition-colors">
                                                                {order.isDelivered ? 'Fulfilled ✓' : 'Fulfill?'}
                                                            </span>
                                                        </label>
                                                        <button 
                                                            onClick={() => handleDeleteOrder(order._id)}
                                                            className="ml-auto w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                            title="Delete Order"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                    <p className="text-xs font-black text-emerald-600 mt-1">📞 {order.shippingAddress?.phone}</p>
                                                </div>
                                            </div>

                                            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full -mr-12 -mt-12 ring-1 ring-slate-100"></div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 relative">Shipping Destination</p>
                                                <p className="text-xs font-bold text-slate-700 leading-relaxed relative">
                                                    {order.shippingAddress?.address},<br/>
                                                    {order.shippingAddress?.city} {order.shippingAddress?.postalCode},<br/>
                                                    {order.shippingAddress?.country}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Right: Order Summary */}
                                        <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8 flex flex-col justify-between">
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center md:text-left">Order Details</p>
                                                <div className="space-y-3">
                                                    {order.orderItems.map((item, i) => (
                                                        <div key={i} className="flex items-center justify-between">
                                                            <span className="text-[10px] font-bold text-slate-600 truncate max-w-[100px]">{item.name}</span>
                                                            <span className="text-[10px] font-black text-slate-400">x{item.qty}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="mt-8">
                                                <div className="flex justify-between items-end mb-4">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Price</span>
                                                    <span className="text-xl font-black text-slate-800 tracking-tighter">৳{order.totalPrice?.toLocaleString()}</span>
                                                </div>
                                                <button 
                                                    onClick={() => { setSelectedOrder(order); setIsOrderModalOpen(true); }}
                                                    className="w-full bg-slate-900 text-white rounded-2xl py-3 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-yellow-500 transition-all shadow-lg shadow-slate-200"
                                                >
                                                    Open Manifest
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {orders.filter(o => o.isPaid).length === 0 && (
                                    <div className="col-span-full py-32 text-center opacity-40">
                                        <ShoppingCart size={64} className="mx-auto mb-4" />
                                        <p className="text-sm font-black uppercase tracking-widest">No paid orders ready for shipment</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ========== ORDERS TAB (HISTORY) ========== */}
                    {activeTab === 'orders history' && (
                        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden animate-in fade-in duration-500">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                            <th className="p-6">Order ID</th>
                                            <th className="p-6">Customer Name</th>
                                            <th className="p-6">Placed Date</th>
                                            <th className="p-6">Payment Method</th>
                                            <th className="p-6">Total Amount</th>
                                            <th className="p-6">Status</th>
                                            <th className="p-6 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {orders.map(order => (
                                            <tr key={order._id} className="hover:bg-slate-50/30 transition-colors group">
                                                <td className="p-6 font-black text-xs text-slate-800">
                                                    <button 
                                                        onClick={() => { setSelectedOrder(order); setIsOrderModalOpen(true); }}
                                                        className="underline decoration-yellow-400 hover:text-yellow-600 transition-colors"
                                                    >
                                                        #{order._id.slice(-8).toUpperCase()}
                                                    </button>
                                                </td>
                                                <td className="p-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black">
                                                            {(order.user?.name || 'G')[0]}
                                                        </div>
                                                        <span className="text-sm font-medium text-slate-700">{order.user?.name || 'Guest User'}</span>
                                                    </div>
                                                </td>
                                                <td className="p-6 text-xs text-slate-400 font-bold">{new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                                <td className="p-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-slate-800 uppercase tracking-tighter">{order.paymentMethod}</span>
                                                        {order.paymentResult?.id && (
                                                            <span className="text-[9px] text-indigo-500 font-bold truncate max-w-[100px]">{order.paymentResult.id}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-6 text-sm font-black text-slate-900">৳{order.totalPrice?.toLocaleString()}</td>
                                                <td className="p-6">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${order.isPaid ? 'bg-emerald-500' : order.orderStatus === 'Cancelled' ? 'bg-red-500' : 'bg-amber-400 animate-pulse'}`}></div>
                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${order.isPaid ? 'text-emerald-600' : order.orderStatus === 'Cancelled' ? 'text-red-600' : 'text-amber-600'}`}>
                                                            {order.isPaid ? 'Paid' : order.orderStatus === 'Cancelled' ? 'Failed/Cancelled' : 'Pending'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-6 text-center">
                                                    <button 
                                                        onClick={() => handleDeleteOrder(order._id)}
                                                        className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto hover:bg-red-50 hover:text-red-500 transition-all border border-transparent hover:border-red-100"
                                                        title="Delete Order"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* ========== ADD/EDIT PRODUCT MODAL ========== */}
            {isProductModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-end p-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white h-full w-full max-w-2xl shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ring-1 ring-white/20">
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                            <div>
                                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">
                                    {editingProduct ? 'Update Product' : 'Add New Unit'}
                                </h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Inventory Management System</p>
                            </div>
                            <button onClick={() => { setIsProductModalOpen(false); resetForm(); }} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 rounded-2xl transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 bg-slate-50/30">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Base Name *</label>
                                    <input className="w-full bg-white border border-slate-200 px-4 py-3 rounded-2xl outline-none focus:ring-4 focus:ring-yellow-400/20 focus:border-yellow-400 transition-all font-semibold text-sm" 
                                        placeholder="Enter product title..."
                                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Retail Price (৳) *</label>
                                    <input type="number" className="w-full bg-white border border-slate-200 px-4 py-3 rounded-2xl outline-none focus:ring-4 focus:ring-yellow-400/20 focus:border-yellow-400 transition-all font-semibold text-sm" 
                                        placeholder="0"
                                        value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Promo Price (৳)</label>
                                    <input type="number" className="w-full bg-white border border-slate-200 px-4 py-3 rounded-2xl outline-none focus:ring-4 focus:ring-yellow-400/20 focus:border-yellow-400 transition-all font-semibold text-sm" 
                                        placeholder="Optional"
                                        value={formData.discountPrice} onChange={e => setFormData({...formData, discountPrice: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Assign Category *</label>
                                    <select className="w-full bg-white border border-slate-200 px-4 py-3 rounded-2xl outline-none focus:ring-4 focus:ring-yellow-400/20 focus:border-yellow-400 transition-all font-semibold text-sm appearance-none" 
                                        value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required>
                                        <option value="">Choose Category</option>
                                        {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Manufacturer Brand *</label>
                                    <input className="w-full bg-white border border-slate-200 px-4 py-3 rounded-2xl outline-none focus:ring-4 focus:ring-yellow-400/20 focus:border-yellow-400 transition-all font-semibold text-sm" 
                                        placeholder="e.g. Sony"
                                        value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Unit Count *</label>
                                    <input type="number" className="w-full bg-white border border-slate-200 px-4 py-3 rounded-2xl outline-none focus:ring-4 focus:ring-yellow-400/20 focus:border-yellow-400 transition-all font-semibold text-sm" 
                                        placeholder="0"
                                        value={formData.countInStock} onChange={e => setFormData({...formData, countInStock: e.target.value})} required />
                                </div>
                                <div className="flex items-center gap-6 pt-6">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input type="checkbox" checked={formData.isFeatured} onChange={e => setFormData({...formData, isFeatured: e.target.checked})} className="accent-slate-900 w-5 h-5" />
                                        <span className="text-xs font-black uppercase tracking-widest text-slate-500">Featured</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input type="checkbox" checked={formData.isTrending} onChange={e => setFormData({...formData, isTrending: e.target.checked})} className="accent-slate-900 w-5 h-5" />
                                        <span className="text-xs font-black uppercase tracking-widest text-slate-500">Trending</span>
                                    </label>
                                </div>
                                <div className="md:col-span-2 space-y-2 pt-4">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Visual Assets</label>
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-[2rem] cursor-pointer hover:border-yellow-400 hover:bg-yellow-50/50 transition-all bg-white relative group">
                                        <input type="file" multiple accept="image/*" onChange={uploadFileHandler} className="hidden" />
                                        <div className="flex flex-col items-center justify-center py-5">
                                            <Upload className="w-8 h-8 text-slate-300 mb-2" />
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Drop assets here</p>
                                        </div>
                                    </label>
                                    {uploadedImages.length > 0 && (
                                        <div className="flex gap-3 flex-wrap pt-2">
                                            {uploadedImages.map((img, idx) => (
                                                <div key={idx} className="relative group w-20 h-20 bg-white border border-slate-100 rounded-2xl p-1 shadow-sm">
                                                    <img src={img.startsWith('http') ? img : `${BASE_URL}${img}`} alt="" className="w-full h-full object-contain" />
                                                    <button type="button" onClick={() => removeUploadedImage(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg"><X size={12} /></button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Detail Specification *</label>
                                    <textarea className="w-full bg-white border border-slate-200 px-4 py-4 rounded-[2rem] outline-none focus:ring-4 focus:ring-yellow-400/20 focus:border-yellow-400 transition-all font-medium text-sm h-32 resize-none" 
                                        placeholder="Enter details..."
                                        value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required></textarea>
                                </div>
                            </div>
                        </form>
                        <div className="p-8 border-t border-slate-100 bg-white flex gap-4">
                            <button type="button" onClick={() => { setIsProductModalOpen(false); resetForm(); }} className="flex-1 py-4 text-xs font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-800">Discard</button>
                            <button onClick={handleSubmit} className="flex-1 bg-slate-900 text-white rounded-2xl py-4 text-xs font-black uppercase tracking-[0.2em] hover:bg-yellow-500 transition-all">
                                {editingProduct ? 'Confirm Update' : 'Initialize Unit'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========== ADD CATEGORY MODAL ========== */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in zoom-in-95 duration-300">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-10 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-2">New Category</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">Asset Grouping System</p>
                            <form onSubmit={handleCreateCategory}>
                                <div className="space-y-2 mb-8">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Label Name *</label>
                                    <input className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-yellow-400/20 focus:border-yellow-400 transition-all font-black text-sm"
                                        placeholder="e.g. Smart Electronics"
                                        value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} required autoFocus />
                                </div>
                                <div className="flex flex-col gap-3">
                                    <button type="submit" className="w-full bg-slate-900 text-white rounded-2xl py-4 text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:bg-yellow-500 transition-all">Initialize Category</button>
                                    <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="w-full text-xs font-black uppercase tracking-[0.2em] text-slate-400 py-2">Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {/* ========== ORDER DETAILS MODAL (FULL MANIFEST) ========== */}
            {isOrderModalOpen && selectedOrder && (
                <div className="fixed inset-0 z-[250] flex items-center justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white h-full w-full max-w-2xl shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
                        {/* Header */}
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                            <div>
                                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">
                                    Order Manifest
                                </h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                    Internal Full Records — #{selectedOrder._id.toString().toUpperCase()}
                                </p>
                            </div>
                            <button onClick={() => setIsOrderModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-2xl transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/30">
                            {/* Section 1: Customer Profile */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white rounded-[2rem] p-6 border border-slate-200">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Customer Identity</h4>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-900 text-yellow-400 rounded-2xl flex items-center justify-center font-black">
                                            {(selectedOrder.user?.name || 'G')[0]}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-800 uppercase text-xs">{selectedOrder.user?.name || 'Guest User'}</p>
                                            <p className="text-[10px] text-slate-400 font-bold">{selectedOrder.user?.email || 'No email provided'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-[2rem] p-6 border border-slate-200">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Phone Contact</h4>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                            <TrendingUp size={18} />
                                        </div>
                                        <p className="font-black text-sm text-slate-700">{selectedOrder.shippingAddress?.phone || 'Not provided'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Shipping Destination */}
                            <div className="bg-white rounded-[2rem] p-8 border border-slate-200 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 ring-1 ring-slate-100"></div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 relative">Logistics Manifest (Address)</h4>
                                <div className="relative space-y-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Street Address</p>
                                        <p className="text-sm font-semibold text-slate-800">{selectedOrder.shippingAddress?.address}</p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">City</p>
                                            <p className="text-sm font-semibold text-slate-800">{selectedOrder.shippingAddress?.city}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Postal Code</p>
                                            <p className="text-sm font-semibold text-slate-800">{selectedOrder.shippingAddress?.postalCode}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Country</p>
                                            <p className="text-sm font-semibold text-slate-800">{selectedOrder.shippingAddress?.country}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Financial Manifest */}
                            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-300">
                                <div className="flex justify-between items-start mb-8">
                                    <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Financial Manifest</h4>
                                    <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${selectedOrder.isPaid ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/20 text-amber-400 border border-amber-500/20'}`}>
                                        {selectedOrder.isPaid ? 'Verified Payment' : 'Pending Authorization'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-8 mb-8">
                                    <div>
                                        <p className="text-[10px] font-bold text-white/30 uppercase mb-1">Transaction ID</p>
                                        <p className="text-sm font-black text-yellow-500">{selectedOrder.paymentResult?.id || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-white/30 uppercase mb-1">Payment Method</p>
                                        <p className="text-sm font-black">{selectedOrder.paymentMethod}</p>
                                    </div>
                                </div>
                                <div className="border-t border-white/10 pt-6 flex justify-between items-center">
                                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Net Revenue</p>
                                    <p className="text-3xl font-black text-white">৳{selectedOrder.totalPrice?.toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Section 4: Items Manifest */}
                            <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                                <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ordered Inventory</h4>
                                </div>
                                <div className="divide-y divide-slate-50">
                                    {selectedOrder.orderItems.map((item, idx) => (
                                        <div key={idx} className="p-6 flex items-center justify-between group hover:bg-slate-50/50 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white border border-slate-100 rounded-xl p-1 flex items-center justify-center">
                                                    <img src={item.image.startsWith('http') ? item.image : `${BASE_URL}${item.image}`} alt="" className="max-w-full max-h-full object-contain mix-blend-multiply" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">{item.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold tracking-widest">QUANTITY: {item.qty}</p>
                                                </div>
                                            </div>
                                            <p className="text-sm font-black text-slate-800">৳{(item.price * item.qty).toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 md:p-8 border-t border-slate-100 bg-white flex flex-col md:flex-row gap-4">
                            <button onClick={() => setIsOrderModalOpen(false)} className="w-full md:px-8 bg-slate-900 text-white rounded-2xl py-4 text-xs font-black uppercase tracking-[0.2em] hover:bg-yellow-500 transition-all">
                                Close Manifest
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboardPage;
