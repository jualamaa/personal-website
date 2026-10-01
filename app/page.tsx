"use client"
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import { LogOut, Eye, EyeOff, X, Home, Calendar, User, Trash2, Edit3, Plus, ArrowUpRight, ArrowDownLeft, PieChart, CheckCircle2, Circle, Search, ChevronRight, History } from 'lucide-react'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [userName, setUserName] = useState<string>('Pengguna')
  const [transactions, setTransactions] = useState<any[]>([])
  const [schedules, setSchedules] = useState<any[]>([])
  
  // State Modal Input & Modal Semua Riwayat
  const [showModal, setShowModal] = useState(false)
  const [showAllModal, setShowAllModal] = useState(false)
  const [showBalance, setShowBalance] = useState(true)
  
  // State Filter & Pencarian
  const [filterRingkasan, setFilterRingkasan] = useState<string>('bulan')
  const [customDays, setCustomDays] = useState<number | ''>(14)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTypeModal, setFilterTypeModal] = useState<'semua' | 'pemasukan' | 'pengeluaran'>('semua')
  
  // State Form Transaksi
  const [editId, setEditId] = useState<string | null>(null)
  const [jumlah, setJumlah] = useState('')
  const [kategori, setKategori] = useState('')
  const [jenis, setJenis] = useState('pemasukan')
  
  const router = useRouter()

  useEffect(() => {
    checkUserAndFetchData()
  }, [])

  const checkUserAndFetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/login')
    setUser(user)
    
    const { data: profile } = await supabase.from('profiles').select('nama').eq('id', user.id).single()
    if (profile && profile.nama) setUserName(profile.nama)
    
    const { data: trxData } = await supabase.from('transactions').select('*').order('tanggal', { ascending: false })
    if (trxData) setTransactions(trxData)

    const { data: schData } = await supabase.from('schedules').select('*').order('tanggal', { ascending: true }).limit(3)
    if (schData) setSchedules(schData)
  }

  const simpanTransaksi = async () => {
    if (!jumlah || !kategori) {
      alert("Nominal dan Kategori wajib diisi!")
      return
    }
    
    if (editId) {
      await supabase.from('transactions').update({ jenis, kategori, jumlah: parseFloat(jumlah) }).eq('id', editId)
    } else {
      await supabase.from('transactions').insert([{ user_id: user.id, jenis, kategori, jumlah: parseFloat(jumlah) }])
    }
    
    setJumlah(''); setKategori(''); setEditId(null); setShowModal(false); checkUserAndFetchData()
  }

  const bukaEditModal = (t: any) => {
    setEditId(t.id)
    setJenis(t.jenis)
    setKategori(t.kategori)
    setJumlah(t.jumlah.toString())
    setShowModal(true)
  }

  const hapusTransaksi = async (id: string) => {
    if (window.confirm("Hapus catatan transaksi ini?")) {
      await supabase.from('transactions').delete().eq('id', id)
      checkUserAndFetchData()
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Kalkulasi Keuangan
  let ringkasanPemasukan = 0
  let ringkasanPengeluaran = 0
  let totalSaldo = 0
  
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  transactions.forEach(t => {
    const tAmount = Number(t.jumlah)
    const tDate = new Date(t.tanggal)
    
    if (t.jenis === 'pemasukan') totalSaldo += tAmount
    else totalSaldo -= tAmount

    if (filterRingkasan === 'bulan') {
      if (tDate.getFullYear() === currentYear && tDate.getMonth() === currentMonth) {
        if (t.jenis === 'pemasukan') ringkasanPemasukan += tAmount
        else ringkasanPengeluaran += tAmount
      }
    } else {
      const diffTime = now.getTime() - tDate.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      let limitDays = filterRingkasan === '7' ? 7 : filterRingkasan === '30' ? 30 : Number(customDays) || 0

      if (diffDays <= limitDays && diffDays >= -1) {
        if (t.jenis === 'pemasukan') ringkasanPemasukan += tAmount
        else ringkasanPengeluaran += tAmount
      }
    }
  })

  const rasioPengeluaran = ringkasanPemasukan > 0 ? Math.min(Math.round((ringkasanPengeluaran / ringkasanPemasukan) * 100), 100) : 0

  // Filter Transaksi untuk Modal Semua Riwayat
  const filteredModalTransactions = transactions.filter(t => {
    const matchSearch = t.kategori.toLowerCase().includes(searchQuery.toLowerCase())
    const matchType = filterTypeModal === 'semua' || t.jenis === filterTypeModal
    return matchSearch && matchType
  })

  if (!user) return null

  const saranPemasukan = ['Gaji Pokok', 'Sertifikasi', 'Tunjangan', 'Honor Extra', 'Bisnis']
  const saranPengeluaran = ['Makan & Minum', 'Transportasi', 'Cicilan / Koperasi', 'Belanja', 'Tagihan']

  return (
    <div className="w-full min-h-screen bg-[#F3F4F6] text-[#111111] font-sans antialiased pb-28 md:pb-12">
      
      {/* Top Header Navigation (Desktop) */}
      <header className="hidden md:block bg-white border-b border-gray-200/80 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#111111] text-white rounded-xl flex items-center justify-center font-bold text-sm">
              P
            </div>
            <span className="font-bold text-[#111111] text-base tracking-tight">PNS Tracker</span>
          </div>

          <nav className="flex items-center gap-1 bg-[#F3F4F6] p-1 rounded-2xl">
            <button onClick={() => router.push('/')} className="px-5 py-2 text-xs font-bold rounded-xl bg-white text-[#111111] shadow-xs flex items-center gap-2">
              <Home size={15} /> Beranda
            </button>
            <button onClick={() => router.push('/jadwal')} className="px-5 py-2 text-xs font-medium rounded-xl text-gray-500 hover:text-[#111111] transition flex items-center gap-2">
              <Calendar size={15} /> Jadwal
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
        
        {/* Header Profil */}
        <div className="flex justify-between items-center mb-6 px-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center font-bold text-sm text-[#111111]">
              {userName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-400">Selamat Datang,</p>
              <h1 className="font-bold text-base text-[#111111] capitalize">{userName}</h1>
            </div>
          </div>

          <button onClick={handleLogout} className="md:hidden p-2 text-gray-500 bg-white rounded-2xl border border-gray-200">
            <LogOut size={18} />
          </button>
        </div>

        {/* Highlight Grid (Kartu Hitam & Putih Berdampingan) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 mb-6">
          
          {/* Kartu Hitam Saldo Utama */}
          <div className="md:col-span-6 bg-[#111111] text-white p-6 rounded-3xl shadow-xs flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-xs text-gray-400 font-medium block mb-1">Total Saldo Aktif</span>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    {showBalance ? `Rp ${totalSaldo.toLocaleString('id-ID')}` : 'Rp ••••••••'}
                  </h2>
                  <button onClick={() => setShowBalance(!showBalance)} className="text-gray-400 hover:text-white transition">
                    {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 pt-4 border-t border-gray-800">
              <button 
                onClick={() => { setEditId(null); setJenis('pemasukan'); setKategori(''); setJumlah(''); setShowModal(true) }}
                className="flex-1 bg-white text-[#111111] py-3 rounded-2xl text-xs font-bold hover:bg-gray-100 active:scale-[0.98] transition flex items-center justify-center gap-2"
              >
                <ArrowDownLeft size={16} className="text-emerald-600" />
                <span>+ Pemasukan</span>
              </button>

              <button 
                onClick={() => { setEditId(null); setJenis('pengeluaran'); setKategori(''); setJumlah(''); setShowModal(true) }}
                className="flex-1 bg-gray-900 text-white py-3 border border-gray-800 rounded-2xl text-xs font-bold hover:bg-gray-800 active:scale-[0.98] transition flex items-center justify-center gap-2"
              >
                <ArrowUpRight size={16} className="text-rose-400" />
                <span>- Pengeluaran</span>
              </button>
            </div>
          </div>

          {/* Kartu Putih Ringkasan Pembukuan */}
          <div className="md:col-span-6 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4 gap-2">
                <div className="flex items-center gap-2">
                  <PieChart size={18} className="text-[#111111]" />
                  <h3 className="font-bold text-[#111111] text-sm">Pembukuan Periodik</h3>
                </div>

                {/* Dropdown & Input Kustom Hari */}
                <div className="flex items-center gap-1.5">
                  {filterRingkasan === 'custom' && (
                    <div className="flex items-center bg-[#F3F4F6] border border-gray-200 rounded-xl px-2.5 py-1">
                      <input 
                        type="number" 
                        value={customDays} 
                        onChange={(e) => {
                          if (e.target.value === '') { setCustomDays(''); return; }
                          let val = parseInt(e.target.value);
                          if (val > 365) val = 365;
                          if (val < 1) val = 1;
                          setCustomDays(val);
                        }}
                        className="w-9 text-xs font-bold text-[#111111] bg-transparent outline-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                        placeholder="14"
                      />
                      <span className="text-[11px] font-semibold text-gray-500">Hari</span>
                    </div>
                  )}

                  <select 
                    value={filterRingkasan} 
                    onChange={(e) => setFilterRingkasan(e.target.value)}
                    className="text-xs font-semibold text-gray-700 bg-[#F3F4F6] px-3 py-1.5 rounded-xl outline-none border border-gray-200 cursor-pointer hover:border-gray-300 transition"
                  >
                    <option value="bulan">Bulan Ini</option>
                    <option value="7">7 Hari Terakhir</option>
                    <option value="30">30 Hari Terakhir</option>
                    <option value="custom">Kustom Hari...</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3.5 bg-[#F3F4F6] rounded-2xl mb-4">
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Pemasukan</p>
                  <p className="font-extrabold text-sm text-emerald-600 mt-0.5">
                    {showBalance ? `+Rp ${ringkasanPemasukan.toLocaleString('id-ID')}` : '••••••'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Pengeluaran</p>
                  <p className="font-extrabold text-sm text-rose-600 mt-0.5">
                    {showBalance ? `-Rp ${ringkasanPengeluaran.toLocaleString('id-ID')}` : '••••••'}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs text-gray-500 font-medium mb-1.5">
                <span>Rasio Pengeluaran</span>
                <span className="font-bold text-[#111111]">{rasioPengeluaran}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${rasioPengeluaran > 80 ? 'bg-rose-600' : 'bg-[#111111]'}`} 
                  style={{ width: `${rasioPengeluaran}%` }}
                ></div>
              </div>
            </div>
          </div>

        </div>

        {/* Layout Riwayat Transaksi (Maksimal 10 Terbaru) & Agenda Singkat */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Riwayat Transaksi (Maksimal 10) */}
          <div className="md:col-span-8 space-y-3">
            <div className="flex justify-between items-center px-1">
              <h3 className="font-bold text-[#111111] text-sm">Riwayat Transaksi</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-medium">{transactions.length} transaksi</span>
                {transactions.length > 10 && (
                  <button 
                    onClick={() => setShowAllModal(true)}
                    className="text-xs font-bold text-[#111111] hover:underline flex items-center gap-0.5"
                  >
                    Lihat Semua <ChevronRight size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2.5">
              {/* DIBATASI HANYA 10 TRANSAKSI TERBARU */}
              {transactions.slice(0, 10).map((t) => (
                <div key={t.id} className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs flex justify-between items-center hover:border-gray-300 transition">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${t.jenis === 'pemasukan' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {t.jenis === 'pemasukan' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-[#111111] text-xs sm:text-sm capitalize truncate">{t.kategori}</p>
                      <p className="text-[10px] text-gray-400 font-medium">{t.tanggal}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <p className={`font-extrabold text-xs sm:text-sm ${t.jenis === 'pemasukan' ? 'text-emerald-600' : 'text-[#111111]'}`}>
                      {t.jenis === 'pemasukan' ? '+' : '-'}Rp {Number(t.jumlah).toLocaleString('id-ID')}
                    </p>
                    <div className="flex items-center gap-1">
                      <button onClick={() => bukaEditModal(t)} className="p-1.5 text-gray-400 hover:text-[#111111] hover:bg-gray-100 rounded-lg transition"><Edit3 size={14}/></button>
                      <button onClick={() => hapusTransaksi(t.id)} className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-gray-100 rounded-lg transition"><Trash2 size={14}/></button>
                    </div>
                  </div>
                </div>
              ))}

              {transactions.length > 10 && (
                <button 
                  onClick={() => setShowAllModal(true)}
                  className="w-full py-3 bg-white hover:bg-gray-100 text-[#111111] border border-gray-200 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <History size={14} />
                  <span>Lihat Semua ({transactions.length}) Transaksi</span>
                </button>
              )}

              {transactions.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                  <p className="text-xs text-gray-500 font-medium">Belum ada catatan transaksi.</p>
                </div>
              )}
            </div>
          </div>

          {/* Agenda Mendatang Singkat */}
          <div className="md:col-span-4 space-y-3">
            <div className="flex justify-between items-center px-1">
              <h3 className="font-bold text-[#111111] text-sm">Agenda Terdekat</h3>
              <button onClick={() => router.push('/jadwal')} className="text-xs text-gray-500 hover:text-[#111111] font-semibold">
                Lihat Semua
              </button>
            </div>

            <div className="space-y-2.5">
              {schedules.map((s) => (
                <div key={s.id} className="bg-white p-3.5 rounded-2xl border border-gray-200/80 flex items-center gap-3">
                  <div className="text-gray-400">
                    {s.is_completed ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Circle size={18} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`font-semibold text-xs truncate ${s.is_completed ? 'line-through text-gray-400' : 'text-[#111111]'}`}>
                      {s.judul}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium">{s.tanggal} {s.waktu ? `• ${s.waktu}` : ''}</p>
                  </div>
                </div>
              ))}

              {schedules.length === 0 && (
                <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-gray-200">
                  <p className="text-xs text-gray-400">Tidak ada agenda tersisa.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Floating Action Button untuk Mobile */}
      <div className="fixed bottom-20 right-5 md:hidden z-30">
        <button 
          onClick={() => { setEditId(null); setJenis('pemasukan'); setKategori(''); setJumlah(''); setShowModal(true) }}
          className="bg-[#111111] text-white p-4 rounded-full shadow-lg flex items-center justify-center active:scale-95 transition"
        >
          <Plus size={22} />
        </button>
      </div>

      {/* MODAL FITUR TERSENDIRI: LIHAT SEMUA TRANSAKSI */}
      {showAllModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 border border-gray-200 shadow-2xl max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-150">
            
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
              <div>
                <h2 className="font-extrabold text-base text-[#111111]">Semua Riwayat Transaksi</h2>
                <p className="text-[11px] text-gray-400 font-medium">Total {transactions.length} catatan transaksi tersimpan</p>
              </div>
              <button onClick={() => setShowAllModal(false)} className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition"><X size={16}/></button>
            </div>

            {/* Bar Filter & Pencarian Dalam Modal */}
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Cari kategori transaksi..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs font-medium bg-[#F3F4F6] text-[#111111] outline-none focus:bg-white transition"
                />
              </div>

              <div className="flex gap-1 bg-[#F3F4F6] p-1 rounded-xl">
                <button 
                  onClick={() => setFilterTypeModal('semua')}
                  className={`px-3 py-1 text-[11px] font-bold rounded-lg transition ${filterTypeModal === 'semua' ? 'bg-[#111111] text-white' : 'text-gray-500'}`}
                >
                  Semua
                </button>
                <button 
                  onClick={() => setFilterTypeModal('pemasukan')}
                  className={`px-3 py-1 text-[11px] font-bold rounded-lg transition ${filterTypeModal === 'pemasukan' ? 'bg-[#111111] text-white' : 'text-gray-500'}`}
                >
                  Pemasukan
                </button>
                <button 
                  onClick={() => setFilterTypeModal('pengeluaran')}
                  className={`px-3 py-1 text-[11px] font-bold rounded-lg transition ${filterTypeModal === 'pengeluaran' ? 'bg-[#111111] text-white' : 'text-gray-500'}`}
                >
                  Pengeluaran
                </button>
              </div>
            </div>

            {/* List Transaksi Modal Scrollable */}
            <div className="overflow-y-auto flex-1 space-y-2.5 pr-1">
              {filteredModalTransactions.map((t) => (
                <div key={t.id} className="bg-[#F3F4F6]/60 p-3.5 rounded-2xl border border-gray-200/60 flex justify-between items-center">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${t.jenis === 'pemasukan' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {t.jenis === 'pemasukan' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-[#111111] text-xs sm:text-sm capitalize truncate">{t.kategori}</p>
                      <p className="text-[10px] text-gray-400 font-medium">{t.tanggal}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <p className={`font-extrabold text-xs sm:text-sm ${t.jenis === 'pemasukan' ? 'text-emerald-600' : 'text-[#111111]'}`}>
                      {t.jenis === 'pemasukan' ? '+' : '-'}Rp {Number(t.jumlah).toLocaleString('id-ID')}
                    </p>
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setShowAllModal(false); bukaEditModal(t); }} className="p-1.5 text-gray-400 hover:text-[#111111] hover:bg-gray-200 rounded-lg transition"><Edit3 size={14}/></button>
                      <button onClick={() => hapusTransaksi(t.id)} className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-gray-200 rounded-lg transition"><Trash2 size={14}/></button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredModalTransactions.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-xs text-gray-400 font-medium">Transaksi tidak ditemukan.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Modal Input Transaksi */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 border border-gray-200 shadow-xl animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-bold text-base text-[#111111]">{editId ? 'Edit Catatan' : `Tambah ${jenis === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}`}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition"><X size={16}/></button>
            </div>
            
            <label className="text-[11px] font-bold text-gray-500 mb-1 block">Nominal (Rp)</label>
            <input type="number" placeholder="0" value={jumlah} onChange={(e) => setJumlah(e.target.value)} 
              className="w-full p-3.5 border border-gray-200 rounded-2xl mb-3 text-base font-bold bg-[#F3F4F6] text-[#111111] focus:outline-none focus:bg-white transition" />
            
            <label className="text-[11px] font-bold text-gray-500 mb-1 block">Kategori</label>
            <input type="text" placeholder="Ketik kategori..." value={kategori} onChange={(e) => setKategori(e.target.value)} 
              className="w-full p-3.5 border border-gray-200 rounded-2xl mb-3 text-xs font-semibold bg-[#F3F4F6] text-[#111111] focus:outline-none focus:bg-white transition" />
            
            <div className="flex flex-wrap gap-1.5 mb-6">
              {(jenis === 'pemasukan' ? saranPemasukan : saranPengeluaran).map((saran) => (
                <button key={saran} onClick={() => setKategori(saran)} className={`px-3 py-1.5 text-[11px] font-semibold rounded-xl transition ${kategori === saran ? 'bg-[#111111] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {saran}
                </button>
              ))}
            </div>
            
            <button onClick={simpanTransaksi} className="w-full bg-[#111111] hover:bg-gray-800 text-white p-4 rounded-2xl font-bold text-xs transition active:scale-[0.99]">
              {editId ? 'Perbarui Data' : 'Simpan Transaksi'}
            </button>
          </div>
        </div>
      )}

      {/* Bottom Nav Mobile */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 flex justify-around items-center p-3 z-40">
        <button onClick={() => router.push('/')} className="flex flex-col items-center gap-1 text-[#111111]">
          <Home size={18} />
          <span className="text-[10px] font-bold">Beranda</span>
        </button>
        <button onClick={() => router.push('/jadwal')} className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#111111]">
          <Calendar size={18} />
          <span className="text-[10px] font-semibold">Jadwal</span>
        </button>
        <button onClick={() => router.push('/profil')} className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#111111]">
          <User size={18} />
          <span className="text-[10px] font-semibold">Profil</span>
        </button>
      </div>

    </div>
  )
}