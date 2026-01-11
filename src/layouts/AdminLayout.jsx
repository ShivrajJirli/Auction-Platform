import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Gavel, LogOut, ShieldCheck, FileText, ChevronDown, IndianRupee } from 'lucide-react'

export default function AdminLayout({ currentUser, onLogout }) {
    const location = useLocation()
    const isActive = (path) => location.pathname === path

    const navItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Overview', path: '/admin' },
        { icon: <IndianRupee size={20} />, label: 'Fund Requests', path: '/admin/funds' },
    ]

    return (
        <div className="min-h-screen bg-slate-900 flex font-sans text-slate-100 selection:bg-indigo-500 selection:text-white">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 w-64 bg-slate-950 border-r border-slate-800 z-50 flex flex-col">
                {/* Logo */}
                <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800 bg-slate-950">
                    <img src="/logo.jpg" alt="BidMaster Logo" className="h-10 w-auto rounded-lg" />
                    <span className="text-lg font-bold text-white tracking-wide">BidMaster<span className="text-indigo-500">Admin</span></span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-8 space-y-2">
                    <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Management</p>
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive(item.path)
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
                                : 'hover:bg-slate-800 hover:text-white text-slate-400'
                                }`}
                        >
                            <div className={`${isActive(item.path) ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                                {item.icon}
                            </div>
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* Admin User Footer */}
                <div className="p-4 border-t border-slate-800 bg-slate-950">
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shadow-inner">
                            A
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">Administrator</p>
                            <p className="text-xs text-indigo-400 font-mono">System Access</p>
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

            {/* Main Content */}
            <div className="flex-1 ml-64 flex flex-col min-h-screen bg-slate-900">
                {/* Header */}
                <header className="h-16 bg-slate-900 border-b border-slate-800 sticky top-0 z-40 px-8 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">
                        Dashboard
                    </h2>
                    <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs font-medium text-indigo-400">
                        Secure Environment
                    </div>
                </header>

                <main className="flex-1 p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto animate-fade-in">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}
