import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom"
import { registerUser } from "../api/authAPI";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
    name: z.string().min(2, "Name is too short").max(20, "Name can't be more than 20 characters"),
    email: z.email('Invalid email address'),
    password: z.string()
        .min(6, 'Password must be at least 6 characters')
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
})

const Register = () => {
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data) => {
        try {
            const res = await registerUser(data);
            localStorage.setItem('user', JSON.stringify(res.data));
            console.log("Registration success!");

            navigate("/login");
        } catch (err) {
            alert(err.response?.data?.message || "Login failed");
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

                    <Link to="/login"><small className="text-sm underline">Existing user? Login instead!</small></Link>

                    <button className="btn btn-neutral mt-4">Register</button>
                </fieldset>
            </form>
        </div>
    )
}

export default Register