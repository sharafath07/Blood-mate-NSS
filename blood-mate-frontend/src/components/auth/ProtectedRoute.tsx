import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'

export default function ProtectedRoute() {
    const location = useLocation()
    const token = localStorage.getItem('token')

    if (!token) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location.pathname }}
            />
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
        >
            <Outlet />
        </motion.div>
    )
}