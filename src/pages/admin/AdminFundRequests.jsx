import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { IndianRupee, Check, X, Loader2 } from 'lucide-react'

export default function AdminFundRequests() {
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [processingIds, setProcessingIds] = useState(new Set())

    useEffect(() => {
        fetchRequests()

        // Subscribe to changes
        const channel = supabase
            .channel('fund-requests-admin-page')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'fund_requests' }, () => {
                fetchRequests()
            })
            .subscribe()

        return () => supabase.removeChannel(channel)
    }, [])

    const fetchRequests = async () => {
        try {
            const { data, error } = await supabase
                .from('fund_requests')
                .select('*, users(username, email)')
                .eq('status', 'PENDING')
                .order('created_at', { ascending: true })

            if (error) throw error
            if (data) setRequests(data)
        } catch (err) {
            console.error("Error fetching requests:", err)
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (id) => {
        if (processingIds.has(id)) return
        setProcessingIds(prev => new Set(prev).add(id))

        try {
            // Optimistic update: Remove from UI immediately to feel instant
            setRequests(prev => prev.filter(req => req.id !== id))

            const { error } = await supabase.rpc('approve_fund_request', { request_id: id })
            if (error) {
                // Ignore "already processed" error as it means success occurred elsewhere
                if (!error.message.includes('already processed')) {
                    throw error
                }
            }
        } catch (err) {
            alert('Error approving: ' + err.message)
            fetchRequests() // Re-fetch to restore correct state on error
        } finally {
            setProcessingIds(prev => {
                const next = new Set(prev)
                next.delete(id)
                return next
            })
        }
    }

    const handleReject = async (id) => {
        if (processingIds.has(id)) return
        setProcessingIds(prev => new Set(prev).add(id))

        try {
            setRequests(prev => prev.filter(req => req.id !== id))

            const { error } = await supabase
                .from('fund_requests')
                .update({ status: 'REJECTED', updated_at: new Date() })
                .eq('id', id)
            if (error) throw error
        } catch (err) {
            alert('Error rejecting: ' + err.message)
            fetchRequests()
        } finally {
            setProcessingIds(prev => {
                const next = new Set(prev)
                next.delete(id)
                return next
            })
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Fund Requests</h1>
                <p className="text-slate-400">Manage incoming wallet top-up requests.</p>
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900/50 text-slate-400 font-medium border-b border-slate-700">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Direct Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                                        <Loader2 className="animate-spin mx-auto mb-2" /> Loading...
                                    </td>
                                </tr>
                            ) : requests.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                                        No pending requests found.
                                    </td>
                                </tr>
                            ) : (
                                requests.map(req => (
                                    <tr key={req.id} className="hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-white">{req.users?.username}</div>
                                            <div className="text-xs text-slate-500">{req.users?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 font-mono font-bold text-emerald-400">
                                            ₹{req.amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 text-sm">
                                            {new Date(req.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleReject(req.id)}
                                                    disabled={processingIds.has(req.id)}
                                                    className="p-2 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Reject"
                                                >
                                                    <X size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleApprove(req.id)}
                                                    disabled={processingIds.has(req.id)}
                                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                                                >
                                                    {processingIds.has(req.id) ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
                                                    Approve
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
