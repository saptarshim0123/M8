const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
});

const sendOTPEmail = async (email, otp, type = 'reset') => {
    const subjects = {
        reset: 'Reset your equil password',
        twofa: 'Your equil login verification code'
    }

    const intros = {
        reset: 'You requested to reset your password.',
        twofa: 'Someone is trying to log in to your equil account.'
    }
    try {
        const info = await transporter.sendMail({
            from: `"equil." <${process.env.GMAIL_USER}>`,
            to: email,
            subject: subjects[type],
            html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
                <h1 style="font-size: 24px; font-weight: 700; color: #3d2b1f;">equil.</h1>
                <p style="color: #6b7280; margin-top: 16px;">${intros[type]}</p>
                <p style="color: #6b7280;">Your verification code is:</p>
                <div style="background: #f5ede0; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
                    <span style="font-size: 40px; font-weight: 700; letter-spacing: 8px; color: #7a5c3a;">
                        ${otp}
                    </span>
                </div>
                <p style="color: #6b7280; font-size: 14px;">This code expires in <strong>10 minutes</strong>.</p>
                <p style="color: #6b7280; font-size: 14px;">If you didn't request this, ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #e8d8c4; margin: 24px 0;" />
                <p style="color: #9ca3af; font-size: 12px;">equil — AI-Driven Journaling with Mood & Cognitive Analysis</p>
            </div>
        `
        });
        console.log(`Email sent successfully to ${email}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.log("ACTUAL ERROR:", err);
        throw new Error('Failed to send verification email');
    }
};

module.exports = { sendOTPEmail };