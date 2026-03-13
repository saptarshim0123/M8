import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom"
import { loginUser } from "../api/authAPI";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
    email: z.email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters')
})

const Login = () => {
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data) => {
        
        try {
            const res = await loginUser(data);
            localStorage.setItem('user', JSON.stringify(res.data));
            console.log("Login success");

            navigate("/home");
        } catch (err) {
            alert(err.response?.data?.message || "Login failed");
        }
    }


    return (
        <>
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
                        <legend className="fieldset-legend">Login</legend>
                        <h1 className="font-heading text-2xl font-black tracking-tight text-primary pb-4">Welcome Back!</h1>

                        <label className="label">Email</label>
                        <input {...register("email")} type="email" className="input" placeholder="Email" />
                        {errors.email && <span>{errors.email.message}</span>}

                        <label className="label">Password</label>
                        <input {...register("password")} type="password" className="input" placeholder="Password" />
                        {errors.password && <span>{errors.password.message}</span>}

                        <a className="text-sm underline" href="">Forgot password?</a>
                        <Link to="/register"><small className="text-sm underline" >New user? Register instead!</small></Link>

                        <button className="btn btn-neutral mt-4">Login</button>
                    </fieldset>
                </form>
            </div>
        </>
    )
}

export default Login