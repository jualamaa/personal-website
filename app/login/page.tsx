"use client"
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, User, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react'

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
      // Login
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setPesan({ type: 'error', text: 'Email atau password salah. Silakan coba lagi.' })
      } else {
        setPesan({ type: 'success', text: 'Login berhasil! Mengalihkan...' })
        setTimeout(() => router.push('/'), 800)
      }
    } else {
      // Registrasi
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
    <div className="min-h-screen w-full bg-[#FAF9F5] text-slate-900 flex items-center justify-center p-4 sm:p-6 font-sans antialiased">
      
      {/* Container Utama (Card Clean & Outline Flat) */}
      <div className="w-full max-w-md bg-white border border-slate-900 rounded-[2.5rem] p-6 sm:p-8 relative overflow-hidden shadow-sm">
        
        {/* Decorative Top Accent (Inspirasi dari gambar acuan) */}
        {!isLogin && (
          <div className="absolute top-0 left-0 right-0 bg-black text-white px-6 pt-6 pb-8 rounded-b-[2rem] mb-6">
            <button 
              onClick={() => { setIsLogin(true); setPesan({ type: '', text: '' }); }}
              className="p-1 hover:bg-white/20 rounded-full transition mb-2"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-xl font-black tracking-tight">Mari Bergabung</h1>
            <p className="text-xs text-slate-300">Buat akun PNS Tracker kamu sekarang.</p>
          </div>
        )}

        <div className={!isLogin ? "pt-24" : ""}>
          
          {/* Header Login */}
          {isLogin && (
            <div className="mb-8">
              <div className="w-12 h-12 bg-slate-100 border border-slate-900 rounded-2xl flex items-center justify-center font-black text-lg mb-4">
                P
              </div>
              <h1 className="text-2xl font-black text-black tracking-tight">Halo, Selamat Datang</h1>
              <p className="text-xs font-medium text-slate-500 mt-1">
                Silakan masuk untuk mengelola keuangan & agenda harianmu.
              </p>
            </div>
          )}

          {/* Alert Notifikasi */}
          {pesan.text && (
            <div className={`p-3.5 rounded-2xl text-xs font-semibold mb-5 flex items-center gap-2 border ${
              pesan.type === 'error' 
                ? 'bg-rose-50 border-rose-900 text-rose-900' 
                : 'bg-emerald-50 border-emerald-900 text-emerald-900'
            }`}>
              {pesan.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
              <span>{pesan.text}</span>
            </div>
          )}

          {/* Form Auth */}
          <form onSubmit={handleAuth} className="space-y-4">
            
            {!isLogin && (
              <div>
                <label className="text-[11px] font-bold text-slate-700 mb-1.5 block">Nama Lengkap</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Joseph Kurniawan"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className="w-full p-3.5 pl-10 border border-slate-900 rounded-2xl text-xs font-medium bg-[#FAF9F5] text-black focus:outline-none focus:bg-white transition"
                  />
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                </div>
              </div>
            )}

            <div>
              <label className="text-[11px] font-bold text-slate-700 mb-1.5 block">Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3.5 pl-10 border border-slate-900 rounded-2xl text-xs font-medium bg-[#FAF9F5] text-black focus:outline-none focus:bg-white transition"
                />
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 mb-1.5 block">Kata Sandi</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3.5 pl-10 pr-10 border border-slate-900 rounded-2xl text-xs font-medium bg-[#FAF9F5] text-black focus:outline-none focus:bg-white transition"
                />
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-black"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="text-right">
                <button type="button" className="text-[11px] font-bold text-slate-600 hover:text-black transition">
                  Lupa kata sandi?
                </button>
              </div>
            )}

            {/* Tombol Utama Hitam Solid */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-slate-800 text-white p-4 rounded-2xl font-bold text-xs sm:text-sm transition active:scale-[0.99] mt-2 shadow-sm"
            >
              {loading ? 'Memproses...' : isLogin ? 'Masuk' : 'Daftar Akun'}
            </button>
          </form>

          {/* Switcher Bawah */}
          <div className="mt-8 text-center pt-4 border-t border-slate-100">
            {isLogin ? (
              <p className="text-xs font-medium text-slate-600">
                Belum punya akun?{' '}
                <button
                  onClick={() => { setIsLogin(false); setPesan({ type: '', text: '' }); }}
                  className="font-black text-black underline underline-offset-4 hover:opacity-80 transition ml-1"
                >
                  Daftar Sekarang
                </button>
              </p>
            ) : (
              <p className="text-xs font-medium text-slate-600">
                Sudah punya akun?{' '}
                <button
                  onClick={() => { setIsLogin(true); setPesan({ type: '', text: '' }); }}
                  className="font-black text-black underline underline-offset-4 hover:opacity-80 transition ml-1"
                >
                  Masuk di sini
                </button>
              </p>
            )}
          </div>

        </div>

      </div>

    </div>
  )
}