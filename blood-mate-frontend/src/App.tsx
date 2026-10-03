import { BrowserRouter, Routes, Route } from 'react-router-dom'
import DashboardLayout from './layouts/DashboardLayout'
import Dashboard from './pages/Dashboard'
import Students from './pages/Students'

function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex min-h-[500px] items-center justify-center">
      <div className="text-center">
        <h2 className="font-['Manrope'] text-2xl font-bold text-neutral-900">
          {title}
        </h2>

        <p className="mt-2 text-sm text-neutral-400">
          This section is coming next.
        </p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Dashboard />} />

          <Route path="/students" element={<Students />} />

          <Route
            path="/requests"
            element={<Placeholder title="Blood Requests" />}
          />

          <Route
            path="/donors"
            element={<Placeholder title="Donor Matching" />}
          />

          <Route
            path="/notifications"
            element={<Placeholder title="Notifications" />}
          />

          <Route
            path="/reports"
            element={<Placeholder title="Reports" />}
          />

          <Route
            path="/settings"
            element={<Placeholder title="Settings" />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}