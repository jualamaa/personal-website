"use client"
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { User, Home, Calendar, Save, LogOut, ShieldCheck, HelpCircle, Building, Mail, Sparkles, Check, Activity } from 'lucide-react'

export default function ProfilPage() {
  const [user, setUser] = useState<any>(null)
  const [nama, setNama] = useState('')
  const [instansi, setInstansi] = useState('')
  const [pesan, setPesan] = useState('')
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({ totalTrx: 0, totalSchedule: 0 })
  const [cardColor, setCardColor] = useState('from-blue-600 via-indigo-600 to-blue-800')

  const router = useRouter()

  useEffect(() => {
    fetchUserAndProfile()
  }, [])

  const fetchUserAndProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/login')
    setUser(user)

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (profile) {
      setNama(profile.nama || '')
      setInstansi(profile.instansi || '')
    }

    const { count: trxCount } = await supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    const { count: schCount } = await supabase.from('schedules').select('*', { count: 'exact', head: true }).eq('user_id', user.id)

    setStats({ totalTrx: trxCount || 0, totalSchedule: schCount || 0 })
  }

  const updateProfil = async () => {
    if (!user) return
    setLoading(true)
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      nama,
      instansi
    })

    setLoading(false)
    if (error) {
      setPesan('Gagal memperbarui profil.')
    } else {
      setPesan('Profil berhasil diperbarui!')
      setTimeout(() => setPesan(''), 3000)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!user) return null

  const inisial = nama ? nama.substring(0, 2).toUpperCase() : user.email?.substring(0, 2).toUpperCase()

  return (
    <div className="w-full min-h-screen bg-slate-100 text-slate-900 pb-28 md:pb-12 animate-in fade-in duration-300">

      {/* Top Navbar Khusus Desktop */}
      <header className="hidden md:block bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black">
              P
            </div>
            <span className="font-extrabold text-slate-800 text-base tracking-wide">PNS Tracker</span>
          </div>

          <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 text-xs font-bold rounded-xl text-slate-600 hover:text-blue-600 hover:bg-white/60 transition flex items-center gap-2"
            >
              <Home size={16} /> Beranda
            </button>
            <button
              onClick={() => router.push('/jadwal')}
              className="px-4 py-2 text-xs font-bold rounded-xl text-slate-600 hover:text-blue-600 hover:bg-white/60 transition flex items-center gap-2"
            >
              <Calendar size={16} /> Jadwal
            </button>
            <button
              onClick={() => router.push('/profil')}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-white text-blue-600 shadow-xs flex items-center gap-2"
            >
              <User size={16} /> Profil
            </button>
          </nav>

          <button
            onClick={handleLogout}
            className="text-xs font-bold text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-xl transition flex items-center gap-1.5"
          >
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </header>

      {/* Container Utama Responsive */}
      <div className="max-w-md md:max-w-5xl mx-auto pt-0 md:pt-6 px-0 md:px-6">

        {/* Kartu Digital Header */}
        <div className={`bg-gradient-to-br ${cardColor} text-white p-5 sm:p-6 md:p-8 rounded-b-[2rem] md:rounded-[2.5rem] shadow-xl relative overflow-hidden transition-all duration-500`}>
          <div className="absolute -right-10 -top-10 w-44 h-44 bg-white/10 rounded-full blur-2xl"></div>

          <div className="flex justify-between items-center mb-5 relative z-10">
            <div className="flex items-center gap-1.5 text-blue-200 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
              <Sparkles size={14} className="text-amber-300 animate-pulse" />
              <span>Kartu Anggota Digital</span>
            </div>
            <button onClick={handleLogout} className="md:hidden p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-blue-100 transition active:scale-95 shadow-sm">
              <LogOut size={15} />
            </button>
          </div>

          <div className="flex items-center gap-4 relative z-10 mb-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white text-blue-700 font-black text-lg sm:text-xl flex items-center justify-center shadow-lg border-2 border-white/30 shrink-0">
              {inisial}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-xl font-bold text-white capitalize truncate">{nama || 'Pengguna Baru'}</h2>
              <p className="text-[11px] sm:text-xs text-blue-100/80 font-medium truncate">{instansi || 'Instansi belum diisi'}</p>
              <span className="inline-block mt-1 text-[9px] sm:text-[10px] bg-white/20 px-2.5 py-0.5 rounded-full font-semibold text-blue-100 backdrop-blur-xs">
                PNS Tracker Member
              </span>
            </div>
          </div>

          <div className="bg-white/15 backdrop-blur-md border border-white/20 p-3 sm:p-4 rounded-xl sm:rounded-2xl flex justify-around items-center relative z-10 shadow-inner max-w-lg">
            <div className="text-center">
              <p className="text-[9px] sm:text-[10px] text-blue-100 font-semibold uppercase">Total Transaksi</p>
              <p className="text-sm sm:text-base font-black text-white">{stats.totalTrx}</p>
            </div>
            <div className="w-px h-5 bg-white/20"></div>
            <div className="text-center">
              <p className="text-[9px] sm:text-[10px] text-blue-100 font-semibold uppercase">Agenda Terjadwal</p>
              <p className="text-sm sm:text-base font-black text-white">{stats.totalSchedule}</p>
            </div>
          </div>
        </div>

        {/* Layout Multi-Kolom Desktop */}
        <div className="md:grid md:grid-cols-12 md:gap-6 md:mt-6">
          <div className="md:col-span-5 px-4 sm:px-6 md:px-0 mt-3.5 md:mt-0 space-y-3.5">
            <div className="flex items-center justify-between bg-white p-3 rounded-xl sm:rounded-2xl shadow-sm border border-slate-200/80">
              <span className="text-[11px] sm:text-xs font-bold text-slate-600">Tema Kartu Digital</span>
              <div className="flex gap-2">
                {[
                  { id: 'blue', style: 'from-blue-600 via-indigo-600 to-blue-800' },
                  { id: 'emerald', style: 'from-emerald-700 via-teal-700 to-slate-900' },
                  { id: 'purple', style: 'from-purple-700 via-indigo-700 to-slate-900' },
                ].map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setCardColor(theme.style)}
                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-r ${theme.style} ${cardColor === theme.style ? 'ring-2 ring-offset-2 ring-blue-600 scale-105' : 'opacity-80'} transition-all`}
                  />
                ))}
              </div>
            </div>

            <div className="bg-white p-2 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200/80 space-y-1">
              <button className="w-full p-3 flex items-center justify-between hover:bg-slate-50 rounded-xl transition text-left">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Keamanan Akun</p>
                    <p className="text-[9px] text-slate-400">Terhubung dengan Supabase Auth</p>
                  </div>
                </div>
                <span className="text-[10px] text-blue-600 font-bold">Aktif</span>
              </button>

              <button className="w-full p-3 flex items-center justify-between hover:bg-slate-50 rounded-xl transition text-left">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Activity size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Pusat Bantuan & Panduan</p>
                    <p className="text-[9px] text-slate-400">Petunjuk penggunaan aplikasi</p>
                  </div>
                </div>
                <HelpCircle size={15} className="text-slate-300" />
              </button>
            </div>
          </div>

          <div className="md:col-span-7 px-4 sm:px-6 md:px-0 mt-3.5 md:mt-0">
            {pesan && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-2.5 mb-3 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 animate-in fade-in">
                <Check size={15} /> {pesan}
              </div>
            )}

            <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200/80 space-y-3 sm:space-y-4">
              <h3 className="font-bold text-slate-800 text-xs sm:text-sm mb-1 flex items-center gap-1.5">
                <User size={15} className="text-blue-600" /> Informasi Data Diri
              </h3>

              <div>
                <label className="text-[10px] sm:text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1">
                  <Mail size={11} /> Email Akun
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50 text-slate-500 cursor-not-allowed outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] sm:text-[11px] font-bold text-slate-600 mb-1 block">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  placeholder="Contoh: Joseph Kurniawan"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50 text-black focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                />
              </div>

              <div>
                <label className="text-[10px] sm:text-[11px] font-bold text-slate-600 mb-1 block flex items-center gap-1">
                  <Building size={11} /> Instansi
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Guru"
                  value={instansi}
                  onChange={(e) => setInstansi(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50 text-black focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                />
              </div>

              <button
                onClick={updateProfil}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-xl font-bold text-xs shadow-lg shadow-blue-600/25 active:scale-95 transition flex items-center justify-center gap-1.5"
              >
                <Save size={15} /> {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigasi Bawah Khusus Mobile */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200/80 flex justify-around items-center p-2.5 z-40 shadow-xl">
        <button onClick={() => router.push('/')} className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-blue-600 transition">
          <Home size={20} strokeWidth={2.5} />
          <span className="text-[9px] font-semibold">Beranda</span>
        </button>
        <button onClick={() => router.push('/jadwal')} className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-blue-600 transition">
          <Calendar size={20} strokeWidth={2.5} />
          <span className="text-[9px] font-semibold">Jadwal</span>
        </button>
        <button onClick={() => router.push('/profil')} className="flex flex-col items-center gap-0.5 text-blue-600 transition">
          <User size={20} strokeWidth={2.5} />
          <span className="text-[9px] font-bold">Profil</span>
        </button>
      </div>

    </div>
  )
}