import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import api, { BASE_URL } from '../utils/axiosConfig';
import { toast } from 'react-toastify';
import { Package, Users, ShoppingBag, Layers, Plus, Trash2, Edit, Loader, X, Upload } from 'lucide-react';

const AdminDashboardPage = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('products');
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    // Product Form State
    const [showProductForm, setShowProductForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [productForm, setProductForm] = useState({
        name: '', price: '', discountPrice: '', description: '', brand: '', countInStock: '', category: '', images: ['']
    });

    // Category Form State
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', image: '' });

    useEffect(() => {
        if (!userInfo || !userInfo.isAdmin) {
            navigate('/login');
            return;
        }
        fetchData();
    }, [userInfo, navigate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [prodRes, catRes, ordRes] = await Promise.all([
                api.get('/api/products'),
                api.get('/api/categories'),
                api.get('/api/orders'),
            ]);
            setProducts(prodRes.data.products || []);
            setCategories(catRes.data || []);
            setOrders(ordRes.data || []);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    // ============== PRODUCT CRUD ==============
    const resetProductForm = () => {
        setProductForm({ name: '', price: '', discountPrice: '', description: '', brand: '', countInStock: '', category: '', images: [''] });
        setEditingProduct(null);
        setShowProductForm(false);
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...productForm,
                price: Number(productForm.price),
                discountPrice: Number(productForm.discountPrice) || 0,
                countInStock: Number(productForm.countInStock),
                slug: productForm.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
                images: productForm.images.filter(img => img.trim() !== ''),
            };

            if (editingProduct) {
                await api.put(`/api/products/${editingProduct._id}`, payload);
                toast.success('Product updated!');
            } else {
                // Create and then update
                const res = await api.post('/api/products', { categoryId: payload.category });
                await api.put(`/api/products/${res.data._id}`, payload);
                toast.success('Product created!');
            }
            resetProductForm();
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed');
        }
    };

    const editProduct = (p) => {
        setProductForm({
            name: p.name, price: p.price, discountPrice: p.discountPrice || '', description: p.description,
            brand: p.brand, countInStock: p.countInStock, category: p.category?._id || p.category || '',
            images: p.images?.length ? p.images : ['']
        });
        setEditingProduct(p);
        setShowProductForm(true);
    };

    const deleteProduct = async (id) => {
        if (!window.confirm('Delete this product?')) return;
        try {
            await api.delete(`/api/products/${id}`);
            toast.success('Product deleted');
            fetchData();
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);
        try {
            const { data } = await api.post('/api/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setProductForm(prev => ({ ...prev, images: [data.image, ...prev.images.filter(i => i)] }));
            toast.success('Image uploaded!');
        } catch (err) {
            toast.error('Upload failed');
        }
    };

    // ============== CATEGORY CRUD ==============
    const resetCategoryForm = () => {
        setCategoryForm({ name: '', slug: '', image: '' });
        setEditingCategory(null);
        setShowCategoryForm(false);
    };

    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...categoryForm, slug: categoryForm.slug || categoryForm.name.toLowerCase().replace(/\s+/g, '-') };
            if (editingCategory) {
                await api.put(`/api/categories/${editingCategory._id}`, payload);
                toast.success('Category updated!');
            } else {
                await api.post('/api/categories', payload);
                toast.success('Category created!');
            }
            resetCategoryForm();
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed');
        }
    };

    const deleteCategory = async (id) => {
        if (!window.confirm('Delete this category?')) return;
        try {
            await api.delete(`/api/categories/${id}`);
            toast.success('Category deleted');
            fetchData();
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    // ============== ORDER STATUS ==============
    const updateOrderStatus = async (orderId, status) => {
        try {
            await api.put(`/api/orders/${orderId}/status`, { status });
            toast.success(`Order marked as ${status}`);
            fetchData();
        } catch (err) {
            toast.error('Failed to update');
        }
    };

    if (loading && products.length === 0) {
        return (
            <div className="flex justify-center items-center py-32">
                <Loader size={40} className="animate-spin text-[#fed700]" />
            </div>
        );
    }

    return (
        <div className="container-custom py-8">
            <h1 className="text-2xl font-extrabold mb-6">Admin Dashboard</h1>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-[#fed700] p-4 rounded-xl"><p className="text-sm font-bold opacity-70">Products</p><p className="text-2xl font-extrabold">{products.length}</p></div>
                <div className="bg-white border p-4 rounded-xl"><p className="text-sm font-bold text-gray-500">Categories</p><p className="text-2xl font-extrabold text-blue-600">{categories.length}</p></div>
                <div className="bg-white border p-4 rounded-xl"><p className="text-sm font-bold text-gray-500">Orders</p><p className="text-2xl font-extrabold text-green-600">{orders.length}</p></div>
                <div className="bg-white border p-4 rounded-xl"><p className="text-sm font-bold text-gray-500">Revenue</p><p className="text-2xl font-extrabold text-purple-600">৳{orders.reduce((a, o) => a + (o.totalPrice || 0), 0).toLocaleString()}</p></div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b pb-0 overflow-x-auto">
                {[
                    { key: 'products', label: 'Products', icon: <Package size={16} /> },
                    { key: 'categories', label: 'Categories', icon: <Layers size={16} /> },
                    { key: 'orders', label: 'Orders', icon: <ShoppingBag size={16} /> },
                ].map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-bold transition whitespace-nowrap ${activeTab === tab.key ? 'border-b-2 border-[#fed700] text-[#333e48]' : 'text-gray-400 hover:text-gray-600'}`}>
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* ============== PRODUCTS TAB ============== */}
            {activeTab === 'products' && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold">All Products ({products.length})</h2>
                        <button onClick={() => { resetProductForm(); setShowProductForm(true); }}
                            className="bg-[#333e48] text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-black transition">
                            <Plus size={16} /> Add Product
                        </button>
                    </div>

                    {/* Product Form Modal */}
                    {showProductForm && (
                        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-extrabold text-lg">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                                    <button onClick={resetProductForm} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                                </div>
                                <form onSubmit={handleProductSubmit} className="flex flex-col gap-3">
                                    <input type="text" required placeholder="Product Name" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})}
                                        className="border p-3 rounded-lg outline-none focus:border-[#fed700]" />
                                    <div className="grid grid-cols-3 gap-3">
                                        <input type="number" required placeholder="Price (৳)" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})}
                                            className="border p-3 rounded-lg outline-none focus:border-[#fed700]" />
                                        <input type="number" placeholder="Discount Price" value={productForm.discountPrice} onChange={e => setProductForm({...productForm, discountPrice: e.target.value})}
                                            className="border p-3 rounded-lg outline-none focus:border-[#fed700]" />
                                        <input type="number" required placeholder="Stock" value={productForm.countInStock} onChange={e => setProductForm({...productForm, countInStock: e.target.value})}
                                            className="border p-3 rounded-lg outline-none focus:border-[#fed700]" />
                                    </div>
                                    <input type="text" required placeholder="Brand" value={productForm.brand} onChange={e => setProductForm({...productForm, brand: e.target.value})}
                                        className="border p-3 rounded-lg outline-none focus:border-[#fed700]" />
                                    <select required value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})}
                                        className="border p-3 rounded-lg outline-none focus:border-[#fed700]">
                                        <option value="">Select Category</option>
                                        {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                    <textarea required placeholder="Description" rows="3" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})}
                                        className="border p-3 rounded-lg outline-none focus:border-[#fed700]" />
                                    
                                    {/* Image Upload */}
                                    <div className="border rounded-lg p-3">
                                        <label className="text-sm font-bold text-gray-700 block mb-2">Product Images</label>
                                        <label className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-200 transition text-sm font-semibold mb-2">
                                            <Upload size={16} /> Upload Image
                                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                        </label>
                                        <input type="text" placeholder="Or paste image URL" value={productForm.images[0] || ''} onChange={e => setProductForm({...productForm, images: [e.target.value]})}
                                            className="w-full border p-2 rounded mt-2 text-sm outline-none" />
                                        {productForm.images[0] && (
                                            <img src={productForm.images[0]?.startsWith('http') ? productForm.images[0] : `${BASE_URL}${productForm.images[0]}`} alt="Preview" className="w-20 h-20 object-contain mt-2 border rounded" />
                                        )}
                                    </div>
                                    
                                    <button type="submit" className="bg-[#fed700] text-[#333e48] font-extrabold py-3 rounded-full hover:bg-yellow-500 transition">
                                        {editingProduct ? 'Update Product' : 'Create Product'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Products Table */}
                    <div className="bg-white border rounded-xl overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-3">Image</th>
                                    <th className="p-3">Name</th>
                                    <th className="p-3">Price</th>
                                    <th className="p-3">Stock</th>
                                    <th className="p-3">Category</th>
                                    <th className="p-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center py-8 text-gray-400">No products yet. Click "Add Product" to create one.</td></tr>
                                ) : products.map(p => (
                                    <tr key={p._id} className="border-t hover:bg-gray-50">
                                        <td className="p-3"><img src={p.images?.[0]?.startsWith('http') ? p.images[0] : `${BASE_URL}${p.images?.[0]}` || 'https://via.placeholder.com/50'} alt="" className="w-12 h-12 object-contain rounded" /></td>
                                        <td className="p-3 font-semibold max-w-[200px] truncate">{p.name}</td>
                                        <td className="p-3 font-bold">৳{p.price}</td>
                                        <td className="p-3"><span className={`font-bold ${p.countInStock > 0 ? 'text-green-600' : 'text-red-500'}`}>{p.countInStock}</span></td>
                                        <td className="p-3 text-gray-500">{p.category?.name || '—'}</td>
                                        <td className="p-3 flex gap-2">
                                            <button onClick={() => editProduct(p)} className="text-blue-600 hover:text-blue-800 p-1"><Edit size={16} /></button>
                                            <button onClick={() => deleteProduct(p._id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ============== CATEGORIES TAB ============== */}
            {activeTab === 'categories' && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold">All Categories ({categories.length})</h2>
                        <button onClick={() => { resetCategoryForm(); setShowCategoryForm(true); }}
                            className="bg-[#333e48] text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-black transition">
                            <Plus size={16} /> Add Category
                        </button>
                    </div>

                    {showCategoryForm && (
                        <div className="bg-white border rounded-xl p-6 mb-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold">{editingCategory ? 'Edit Category' : 'New Category'}</h3>
                                <button onClick={resetCategoryForm} className="text-gray-400"><X size={18} /></button>
                            </div>
                            <form onSubmit={handleCategorySubmit} className="flex flex-col sm:flex-row gap-3">
                                <input type="text" required placeholder="Category Name" value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})}
                                    className="border p-3 rounded-lg outline-none flex-1 focus:border-[#fed700]" />
                                <input type="text" placeholder="Slug (auto)" value={categoryForm.slug} onChange={e => setCategoryForm({...categoryForm, slug: e.target.value})}
                                    className="border p-3 rounded-lg outline-none flex-1 focus:border-[#fed700]" />
                                <button type="submit" className="bg-[#fed700] text-[#333e48] font-bold px-6 py-3 rounded-lg hover:bg-yellow-500 transition whitespace-nowrap">
                                    {editingCategory ? 'Update' : 'Create'}
                                </button>
                            </form>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categories.length === 0 ? (
                            <p className="text-gray-400 col-span-full text-center py-8">No categories yet. Create one first before adding products.</p>
                        ) : categories.map(c => (
                            <div key={c._id} className="bg-white border rounded-xl p-4 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold">{c.name}</h3>
                                    <p className="text-xs text-gray-400">{c.slug}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => { setCategoryForm({ name: c.name, slug: c.slug, image: c.image || '' }); setEditingCategory(c); setShowCategoryForm(true); }}
                                        className="text-blue-600 hover:text-blue-800 p-1"><Edit size={16} /></button>
                                    <button onClick={() => deleteCategory(c._id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ============== ORDERS TAB ============== */}
            {activeTab === 'orders' && (
                <div>
                    <h2 className="font-bold mb-4">All Orders ({orders.length})</h2>
                    <div className="bg-white border rounded-xl overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-3">Order ID</th>
                                    <th className="p-3">Customer</th>
                                    <th className="p-3">Date</th>
                                    <th className="p-3">Total</th>
                                    <th className="p-3">Paid</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.length === 0 ? (
                                    <tr><td colSpan="7" className="text-center py-8 text-gray-400">No orders yet.</td></tr>
                                ) : orders.map(o => (
                                    <tr key={o._id} className="border-t hover:bg-gray-50">
                                        <td className="p-3 font-mono text-xs">{o._id.slice(-8)}</td>
                                        <td className="p-3 font-semibold">{o.user?.name || '—'}</td>
                                        <td className="p-3 text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                                        <td className="p-3 font-bold">৳{o.totalPrice?.toLocaleString()}</td>
                                        <td className="p-3">
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${o.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                                {o.isPaid ? 'Paid' : 'Not Paid'}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                                o.orderStatus === 'Delivered' ? 'bg-green-100 text-green-700' :
                                                o.orderStatus === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>{o.orderStatus || 'Processing'}</span>
                                        </td>
                                        <td className="p-3">
                                            <select onChange={(e) => updateOrderStatus(o._id, e.target.value)} defaultValue=""
                                                className="border rounded px-2 py-1 text-xs outline-none">
                                                <option value="" disabled>Update</option>
                                                <option value="Processing">Processing</option>
                                                <option value="Shipped">Shipped</option>
                                                <option value="Delivered">Delivered</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboardPage;
