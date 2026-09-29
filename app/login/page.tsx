"use client"
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { Lock, Mail, Eye, EyeOff, Sparkles, Wallet, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nama, setNama] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pesan, setPesan] = useState({ type: '', text: '' })

  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setPesan({ type: '', text: '' })

    if (isLogin) {
      // Proses Login
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setPesan({ type: 'error', text: 'Email atau password salah. Silakan coba lagi.' })
      } else {
        setPesan({ type: 'success', text: 'Login berhasil! Mengalihkan...' })
        setTimeout(() => router.push('/'), 1000)
      }
    } else {
      // Proses Registrasi
      if (!nama) {
        setPesan({ type: 'error', text: 'Nama lengkap wajib diisi!' })
        setLoading(false)
        return
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        setPesan({ type: 'error', text: error.message })
      } else {
        if (data.user) {
          // Simpan nama ke tabel profiles
          await supabase.from('profiles').upsert({
            id: data.user.id,
            nama: nama,
          })
        }
        setPesan({ type: 'success', text: 'Pendaftaran berhasil! Silakan login.' })
        setIsLogin(true)
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen w-full bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">

      {/* Background Glow Effect */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-300">

        {/* Header Logo & Brand */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl shadow-xl shadow-blue-500/20 mb-3 border border-white/20">
            <Wallet size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-1.5">
            PNS Tracker <Sparkles size={18} className="text-amber-400 animate-pulse" />
          </h1>
          <p className="text-xs font-semibold text-slate-400 mt-1">
            Kelola Keuangan & Agenda Harian Lebih Praktis
          </p>
        </div>

        {/* Card Utama */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20">

          {/* Tab Switcher (Masuk / Daftar) */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6">
            <button
              onClick={() => { setIsLogin(true); setPesan({ type: '', text: '' }); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Masuk
            </button>
            <button
              onClick={() => { setIsLogin(false); setPesan({ type: '', text: '' }); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${!isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Daftar Akun
            </button>
          </div>

          {/* Notifikasi Pesan Error / Success */}
          {pesan.text && (
            <div className={`p-3 rounded-2xl text-xs font-bold text-center mb-4 flex items-center justify-center gap-2 animate-in fade-in ${pesan.type === 'error' ? 'bg-rose-50 border border-rose-200 text-rose-600' : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
              }`}>
              {pesan.type === 'success' && <CheckCircle2 size={16} />}
              {pesan.text}
            </div>
          )}

          {/* Form Auth */}
          <form onSubmit={handleAuth} className="space-y-4">

            {!isLogin && (
              <div>
                <label className="text-[11px] font-bold text-slate-600 mb-1 block">Nama Lengkap & Gelar</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Joseph Kurniawan"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className="w-full p-3.5 pl-10 border border-slate-200 rounded-2xl text-xs font-semibold bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                  />
                  <ShieldCheck size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            )}

            <div>
              <label className="text-[11px] font-bold text-slate-600 mb-1 block">Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3.5 pl-10 border border-slate-200 rounded-2xl text-xs font-semibold bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                />
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 mb-1 block">Kata Sandi</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3.5 pl-10 pr-10 border border-slate-200 rounded-2xl text-xs font-semibold bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                />
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-3.5 rounded-2xl font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 active:scale-95 transition flex items-center justify-center gap-2 mt-2"
            >
              <span>{loading ? 'Memproses...' : isLogin ? 'Masuk Sekarang' : 'Buat Akun Baru'}</span>
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] font-semibold text-slate-500 mt-6">
          &copy; {new Date().getFullYear()} PNS Tracker.
        </p>

      </div>
    </div>
  )
}