import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { ShieldCheck, AlertCircle, Loader2, ArrowLeft } from 'lucide-react'

export default function AdminLoginPage({ onLogin }) {
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

            // Check for Admin status
            if (!data.is_admin && email !== 'admin@bidmaster.com') { // Fallback check for demo
                throw new Error('Access Denied: Admin privileges required.')
            }

            onLogin(data)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
            <div className="max-w-md w-full bg-slate-950 border border-slate-800 p-8 rounded-2xl shadow-2xl">

                <Link to="/" className="inline-flex items-center text-slate-500 hover:text-slate-300 mb-8 transition-colors text-sm">
                    <ArrowLeft size={16} className="mr-2" /> Back to Home
                </Link>

                <div className="text-center mb-8">
                    <div className="inline-block bg-indigo-600 p-3 rounded-xl mb-4 shadow-lg shadow-indigo-900/30">
                        <ShieldCheck className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
                    <p className="text-slate-400 mt-2">Restricted access only.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    {error && (
                        <div className="bg-red-500/10 text-red-400 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-500/20">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Admin Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
                            placeholder="admin@bidmaster.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-900/40 hover:shadow-indigo-900/60 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : 'Authenticate Access'}
                    </button>
                </form>


            </div>
        </div>
    )
}
