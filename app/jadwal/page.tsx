"use client"
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { Calendar as CalendarIcon, Plus, X, Clock, Trash2, Home, User, CheckCircle2, Circle, Edit3, LogOut } from 'lucide-react'

export default function Jadwal() {
  const [user, setUser] = useState<any>(null)
  const [schedules, setSchedules] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [filterTab, setFilterTab] = useState<'semua' | 'hariIni' | 'mendatang'>('semua')
  
  const [editId, setEditId] = useState<string | null>(null)
  const [judul, setJudul] = useState('')
  const [tanggal, setTanggal] = useState('')
  const [waktu, setWaktu] = useState('')
  
  const router = useRouter()

  useEffect(() => {
    checkUserAndFetchData()
  }, [])

  const checkUserAndFetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/login')
    setUser(user)
    
    const { data } = await supabase.from('schedules').select('*').order('tanggal', { ascending: true })
    if (data) setSchedules(data)
  }

  const simpanJadwal = async () => {
    if (!judul || !tanggal) {
      alert("Nama kegiatan dan Tanggal harus diisi!")
      return
    }

    if (editId) {
      await supabase.from('schedules').update({ judul, tanggal, waktu }).eq('id', editId)
    } else {
      await supabase.from('schedules').insert([{ user_id: user.id, judul, tanggal, waktu, is_completed: false }])
    }

    setJudul(''); setTanggal(''); setWaktu(''); setEditId(null); setShowModal(false)
    checkUserAndFetchData()
  }

  const bukaEditModal = (s: any) => {
    setEditId(s.id)
    setJudul(s.judul)
    setTanggal(s.tanggal)
    setWaktu(s.waktu || '')
    setShowModal(true)
  }

  const toggleStatusJadwal = async (id: string, currentStatus: boolean) => {
    await supabase.from('schedules').update({ is_completed: !currentStatus }).eq('id', id)
    checkUserAndFetchData()
  }

  const hapusJadwal = async (id: string) => {
    if (window.confirm("Hapus agenda kegiatan ini?")) {
      await supabase.from('schedules').delete().eq('id', id)
      checkUserAndFetchData()
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!user) return null

  const todayStr = new Date().toISOString().split('T')[0]

  const filteredSchedules = schedules.filter(s => {
    if (filterTab === 'hariIni') return s.tanggal === todayStr
    if (filterTab === 'mendatang') return s.tanggal > todayStr
    return true
  })

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
            <button onClick={() => router.push('/jadwal')} className="px-5 py-2 text-xs font-bold rounded-xl bg-white text-[#111111] shadow-xs flex items-center gap-2">
              <CalendarIcon size={15} /> Jadwal
            </button>
            <button onClick={() => router.push('/profil')} className="px-5 py-2 text-xs font-medium rounded-xl text-gray-500 hover:text-[#111111] transition flex items-center gap-2">
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
        
        {/* Header Title */}
        <div className="flex justify-between items-center mb-6 px-1">
          <div>
            <h1 className="text-xl font-extrabold text-[#111111] tracking-tight">Agenda & Kegiatan</h1>
            <p className="text-xs text-gray-400 font-medium">Kelola jadwal rapat dan tugas harianmu</p>
          </div>

          <button 
            onClick={() => { setEditId(null); setJudul(''); setTanggal(todayStr); setWaktu(''); setShowModal(true) }}
            className="bg-[#111111] hover:bg-gray-800 text-white px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 active:scale-95 shadow-xs"
          >
            <Plus size={16} />
            <span>Tambah Agenda</span>
          </button>
        </div>

        {/* Tab Filter Pill-Shaped Sesuai Referensi */}
        <div className="flex gap-2 mb-6 bg-white p-1.5 rounded-2xl border border-gray-200/80 max-w-md">
          <button 
            onClick={() => setFilterTab('semua')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${filterTab === 'semua' ? 'bg-[#111111] text-white' : 'text-gray-500 hover:text-[#111111]'}`}
          >
            Semua ({schedules.length})
          </button>
          <button 
            onClick={() => setFilterTab('hariIni')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${filterTab === 'hariIni' ? 'bg-[#111111] text-white' : 'text-gray-500 hover:text-[#111111]'}`}
          >
            Hari Ini
          </button>
          <button 
            onClick={() => setFilterTab('mendatang')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${filterTab === 'mendatang' ? 'bg-[#111111] text-white' : 'text-gray-500 hover:text-[#111111]'}`}
          >
            Mendatang
          </button>
        </div>

        {/* List Agenda */}
        <div className="space-y-2.5 max-w-3xl">
          {filteredSchedules.map((s) => (
            <div 
              key={s.id} 
              className={`bg-white p-4 rounded-2xl border border-gray-200/80 flex items-center justify-between gap-3 transition ${s.is_completed ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <button onClick={() => toggleStatusJadwal(s.id, s.is_completed)} className="text-gray-400 hover:text-[#111111]">
                  {s.is_completed ? <CheckCircle2 size={20} className="text-emerald-600" /> : <Circle size={20} />}
                </button>
                <div className="min-w-0">
                  <p className={`font-bold text-xs sm:text-sm truncate ${s.is_completed ? 'line-through text-gray-400' : 'text-[#111111]'}`}>
                    {s.judul}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-gray-400 font-medium mt-0.5">
                    <span className="flex items-center gap-1"><CalendarIcon size={12}/> {s.tanggal}</span>
                    {s.waktu && <span className="flex items-center gap-1"><Clock size={12}/> {s.waktu}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => bukaEditModal(s)} className="p-1.5 text-gray-400 hover:text-[#111111] hover:bg-gray-100 rounded-lg transition"><Edit3 size={14}/></button>
                <button onClick={() => hapusJadwal(s.id)} className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-gray-100 rounded-lg transition"><Trash2 size={14}/></button>
              </div>
            </div>
          ))}

          {filteredSchedules.length === 0 && (
            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
              <p className="text-xs text-gray-400 font-medium">Tidak ada agenda dalam kategori ini.</p>
            </div>
          )}
        </div>

      </main>

      {/* Modal Popup Agenda */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 border border-gray-200 shadow-xl animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-bold text-base text-[#111111]">{editId ? 'Edit Agenda' : 'Tambah Agenda Baru'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition"><X size={16}/></button>
            </div>
            
            <label className="text-[11px] font-bold text-gray-500 mb-1 block">Nama Kegiatan</label>
            <input type="text" placeholder="Contoh: Rapat Koordinasi, Mengajar Kelas 7A" value={judul} onChange={(e) => setJudul(e.target.value)} 
              className="w-full p-3.5 border border-gray-200 rounded-2xl mb-3 text-xs font-semibold bg-[#F3F4F6] text-[#111111] focus:outline-none focus:bg-white transition" />
            
            <div className="flex gap-3 mb-6">
              <div className="flex-1">
                <label className="text-[11px] font-bold text-gray-500 mb-1 block">Tanggal</label>
                <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} 
                  className="w-full p-3.5 border border-gray-200 rounded-2xl text-xs font-semibold bg-[#F3F4F6] text-[#111111] focus:outline-none focus:bg-white transition" />
              </div>
              <div className="flex-1">
                <label className="text-[11px] font-bold text-gray-500 mb-1 block">Waktu (Opsional)</label>
                <input type="time" value={waktu} onChange={(e) => setWaktu(e.target.value)} 
                  className="w-full p-3.5 border border-gray-200 rounded-2xl text-xs font-semibold bg-[#F3F4F6] text-[#111111] focus:outline-none focus:bg-white transition" />
              </div>
            </div>
            
            <button onClick={simpanJadwal} className="w-full bg-[#111111] hover:bg-gray-800 text-white p-4 rounded-2xl font-bold text-xs transition active:scale-[0.99]">
              {editId ? 'Perbarui Agenda' : 'Simpan Agenda'}
            </button>
          </div>
        </div>
      )}

      {/* Bottom Nav Mobile */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 flex justify-around items-center p-3 z-40">
        <button onClick={() => router.push('/')} className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#111111]">
          <Home size={18} />
          <span className="text-[10px] font-semibold">Beranda</span>
        </button>
        <button onClick={() => router.push('/jadwal')} className="flex flex-col items-center gap-1 text-[#111111]">
          <CalendarIcon size={18} />
          <span className="text-[10px] font-bold">Jadwal</span>
        </button>
        <button onClick={() => router.push('/profil')} className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#111111]">
          <User size={18} />
          <span className="text-[10px] font-semibold">Profil</span>
        </button>
      </div>

    </div>
  )
}