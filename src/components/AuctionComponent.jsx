import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Clock, TrendingUp, IndianRupee, History, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react'

export default function AuctionComponent({ currentUser }) {
    const { id } = useParams()
    const [item, setItem] = useState(null)
    const [bids, setBids] = useState([])
    const [bidAmount, setBidAmount] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    const [userBalance, setUserBalance] = useState(0)

    // Fetch initial item data
    useEffect(() => {
        if (id) {
            fetchItemData(id)
        }
        fetchUserBalance()
    }, [id, currentUser])

    // Set up Realtime subscription for items table
    useEffect(() => {
        if (!item) return

        // Subscribe to changes on the items table
        const itemsChannel = supabase
            .channel(`item-${item.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'items',
                    filter: `id=eq.${item.id}`
                },
                (payload) => {
                    setItem(payload.new)
                }
            )
            .subscribe()

        // Subscribe to new bids
        const bidsChannel = supabase
            .channel(`bids-${item.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'bids',
                    filter: `item_id=eq.${item.id}`
                },
                (payload) => {
                    fetchBids(item.id) // Refresh bids list
                }
            )
            .subscribe()

        // Cleanup subscriptions on unmount
        return () => {
            supabase.removeChannel(itemsChannel)
            supabase.removeChannel(bidsChannel)
        }
    }, [item])

    // Fetch item data from database
    const fetchItemData = async (itemId) => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('items')
                .select('*')
                .eq('id', itemId)
                .single()

            if (error) throw error
            setItem(data)
            fetchBids(itemId)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    // Fetch user wallet balance
    const fetchUserBalance = async () => {
        if (!currentUser) return

        try {
            const { data, error } = await supabase
                .from('users')
                .select('wallet_balance')
                .eq('id', currentUser.id)
                .single()

            if (error) throw error
            setUserBalance(data.wallet_balance)
        } catch (err) {
            console.error('Error fetching balance:', err)
        }
    }

    // Fetch recent bids
    const fetchBids = async (itemId) => {
        const targetId = itemId || item?.id
        if (!targetId) return

        try {
            const { data, error } = await supabase
                .from('bids')
                .select(`
          *,
          users (username)
        `)
                .eq('item_id', targetId)
                .order('created_at', { ascending: false })
                .limit(10)

            if (error) throw error
            setBids(data)
        } catch (err) {
            console.error('Error fetching bids:', err)
        }
    }

    // Place a bid using the Supabase stored procedure
    const handlePlaceBid = async () => {
        if (!currentUser) {
            setError('Please login first!')
            return
        }

        if (!bidAmount || parseFloat(bidAmount) <= 0) {
            setError('Please enter a valid bid amount')
            return
        }

        setError(null)
        setSuccess(null)
        setLoading(true)

        try {
            // Call the PostgreSQL function we created
            const { data, error } = await supabase.rpc('place_bid', {
                p_user_id: currentUser.id,
                p_item_id: item.id,
                p_amount: parseFloat(bidAmount)
            })

            if (error) throw error

            // Check if the function returned an error
            if (!data.success) {
                setError(data.error)
            } else {
                setSuccess(`Bid placed successfully!`)
                setBidAmount('')
                fetchUserBalance() // Refresh balance
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    // Calculate time remaining
    const getTimeRemaining = () => {
        if (!item) return 'Loading...'
        const now = new Date()
        const end = new Date(item.end_time)
        const diff = end - now

        if (diff <= 0) return 'Auction Ended'

        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        return `${hours}h ${minutes}m remaining`
    }

    if (loading && !item) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!item) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-xl text-red-600 flex items-center gap-2">
                    <AlertCircle /> No auction item found
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Link to="/dashboard/auctions" className="inline-flex items-center text-slate-500 hover:text-blue-600 transition-colors font-medium">
                <ArrowLeft size={20} className="mr-2" /> Back to Auctions
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Item Details */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        {/* Hero Image */}
                        <div className="aspect-video bg-slate-100 relative group">
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent opacity-60" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-6xl filter drop-shadow-lg">💻</span>
                            </div>
                            <div className="absolute bottom-4 left-4 text-white">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="px-2 py-1 bg-blue-600/90 backdrop-blur-sm rounded text-xs font-bold uppercase tracking-wider">
                                        Live Action
                                    </span>
                                    <span className="px-2 py-1 bg-slate-900/50 backdrop-blur-sm rounded text-xs font-medium flex items-center gap-1">
                                        <Clock size={12} /> {getTimeRemaining()}
                                    </span>
                                </div>
                                <h2 className="text-2xl font-bold">{item.title}</h2>
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">Description</h3>
                                    <p className="text-slate-700 leading-relaxed text-lg">{item.description}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100">
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="text-sm text-slate-500 mb-1">Starting Bid</div>
                                    <div className="text-2xl font-semibold text-slate-900">₹{item.starting_price}</div>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                    <div className="text-sm text-blue-600 mb-1 font-medium flex items-center gap-1">
                                        <TrendingUp size={14} /> Current Highest Bid
                                    </div>
                                    <div className="text-3xl font-bold text-blue-700">₹{item.current_price}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bidding Control Panel */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <IndianRupee className="text-blue-600" /> Place Your Bid
                        </h3>

                        <div className="flex gap-4">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="text-slate-400 font-medium">₹</span>
                                </div>
                                <input
                                    type="number"
                                    value={bidAmount}
                                    onChange={(e) => setBidAmount(e.target.value)}
                                    placeholder={`Min: ₹${(parseFloat(item.current_price) + 0.01).toFixed(2)}`}
                                    className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium text-lg placeholder:text-slate-400"
                                    disabled={loading || !currentUser}
                                />
                            </div>
                            <button
                                onClick={handlePlaceBid}
                                disabled={loading || !currentUser}
                                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-2"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>Place Bid</>
                                )}
                            </button>
                        </div>

                        {(error || success) && (
                            <div className={`mt-4 p-4 rounded-xl flex items-center gap-3 ${error ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'
                                }`}>
                                {error ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                                <span className="font-medium">{error || success}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Bid History */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
                        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <History className="text-slate-400" size={20} /> Live Activity
                        </h3>

                        {bids.length === 0 ? (
                            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <p className="text-slate-400 text-sm">No bids yet.<br />Be the first to bid!</p>
                            </div>
                        ) : (
                            <div className="space-y-4 relative">
                                <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-100" />

                                {bids.map((bid, index) => (
                                    <div key={bid.id} className="relative pl-10 group">
                                        <div className={`absolute left-0 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center ${index === 0 ? 'bg-blue-600 text-white shadow-md z-10' : 'bg-slate-200 text-slate-500'
                                            }`}>
                                            <span className="text-[10px] font-bold">
                                                {bid.users?.username?.[0] || '?'}
                                            </span>
                                        </div>

                                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 group-hover:border-blue-200 transition-colors">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className={`font-semibold text-sm ${index === 0 ? 'text-blue-700' : 'text-slate-700'
                                                    }`}>
                                                    {bid.users?.username || 'Anonymous'}
                                                </span>
                                                <span className="font-bold text-slate-900">
                                                    ₹{bid.amount}
                                                </span>
                                            </div>
                                            <div className="text-xs text-slate-400">
                                                {new Date(bid.created_at).toLocaleTimeString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}