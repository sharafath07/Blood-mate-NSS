import { lazy, Suspense } from 'react'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'

import ProtectedRoute from './components/auth/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout'

import Login from './pages/Login'
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Students = lazy(() => import('./pages/Students'))
const BloodRequests = lazy(() => import('./pages/BloodRequests'))
const DonorMatching = lazy(() => import('./pages/DonorMatching'))
const Notifications = lazy(() => import('./pages/Notifications'))

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f7f5] px-6">
      <div className="text-center">
        <p className="text-sm font-bold text-[#8f1722]">
          404
        </p>

        <h1 className="mt-2 font-['Manrope'] text-3xl font-extrabold text-neutral-950">
          Page not found
        </h1>

        <p className="mt-2 text-sm text-neutral-500">
          The page you are looking for does not exist.
        </p>
        <Link to="/" className="mt-4 inline-block font-bold text-red-700 underline">Back to dashboard</Link>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<p className="p-6 text-sm text-neutral-500" role="status">Loading page…</p>}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/students" element={<Students />} />
            <Route path="/requests" element={<BloodRequests />} />
            <Route path="/donors" element={<DonorMatching />} />
            <Route path="/notifications" element={<Notifications />} />

            <Route path="/donors/:requestId" element={<DonorMatching />} />
          </Route>
        </Route>

        {/* Unknown routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  )
}