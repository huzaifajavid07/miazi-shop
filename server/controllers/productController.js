import asyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';
import Category from '../models/categoryModel.js';

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
    const pageSize = 12;
    const page = Number(req.query.pageNumber) || 1;

    const keyword = req.query.keyword
        ? {
            name: {
                $regex: req.query.keyword,
                $options: 'i',
            },
        }
        : {};

    const categoryFilter = req.query.category ? { category: req.query.category } : {};
    const trendingFilter = req.query.isTrending === 'true' ? { isTrending: true } : {};
    const dealsFilter = req.query.isDeals === 'true' ? { discountPrice: { $gt: 0 } } : {};

    const filterOptions = { ...keyword, ...categoryFilter, ...trendingFilter, ...dealsFilter };

    const count = await Product.countDocuments(filterOptions);
    const products = await Product.find(filterOptions)
        .populate('category', 'name slug')
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    res.json({ products, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Fetch single product by ID or Slug
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    let product;

    // Check if the provided ID is a valid MongoDB ObjectId
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);

    if (isObjectId) {
        product = await Product.findById(id).populate('category', 'name slug');
    } else {
        // If not a valid ID, search by Slug
        product = await Product.findOne({ slug: id }).populate('category', 'name slug');
    }

    if (product) {
        res.json(product);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
    const { name, price, discountPrice, description, images, brand, category, countInStock, isFeatured, isTrending } = req.body;

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();

    const product = new Product({
        name,
        slug,
        price: Number(price),
        discountPrice: Number(discountPrice) || 0,
        user: req.user._id,
        images: images && images.length > 0 ? images : ['https://via.placeholder.com/400'],
        brand,
        category,
        countInStock: Number(countInStock) || 0,
        numReviews: 0,
        description,
        isFeatured: isFeatured || false,
        isTrending: isTrending || false,
    });

    const createdProduct = await product.save();
    const populated = await createdProduct.populate('category', 'name slug');
    res.status(201).json(populated);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
    const {
        name,
        slug,
        price,
        discountPrice,
        description,
        images,
        brand,
        category,
        countInStock,
        isFeatured,
        isTrending
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
        product.name = name || product.name;
        product.slug = slug || product.slug;
        product.price = price || product.price;
        product.discountPrice = discountPrice || product.discountPrice;
        product.description = description || product.description;
        product.images = images || product.images;
        product.brand = brand || product.brand;
        product.category = category || product.category;
        product.countInStock = countInStock || product.countInStock;
        product.isFeatured = isFeatured !== undefined ? isFeatured : product.isFeatured;
        product.isTrending = isTrending !== undefined ? isTrending : product.isTrending;

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        await product.deleteOne();
        res.json({ message: 'Product removed' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
        const alreadyReviewed = product.reviews.find(
            (r) => r.user.toString() === req.user._id.toString()
        );

        if (alreadyReviewed) {
            res.status(400);
            throw new Error('Product already reviewed');
        }

        const review = {
            name: req.user.name,
            rating: Number(rating),
            comment,
            user: req.user._id,
        };

        product.reviews.push(review);

        product.numReviews = product.reviews.length;

        product.rating =
            product.reviews.reduce((acc, item) => item.rating + acc, 0) /
            product.reviews.length;

        await product.save();
        res.status(201).json({ message: 'Review added' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Get product suggestions for search bar
// @route   GET /api/products/suggestions
// @access  Public
const getProductSuggestions = asyncHandler(async (req, res) => {
    const keyword = req.query.keyword
        ? {
            name: {
                $regex: req.query.keyword,
                $options: 'i',
            },
        }
        : {};

    const products = await Product.find({ ...keyword })
        .populate('category', 'name slug')
        .select('name slug images category price')
        .limit(8);

    res.json(products);
});

export {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    createProductReview,
    getProductSuggestions,
};
