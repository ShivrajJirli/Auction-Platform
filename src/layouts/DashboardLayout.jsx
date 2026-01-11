import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Gavel, BarChart3, Wallet, LogOut, User, ChevronDown } from 'lucide-react'

export default function DashboardLayout({ currentUser, onLogout }) {
    const location = useLocation()
    const navigate = useNavigate()
    const [isProfileOpen, setIsProfileOpen] = useState(false)

    const isActive = (path) => location.pathname === path

    const navItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Overview', path: '/dashboard' },
        { icon: <Gavel size={20} />, label: 'Live Auctions', path: '/dashboard/auction' },
        { icon: <BarChart3 size={20} />, label: 'Analytics', path: '/dashboard/analytics' },
        { icon: <User size={20} />, label: 'Profile', path: '/dashboard/profile' },
    ]

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 selection:bg-blue-100">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 w-64 bg-slate-900 text-slate-300 z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out">
                {/* Logo */}
                <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800 bg-slate-950">
                    <img src="/logo.jpg" alt="BidMaster Logo" className="h-10 w-auto rounded-lg" />
                    <span className="text-lg font-bold text-white tracking-wide">BidMaster</span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-8 space-y-2">
                    <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Main Menu</p>
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive(item.path)
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                : 'hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <div className={`${isActive(item.path) ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                                {item.icon}
                            </div>
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}


                </nav>

                {/* User Footer */}
                <div className="p-4 border-t border-slate-800 bg-slate-950">
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-inner">
                            {currentUser?.username?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{currentUser?.username}</p>
                            <p className="text-xs text-emerald-400 font-mono">₹{currentUser?.wallet_balance}</p>
                        </div>
                        <button
                            onClick={onLogout}
                            className="p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors"
                            title="Logout"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 ml-64 flex flex-col min-h-screen">
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-40 px-8 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4 flex-1">
                        <h2 className="text-xl font-bold text-slate-800">
                            {navItems.find(i => isActive(i.path))?.label || 'Dashboard'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Profile Dropdown Trigger */}
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors focus:outline-none"
                            >
                                <div className="text-right hidden md:block">
                                    <p className="text-sm font-bold text-slate-700">{currentUser?.username}</p>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs ring-4 ring-blue-50">
                                    {currentUser?.username?.substring(0, 2).toUpperCase()}
                                </div>
                                <ChevronDown size={16} className={`text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {isProfileOpen && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="px-4 py-3 border-b border-slate-100">
                                        <p className="text-sm font-bold text-slate-900 truncate">{currentUser?.username}</p>
                                        <p className="text-xs text-slate-500 truncate">{currentUser?.email}</p>
                                    </div>
                                    <div className="p-1">
                                        <Link
                                            to="/dashboard/profile"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                                        >
                                            <User size={16} /> Profile
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setIsProfileOpen(false)
                                                onLogout()
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <LogOut size={16} /> Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-8 bg-slate-50 overflow-y-auto">
                    <div className="max-w-7xl mx-auto animate-fade-in">
                        <Outlet />
                    </div>
                </main>
            </div >
        </div >
    )
}
