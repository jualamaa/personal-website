"use client"
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { Calendar as CalendarIcon, Plus, X, Clock, Trash2, Home, User, CheckCircle2, Circle, Edit3, Sparkles, LogOut } from 'lucide-react'

export default function Jadwal() {
  const [user, setUser] = useState<any>(null)
  const [schedules, setSchedules] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [filterTab, setFilterTab] = useState<'semua' | 'hariIni' | 'mendatang'>('semua')
  
  // State Form (Tambah & Edit)
  const [editId, setEditId] = useState<string | null>(null)
  const [judul, setJudul] = useState('')
  const [tanggal, setTanggal] = useState('')
  const [waktu, setWaktu] = useState('')
  const [warna, setWarna] = useState('bg-blue-600')
  
  const router = useRouter()

  useEffect(() => {
    checkUserAndFetchData()
  }, [])

  const checkUserAndFetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/login')
    setUser(user)
    
    const { data } = await supabase
      .from('schedules')
      .select('*')
      .order('tanggal', { ascending: true })
    
    if (data) setSchedules(data)
  }

  const simpanJadwal = async () => {
    if (!judul || !tanggal) {
      alert("Nama kegiatan dan Tanggal harus diisi!")
      return
    }

    if (editId) {
      await supabase.from('schedules').update({
        judul, tanggal, waktu, warna
      }).eq('id', editId)
    } else {
      await supabase.from('schedules').insert([{
        user_id: user.id, judul, tanggal, waktu, warna, is_completed: false
      }])
    }

    setJudul(''); setTanggal(''); setWaktu(''); setEditId(null); setShowModal(false)
    checkUserAndFetchData()
  }

  const bukaEditModal = (s: any) => {
    setEditId(s.id)
    setJudul(s.judul)
    setTanggal(s.tanggal)
    setWaktu(s.waktu || '')
    setWarna(s.warna || 'bg-blue-600')
    setShowModal(true)
  }

  const toggleStatusJadwal = async (id: string, currentStatus: boolean) => {
    await supabase.from('schedules').update({ is_completed: !currentStatus }).eq('id', id)
    checkUserAndFetchData()
  }

  const hapusJadwal = async (id: string) => {
    const konfirmasi = window.confirm("Apakah Anda yakin ingin menghapus agenda ini?");
    if (konfirmasi) {
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

  const totalHariIni = schedules.filter(s => s.tanggal === todayStr && !s.is_completed).length

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
              className="px-4 py-2 text-xs font-bold rounded-xl bg-white text-blue-600 shadow-xs flex items-center gap-2"
            >
              <CalendarIcon size={16} /> Jadwal
            </button>
            <button 
              onClick={() => router.push('/profil')}
              className="px-4 py-2 text-xs font-bold rounded-xl text-slate-600 hover:text-blue-600 hover:bg-white/60 transition flex items-center gap-2"
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
        
        {/* Header Ala GoPay */}
        <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 text-white p-5 sm:p-6 md:p-8 rounded-b-[2rem] md:rounded-[2.5rem] shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-44 h-44 bg-white/10 rounded-full blur-2xl"></div>

          <div className="flex justify-between items-center mb-5 sm:mb-6 relative z-10">
            <div>
              <div className="flex items-center gap-1 text-blue-200 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-0.5">
                <Sparkles size={12} className="text-amber-300 animate-pulse" />
                <span>Manajemen Waktu</span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white">Agenda & Jadwal</h1>
            </div>

            <button 
              onClick={() => { setEditId(null); setJudul(''); setTanggal(todayStr); setWaktu(''); setShowModal(true) }}
              className="bg-white text-blue-700 p-2.5 sm:p-3 md:px-4 rounded-xl sm:rounded-2xl shadow-lg hover:bg-blue-50 active:scale-95 transition flex items-center gap-1.5 font-bold text-xs"
            >
              <Plus size={16} strokeWidth={3} />
              <span>Tambah Agenda</span>
            </button>
          </div>

          <div className="bg-white/15 backdrop-blur-md border border-white/20 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl flex items-center justify-between relative z-10 shadow-inner">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-500/30 flex items-center justify-center text-amber-300 shrink-0">
                <CalendarIcon size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-blue-100 font-medium">Kegiatan Hari Ini</p>
                <p className="text-xs sm:text-sm font-bold text-white truncate">
                  {totalHariIni > 0 ? `${totalHariIni} agenda perlu diselesaikan` : 'Tidak ada agenda tersisa hari ini'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Layout Multi-Kolom Desktop */}
        <div className="md:grid md:grid-cols-12 md:gap-6 md:mt-6">
          <div className="md:col-span-4 px-4 sm:px-6 md:px-0 mt-4 sm:mt-6 md:mt-0">
            <div className="bg-white p-2 md:p-3 rounded-xl sm:rounded-2xl shadow-sm border border-slate-200/80 flex md:flex-col gap-1">
              <button 
                onClick={() => setFilterTab('semua')}
                className={`flex-1 md:w-full py-2 px-3 text-[11px] sm:text-xs font-bold rounded-lg sm:rounded-xl transition-all text-left flex justify-between items-center ${filterTab === 'semua' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
              >
                <span>Semua Agenda</span>
                <span className="text-[10px] opacity-80">({schedules.length})</span>
              </button>
              <button 
                onClick={() => setFilterTab('hariIni')}
                className={`flex-1 md:w-full py-2 px-3 text-[11px] sm:text-xs font-bold rounded-lg sm:rounded-xl transition-all text-left flex justify-between items-center ${filterTab === 'hariIni' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
              >
                <span>Hari Ini</span>
              </button>
              <button 
                onClick={() => setFilterTab('mendatang')}
                className={`flex-1 md:w-full py-2 px-3 text-[11px] sm:text-xs font-bold rounded-lg sm:rounded-xl transition-all text-left flex justify-between items-center ${filterTab === 'mendatang' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
              >
                <span>Mendatang</span>
              </button>
            </div>
          </div>

          <div className="md:col-span-8 px-4 sm:px-6 md:px-0 mt-3 md:mt-0">
            <div className="space-y-2.5 sm:space-y-3">
              {filteredSchedules.map((s) => {
                const isToday = s.tanggal === todayStr;
                
                return (
                  <div 
                    key={s.id} 
                    className={`bg-white p-3.5 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm border transition-all duration-200 flex gap-2.5 sm:gap-3.5 items-center relative overflow-hidden ${s.is_completed ? 'opacity-60 bg-slate-50 border-slate-200' : 'border-slate-100 hover:border-blue-200 hover:shadow-md'}`}
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 sm:w-2 ${s.warna || 'bg-blue-600'}`}></div>

                    <button 
                      onClick={() => toggleStatusJadwal(s.id, s.is_completed)}
                      className="pl-1 sm:pl-2 text-slate-300 hover:text-blue-600 transition shrink-0"
                    >
                      {s.is_completed ? (
                        <CheckCircle2 size={22} className="text-emerald-500 fill-emerald-50" />
                      ) : (
                        <Circle size={22} className="hover:text-blue-600" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5 sm:mb-1">
                        <h3 className={`font-bold text-xs sm:text-sm truncate ${s.is_completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                          {s.judul}
                        </h3>
                        {isToday && !s.is_completed && (
                          <span className="px-1.5 py-0.5 text-[8px] sm:text-[9px] font-black bg-amber-100 text-amber-700 rounded uppercase shrink-0">Hari Ini</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2.5 sm:gap-3 text-[10px] sm:text-xs text-slate-400 font-medium">
                        <span className="flex items-center gap-1"><CalendarIcon size={12}/> {s.tanggal}</span>
                        {s.waktu && <span className="flex items-center gap-1"><Clock size={12}/> {s.waktu}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 shrink-0">
                      <button onClick={() => bukaEditModal(s)} className="p-1.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                        <Edit3 size={15} />
                      </button>
                      <button onClick={() => hapusJadwal(s.id)} className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                )
              })}

              {filteredSchedules.length === 0 && (
                <div className="text-center py-10 sm:py-12 bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm">
                  <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center mx-auto mb-2.5 shadow-inner">
                    <CalendarIcon size={22} />
                  </div>
                  <p className="text-slate-700 font-bold text-xs sm:text-sm mb-0.5">Tidak Ada Agenda</p>
                  <p className="text-slate-400 text-[10px] sm:text-xs">Klik tombol 'Tambah Agenda' untuk mencatat kegiatan baru.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Popup */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center z-50 animate-in fade-in duration-200 p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-[2rem] sm:rounded-2xl p-5 sm:p-6 animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-bold text-base sm:text-lg text-slate-800">{editId ? 'Edit Agenda' : 'Tambah Agenda Baru'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full transition"><X size={16}/></button>
            </div>
            
            <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Nama Kegiatan</label>
            <input type="text" placeholder="Misal: Rapat Guru, Mengajar Kelas 7A" value={judul} onChange={(e) => setJudul(e.target.value)} 
              className="w-full p-3.5 border border-slate-200 rounded-xl mb-3 text-xs font-semibold bg-slate-50 text-black focus:outline-none focus:ring-2 focus:ring-blue-600 transition" />
            
            <div className="flex gap-3 mb-3">
              <div className="flex-1">
                <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Tanggal</label>
                <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} 
                  className="w-full p-3.5 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50 text-black focus:outline-none focus:ring-2 focus:ring-blue-600 transition" />
              </div>
              <div className="flex-1">
                <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Waktu (Opsional)</label>
                <input type="time" value={waktu} onChange={(e) => setWaktu(e.target.value)} 
                  className="w-full p-3.5 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50 text-black focus:outline-none focus:ring-2 focus:ring-blue-600 transition" />
              </div>
            </div>

            <label className="text-[11px] font-semibold text-slate-500 mb-2 block">Pilih Label Warna</label>
            <div className="flex gap-2.5 mb-5">
              {['bg-blue-600', 'bg-emerald-600', 'bg-amber-500', 'bg-rose-600', 'bg-purple-600'].map(color => (
                <button key={color} onClick={() => setWarna(color)}
                  className={`w-8 h-8 rounded-xl ${color} ${warna === color ? 'ring-2 ring-offset-2 ring-blue-600 scale-105 shadow' : 'opacity-80'} transition-all`} />
              ))}
            </div>
            
            <button onClick={simpanJadwal} className="w-full text-white p-3.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/25 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all">
              {editId ? 'Perbarui Agenda' : 'Simpan Agenda'}
            </button>
          </div>
        </div>
      )}

      {/* Navigasi Bawah Khusus Mobile */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200/80 flex justify-around items-center p-2.5 z-40 shadow-xl">
        <button onClick={() => router.push('/')} className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-blue-600 transition">
          <Home size={20} strokeWidth={2.5} />
          <span className="text-[9px] font-semibold">Beranda</span>
        </button>
        <button onClick={() => router.push('/jadwal')} className="flex flex-col items-center gap-0.5 text-blue-600 transition">
          <CalendarIcon size={20} strokeWidth={2.5} />
          <span className="text-[9px] font-bold">Jadwal</span>
        </button>
        <button onClick={() => router.push('/profil')} className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-blue-600 transition">
          <User size={20} strokeWidth={2.5} />
          <span className="text-[9px] font-semibold">Profil</span>
        </button>
      </div>

    </div>
  )
}