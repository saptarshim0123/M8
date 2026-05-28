const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

const sendOTPEmail = async (email, otp, type = 'reset') => {
    const subjects = {
        reset: 'Reset your equil password',
        twofa: 'Your equil login verification code',
        register: 'Verify your equil account'
    }

    const intros = {
        reset: 'You requested to reset your password.',
        twofa: 'Someone is trying to log in to your equil account.',
        register: 'Welcome to equil! Please verify your email to complete registration.'
    }
    try {
        const data = await resend.emails.send({
            from: `equil. <${FROM_EMAIL}>`,
            to: [email],
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

        console.log(`Email sent successfully to ${email}`);
        return { success: true, messageId: data.id };
    } catch (err) {
        console.log("ACTUAL ERROR:", err);
        throw new Error('Failed to send verification email');
    }
};

const sendTherapistPendingEmail = async (therapistName, therapistEmail) => {
    const User = require('../models/User');
    try {
        const admins = await User.find({ role: 'admin' }).select('email');
        if (!admins.length) {
            console.log('No admin users found to notify about therapist signup');
            return;
        }

        const adminEmails = admins.map(a => a.email);

        await resend.emails.send({
            from: `equil. Admin <${FROM_EMAIL}>`,
            to: adminEmails,
            subject: 'New Therapist Awaiting Approval — equil',
            html: `
            <div style="font-family: 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 36px; background: #fffcf7; border-radius: 16px;">
                <h1 style="font-size: 24px; font-weight: 700; color: #3d2b1f; margin-bottom: 4px;">equil.</h1>
                <p style="color: #9ca3af; font-size: 13px; margin-top: 0;">Admin Notification</p>

                <div style="background: #fff7ed; border-left: 4px solid #d97706; border-radius: 8px; padding: 20px; margin: 24px 0;">
                    <p style="color: #92400e; font-weight: 600; margin: 0 0 8px 0; font-size: 16px;">🩺 New Therapist Registration</p>
                    <p style="color: #78716c; margin: 4px 0;"><strong>Name:</strong> ${therapistName}</p>
                    <p style="color: #78716c; margin: 4px 0;"><strong>Email:</strong> ${therapistEmail}</p>
                </div>

                <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                    A new therapist has registered on equil and is awaiting your verification. 
                    Please review their credentials and license documentation in the admin dashboard.
                </p>

                <a href="${process.env.CLIENT_URL}/admin" 
                   style="display: inline-block; background: #7a5c3a; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; margin-top: 16px;">
                    Open Admin Dashboard
                </a>

                <hr style="border: none; border-top: 1px solid #e8d8c4; margin: 28px 0;" />
                <p style="color: #9ca3af; font-size: 12px;">equil — AI-Driven Journaling with Mood & Cognitive Analysis</p>
            </div>
        `
        });
        console.log(`Therapist pending notification sent to admins`);
    } catch (err) {
        console.error('Failed to send therapist pending email to admins:', err.message);
    }
};

const sendTherapistApprovedEmail = async (therapistEmail, therapistName, practiceCode) => {
    try {
        await resend.emails.send({
            from: `equil. <${FROM_EMAIL}>`,
            to: [therapistEmail],
            subject: 'You\'re Approved! Welcome to equil 🎉',
            html: `
            <div style="font-family: 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 36px; background: #fffcf7; border-radius: 16px;">
                <h1 style="font-size: 24px; font-weight: 700; color: #3d2b1f; margin-bottom: 4px;">equil.</h1>
                <p style="color: #9ca3af; font-size: 13px; margin-top: 0;">Therapist Verification</p>

                <div style="background: #ecfdf5; border-left: 4px solid #059669; border-radius: 8px; padding: 20px; margin: 24px 0;">
                    <p style="color: #065f46; font-weight: 600; margin: 0 0 8px 0; font-size: 16px;">✅ Account Verified</p>
                    <p style="color: #6b7280; margin: 0;">
                        Congratulations, <strong>${therapistName}</strong>! Your therapist account has been reviewed and approved.
                    </p>
                </div>

                <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                    Your unique practice code is:
                </p>
                <div style="background: #f5ede0; border-radius: 12px; padding: 20px; text-align: center; margin: 16px 0;">
                    <span style="font-size: 32px; font-weight: 700; letter-spacing: 4px; color: #7a5c3a;">
                        ${practiceCode}
                    </span>
                </div>
                <p style="color: #6b7280; font-size: 13px; line-height: 1.6;">
                    Share this code with your clients so they can connect with you on equil. You can also find it in your therapist dashboard.
                </p>

                <a href="${process.env.CLIENT_URL}/therapist/dashboard" 
                   style="display: inline-block; background: #7a5c3a; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; margin-top: 16px;">
                    Go to Your Dashboard
                </a>

                <hr style="border: none; border-top: 1px solid #e8d8c4; margin: 28px 0;" />
                <p style="color: #9ca3af; font-size: 12px;">equil — AI-Driven Journaling with Mood & Cognitive Analysis</p>
            </div>
        `
        });
        console.log(`Approval email sent to therapist: ${therapistEmail}`);
    } catch (err) {
        console.error('Failed to send therapist approval email:', err.message);
    }
};

module.exports = { sendOTPEmail, sendTherapistPendingEmail, sendTherapistApprovedEmail };