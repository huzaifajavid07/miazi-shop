import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const testConnection = async () => {
    console.log('Testing MONGO_URI:', process.env.MONGO_URI);
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log('✅ Success: MongoDB Connected!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Failure: Connection Error:', error.message);
        process.exit(1);
    }
};

testConnection();
