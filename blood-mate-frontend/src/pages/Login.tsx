import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
    ArrowRight,
    Eye,
    EyeOff,
    HeartPulse,
    LockKeyhole,
    Mail,
    ShieldCheck,
} from 'lucide-react'
import axios from 'axios'

import { api } from '../services/api'

export default function Login() {
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        setError('')

        if (!email.trim() || !password.trim()) {
            setError('Please enter your email and password.')
            return
        }

        try {
            setLoading(true)

            await api.auth.login(email.trim(), password)

            navigate('/', { replace: true })
        } catch (error) {
            console.error('Login failed:', error)

            if (axios.isAxiosError(error)) {
                const message =
                    error.response?.data?.message ||
                    error.response?.data?.error

                setError(
                    typeof message === 'string'
                        ? message
                        : 'Invalid email or password. Please try again.',
                )
            } else {
                setError('Unable to sign in. Please try again.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen bg-[#f7f7f5]">
            <div className="grid min-h-screen lg:grid-cols-2">
                {/* Brand panel */}
                <section className="relative hidden overflow-hidden bg-[#8f1722] lg:flex">
                    <div className="absolute inset-0">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                                duration: 1.2,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                            className="absolute -right-32 -top-32 h-96 w-96 rounded-full border border-white/10"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                                duration: 1.4,
                                delay: 0.15,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                            className="absolute -bottom-40 -left-40 h-[30rem] w-[30rem] rounded-full border border-white/10"
                        />
                    </div>

                    <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">
                        <motion.div
                            initial={{ opacity: 0, y: -15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="flex items-center gap-3"
                        >
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#8f1722] shadow-lg">
                                <HeartPulse size={23} strokeWidth={2.5} />
                            </div>

                            <div>
                                <p className="font-['Manrope'] text-xl font-extrabold tracking-tight text-white">
                                    Blood Mate
                                </p>
                                <p className="text-xs text-white/60">
                                    NSS Blood Donation Network
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 25 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.8,
                                delay: 0.2,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                            className="max-w-xl"
                        >
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-medium text-white/80 backdrop-blur-sm">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                                Connecting donors with those in need.
                            </div>

                            <h1 className="font-['Manrope'] text-5xl font-extrabold leading-[1.08] tracking-tight text-white xl:text-6xl">
                                Every donor
                                <br />
                                can make a
                                <br />
                                <span className="text-white/70">difference.</span>
                            </h1>

                            <p className="mt-7 max-w-md text-base leading-7 text-white/65">
                                Manage donors, coordinate blood requests, and connect
                                students with patients who need help—faster and more
                                efficiently.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.45 }}
                            className="flex items-center gap-3 text-sm text-white/60"
                        >
                            <ShieldCheck size={18} />
                            <span>Built for secure blood-donation coordination</span>
                        </motion.div>
                    </div>
                </section>

                {/* Login panel */}
                <section className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-10 lg:min-h-0 lg:px-16 xl:px-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.7,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        className="w-full max-w-md"
                    >
                        {/* Mobile brand */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="mb-10 flex items-center gap-3 lg:hidden"
                        >
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#8f1722] text-white shadow-sm">
                                <HeartPulse size={23} strokeWidth={2.5} />
                            </div>

                            <div>
                                <p className="font-['Manrope'] text-xl font-extrabold tracking-tight text-neutral-900">
                                    Blood Mate
                                </p>
                                <p className="text-xs text-neutral-500">
                                    NSS Blood Donation Network
                                </p>
                            </div>
                        </motion.div>

                        <div className="mb-9">
                            <h2 className="font-['Manrope'] text-3xl font-extrabold tracking-tight text-neutral-950">
                                Welcome back
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-neutral-500">
                                Sign in to manage blood requests and donor coordination.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm font-medium text-neutral-800"
                                >
                                    Email address
                                </label>

                                <div className="relative">
                                    <Mail
                                        size={18}
                                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                                    />

                                    <input
                                        id="email"
                                        type="email"
                                        autoComplete="email"
                                        value={email}
                                        onChange={(event) => setEmail(event.target.value)}
                                        placeholder="you@example.com"
                                        className="w-full rounded-xl border border-neutral-200 bg-white py-3.5 pl-11 pr-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#8f1722] focus:ring-4 focus:ring-red-50"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-medium text-neutral-800"
                                    >
                                        Password
                                    </label>
                                </div>

                                <div className="relative">
                                    <LockKeyhole
                                        size={18}
                                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                                    />

                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={(event) =>
                                            setPassword(event.target.value)
                                        }
                                        placeholder="Enter your password"
                                        className="w-full rounded-xl border border-neutral-200 bg-white py-3.5 pl-11 pr-12 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#8f1722] focus:ring-4 focus:ring-red-50"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword((current) => !current)
                                        }
                                        aria-label={
                                            showPassword
                                                ? 'Hide password'
                                                : 'Show password'
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                                    >
                                        {showPassword ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Error */}
                            <AnimatePresence initial={false}>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0, y: -5 }}
                                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                                        exit={{ opacity: 0, height: 0, y: -5 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div
                                            role="alert"
                                            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                                        >
                                            {error}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Submit */}
                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={!loading ? { y: -1 } : undefined}
                                whileTap={!loading ? { scale: 0.99 } : undefined}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#8f1722] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#7c131d] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? (
                                    <>
                                        <motion.span
                                            animate={{ rotate: 360 }}
                                            transition={{
                                                duration: 0.8,
                                                repeat: Infinity,
                                                ease: 'linear',
                                            }}
                                            className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                                        />
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        Sign in
                                        <ArrowRight size={17} />
                                    </>
                                )}
                            </motion.button>
                        </form>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7, duration: 0.5 }}
                            className="mt-8 flex items-center justify-center gap-2 text-xs text-neutral-400"
                        >
                            <ShieldCheck size={14} />
                            Secure access to Blood Mate
                        </motion.div>
                    </motion.div>
                </section>
            </div>
        </main>
    )
}