import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { LuCamera, LuFolder, LuSun, LuMoon } from 'react-icons/lu'
import Avatar from 'boring-avatars'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../context/ThemeContext'
import { updateProfile, changePassword, deleteAccount } from '../api/userAPI'

const profileSchema = z.object({
    name: z.string().min(2, 'Name too short').max(20, 'Name too long'),
    bio: z.string().max(150, 'Bio too long').optional(),
    age: z.coerce.number().min(13, 'Must be at least 13').max(120).optional().or(z.literal(''))
})

const passwordSchema = z.object({
    oldPassword: z.string().min(6, 'Required'),
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

const Profile = () => {
    const { user, login, logout } = useAuth()
    const { theme, toggleTheme } = useTheme()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('profile')

    const profileForm = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name || '',
            bio: user?.bio || '',
            age: user?.age || ''
        }
    })

    const passwordForm = useForm({
        resolver: zodResolver(passwordSchema)
    })

    const onProfileSubmit = async (data) => {
        try {
            const formData = new FormData()
            formData.append('name', data.name)
            formData.append('bio', data.bio || '')
            if(data.age) formData.append('age', data.age)
            
            if (avatarFile) {
                formData.append('avatar', avatarFile)
            }

            const res = await updateProfile(formData)
            login({ ...user, ...res.data })
            setAvatarFile(null)
            toast.success('Profile updated!')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed')
        }
    }

    const onPasswordSubmit = async (data) => {
        try {
            await changePassword({
                oldPassword: data.oldPassword,
                newPassword: data.newPassword
            })
            toast.success('Password changed!')
            passwordForm.reset()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to change password')
        }
    }

    const handleDeleteAccount = async () => {
        try {
            await deleteAccount()
            logout()
            toast.success('Account deleted')
            navigate('/')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete account')
        }
    }

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null)
    const [avatarFile, setAvatarFile] = useState(null)
    const fileInputRef = useRef(null)

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be under 5MB')
            return
        }
        setAvatarFile(file)
        const reader = new FileReader()
        reader.onloadend = () => setAvatarPreview(reader.result)
        reader.readAsDataURL(file)
    }

    return (
        <div className="w-full max-w-2xl mx-auto px-6 py-8">

            {/* Avatar + Info */}
            <div className="flex flex-col items-center text-center mb-8">

                {/* Avatar with camera overlay */}
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>

                    {/* Show uploaded preview or boring avatar */}
                    {avatarPreview ? (
                        <img
                            src={avatarPreview}
                            alt="avatar"
                            className="w-24 h-24 rounded-full object-cover"
                        />
                    ) : (
                        <Avatar
                            size={96}
                            name={user?.name}
                            variant="beam"
                            colors={['#c4a882', '#7a5c3a', '#f5ede0', '#3d2b1f', '#e8d8c4']}
                        />
                    )}

                    {/* Camera overlay on hover */}
                    <div className="absolute inset-0 rounded-full bg-neutral/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <LuCamera className="text-white w-6 h-6" />
                    </div>
                </div>

                {/* Hidden file input — accepts image, camera */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleFileChange}
                />

                {/* Upload options */}
                <div className="flex gap-2 mt-3">
                    <button
                        type="button"
                        onClick={() => {
                            fileInputRef.current.removeAttribute('capture')
                            fileInputRef.current.click()
                        }}
                        className="btn btn-ghost btn-sm gap-1 font-data"
                    >
                        <LuFolder className="w-3 h-3" /> Gallery
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            fileInputRef.current.setAttribute('capture', 'environment')
                            fileInputRef.current.click()
                        }}
                        className="btn btn-ghost btn-sm gap-1 font-data"
                    >
                        <LuCamera className="w-3 h-3" /> Camera
                    </button>
                </div>

                <h1 className="font-heading text-3xl font-bold text-neutral mt-4">{user?.name}</h1>
                <p className="font-data text-sm text-neutral/50 mt-1">{user?.email}</p>
                {user?.bio && (
                    <p className="font-sans text-sm text-neutral/60 mt-2 max-w-sm">{user?.bio}</p>
                )}
                <p className="font-data text-xs text-neutral/30 mt-2">
                    Member since {new Date(user?.createdAt).toLocaleDateString('en-IN', {
                        month: 'long', year: 'numeric'
                    })}
                </p>
            </div>

            {/* Tabs */}
            <div className="tabs tabs-border mb-6">
                <button
                    className={`tab font-data ${activeTab === 'profile' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    Edit Profile
                </button>
                <button
                    className={`tab font-data ${activeTab === 'password' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('password')}
                >
                    Password
                </button>
                <button
                    className={`tab font-data ${activeTab === 'account' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('account')}
                >
                    Account
                </button>
            </div>

            {/* Tab — Edit Profile */}
            {activeTab === 'profile' && (
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="flex flex-col gap-4">
                    <div>
                        <label className="label font-data text-sm">Name</label>
                        <input
                            {...profileForm.register('name')}
                            className="input input-bordered w-full"
                            placeholder="Your name"
                        />
                        {profileForm.formState.errors.name && (
                            <p className="text-error text-xs mt-1">{profileForm.formState.errors.name.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="label font-data text-sm">Bio</label>
                        <textarea
                            {...profileForm.register('bio')}
                            className="textarea textarea-bordered w-full"
                            placeholder="A little about yourself..."
                            rows={3}
                        />
                        {profileForm.formState.errors.bio && (
                            <p className="text-error text-xs mt-1">{profileForm.formState.errors.bio.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="label font-data text-sm">Age</label>
                        <input
                            {...profileForm.register('age')}
                            type="number"
                            className="input input-bordered w-full"
                            placeholder="Your age"
                        />
                        {profileForm.formState.errors.age && (
                            <p className="text-error text-xs mt-1">{profileForm.formState.errors.age.message}</p>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={profileForm.formState.isSubmitting}
                        className="btn btn-primary w-full mt-2"
                    >
                        {profileForm.formState.isSubmitting
                            ? <span className="loading loading-spinner loading-sm" />
                            : 'Save Changes'
                        }
                    </button>
                </form>
            )}

            {/* Tab — Password */}
            {activeTab === 'password' && (
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="flex flex-col gap-4">
                    <div>
                        <label className="label font-data text-sm">Current Password</label>
                        <input
                            {...passwordForm.register('oldPassword')}
                            type="password"
                            className="input input-bordered w-full"
                            placeholder="Current password"
                        />
                        {passwordForm.formState.errors.oldPassword && (
                            <p className="text-error text-xs mt-1">{passwordForm.formState.errors.oldPassword.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="label font-data text-sm">New Password</label>
                        <input
                            {...passwordForm.register('newPassword')}
                            type="password"
                            className="input input-bordered w-full"
                            placeholder="New password"
                        />
                        {passwordForm.formState.errors.newPassword && (
                            <p className="text-error text-xs mt-1">{passwordForm.formState.errors.newPassword.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="label font-data text-sm">Confirm New Password</label>
                        <input
                            {...passwordForm.register('confirmPassword')}
                            type="password"
                            className="input input-bordered w-full"
                            placeholder="Confirm new password"
                        />
                        {passwordForm.formState.errors.confirmPassword && (
                            <p className="text-error text-xs mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={passwordForm.formState.isSubmitting}
                        className="btn btn-primary w-full mt-2"
                    >
                        {passwordForm.formState.isSubmitting
                            ? <span className="loading loading-spinner loading-sm" />
                            : 'Change Password'
                        }
                    </button>
                </form>
            )}

            {/* Tab — Account */}
            {activeTab === 'account' && (
                <div className="flex flex-col gap-4">
                    <div className="card bg-base-200 rounded-2xl p-6">
                        <h3 className="font-heading text-lg font-bold mb-1">Weekly Digest</h3>
                        <p className="font-sans text-sm text-neutral/60 mb-4">
                            Receive a weekly AI-written summary of your emotional patterns every Sunday.
                        </p>
                        <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            defaultChecked={user?.weeklyDigestEnabled}
                        />
                    </div>

                    <div className="card bg-base-200 rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-heading text-lg font-bold mb-1">App Theme</h3>
                                <p className="font-sans text-sm text-neutral/60">
                                    Switch between light and dark modes.
                                </p>
                            </div>
                            <button onClick={toggleTheme} className="btn btn-circle btn-ghost bg-base-100">
                                {theme === 'luxury' ? <LuSun size={20} /> : <LuMoon size={20} />}
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="btn btn-outline w-full"
                    >
                        Logout
                    </button>

                    <div className="divider text-xs text-neutral/30">Danger Zone</div>

                    <div className="card bg-error/5 border border-error/20 rounded-2xl p-6">
                        <h3 className="font-heading text-lg font-bold text-error mb-1">Delete Account</h3>
                        <p className="font-sans text-sm text-neutral/60 mb-4">
                            Permanently deletes your account, all journal entries and analyses. Cannot be undone.
                        </p>
                        <button
                            className="btn btn-error btn-outline w-full"
                            onClick={() => document.getElementById('deleteAccountModal').showModal()}
                        >
                            Delete My Account
                        </button>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <dialog id="deleteAccountModal" className="modal">
                <div className="modal-box">
                    <h3 className="font-heading text-xl font-bold text-error">Are you sure?</h3>
                    <p className="font-sans text-sm text-neutral/70 mt-2">
                        This will permanently delete your account, all entries and analyses. This cannot be undone.
                    </p>
                    <div className="modal-action">
                        <button className="btn btn-error" onClick={handleDeleteAccount}>
                            Yes, delete everything
                        </button>
                        <button
                            className="btn btn-ghost"
                            onClick={() => document.getElementById('deleteAccountModal').close()}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </dialog>
        </div>
    )
}

export default Profile