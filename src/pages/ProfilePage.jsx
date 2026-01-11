import { User, Mail, LogOut, IndianRupee } from 'lucide-react'

export default function ProfilePage({ currentUser, onLogout }) {
    if (!currentUser) return <div>Loading...</div>

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Profile Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col md:flex-row items-center gap-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-4xl text-white font-bold ring-4 ring-white shadow-lg">
                    {currentUser.username[0].toUpperCase()}
                </div>
                <div className="text-center md:text-left flex-1">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">{currentUser.username}</h1>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold border border-blue-100">Verified Member</span>
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-semibold border border-indigo-100">Bidder</span>
                    </div>
                </div>
                <button
                    onClick={onLogout}
                    className="px-6 py-2 border border-red-200 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                    <LogOut size={16} /> Sign Out
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Personal Info & Stats */}
                <div className="md:col-span-2 space-y-6">
                    {/* Personal Info */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <User className="text-slate-400" /> Personal Information
                        </h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Username</label>
                                    <input type="text" value={currentUser.username} disabled className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Account ID</label>
                                    <input type="text" value={`ID-${currentUser.id.slice(0, 8).toUpperCase()}`} disabled className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 font-mono text-sm" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input type="email" value={currentUser.email} disabled className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Auction Stats (Mock data for now, could be real later) */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                                <div className="text-3xl font-bold text-slate-900">0</div>
                                <div className="text-xs text-slate-500 uppercase font-bold mt-1">Auctions Won</div>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                                <div className="text-3xl font-bold text-slate-900">0</div>
                                <div className="text-xs text-slate-500 uppercase font-bold mt-1">Bids Placed</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Wallet Summary */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <IndianRupee className="text-slate-400" /> Wallet Balance
                        </h2>
                        <div className="p-6 bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-2xl text-white shadow-lg text-center">
                            <p className="text-indigo-200 text-sm font-medium mb-1">Available Funds</p>
                            <h3 className="text-4xl font-bold text-white mb-2">
                                ₹{currentUser.wallet_balance?.toLocaleString() || '0'}
                            </h3>
                            <p className="text-indigo-300 text-xs">Used for all auction bids</p>
                        </div>

                        <div className="mt-6 space-y-3">
                            <div className="flex items-center justify-between text-sm py-2 border-b border-slate-100">
                                <span className="text-slate-500">Status</span>
                                <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">Active</span>
                            </div>
                            <div className="flex items-center justify-between text-sm py-2 border-b border-slate-100">
                                <span className="text-slate-500">Currency</span>
                                <span className="text-slate-700 font-medium">INR (₹)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
