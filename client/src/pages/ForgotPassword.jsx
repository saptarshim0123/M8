import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { forgotPassword, resetPassword } from '../api/authAPI'

const emailSchema = z.object({
    email: z.string().email('Invalid email')
})

const resetSchema = z.object({
    otp: z.string().length(6, 'OTP must be 6 digits'),
    newPassword: z.string()
        .min(6, 'At least 6 characters')
        .regex(/[A-Z]/, 'Must contain uppercase')
        .regex(/[0-9]/, 'Must contain number')
        .regex(/[^A-Za-z0-9]/, 'Must contain special character'),
    confirmPassword: z.string()
}).refine(d => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
})

const ForgotPassword = () => {
    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const [email, setEmail] = useState('')

    const emailForm = useForm({ resolver: zodResolver(emailSchema) })
    const resetForm = useForm({ resolver: zodResolver(resetSchema) })

    const onEmailSubmit = async (data) => {
        try {
            await forgotPassword({ email: data.email })
            setEmail(data.email)
            toast.success('OTP sent to your email!')
            setStep(2)
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send OTP')
        }
    }

    const onResetSubmit = async (data) => {
        try {
            await resetPassword({
                email,
                otp: data.otp,
                newPassword: data.newPassword
            })
            toast.success('Password reset successfully!')
            navigate('/login')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reset password')
        }
    }

    return (
        <div>
            <Link to="/login">
                <button className="btn btn-square m-10">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18" />
                    </svg>
                </button>
            </Link>

            <div className="flex items-center justify-center">
                <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-6">
                    <legend className="fieldset-legend">
                        {step === 1 ? 'Forgot Password' : 'Reset Password'}
                    </legend>

                    {step === 1 ? (
                        <>
                            <h1 className="font-heading text-2xl font-black text-primary pb-2">
                                Forgot your password?
                            </h1>
                            <p className="font-sans text-sm text-neutral/60 mb-4">
                                Enter your email and we'll send you a 6-digit OTP.
                            </p>
                            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="flex flex-col gap-3">
                                <label className="label font-data text-sm">Email</label>
                                <input
                                    {...emailForm.register('email')}
                                    type="email"
                                    className="input w-full"
                                    placeholder="your@email.com"
                                />
                                {emailForm.formState.errors.email && (
                                    <p className="text-error text-xs">{emailForm.formState.errors.email.message}</p>
                                )}
                                <button
                                    type="submit"
                                    disabled={emailForm.formState.isSubmitting}
                                    className="btn btn-primary w-full mt-2"
                                >
                                    {emailForm.formState.isSubmitting
                                        ? <span className="loading loading-spinner loading-sm" />
                                        : 'Send OTP'
                                    }
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            <h1 className="font-heading text-2xl font-black text-primary pb-2">
                                Check your email
                            </h1>
                            <p className="font-sans text-sm text-neutral/60 mb-4">
                                We sent a 6-digit code to <strong>{email}</strong>
                            </p>
                            <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="flex flex-col gap-3">
                                <label className="label font-data text-sm">OTP Code</label>
                                <input
                                    {...resetForm.register('otp')}
                                    type="text"
                                    maxLength={6}
                                    autoComplete="off"
                                    className="input w-full tracking-widest text-center text-xl font-data"
                                    placeholder="000000"
                                />
                                {resetForm.formState.errors.otp && (
                                    <p className="text-error text-xs">{resetForm.formState.errors.otp.message}</p>
                                )}
                                <label className="label font-data text-sm">New Password</label>
                                <input
                                    {...resetForm.register('newPassword')}
                                    type="password"
                                    className="input w-full"
                                    placeholder="New password"
                                />
                                {resetForm.formState.errors.newPassword && (
                                    <p className="text-error text-xs">{resetForm.formState.errors.newPassword.message}</p>
                                )}
                                <label className="label font-data text-sm">Confirm Password</label>
                                <input
                                    {...resetForm.register('confirmPassword')}
                                    type="password"
                                    className="input w-full"
                                    placeholder="Confirm password"
                                />
                                {resetForm.formState.errors.confirmPassword && (
                                    <p className="text-error text-xs">{resetForm.formState.errors.confirmPassword.message}</p>
                                )}
                                <button
                                    type="submit"
                                    disabled={resetForm.formState.isSubmitting}
                                    className="btn btn-primary w-full mt-2"
                                >
                                    {resetForm.formState.isSubmitting
                                        ? <span className="loading loading-spinner loading-sm" />
                                        : 'Reset Password'
                                    }
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="btn btn-ghost btn-sm"
                                >
                                    ← Use different email
                                </button>
                            </form>
                        </>
                    )}
                </fieldset>
            </div>
        </div>
    )
}

export default ForgotPassword