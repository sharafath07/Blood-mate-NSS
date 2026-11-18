import {
    Bell,
    FileHeart,
    LayoutDashboard,
    Menu,
    MessageCircle,
    Users,
    X,
    HeartPulse,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'

const navigation = [
    {
        label: 'Overview',
        items: [
            { name: 'Dashboard', path: '/', icon: LayoutDashboard },
            { name: 'Students', path: '/students', icon: Users },
            { name: 'Blood Requests', path: '/requests', icon: FileHeart },
        ],
    },
    {
        label: 'Operations',
        items: [
            { name: 'Donor Matching', path: '/donors', icon: HeartPulse },
            { name: 'Notifications', path: '/notifications', icon: MessageCircle },
        ],
    },
]

export default function DashboardLayout() {
    const [mobileOpen, setMobileOpen] = useState(false)
    const user = api.auth.getUser()
    const userName = user?.name || 'Coordinator'
    const userRole = user?.role === 'ADMIN' ? 'Administrator' : user?.role === 'VOLUNTEER' ? 'Volunteer' : 'Coordinator'
    const initials = userName.trim().split(/\s+/).slice(0, 2).map((name: string) => name[0]).join('').toUpperCase()
    const navigate = useNavigate()

    const handleLogout = () => {
        api.auth.logout()
        navigate('/login', { replace: true })
    }

    return (
        <div className="min-h-screen bg-[#f7f7f5] text-neutral-900">

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed inset-y-0 left-0 z-50 w-[260px]
          border-r border-neutral-200/80
          bg-white
          transition-transform duration-300
          lg:translate-x-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
            >
                <div className="flex h-full flex-col">

                    {/* Brand */}
                    <div className="flex h-[82px] items-center justify-between px-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#b91c1c] shadow-sm">
                                <HeartPulse className="h-5 w-5 text-white" strokeWidth={2.4} />
                            </div>

                            <div>
                                <h1
                                    className="font-['Manrope'] text-[17px] font-extrabold tracking-tight"
                                >
                                    Blood Mate
                                </h1>

                                <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-neutral-400">
                                    NSS • Blood Wing
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => setMobileOpen(false)}
                            className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 lg:hidden"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 overflow-y-auto px-3 py-5">

                        {navigation.map((section) => (
                            <div key={section.label} className="mb-7">

                                <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-400">
                                    {section.label}
                                </p>

                                <nav className="space-y-1">
                                    {section.items.map((item) => {
                                        const Icon = item.icon

                                        return (
                                            <NavLink
                                                key={item.path}
                                                to={item.path}
                                                onClick={() => setMobileOpen(false)}
                                                className={({ isActive }) =>
                                                    `
                          group flex items-center gap-3 rounded-xl px-3 py-2.5
                          text-[13px] font-semibold transition-all
                          ${isActive
                                                        ? 'bg-[#fff1f1] text-[#b91c1c]'
                                                        : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'
                                                    }
                          `
                                                }
                                            >
                                                {({ isActive }) => (
                                                    <>
                                                        <Icon
                                                            className={`h-[18px] w-[18px] ${isActive
                                                                ? 'text-[#b91c1c]'
                                                                : 'text-neutral-400 group-hover:text-neutral-600'
                                                                }`}
                                                            strokeWidth={isActive ? 2.3 : 1.9}
                                                        />

                                                        <span>{item.name}</span>
                                                    </>
                                                )}
                                            </NavLink>
                                        )
                                    })}
                                </nav>
                            </div>
                        ))}

                    </div>

                    {/* Bottom area */}
                    <div className="border-t border-neutral-100 p-3">



                        <div className="mt-3 flex items-center gap-3 rounded-xl bg-neutral-50 p-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white">
                                {initials}
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-bold text-neutral-900">
                                    {userName}
                                </p>
                                <p className="truncate text-[10px] text-neutral-400">
                                    {userRole}
                                </p>
                            </div>


                        </div>

                    </div>
                </div>
            </aside>

            {/* Main */}
            <div className="lg:pl-[260px]">

                {/* Header */}
                <header className="sticky top-0 z-30 flex h-[74px] items-center border-b border-neutral-200/70 bg-[#f7f7f5]/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">

                    <button
                        onClick={() => setMobileOpen(true)}
                        className="mr-3 rounded-xl p-2 text-neutral-600 hover:bg-white lg:hidden"
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    <div className="hidden sm:block">
                        <p className="text-xs font-medium text-neutral-400">
                            Blood Mate
                        </p>
                        <p className="text-sm font-bold text-neutral-800">
                            NSS Blood Donation Management
                        </p>
                    </div>

                    <div className="ml-auto flex items-center gap-2">

                        {/* Notifications */}
                        <button type="button" aria-label="Donor contacts" onClick={() => navigate("/notifications")} className="relative rounded-xl p-2.5 text-neutral-500 transition hover:bg-white hover:text-neutral-900">
                            <Bell className="h-[19px] w-[19px]" strokeWidth={1.8} />
                        </button>

                        <div className="mx-1 hidden h-7 w-px bg-neutral-200 sm:block" />

                        {/* User */}
                        <div className="flex items-center gap-2 rounded-xl p-1.5 pr-2 transition hover:bg-white">

                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-bold text-white">
                                {initials}
                            </div>

                            <div className="hidden text-left sm:block">
                                <p className="text-[11px] font-bold text-neutral-800">
                                    {userName}
                                </p>
                                <p className="text-[9px] text-neutral-400">
                                    {userRole}
                                </p>
                            </div>


                        </div>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="rounded-xl px-3 py-2 text-xs font-semibold text-neutral-500 transition hover:bg-red-50 hover:text-red-600"
                        >
                            Sign out
                        </button>

                    </div>
                </header>

                {/* Page */}
                <main className="min-h-[calc(100vh-74px)] p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>

            </div>
        </div>
    )
}