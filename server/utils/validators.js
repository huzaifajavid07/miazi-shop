import { z } from 'zod';

// User Schemas
export const registerUserSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters').max(50),
        email: z.string().email('Invalid email address'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
    })
});

export const authUserSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(1, 'Password is required'),
    })
});

export const forgotPasswordSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
    })
});

export const resetPasswordSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        otp: z.string().length(6, 'OTP must be exactly 6 digits'),
        newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    })
});

// Order Schema
export const createOrderSchema = z.object({
    body: z.object({
        orderItems: z.array(z.object({
            name: z.string(),
            qty: z.number().int().positive(),
            image: z.string(),
            price: z.number(),
            product: z.string()
        })).min(1, 'Order must contain at least one item'),
        shippingAddress: z.object({
            address: z.string(),
            city: z.string(),
            postalCode: z.string().optional(),
            country: z.string(),
            fullName: z.string().optional(),
            phone: z.string(),
            lat: z.number().nullable().optional(),
            lng: z.number().nullable().optional(),
        }),
        paymentMethod: z.string(),
        itemsPrice: z.number(),
        taxPrice: z.number(),
        shippingPrice: z.number(),
        totalPrice: z.number(),
        paymentScreenshot: z.string().nullable().optional(),
    })
});
