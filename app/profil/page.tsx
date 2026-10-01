"use client"
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { User, Home, Calendar, Save, LogOut, Building, Mail, Check } from 'lucide-react'

export default function ProfilPage() {
  const [user, setUser] = useState<any>(null)
  const [nama, setNama] = useState('')
  const [instansi, setInstansi] = useState('')
  const [pesan, setPesan] = useState('')
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({ totalTrx: 0, totalSchedule: 0 })

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

  return (
    <div className="w-full min-h-screen bg-[#F3F4F6] text-[#111111] font-sans antialiased pb-28 md:pb-12">
      
      {/* Top Header Desktop */}
      <header className="hidden md:block bg-white border-b border-gray-200/80 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#111111] text-white rounded-xl flex items-center justify-center font-bold text-sm">
              P
            </div>
            <span className="font-bold text-[#111111] text-base tracking-tight">PNS Tracker</span>
          </div>

          <nav className="flex items-center gap-1 bg-[#F3F4F6] p-1 rounded-2xl">
            <button onClick={() => router.push('/')} className="px-5 py-2 text-xs font-medium rounded-xl text-gray-500 hover:text-[#111111] transition flex items-center gap-2">
              <Home size={15} /> Beranda
            </button>
            <button onClick={() => router.push('/jadwal')} className="px-5 py-2 text-xs font-medium rounded-xl text-gray-500 hover:text-[#111111] transition flex items-center gap-2">
              <Calendar size={15} /> Jadwal
            </button>
            <button onClick={() => router.push('/profil')} className="px-5 py-2 text-xs font-bold rounded-xl bg-white text-[#111111] shadow-xs flex items-center gap-2">
              <User size={15} /> Profil
            </button>
          </nav>

          <button onClick={handleLogout} className="text-xs font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50 px-3.5 py-2 rounded-xl transition flex items-center gap-2">
            <LogOut size={15} /> Keluar
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-4 md:pt-8">
        
        {/* Kartu Profil Utama Solid */}
        <div className="bg-[#111111] text-white p-6 rounded-3xl shadow-xs max-w-2xl mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-white text-[#111111] font-extrabold text-lg flex items-center justify-center shrink-0">
              {nama ? nama.substring(0, 2).toUpperCase() : user.email?.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold truncate">{nama || 'Pengguna PNS Tracker'}</h2>
              <p className="text-xs text-gray-400 truncate">{instansi || 'Instansi belum diisi'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-800 text-center">
            <div>
              <p className="text-[10px] text-gray-400 font-medium uppercase">Total Transaksi</p>
              <p className="text-base font-extrabold mt-0.5">{stats.totalTrx}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-medium uppercase">Agenda Tersimpan</p>
              <p className="text-base font-extrabold mt-0.5">{stats.totalSchedule}</p>
            </div>
          </div>
        </div>

        {/* Form Edit Informasi Data Diri */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 max-w-2xl space-y-4">
          <h3 className="font-bold text-[#111111] text-sm mb-2">Informasi Akun & Data Diri</h3>

          {pesan && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-2xl text-xs font-semibold flex items-center gap-2">
              <Check size={16} /> {pesan}
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold text-gray-500 mb-1 flex items-center gap-1">
              <Mail size={12} /> Email Akun
            </label>
            <input 
              type="email" 
              disabled 
              value={user.email} 
              className="w-full p-3.5 border border-gray-200 rounded-2xl text-xs font-medium bg-[#F3F4F6] text-gray-400 cursor-not-allowed outline-none" 
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-700 mb-1 block">Nama Lengkap & Gelar</label>
            <input 
              type="text" 
              placeholder="Contoh: Budi Santoso, S.Pd." 
              value={nama} 
              onChange={(e) => setNama(e.target.value)} 
              className="w-full p-3.5 border border-gray-200 rounded-2xl text-xs font-medium bg-[#F3F4F6] text-[#111111] focus:outline-none focus:bg-white transition" 
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1">
              <Building size={12} /> Instansi / Tempat Tugas
            </label>
            <input 
              type="text" 
              placeholder="Contoh: SDN 01 Sukamaju" 
              value={instansi} 
              onChange={(e) => setInstansi(e.target.value)} 
              className="w-full p-3.5 border border-gray-200 rounded-2xl text-xs font-medium bg-[#F3F4F6] text-[#111111] focus:outline-none focus:bg-white transition" 
            />
          </div>

          <button 
            onClick={updateProfil} 
            disabled={loading}
            className="w-full bg-[#111111] hover:bg-gray-800 text-white p-4 rounded-2xl font-bold text-xs transition active:scale-[0.99] flex items-center justify-center gap-2 mt-2"
          >
            <Save size={16} /> {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>

      </main>

      {/* Bottom Nav Mobile */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 flex justify-around items-center p-3 z-40">
        <button onClick={() => router.push('/')} className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#111111]">
          <Home size={18} />
          <span className="text-[10px] font-semibold">Beranda</span>
        </button>
        <button onClick={() => router.push('/jadwal')} className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#111111]">
          <Calendar size={18} />
          <span className="text-[10px] font-semibold">Jadwal</span>
        </button>
        <button onClick={() => router.push('/profil')} className="flex flex-col items-center gap-1 text-[#111111]">
          <User size={18} />
          <span className="text-[10px] font-bold">Profil</span>
        </button>
      </div>

    </div>
  )
}