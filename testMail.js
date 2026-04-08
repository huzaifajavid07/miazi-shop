import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: './server/.env' });

const testEmail = async () => {
    console.log('--- Email Diagnostic Started ---');
    console.log('Service:', process.env.EMAIL_SERVICE);
    console.log('User:', process.env.EMAIL_USER);
    console.log('Pass:', process.env.EMAIL_PASS ? '********' : 'MISSING');

    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    try {
        console.log('Verifying connection...');
        await transporter.verify();
        console.log('✅ Connection Successful!');

        console.log('Sending test mail...');
        const info = await transporter.sendMail({
            from: `"Diagnostic Meta" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Send to self
            subject: 'SMTP Diagnostic Test - Miazi Shop',
            text: 'If you see this, your email system is fully functional.',
            html: '<b>Miazi Shop</b> Email System: Status 100% OK',
        });

        console.log('✅ Message sent: %s', info.messageId);
    } catch (error) {
        console.error('❌ Connection/Send Failed:');
        console.error(error);
    }
};

testEmail();
