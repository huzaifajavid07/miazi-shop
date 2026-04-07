import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/userModel.js';
import Category from './models/categoryModel.js';
import Product from './models/productModel.js';
import connectDB from './config/db.js';
import slugify from 'slugify';

dotenv.config();

connectDB();

const seedData = async () => {
    try {
        // Clear existing data
        await Product.deleteMany();
        await Category.deleteMany();

        // Admin User
        let admin = await User.findOne({ isAdmin: true });
        if (!admin) {
             admin = await User.create({
                name: 'Admin Saad',
                email: 'saad489254@gmail.com',
                password: 'admin123',
                isAdmin: true,
            });
            console.log('✅ Admin user created');
        }

        const adminId = admin._id;

        // Categories from Footer
        const categoriesData = [
            { name: 'Laptops & Computers' },
            { name: 'Cameras & Photography' },
            { name: 'Smart Phones & Tablets' },
            { name: 'Video Games & Consoles' },
            { name: 'TV & Audio' },
        ];

        const categories = {};
        for (const cat of categoriesData) {
            const slug = slugify(cat.name, { lower: true });
            const category = await Category.create({
                name: cat.name,
                slug: slug,
                image: ''
            });
            categories[cat.name] = category._id;
            console.log(`✅ Category created: ${cat.name}`);
        }

        // Products (2 per category)
        const productsData = [
            // Laptops
            {
                name: 'MacBook Pro 14 (M3 Chip)',
                brand: 'Apple',
                price: 220000,
                description: 'The latest MacBook Pro with the powerful M3 chip, 8GB RAM, and 512GB SSD. Stunning Liquid Retina XDR display.',
                images: ['https://images.unsplash.com/photo-1517336714460-4c5049c072e9?q=80&w=1000&auto=format&fit=crop'],
                category: 'Laptops & Computers',
                countInStock: 10,
                isFeatured: true
            },
            {
                name: 'Dell XPS 15 (2024)',
                brand: 'Dell',
                price: 185000,
                description: 'Ultra-premium Dell laptop with 13th Gen Intel Core i7, 16GB RAM, and 512GB SSD. Gorgeous InfinityEdge display.',
                images: ['https://images.unsplash.com/photo-1593642828176-23fe05f88cca?q=80&w=1000&auto=format&fit=crop'],
                category: 'Laptops & Computers',
                countInStock: 5,
                isTrending: true
            },
            // Cameras
            {
                name: 'Sony Alpha A7 IV',
                brand: 'Sony',
                price: 245000,
                description: 'Professional full-frame mirrorless camera with 33MP sensor, advanced AI autofocus, and 4K 60p video capabilities.',
                images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop'],
                category: 'Cameras & Photography',
                countInStock: 8,
                isFeatured: true
            },
            {
                name: 'Canon EOS R6 Mark II',
                brand: 'Canon',
                price: 230000,
                description: 'High-speed full-frame mirrorless camera for enthusiasts, featuring 24.2 MP, amazing dual-pixel AF, and 40fps burst shooting.',
                images: ['https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?q=80&w=1000&auto=format&fit=crop'],
                category: 'Cameras & Photography',
                countInStock: 6
            },
            // Smart Phones
            {
                name: 'Samsung Galaxy S24 Ultra',
                brand: 'Samsung',
                price: 145000,
                description: 'The ultimate Android smartphone with Galaxy AI, Titanium frame, 200MP camera, and built-in S Pen.',
                images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=1000&auto=format&fit=crop'],
                category: 'Smart Phones & Tablets',
                countInStock: 15,
                isTrending: true
            },
            {
                name: 'iPad Pro 12.9 (M2 chip)',
                brand: 'Apple',
                price: 125000,
                description: 'Most powerful tablet experience with M2 chip, Liquid Retina XDR display, and support for Apple Pencil and Magic Keyboard.',
                images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=1000&auto=format&fit=crop'],
                category: 'Smart Phones & Tablets',
                countInStock: 12
            },
            // Gaming
            {
                name: 'PlayStation 5 Disc Edition',
                brand: 'Sony',
                price: 65000,
                description: 'The latest PlayStation with lightning-fast loading, stunning 4K 120Hz graphics, and immersive DualSense controller.',
                images: ['https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=1000&auto=format&fit=crop'],
                category: 'Video Games & Consoles',
                countInStock: 20,
                isFeatured: true
            },
            {
                name: 'Xbox Series X',
                brand: 'Microsoft',
                price: 62000,
                description: 'The most powerful Xbox ever, featuring 12 teraflops of processing power, true 4K gaming, and backward compatibility.',
                images: ['https://images.unsplash.com/photo-1605901309584-818e25960a8f?q=80&w=1000&auto=format&fit=crop'],
                category: 'Video Games & Consoles',
                countInStock: 18
            },
            // TV & Audio
            {
                name: 'LG C3 55-inch OLED 4K',
                brand: 'LG',
                price: 165000,
                description: 'Premium 4K OLED TV with self-lit pixels, perfect blacks, a9 AI Processor Gen6, and immersive Dolby Atmos sound.',
                images: ['https://images.unsplash.com/photo-1593359677771-4830107297e5?q=80&w=1000&auto=format&fit=crop'],
                category: 'TV & Audio',
                countInStock: 4,
                isTrending: true
            },
            {
                name: 'Bose QuietComfort Ultra',
                brand: 'Bose',
                price: 45000,
                description: 'The ultimate noise-cancelling headphones with breakthrough spatial audio, world-class quiet, and CustomTune technology.',
                images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop'],
                category: 'TV & Audio',
                countInStock: 25
            },
        ];

        for (const item of productsData) {
            const slug = slugify(item.name, { lower: true });
            await Product.create({
                ...item,
                user: adminId,
                category: categories[item.category],
                slug: slug,
                discountPrice: 0,
                rating: 4.5 + Math.random() * 0.5,
                numReviews: Math.floor(Math.random() * 50) + 10,
            });
            console.log(`✅ Product created: ${item.name}`);
        }

        console.log('\n🎉 Seeding complete!');
        process.exit();
    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        process.exit(1);
    }
};

seedData();
