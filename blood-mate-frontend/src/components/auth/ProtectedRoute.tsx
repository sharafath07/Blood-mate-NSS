import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import { api } from '../../services/api'

export default function ProtectedRoute() {
    const location = useLocation()
    if (!api.auth.isAuthenticated()) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location.pathname + location.search }}
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