import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom"
import { registerUser } from "../api/authAPI";
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

const Register = () => {
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(schema),
    });

    const { login } = useAuth()

    const onSubmit = async (data) => {
        try {
            const res = await registerUser(data);
            login(res.data);
            toast.success('Welcome to equil!')
            navigate('/dashboard')
        } catch (err) {
            toast.error(err.response?.data?.message || "Login failed");
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
            <form onSubmit={handleSubmit(onSubmit)} className="flex items-center justify-center font-data">
                <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4 text-base">
                    <legend className="fieldset-legend">Register</legend>
                    <h1 className="font-heading text-2xl font-black tracking-tight text-primary pb-4">Hello There!<br></br>Welcome to, <span className="text-neutral">equil.</span></h1>

                    <label className="label">Name</label>
                    <input {...register("name")} type="text" className="input" placeholder="Name" />
                    {errors.name && <span>{errors.name.message}</span>}

                    <label className="label">Email</label>
                    <input {...register("email")} type="email" className="input" placeholder="Email" />
                    {errors.email && <span>{errors.email.message}</span>}

                    <label className="label">Password</label>
                    <input {...register("password")} type="password" className="input" placeholder="Password" />
                    {errors.password && <span>{errors.password.message}</span>}

                    <label className="label">Confirm Password</label>
                    <input {...register("confirmPassword")} type="password" className="input" placeholder="Password" />
                    {errors.confirmPassword && <span>{errors.confirmPassword.message}</span>}

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
        </div>
    )
}

export default Register