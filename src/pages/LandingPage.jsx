import { Link } from 'react-router-dom'
import { Gavel, ArrowRight } from 'lucide-react'

export default function LandingPage() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'))
    const isAdmin = currentUser?.is_admin || currentUser?.email === 'admin@bidmaster.com'
    const dashboardLink = isAdmin ? '/admin' : '/dashboard'

    const handleLogout = () => {
        localStorage.removeItem('currentUser')
        window.location.reload()
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 flex flex-col">
            {/* Simple Top Nav */}
            <nav className="w-full bg-white border-b border-slate-200 py-4 px-6 md:px-12 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <img src="/logo.jpg" alt="BidMaster Logo" className="h-8 w-auto rounded-md" />
                    <span className="text-xl font-bold text-slate-900">BidMaster</span>
                </div>
                <div className="flex gap-4 items-center">
                    {currentUser ? (
                        <>
                            <span className="text-sm font-medium text-slate-600 hidden md:block">
                                Hello, {currentUser.username || 'User'}
                            </span>
                            <button onClick={handleLogout} className="text-slate-600 hover:text-red-600 font-medium px-4 py-2 transition-colors">
                                Log Out
                            </button>
                            <Link to={dashboardLink} className="bg-slate-900 text-white px-5 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors">
                                Go to Dashboard
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-slate-600 hover:text-slate-900 font-medium px-4 py-2">Log In</Link>
                            <Link to="/register" className="bg-slate-900 text-white px-5 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors">Sign Up</Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Minimal Hero */}
            <main className="flex-1 flex flex-col justify-center items-center text-center px-4">
                <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 max-w-3xl">
                    Online Auctions, <br /> <span className="text-blue-600">Simplified.</span>
                </h1>
                <p className="text-xl text-slate-600 mb-10 max-w-xl mx-auto leading-relaxed">
                    The reliable platform for secure buying and selling. No clutter, just auctions.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                    {!currentUser ? (
                        <>
                            <Link to="/register" className="px-8 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                                Get Started <ArrowRight size={20} />
                            </Link>
                            <Link to="/login" className="px-8 py-3.5 bg-white text-slate-700 border border-slate-300 font-bold rounded-xl hover:bg-slate-50 transition-all">
                                Existing User
                            </Link>
                        </>
                    ) : (
                        <Link to={dashboardLink} className="px-8 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
                            Go to My Dashboard <ArrowRight size={20} />
                        </Link>
                    )}
                </div>
            </main>

            {/* Minimal Footer */}
            <footer className="py-8 text-center text-slate-400 text-sm">
                <div className="flex flex-col items-center gap-2">
                    <span>&copy; 2026 BidMaster Inc. Simple & Secure.</span>
                    <Link to="/admin-login" className="text-xs text-slate-300 hover:text-blue-600 transition-colors">Admin Access</Link>
                </div>
            </footer>
        </div>
    )
}
