import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom"
import { registerUser, verifyRegistration, resendOTP } from "../api/authAPI";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const schema = z.object({
    name: z.string().min(2, "Name is too short").max(20, "Name can't be more than 20 characters"),
    email: z.email('Invalid email address'),
    password: z.string()
        .min(6, 'Password must be at least 6 characters')
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string(),
}).refine(
    (data) => data.password === data.confirmPassword,
    {
        message: "Passwords don't match",
        path: ['confirmPassword']
    }
)

const otpSchema = z.object({
    otp: z.string().length(6, 'OTP must be 6 digits')
})

const Register = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [resending, setResending] = useState(false);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(schema),
    });

    const otpForm = useForm({
        resolver: zodResolver(otpSchema)
    });

    const onSubmit = async (data) => {
        try {
            await registerUser(data);
            setEmail(data.email);
            toast.success('OTP sent to your email!');
            setStep(2);
        } catch (err) {
            toast.error(err.response?.data?.message || "Registration failed");
        }
    }

    const onOTPSubmit = async (data) => {
        try {
            const res = await verifyRegistration({ email, otp: data.otp });
            login(res.data);
            toast.success('Welcome to equil!');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid OTP');
        }
    }

    const handleResend = async () => {
        setResending(true);
        try {
            await resendOTP({ email, type: 'register' });
            toast.success('OTP resent!');
        } catch (err) {
            toast.error('Failed to resend OTP');
            console.log(err);
        } finally {
            setResending(false);
        }
    }

    return (
        <div>
            <Link to="/">
                <button className="btn btn-square m-10">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18" />
                    </svg>
                </button>
            </Link>

            {step === 1 ? (
                <form onSubmit={handleSubmit(onSubmit)} className="flex items-center justify-center font-data">
                    <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4 text-base">
                        <legend className="fieldset-legend">Register</legend>
                        <h1 className="font-heading text-2xl font-black tracking-tight text-primary pb-4">Hello There!<br></br>Welcome to, <span className="text-neutral">equil.</span></h1>

                        <label className="label">Name</label>
                        <input {...register("name")} type="text" className="input" placeholder="Name" />
                        {errors.name && <span className="text-error text-xs">{errors.name.message}</span>}

                        <label className="label">Email</label>
                        <input {...register("email")} type="email" className="input" placeholder="Email" />
                        {errors.email && <span className="text-error text-xs">{errors.email.message}</span>}

                        <label className="label">Password</label>
                        <input {...register("password")} type="password" className="input" placeholder="Password" />
                        {errors.password && <span className="text-error text-xs">{errors.password.message}</span>}

                        <label className="label">Confirm Password</label>
                        <input {...register("confirmPassword")} type="password" className="input" placeholder="Password" />
                        {errors.confirmPassword && <span className="text-error text-xs">{errors.confirmPassword.message}</span>}

                        <Link to="/login"><small className="text-sm underline">Existing user? Login instead!</small></Link>

                        <button className="btn btn-neutral mt-4 " disabled={isSubmitting}>{isSubmitting ? <span className="loading loading-spinner loading-sm" /> : 'Register'}</button>
                        <div className="divider font-data text-xs">OR</div>
                                <a href="http://localhost:3000/api/auth/google"
                                    className="btn btn-outline w-full gap-2 font-data"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                                        <path fill="none" d="M0 0h48v48H0z" />
                                    </svg>
                                    Continue with Google
                                </a>
                    </fieldset>
                </form>
            ) : (
                <form onSubmit={otpForm.handleSubmit(onOTPSubmit)} className="flex items-center justify-center font-data">
                    <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4 text-base">
                        <legend className="fieldset-legend">Verify Email</legend>
                        <h1 className="font-heading text-2xl font-black tracking-tight text-primary pb-2">Check your email</h1>
                        <p className="font-sans text-sm text-neutral/60 mb-4">
                            We sent a 6-digit code to <strong>{email}</strong>
                        </p>
                        <label className="label font-data text-sm">OTP Code</label>
                        <input
                            {...otpForm.register('otp')}
                            type="text"
                            maxLength={6}
                            autoComplete="off"
                            className="input w-full tracking-widest text-center text-xl font-data"
                            placeholder="000000"
                        />
                        {otpForm.formState.errors.otp && (
                            <span className="text-error text-xs">{otpForm.formState.errors.otp.message}</span>
                        )}
                        <button
                            type="submit"
                            disabled={otpForm.formState.isSubmitting}
                            className="btn btn-neutral w-full mt-4"
                        >
                            {otpForm.formState.isSubmitting
                                ? <span className="loading loading-spinner loading-sm" />
                                : 'Verify & Create Account'
                            }
                        </button>
                        <div className="flex justify-between items-center mt-2">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="btn btn-ghost btn-sm"
                            >
                                ← Back
                            </button>
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={resending}
                                className="btn btn-ghost btn-sm"
                            >
                                {resending
                                    ? <span className="loading loading-spinner loading-xs" />
                                    : 'Resend OTP'
                                }
                            </button>
                        </div>
                    </fieldset>
                </form>
            )}
        </div>
    )
}

export default Register