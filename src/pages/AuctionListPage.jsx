import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Search, Filter, Clock, ArrowRight, Loader2, IndianRupee } from 'lucide-react'

export default function AuctionListPage() {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        fetchItems()

        // Subscribe to real-time updates for new auctions
        const channel = supabase
            .channel('auction-list-updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, () => {
                fetchItems()
            })
            .subscribe()

        return () => supabase.removeChannel(channel)
    }, [])

    const fetchItems = async () => {
        try {
            const { data, error } = await supabase
                .from('items')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            if (data) setItems(data)
        } catch (err) {
            console.error("Error fetching auctions:", err)
        } finally {
            setLoading(false)
        }
    }

    const filteredItems = items.filter(item =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Live Auctions</h1>
                    <p className="text-slate-500">Discover and bid on exclusive items.</p>
                </div>
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search items..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                    />
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                    <p className="text-slate-500 text-lg">No active auctions found matching your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map(item => (
                        <Link to={`/dashboard/auction/${item.id}`} key={item.id} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                                {item.image_url ? (
                                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl bg-slate-100">📦</div>
                                )}
                                <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                                    <Clock size={12} />
                                    {new Date(item.end_time) > new Date() ? 'LIVE' : 'ENDED'}
                                </div>
                            </div>

                            <div className="p-5">
                                <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                                <p className="text-slate-500 text-sm mb-4 line-clamp-2">{item.description}</p>

                                <div className="flex items-end justify-between border-t border-slate-100 pt-4">
                                    <div>
                                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Current Bid</p>
                                        <p className="text-xl font-bold text-slate-900 flex items-center">
                                            <IndianRupee size={16} strokeWidth={2.5} />
                                            {item.current_price?.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <ArrowRight size={20} />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
