import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet, Clock, ArrowRight } from 'lucide-react'
import RequestFundsModal from '../components/RequestFundsModal'

export default function DashboardPage({ currentUser, onRefresh }) {
    const navigate = useNavigate()
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <RequestFundsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                currentUser={currentUser}
                onRefresh={onRefresh}
            />

            {/* Simple Welcome & Wallet */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Hello, {currentUser?.username}</h1>
                    <p className="text-slate-500 mt-1">Welcome to your trading dashboard.</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Wallet Balance</div>
                        <div className="text-3xl font-bold text-slate-800 font-mono">₹{currentUser?.wallet_balance?.toLocaleString()}</div>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                    >
                        Request Funds
                    </button>
                </div>
            </div>

            {/* Core Actions Grid */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Live Auction Card */}
                <div onClick={() => navigate('/dashboard/auctions')} className="group cursor-pointer bg-white p-8 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-6">
                        <Clock size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">Live Auctions</h3>
                    <p className="text-slate-500 mb-6">View and bid on items currently open for auction.</p>
                    <div className="flex items-center text-blue-600 font-semibold">
                        Go to Auctions <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>

                {/* Profile/Settings Card */}
                <div onClick={() => navigate('/dashboard/profile')} className="group cursor-pointer bg-white p-8 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-lg flex items-center justify-center mb-6">
                        <Wallet size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-slate-600 transition-colors">My Profile</h3>
                    <p className="text-slate-500 mb-6">Manage your account settings and view transaction history.</p>
                    <div className="flex items-center text-slate-600 font-semibold">
                        View Profile <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
            </div>
        </div>
    )
}
