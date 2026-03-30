import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

const GoogleAuthSuccess = () => {
    const navigate = useNavigate()
    const { login } = useAuth()

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const data = params.get('data')

        if (data) {
            try {
                const user = JSON.parse(decodeURIComponent(data))
                login(user)
                toast.success(`Welcome, ${user.name}!`)
                navigate('/dashboard')
            } catch {
                toast.error('Google login failed')
                navigate('/login')
            }
        } else {
            toast.error('Google login failed')
            navigate('/login')
        }
    }, [])

    return (
        <div className="min-h-screen flex items-center justify-center">
            <span className="loading loading-spinner loading-lg text-primary" />
        </div>
    )
}

export default GoogleAuthSuccess