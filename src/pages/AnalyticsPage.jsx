import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { IndianRupee, Gavel, Trophy, Calendar, Loader2, Wallet } from 'lucide-react'

export default function AnalyticsPage({ currentUser }) {
    const [loading, setLoading] = useState(true)
    const [MyBids, setMyBids] = useState([])
    const [stats, setStats] = useState({
        totalValue: 0,
        activeBidsCount: 0,
        wonCount: 0,
        totalRequested: 0
    })

    useEffect(() => {
        if (currentUser) {
            fetchMyActivity()
        }
    }, [currentUser])

    const fetchMyActivity = async () => {
        try {
            setLoading(true)

            // Fetch all bids by this user
            const { data: bidsData, error: bidsError } = await supabase
                .from('bids')
                .select(`
                    id,
                    amount,
                    created_at,
                    items (
                        id,
                        title,
                        end_time,
                        current_price,
                        winner_id
                    )
                `)
                .eq('user_id', currentUser.id)
                .order('created_at', { ascending: false })

            // Fetch fund requests by this user
            const { data: requestsData, error: requestsError } = await supabase
                .from('fund_requests')
                .select('amount, status')
                .eq('user_id', currentUser.id)

            if (bidsData) {
                setMyBids(bidsData)

                // Calculate Stats
                const totalBidValue = bidsData.reduce((acc, bid) => acc + bid.amount, 0)
                const totalBidsCount = bidsData.length
                const wonCount = bidsData.filter(bid => bid.items?.winner_id === currentUser.id).length

                // Calculate Total Requested (Only Pending)
                const totalRequested = requestsData
                    ? requestsData
                        .filter(req => req.status?.toLowerCase() === 'pending')
                        .reduce((acc, req) => acc + req.amount, 0)
                    : 0

                setStats({
                    totalValue: totalBidValue,
                    activeBidsCount: totalBidsCount,
                    wonCount: wonCount,
                    totalRequested: totalRequested
                })
            }
        } catch (error) {
            console.error('Error fetching analytics:', error)
        } finally {
            setLoading(false)
        }
    }

    const StatCards = [
        { label: 'Total Bid Value', value: `₹${stats.totalValue.toLocaleString()}`, icon: <IndianRupee size={20} /> },
        { label: 'Total Bids Placed', value: stats.activeBidsCount, icon: <Gavel size={20} /> },
        { label: 'Auctions Won', value: stats.wonCount, icon: <Trophy size={20} /> },
        { label: 'Money Requested', value: `₹${stats.totalRequested.toLocaleString()}`, icon: <Wallet size={20} /> },
    ]

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600" /></div>

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Your Activity</h1>
                <p className="text-slate-500">Real-time overview of your trading performance.</p>
            </div>

            {/* Simple Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {StatCards.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</div>
                            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg text-slate-500 text-blue-600">
                            {stat.icon}
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent History Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                    <h2 className="text-lg font-bold text-slate-800">Recent Transactions</h2>
                </div>

                {MyBids.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Calendar className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="font-medium text-slate-900 mb-1">No history found</h3>
                        <p className="text-sm max-w-xs mx-auto">Once you participate in auctions, your transaction history will appear here.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">Item</th>
                                    <th className="px-6 py-4">Bid Amount</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {MyBids.map((bid) => (
                                    <tr key={bid.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            {bid.items?.title || 'Unknown Item'}
                                        </td>
                                        <td className="px-6 py-4 font-mono font-semibold text-slate-700">
                                            ₹{bid.amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {new Date(bid.created_at).toLocaleDateString()} {new Date(bid.created_at).toLocaleTimeString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                Placed
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
