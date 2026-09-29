"use client"
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import { LogOut, Wallet, ArrowDownCircle, ArrowUpCircle, Eye, EyeOff, X, Home, Calendar, User, Trash2, Edit3, PieChart, Sparkles } from 'lucide-react'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [userName, setUserName] = useState<string>('Personal Website')
  const [transactions, setTransactions] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [showBalance, setShowBalance] = useState(true)
  
  // State untuk Filter Pembukuan
  const [filterRingkasan, setFilterRingkasan] = useState<string>('bulan')
  const [customDays, setCustomDays] = useState<number | ''>(14)
  
  // State Form (Tambah & Edit)
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
  }

  const simpanTransaksi = async () => {
    if (!jumlah || !kategori) {
      alert("Nominal dan Kategori harus diisi!")
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
    const konfirmasi = window.confirm("Apakah Anda yakin ingin menghapus transaksi ini?");
    if (konfirmasi) {
      await supabase.from('transactions').delete().eq('id', id);
      checkUserAndFetchData();
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Logika Kalkulasi Pembukuan
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
      
      let limitDays = 0
      if (filterRingkasan === '7') limitDays = 7
      else if (filterRingkasan === '30') limitDays = 30
      else if (filterRingkasan === 'custom') limitDays = Number(customDays) || 0

      if (diffDays <= limitDays && diffDays >= -1) {
        if (t.jenis === 'pemasukan') ringkasanPemasukan += tAmount
        else ringkasanPengeluaran += tAmount
      }
    }
  })

  const rasioPengeluaran = ringkasanPemasukan > 0 ? Math.min(Math.round((ringkasanPengeluaran / ringkasanPemasukan) * 100), 100) : 0

  if (!user) return null

  const saranPemasukan = ['Gaji Pokok', 'Sertifikasi', 'Tunjangan', 'Honor Extra', 'Bisnis']
  const saranPengeluaran = ['Makan & Minum', 'Transportasi', 'Cicilan / Koperasi', 'Belanja', 'Tagihan']

  return (
    <div className="w-full min-h-screen bg-slate-100 text-slate-900 pb-28 md:pb-12 animate-in fade-in duration-300">
      
      {/* Top Navbar Khusus Desktop (Layar Laptop / PC) */}
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
              className="px-4 py-2 text-xs font-bold rounded-xl bg-white text-blue-600 shadow-xs flex items-center gap-2"
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

      {/* Container Utama */}
      <div className="max-w-md md:max-w-5xl mx-auto pt-0 md:pt-6 px-0 md:px-6">
        
        {/* Header Kartu Saldo */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-700 text-white p-5 sm:p-6 md:p-8 rounded-b-[2rem] md:rounded-[2.5rem] shadow-lg relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex justify-between items-center mb-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/25 shadow-inner">
                <Wallet size={22} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1 text-blue-100 text-[11px] sm:text-xs font-medium">
                  <span>Halo, selamat datang</span>
                  <Sparkles size={12} className="text-amber-300 animate-pulse" />
                </div>
                <p className="font-bold text-sm sm:text-base tracking-wide text-white capitalize truncate max-w-[180px]">{userName}</p>
              </div>
            </div>

            <button onClick={handleLogout} className="md:hidden p-2 sm:p-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-md rounded-full text-white transition active:scale-95 shadow-sm">
              <LogOut size={16} />
            </button>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-[10px] sm:text-xs text-blue-100/90 mb-1 font-bold tracking-wider uppercase">Total Saldo Aktif</p>
              <div className="flex items-center gap-3">
                <h1 className={`text-2xl sm:text-3xl md:text-4xl font-black tracking-tight ${totalSaldo < 0 ? 'text-rose-200' : 'text-white'}`}>
                  {showBalance ? `Rp ${totalSaldo.toLocaleString('id-ID')}` : 'Rp ••••••••'}
                </h1>
                <button onClick={() => setShowBalance(!showBalance)} className="text-blue-100/80 hover:text-white transition p-1">
                  {showBalance ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Layout Grid 2 Kolom untuk Desktop */}
        <div className="md:grid md:grid-cols-12 md:gap-6 md:mt-6">
          
          {/* Kolom Kiri: Action Buttons & Pembukuan */}
          <div className="md:col-span-5">
            <div className="flex gap-3 sm:gap-4 px-4 sm:px-6 md:px-0 -mt-6 md:mt-0 relative z-20">
              <button 
                onClick={() => { setEditId(null); setJenis('pemasukan'); setKategori(''); setJumlah(''); setShowModal(true) }}
                className="flex-1 bg-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl shadow-md shadow-slate-200/60 border border-slate-100 flex flex-col items-center gap-1.5 hover:bg-emerald-50/30 active:scale-95 transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition shadow-inner">
                  <ArrowDownCircle size={22} className="text-emerald-600" />
                </div>
                <span className="text-xs font-bold text-slate-700">Pemasukan</span>
              </button>
              
              <button 
                onClick={() => { setEditId(null); setJenis('pengeluaran'); setKategori(''); setJumlah(''); setShowModal(true) }}
                className="flex-1 bg-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl shadow-md shadow-slate-200/60 border border-slate-100 flex flex-col items-center gap-1.5 hover:bg-rose-50/30 active:scale-95 transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center group-hover:scale-110 transition shadow-inner">
                  <ArrowUpCircle size={22} className="text-rose-600" />
                </div>
                <span className="text-xs font-bold text-slate-700">Pengeluaran</span>
              </button>
            </div>

            {/* Kartu Pembukuan */}
            <div className="px-4 sm:px-6 md:px-0 mt-4 sm:mt-5 md:mt-6">
              <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100/90">
                <div className="flex justify-between items-center mb-3 sm:mb-4 gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-50 rounded-xl text-blue-600">
                      <PieChart size={16} />
                    </div>
                    <h3 className="font-bold text-slate-800 text-xs sm:text-sm">Pembukuan</h3>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    {filterRingkasan === 'custom' && (
                      <div className="flex items-center bg-blue-50/80 border border-blue-100 rounded-xl px-2.5 py-1">
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
                          className="w-10 text-xs font-bold text-blue-700 bg-transparent outline-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                          placeholder="14"
                        />
                        <span className="text-[11px] font-bold text-blue-600/80">Hari</span>
                      </div>
                    )}
                    
                    <select 
                      value={filterRingkasan} 
                      onChange={(e) => setFilterRingkasan(e.target.value)}
                      className="text-xs font-bold text-blue-700 bg-blue-50/80 px-3 py-1.5 rounded-xl outline-none cursor-pointer border border-blue-100 hover:bg-blue-100/60 transition"
                    >
                      <option value="bulan">Bulan Ini</option>
                      <option value="7">7 Hari Terakhir</option>
                      <option value="30">30 Hari Terakhir</option>
                      <option value="custom">Kustom...</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                  <div className="flex-1">
                    <p className="text-[9px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Pemasukan</p>
                    <p className="font-black text-xs sm:text-sm text-emerald-600">
                       {showBalance ? `+Rp ${ringkasanPemasukan.toLocaleString('id-ID')}` : '••••••'}
                    </p>
                  </div>
                  <div className="w-px h-7 bg-slate-100 mx-3"></div>
                  <div className="flex-1 text-right">
                    <p className="text-[9px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Pengeluaran</p>
                    <p className="font-black text-xs sm:text-sm text-rose-600">
                       {showBalance ? `-Rp ${ringkasanPengeluaran.toLocaleString('id-ID')}` : '••••••'}
                    </p>
                  </div>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${rasioPengeluaran > 80 ? 'bg-rose-500' : 'bg-blue-600'}`} 
                    style={{ width: `${rasioPengeluaran}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center mt-1.5 text-[9px] text-slate-400 font-semibold">
                  <span>Rasio Pengeluaran</span>
                  <span className="text-slate-600">{rasioPengeluaran}% dari pemasukan</span>
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Riwayat Transaksi */}
          <div className="md:col-span-7 px-4 sm:px-6 md:px-0 pt-4 md:pt-0">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-slate-800 text-xs sm:text-sm">Riwayat Terakhir</h3>
              <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full">{transactions.length} Transaksi</span>
            </div>
            
            <div className="space-y-2.5">
              {transactions.slice(0, 8).map((t) => (
                <div key={t.id} className="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100/90 flex justify-between items-center hover:shadow-md transition duration-200">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${t.jenis === 'pemasukan' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {t.jenis === 'pemasukan' ? <ArrowDownCircle size={18} /> : <ArrowUpCircle size={18} />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 text-xs sm:text-sm capitalize truncate">{t.kategori}</p>
                      <p className="text-[9px] font-semibold text-slate-400">{t.tanggal}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <p className={`font-black text-xs sm:text-sm ${t.jenis === 'pemasukan' ? 'text-emerald-600' : 'text-slate-800'}`}>
                      {t.jenis === 'pemasukan' ? '+' : '-'}Rp {Number(t.jumlah).toLocaleString('id-ID')}
                    </p>
                    <div className="flex gap-0.5">
                      <button onClick={() => bukaEditModal(t)} className="p-1 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit3 size={14}/></button>
                      <button onClick={() => hapusTransaksi(t.id)} className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"><Trash2 size={14}/></button>
                    </div>
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                 <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-200">
                   <p className="text-xs text-slate-500 font-semibold mb-1">Belum ada transaksi</p>
                   <p className="text-[10px] text-slate-400">Catat keuangan pertama Anda menggunakan tombol di atas.</p>
                 </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Modal Popup (Form Tambah / Edit) */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 animate-in fade-in duration-200 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-5 sm:p-6 animate-in zoom-in-95 duration-200 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-base text-slate-800">{editId ? 'Edit Transaksi' : `Catat ${jenis === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}`}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full transition"><X size={16}/></button>
            </div>
            
            <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Nominal (Rp)</label>
            <input type="number" placeholder="0" value={jumlah} onChange={(e) => setJumlah(e.target.value)} 
              className="w-full p-3.5 border border-slate-200 rounded-xl mb-3 text-lg font-bold bg-slate-50 text-black focus:outline-none focus:ring-2 focus:ring-blue-600" />
            
            <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Kategori</label>
            <input type="text" placeholder="Ketik kategori bebas..." value={kategori} onChange={(e) => setKategori(e.target.value)} 
              className="w-full p-3.5 border border-slate-200 rounded-xl mb-3 text-xs font-semibold bg-slate-50 text-black focus:outline-none focus:ring-2 focus:ring-blue-600 transition" />
            
            <div className="flex flex-wrap gap-1.5 mb-5">
              {(jenis === 'pemasukan' ? saranPemasukan : saranPengeluaran).map((saran) => (
                <button key={saran} onClick={() => setKategori(saran)} className={`px-3 py-1 text-[11px] font-semibold rounded-lg transition-all ${kategori === saran ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {saran}
                </button>
              ))}
            </div>
            
            <button onClick={simpanTransaksi} className={`w-full text-white p-3.5 rounded-xl font-bold text-xs sm:text-sm shadow-md active:scale-95 transition ${jenis === 'pemasukan' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
              {editId ? 'Perbarui Data' : 'Simpan Data'}
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navbar Khusus Mobile / HP */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200/80 flex justify-around items-center p-2.5 z-40 shadow-xl">
        <button onClick={() => router.push('/')} className="flex flex-col items-center gap-0.5 text-blue-600 transition">
          <Home size={20} strokeWidth={2.5} />
          <span className="text-[9px] font-bold">Beranda</span>
        </button>
        <button onClick={() => router.push('/jadwal')} className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-blue-600 transition">
          <Calendar size={20} strokeWidth={2.5} />
          <span className="text-[9px] font-semibold">Jadwal</span>
        </button>
        <button onClick={() => router.push('/profil')} className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-blue-600 transition">
          <User size={20} strokeWidth={2.5} />
          <span className="text-[9px] font-semibold">Profil</span>
        </button>
      </div>

    </div>
  )
}