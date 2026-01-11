import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { X, Loader2, IndianRupee } from 'lucide-react'

export default function RequestFundsModal({ isOpen, onClose, currentUser }) {
    const [amount, setAmount] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    if (!isOpen) return null

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (!amount || parseFloat(amount) <= 0) throw new Error("Invalid amount")

            const { error } = await supabase
                .from('fund_requests')
                .insert([{
                    user_id: currentUser.id,
                    amount: parseFloat(amount),
                    status: 'PENDING'
                }])

            if (error) throw error

            setSuccess(true)
            setTimeout(() => {
                onClose()
                setSuccess(false)
                setAmount('')
            }, 2000)
        } catch (err) {
            alert("Error: " + err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-800">Request Funds</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {success ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <IndianRupee size={32} />
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 mb-2">Request Sent!</h4>
                        <p className="text-slate-500">Admin will review your request shortly.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-2">Amount to Add (₹)</label>
                            <div className="relative">
                                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="number"
                                    autoFocus
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 text-2xl font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                                    placeholder="5000"
                                />
                            </div>
                            <p className="text-xs text-slate-400 mt-2">Min: ₹100 • Max: ₹1,00,000</p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all flex justify-center"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Send Request'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}
