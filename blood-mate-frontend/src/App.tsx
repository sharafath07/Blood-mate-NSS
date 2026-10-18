import { BrowserRouter, Route, Routes } from 'react-router-dom'

import ProtectedRoute from './components/auth/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Students from './pages/Students'
import BloodRequests from './pages/BloodRequests'
import DonorMatching from './pages/DonorMatching'
import Notifications from './pages/Notifications'

function Placeholder({ title }: { title: string }) {
  return (
    <div className="p-6">
      <h1 className="font-['Manrope'] text-2xl font-bold text-neutral-950">
        {title}
      </h1>
    </div>
  )
}

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
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
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

            <Route
              path="/reports"
              element={<Placeholder title="Reports" />}
            />

            <Route
              path="/settings"
              element={<Placeholder title="Settings" />}
            />
          </Route>
        </Route>

        {/* Unknown routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}