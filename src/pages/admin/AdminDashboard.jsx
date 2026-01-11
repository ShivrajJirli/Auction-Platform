import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Plus, DollarSign, Check, X, Loader2, Image as ImageIcon, Gavel, IndianRupee, Trash2, Ban } from 'lucide-react'


export default function AdminDashboard() {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <ManageAuctionsPanel />
                <AddAuctionPanel />
            </div>
        </div>
    )
}

function AddAuctionPanel() {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        starting_price: '',
        end_time: '',
        image_url: '',
    })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Basic validation
            if (!formData.title || !formData.starting_price || !formData.end_time) {
                throw new Error("Missing required fields")
            }

            // Using provided image URL or a fallback
            const finalImageUrl = formData.image_url.trim() || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&q=80&w=800'

            const { error } = await supabase
                .from('items')
                .insert([{
                    ...formData,
                    image_url: finalImageUrl,
                    current_price: formData.starting_price,
                    end_time: new Date(formData.end_time).toISOString()
                }])

            if (error) throw error

            alert("Auction created successfully!")
            setFormData({
                title: '',
                description: '',
                starting_price: '',
                end_time: '',
                image_url: '',
            })
        } catch (err) {
            alert("Error creating auction: " + err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden h-fit">
            <div className="p-6 border-b border-slate-700">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Gavel className="text-indigo-400" size={20} /> Create New Auction
                </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Item Title</label>
                    <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        placeholder="e.g. Vintage Camera"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Start Price (₹)</label>
                        <input
                            type="number"
                            required
                            value={formData.starting_price}
                            onChange={e => setFormData({ ...formData, starting_price: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="1000"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">End Time</label>
                        <input
                            type="datetime-local"
                            required
                            value={formData.end_time}
                            onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Image URL</label>
                    <div className="flex gap-2">
                        <div className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-500">
                            <ImageIcon size={20} />
                        </div>
                        <input
                            type="url"
                            value={formData.image_url}
                            onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="https://example.com/item.jpg"
                        />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Leave empty for a default image.</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                    <textarea
                        rows="3"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                        placeholder="Item details..."
                    ></textarea>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 flex justify-center"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Launch Auction'}
                    </button>
                </div>
            </form>
        </div>
    )
}

function ManageAuctionsPanel() {
    const [auctions, setAuctions] = useState([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(null)

    useEffect(() => {
        fetchAuctions()

        // Subscribe to real-time changes
        const subscription = supabase
            .channel('admin-manage-items')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, () => {
                fetchAuctions()
            })
            .subscribe()

        return () => supabase.removeChannel(subscription)
    }, [])

    const fetchAuctions = async () => {
        try {
            // Fetch items that are actively running or recently added
            const { data, error } = await supabase
                .from('items')
                .select('*')
                .gt('end_time', new Date().toISOString()) // Only show running auctions
                .order('created_at', { ascending: false })

            if (data) setAuctions(data)
        } catch (error) {
            console.error("Error fetching auctions:", error)
        } finally {
            setLoading(false)
        }
    }

    const stopAuction = async (id) => {
        if (!confirm("Are you sure you want to stop this auction immediately?")) return
        setProcessing(id)
        try {
            const { error } = await supabase
                .from('items')
                .update({ end_time: new Date().toISOString() })
                .eq('id', id)

            if (error) throw error
        } catch (error) {
            alert("Error stopping auction: " + error.message)
        } finally {
            setProcessing(null)
        }
    }

    const deleteAuction = async (id) => {
        if (!confirm("Are you sure you want to DELETE this auction? This cannot be undone.")) return
        setProcessing(id)
        try {
            const { error } = await supabase
                .from('items')
                .delete()
                .eq('id', id)

            if (error) throw error
        } catch (error) {
            alert("Error deleting auction: " + error.message)
        } finally {
            setProcessing(null)
        }
    }

    return (
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden flex flex-col h-[500px]">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Gavel className="text-blue-400" size={20} /> Live Auctions
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loading ? (
                    <div className="text-center py-10 text-slate-500"><Loader2 className="animate-spin mx-auto mb-2" /> Loading...</div>
                ) : auctions.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        <p>No active auctions running.</p>
                    </div>
                ) : (
                    auctions.map(item => (
                        <div key={item.id} className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 flex justify-between items-center gap-4">
                            <div className="flex items-center gap-4 overflow-hidden">
                                <img
                                    src={item.image_url || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&q=80&w=800'}
                                    className="w-12 h-12 rounded-lg object-cover bg-slate-800"
                                    alt=""
                                />
                                <div className="min-w-0">
                                    <h4 className="font-bold text-white truncate">{item.title}</h4>
                                    <p className="text-slate-400 text-sm">₹{item.current_price.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={() => stopAuction(item.id)}
                                    disabled={processing === item.id}
                                    title="Stop Auction Now"
                                    className="p-2 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 rounded-lg transition-colors"
                                >
                                    <Ban size={18} />
                                </button>
                                <button
                                    onClick={() => deleteAuction(item.id)}
                                    disabled={processing === item.id}
                                    title="Delete Auction"
                                    className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
