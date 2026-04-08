import mongoose from 'mongoose';

const paymentIntentSchema = new mongoose.Schema({
    tran_id: {
        type: String,
        required: true,
        unique: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    orderData: {
        orderItems: [{
            name: { type: String, required: true },
            qty: { type: Number, required: true },
            image: { type: String, required: true },
            price: { type: Number, required: true },
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }
        }],
        shippingAddress: {
            address: { type: String },
            city: { type: String },
            postalCode: { type: String },
            country: { type: String },
            phone: { type: String }
        },
        itemsPrice: { type: Number },
        shippingPrice: { type: Number },
        taxPrice: { type: Number },
        totalPrice: { type: Number },
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed', 'Cancelled'],
        default: 'Pending',
    },
    expiresAt: {
        type: Date,
        default: () => Date.now() + 3600000, // Expires in 1 hour
    }
}, {
    timestamps: true,
});

// Automatically delete expired intents
paymentIntentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PaymentIntent = mongoose.model('PaymentIntent', paymentIntentSchema);

export default PaymentIntent;
