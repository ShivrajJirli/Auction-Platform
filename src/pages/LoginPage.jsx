import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Link } from 'react-router-dom'
import { Gavel, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react'

export default function LoginPage({ onLogin }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { data, error: fetchError } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .single()

            if (fetchError || !data) throw new Error('Invalid credentials')
            if (data.password !== password) throw new Error('Invalid credentials')

            onLogin(data)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }



    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-blue-100">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden relative">

                {/* Back Button */}
                <div className="absolute top-4 left-4">
                    <Link to="/" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all" title="Back to Home">
                        <ArrowLeft size={20} />
                    </Link>
                </div>

                <div className="p-8 pt-12">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-block bg-blue-600 p-3 rounded-2xl mb-4 shadow-lg shadow-blue-200 transform hover:scale-110 transition-transform duration-300">
                            <Gavel className="text-white w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome Back</h1>
                        <p className="text-slate-500 mt-2 text-lg">Sign in to your BidMaster account</p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm flex items-center gap-3 border border-red-100 animate-in fade-in slide-in-from-top-2">
                                <AlertCircle size={20} className="shrink-0" /> {error}
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-slate-700 ml-1">Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all duration-200 font-medium"
                                placeholder="Registered Email"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-slate-700 ml-1">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all duration-200 font-medium"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-2"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="animate-spin" size={20} /> Signing in...
                                </span>
                            ) : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-500 text-sm font-medium">
                            New to BidMaster? <Link to="/register" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">Create account</Link>
                        </p>
                    </div>


                </div>
            </div>
        </div>
    )
}
