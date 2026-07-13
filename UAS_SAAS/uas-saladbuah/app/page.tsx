'use client';
import { useState, useEffect } from 'react';

export default function DashboardGorSaaS() {
 
  const [activeMenu, setActiveMenu] = useState('Home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [namaLengkap, setNamaLengkap] = useState('');
  
 
  const [userProfile, setUserProfile] = useState<{ id: number; email: string; nama: string } | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

 const [currentGor, setCurrentGor] = useState<{
  id: number;
  nama: string;
  alamat: string;
  pemilik: string;
}>({ 
  id: 1, 
  nama: 'Grand Smash Arena', 
  alamat: 'Jl. Contoh No. 123',
  pemilik: 'Tamu / Pengunjung'
});

  const [lapangans, setLapangans] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);

  
  const fetchDataFromDb = async (userId: number) => {
    try {
      const res = await fetch(`/api/gor?userId=${userId}`);
      const data = await res.json();
      setLapangans(data);
    } catch (error) {
      console.error("Gagal ambil data:", error);
    }
  };

 
  const [namaLapangan, setNamaLapangan] = useState('');
  const [tipeLapangan, setTipeLapangan] = useState('Futsal');
  const [hargaLapangan, setHargaLapangan] = useState('');

  const [inputCustomer, setInputCustomer] = useState('');
  const [lapanganTerpilih, setLapanganTerpilih] = useState('');
  const [tanggalBooking, setTanggalBooking] = useState('');
  const [jamMulai, setJamMulai] = useState('15:00');
  const [durasiMain, setDurasiMain] = useState(1);
  const [totalBiaya, setTotalBiaya] = useState(0);

  useEffect(() => {
    const lap = lapangans.find(l => l.nama === lapanganTerpilih);
    if (lap) {
      setTotalBiaya(lap.harga_per_jam * durasiMain);
    } else {
      setTotalBiaya(0);
    }
  }, [lapanganTerpilih, durasiMain, lapangans]);
 
   const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return alert('Email dan password wajib diisi!');

    if (authMode === 'login') {
      setIsLoggedIn(true);
      const username = namaLengkap || email.split('@')[0];
      
     
      const mockUser = {
        id: 1, 
        email: email,
        nama: username
      };

      setUserProfile(mockUser);
      setCurrentGor(prev => ({ ...prev, pemilik: username }));
      alert('Selamat Datang Kembali! Berhasil masuk ke akun.');
      setActiveMenu('Kelola GOR'); 
    } else {
      if (!namaLengkap) return alert('Nama Lengkap wajib diisi saat mendaftar!');
      alert('Pendaftaran Berhasil! Silakan masuk dengan akun baru Anda.');
      setAuthMode('login'); 
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserProfile(null);
    setEmail('');
    setPassword('');
    setNamaLengkap('');
    setCurrentGor(prev => ({ ...prev, pemilik: 'Tamu / Pengunjung' }));
    alert('Berhasil keluar dari akun.');
    setActiveMenu('Home');
  };

  
  const handleAddOrUpdateLapangan = async (e: React.FormEvent) => {
  e.preventDefault();
  const userId = userProfile?.id;

  if (editingId) {
   
    await fetch('/api/gor', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editingId, 
        nama: namaLapangan,
        tipe: tipeLapangan,
        harga_per_jam: hargaLapangan,
      })
    });
    alert("Data berhasil diperbarui!");
  } else {
  
    await fetch('/api/gor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        nama: namaLapangan,
        tipe: tipeLapangan,
        harga_per_jam: hargaLapangan,
      })
    });
    alert("Data berhasil tersimpan!");
  }

  
   setEditingId(null);
  setNamaLapangan('');
  setHargaLapangan('');
  
  if (userId) {
     fetchDataFromDb(userId);
  };
  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCustomer || !lapanganTerpilih || !tanggalBooking) return alert('Mohon lengkapi detail booking jadwal!');

    const isBentrok = bookings.some(b => 
      b.lapanganNama === lapanganTerpilih && 
      b.tanggalManual === tanggalBooking && 
      b.jamMulai === jamMulai
    );

    if (isBentrok) {
      return alert('🚨 JADWAL BENTROK! Slot jam tersebut pada lapangan ini sudah di-booking kelompok lain.');
    }

    const newBooking = {
      id: 'b_' + Date.now(),
      customer: inputCustomer,
      lapanganNama: lapanganTerpilih,
      tanggalManual: tanggalBooking,
      jamMulai: jamMulai,
      durasi: durasiMain,
      totalBayar: totalBiaya
    };

    setBookings([newBooking, ...bookings]);
    setInputCustomer(''); 
    setLapanganTerpilih(''); 
    setTanggalBooking(''); 
    setDurasiMain(1);
    alert('Booking sukses diamankan ke sistem kalender!');
  };

  
  const getOmsetStats = () => {
    let hariIni = 0, totalSemua = 0;
    const todayStr = '2026-07-12'; 

    bookings.forEach(b => {
      totalSemua += b.totalBayar;
      if (b.tanggalManual === todayStr) {
        hariIni += b.totalBayar;
      }
    });

    return { hariIni, totalSemua };
  };

  const { hariIni, totalSemua } = getOmsetStats();

  // 1. Fungsi untuk Hapus
const handleDeleteLapangan = (id: string) => {
  if (confirm("Apakah Anda yakin ingin menghapus lapangan ini?")) {
    setLapangans(lapangans.filter((l) => l.id !== id));
  }
};


const startEditLapangan = (lap: any) => {
  setEditingId(lap.id);           // Mengingat ID lapangan yang diedit
  setNamaLapangan(lap.nama);      // Memasukkan nama ke kotak form
  setHargaLapangan(lap.hargaPerJam.toString()); // Memasukkan harga ke kotak form
};

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 md:p-8 font-sans text-slate-800 antialiased">
      <h1 style={{ color: 'red', fontSize: '50px' }}>TESTING - JIKA INI MUNCUL ARTINYA SERVER NORMAL!</h1>
    {/* ... sisa kode Anda ... */}
      <div className="max-w-7xl mx-auto space-y-6">
        
        {}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-sm gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏟️</span>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">{currentGor.nama}</h2>
              <p className="text-xs text-slate-400 font-medium">Operator: {currentGor.pemilik}</p>
            </div>
          </div>
          
          {}
          <nav className="flex flex-wrap items-center justify-center gap-1 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
            <button 
              onClick={() => setActiveMenu('Home')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${activeMenu === 'Home' ? 'text-blue-600 bg-white shadow-sm' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/70'}`}
            >
              Home
            </button>
            {isLoggedIn && (
              <button 
                onClick={() => setActiveMenu('Kelola GOR')}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${activeMenu === 'Kelola GOR' ? 'text-blue-600 bg-white shadow-sm' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/70'}`}
              >
                ⚙️ Kelola GOR (Workspace)
              </button>
            )}
            
            <button 
              onClick={() => setActiveMenu('Tentang Kami')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${activeMenu === 'Tentang Kami' ? 'text-blue-600 bg-white shadow-sm' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/70'}`}
            >
              Tentang Kami
            </button>
            <button 
              onClick={() => setActiveMenu('Service')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${activeMenu === 'Service' ? 'text-blue-600 bg-white shadow-sm' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/70'}`}
            >
              Service
            </button>
            <button 
              onClick={() => setActiveMenu('Kontak')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${activeMenu === 'Kontak' ? 'text-blue-600 bg-white shadow-sm' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/70'}`}
            >
              Kontak
            </button>
          </nav>

          {}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-block bg-blue-50 text-blue-700 text-[10px] font-bold px-3 py-1.5 rounded-xl border border-blue-100">
                  👤 {userProfile?.nama}
                </span>
                <button 
                  onClick={handleLogout}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 text-[10px] font-bold px-3 py-1.5 rounded-xl border border-rose-100 transition duration-200 cursor-pointer"
                >
                  🚪 Keluar
                </button>
              </div>
            ) : (
              <button 
                onClick={() => { setActiveMenu('Autentikasi'); setAuthMode('login'); }}
                className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-4 py-1.5 rounded-xl shadow-sm transition duration-200 cursor-pointer"
              >
                🔑 Masuk / Daftar
              </button>
            )}
          </div>
        </div>

        {}
        
        {}
        {activeMenu === 'Autentikasi' && !isLoggedIn && (
          <div className="max-w-md mx-auto bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-md space-y-6 my-8">
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900">
                {authMode === 'login' ? '🔑 Masuk ke Akun GOR' : '📝 Buat Akun Baru'}
              </h3>
              <p className="text-xs text-slate-400">
                {authMode === 'login' ? 'Gunakan email dan password terdaftar Anda' : 'Lengkapi formulir untuk membuat dashboard SaaS'}
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nama Lengkap</label>
                  <input 
                    type="text" 
                    required
                    value={namaLengkap} 
                    onChange={(e) => setNamaLengkap(e.target.value)} 
                    placeholder="Contoh: Maria Violeta" 
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>
              )}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Alamat Email</label>
                <input 
                  type="email" 
                  required
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="name@example.com" 
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Password</label>
                <input 
                  type="password" 
                  required
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition duration-200 shadow-sm mt-2">
                {authMode === 'login' ? 'Masuk Sekarang 🚀' : 'Daftarkan Akun Baru ✨'}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-slate-100 text-xs">
              {authMode === 'login' ? (
                <p className="text-slate-500">
                  Belum punya akun?{' '}
                  <button onClick={() => setAuthMode('register')} className="text-blue-600 font-bold hover:underline cursor-pointer">
                    Daftar di sini
                  </button>
                </p>
              ) : (
                <p className="text-slate-500">
                  Sudah punya akun sebelumnya?{' '}
                  <button onClick={() => setAuthMode('login')} className="text-blue-600 font-bold hover:underline cursor-pointer">
                    Masuk di sini
                  </button>
                </p>
              )}
            </div>
          </div>
        )}

        {}
        {activeMenu === 'Home' && (
          <div className="space-y-8 py-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl p-8 md:p-12 shadow-md relative overflow-hidden">
              <div className="max-w-2xl space-y-4 relative z-10">
                <span className="bg-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wider uppercase">
                  Sistem Informasi Manajemen Sport Center
                </span>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                  Solusi Manajemen GOR & Lapangan Olahraga Jadi Lebih Cerdas
                </h1>
                <p className="text-sm text-blue-50/90 leading-relaxed">
                  Web ini dibangun sebagai platform **SaaS (Software as a Service)** komprehensif untuk membantu pemilik atau pengelola Gelanggang Olahraga (GOR) mengotomatisasi pendataan aset, memetakan tarif per jam, serta mengatur jadwal reservasi agar bebas dari tabrakan jadwal (*anti-booking conflict*).
                </p>
                <div className="pt-2">
                  {isLoggedIn ? (
                    <button 
                      onClick={() => setActiveMenu('Kelola GOR')}
                      className="bg-white hover:bg-blue-5 text-blue-600 font-bold px-5 py-2.5 rounded-xl text-xs shadow transition duration-200 flex items-center gap-2"
                    >
                      Buka Ruang Kerja Kelola GOR 🚀
                    </button>
                  ) : (
                    <button 
                      onClick={() => { setActiveMenu('Autentikasi'); setAuthMode('login'); }}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow transition duration-200 flex items-center gap-2"
                    >
                      Masuk Ke Akun Anda / Buat Akun Baru 🔑
                    </button>
                  )}
                </div>
              </div>
              <div className="absolute right-0 bottom-0 top-0 opacity-10 text-[15rem] hidden md:flex items-center justify-center font-black pointer-events-none select-none">
                🏸
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                <div className="text-2xl bg-blue-50 w-11 h-11 rounded-xl flex items-center justify-center">📊</div>
                <h4 className="font-bold text-slate-900 text-sm">Efisiensi Pendapatan Real-Time</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Melacak kas masuk harian dan omset akumulasi penyewaan secara otomatis tanpa kalkulasi manual yang rentan kesalahan.
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                <div className="text-2xl bg-emerald-50 w-11 h-11 rounded-xl flex items-center justify-center">🛡️</div>
                <h4 className="font-bold text-slate-900 text-sm">Proteksi Jadwal Bentrok</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Sistem cerdas divalidasi langsung di sisi klien untuk memblokir reservasi yang mencoba mengambil slot lapangan, tanggal, dan jam yang sama.
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                <div className="text-2xl bg-purple-50 w-11 h-11 rounded-xl flex items-center justify-center">⚡</div>
                <h4 className="font-bold text-slate-900 text-sm">Skalabilitas Multi-Tenant</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Arsitektur aplikasi dipersiapkan untuk mendukung banyak GOR sekaligus, di mana setiap pemilik memiliki kontrol penuh atas aset lapangannya.
                </p>
              </div>
            </div>
          </div>
        )}

        {}
        {activeMenu === 'Kelola GOR' && isLoggedIn && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center bg-gradient-to-br from-white to-emerald-50/10">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kas Masuk Hari Ini</p>
                  <h3 className="text-lg font-black text-emerald-600 mt-0.5">Rp {hariIni.toLocaleString('id-ID')}</h3>
                </div>
                <span className="bg-emerald-50 text-sm p-2 rounded-xl">💰</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center bg-gradient-to-br from-white to-blue-50/10">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Omset Akumulasi</p>
                  <h3 className="text-lg font-black text-blue-600 mt-0.5">Rp {totalSemua.toLocaleString('id-ID')}</h3>
                </div>
                <span className="bg-blue-50 text-sm p-2 rounded-xl">📊</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center bg-gradient-to-br from-white to-purple-50/10">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Aset Lapangan</p>
                  <h3 className="text-lg font-black text-purple-600 mt-0.5">{lapangans.length} Unit Lapangan</h3>
                </div>
                <span className="bg-purple-50 text-sm p-2 rounded-xl">🏸</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="space-y-6">
                
                {}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-50 pb-2">
                    🛠️ Tambah Unit Lapangan Aset
                  </h3>
                  <form onSubmit={handleAddOrUpdateLapangan} className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nama Lapangan</label>
                      <input type="text" value={namaLapangan} onChange={(e) => setNamaLapangan(e.target.value)} placeholder="Misal: Lapangan Futsal B (Interlock)" className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-xs focus:outline-none transition" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cabang Olahraga</label>
                        <select value={tipeLapangan} onChange={(e) => setTipeLapangan(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-xs focus:outline-none cursor-pointer">
                          <option value="Futsal">Futsal</option>
                          <option value="Badminton">Badminton</option>
                          <option value="Basket">Basket</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Harga / Jam (Rp)</label>
                        <input type="number" value={hargaLapangan} onChange={(e) => setHargaLapangan(e.target.value)} placeholder="80000" className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-xs focus:outline-none" />
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm transition duration-200 mt-1">
                      {editingId ? '✏️ Perbarui Lapangan' : '➕ Daftarkan Lapangan Baru'}
                    </button>
                  </form>
                </div>

                {}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-50 pb-2">
                    📅 Form Reservasi & Slot Jadwal
                  </h3>
                  <form onSubmit={handleCreateBooking} className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nama Kelompok / Customer</label>
                      <input type="text" value={inputCustomer} onChange={(e) => setInputCustomer(e.target.value)} placeholder="Kelompok Futsal UMBY FC" className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-xs focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pilih Lapangan</label>
                      <select value={lapanganTerpilih} onChange={(e) => setLapanganTerpilih(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-xs focus:outline-none cursor-pointer">
                        <option value="">-- Pilih Lapangan GOR --</option>
                        {lapangans.map(l => <option key={l.id} value={l.nama}>{l.nama} (Rp {l.hargaPerJam}/jam)</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tanggal</label>
                        <input type="date" value={tanggalBooking} onChange={(e) => setTanggalBooking(e.target.value)} className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50/50 text-xs focus:outline-none cursor-pointer" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Jam Mulai</label>
                        <select value={jamMulai} onChange={(e) => setJamMulai(e.target.value)} className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50/50 text-xs focus:outline-none cursor-pointer">
                          <option value="15:00">15:00</option>
                          <option value="16:00">16:00</option>
                          <option value="17:00">17:00</option>
                          <option value="19:00">19:00</option>
                          <option value="20:00">20:00</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Durasi</label>
                        <select value={durasiMain} onChange={(e) => setDurasiMain(Number(e.target.value))} className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50/50 text-xs focus:outline-none cursor-pointer">
                          <option value={1}>1 Jam</option>
                          <option value={2}>2 Jam</option>
                          <option value={3}>3 Jam</option>
                        </select>
                      </div>
                    </div>
                    <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 flex justify-between items-center text-xs">
                      <span className="font-bold text-emerald-800">Total Invoice Cash:</span>
                      <span className="font-black text-emerald-700 text-sm">Rp {totalBiaya.toLocaleString('id-ID')}</span>
                    </div>
                    <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm transition duration-200">
                      📥 Kunci Slot & Simpan Jadwal
                    </button>
                  </form>
                </div>
              </div>

              {}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">🏟️ Daftar Status Lapangan Terdaftar</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                          <th className="pb-2.5 pl-2">Nama Lapangan</th>
                          <th className="pb-2.5">Kategori Cabor</th>
                          <th className="pb-2.5">Tarif Kontrak / Jam</th>
                          <th className="pb-2.5 text-right pr-2">Status</th>
                          <th className="pb-2.5 text-right pr-2">Aksi</th>
                        </tr>
                      </thead>
                        <tbody className="divide-y divide-slate-50 text-xs text-slate-700">
  {lapangans.map((lap) => (
    <tr key={lap.id} className="hover:bg-slate-50/40 transition">
      <td className="py-2.5 font-semibold text-slate-800 pl-2">{lap.nama}</td>
      <td className="py-2.5 font-medium text-slate-500">{lap.tipe}</td>
      <td className="py-2.5 font-bold text-slate-600">
        Rp {Number(lap.hargaPerJam).toLocaleString('id-ID')}
      </td>
      <td className="py-2.5 text-right pr-2">
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${lap.status === 'Aktif' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {lap.status}
        </span>
      </td>
      
      {}
      <td className="py-2.5 text-right pr-2 space-x-2">
        <button 
          onClick={() => startEditLapangan(lap)} 
          className="text-blue-500 hover:text-blue-700 font-bold"
        >
          Edit
        </button>
        <button 
          onClick={() => handleDeleteLapangan(lap.id)} 
          className="text-rose-500 hover:text-rose-700 font-bold"
        >
          Hapus
        </button>
      </td>
    </tr>
  ))}
</tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">📋 Laporan & Log Ringkasan Booking Jadwal</h3>
                    <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-md">{bookings.length} Transaksi Terkunci</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                          <th className="pb-2.5 pl-2">Tanggal & Jam</th>
                          <th className="pb-2.5">Nama Penyewa</th>
                          <th className="pb-2.5">Lapangan</th>
                          <th className="pb-2.5 text-right pr-2">Total Bayar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-xs text-slate-700">
                        {bookings.map((b) => (
                          <tr key={b.id} className="hover:bg-slate-50/40 transition">
                            <td className="py-2.5 pl-2">
                              <p className="font-medium text-slate-800">{b.tanggalManual.split('-').reverse().join('/')}</p>
                              <p className="text-[10px] text-blue-500 font-bold">Pukul {b.jamMulai} ({b.durasi} Jam)</p>
                            </td>
                            <td className="py-2.5 font-semibold text-slate-700">{b.customer}</td>
                            <td className="py-2.5 text-slate-500 font-medium">{b.lapanganNama}</td>
                            <td className="py-2.5 text-right font-black text-emerald-600 pr-2">Rp {b.totalBayar.toLocaleString('id-ID')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {}
        {activeMenu === 'Kelola GOR' && !isLoggedIn && (
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center space-y-4">
            <span className="text-4xl">🔒</span>
            <h3 className="text-base font-bold text-slate-900">Akses Workspace Terkunci</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Silakan lakukan autentikasi masuk ke akun terlebih dahulu menggunakan tombol di bawah ini untuk membuka menu kelola operasional GOR.
            </p>
            <button onClick={() => { setActiveMenu('Autentikasi'); setAuthMode('login'); }} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-sm">
              Ke Halaman Masuk
            </button>
          </div>
        )}

        {}
        {activeMenu === 'Tentang Kami' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">ℹ️ Tentang Platform</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Grand Smash Arena adalah platform SaaS pengelolaan GOR modern yang dirancang khusus untuk mempermudah operasional reservasi lapangan olahraga secara real-time, efisien, dan transparan bagi semua pelaku usaha bisnis olahraga.
            </p>
          </div>
        )}

        {}
        {activeMenu === 'Service' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">🛠️ Layanan & Fasilitas GOR</h3>
            <ul className="list-disc list-inside text-xs text-slate-600 space-y-2">
              <li>Penyewaan Lapangan Futsal standar kompetisi menggunakan lantai Vinyl premium.</li>
              <li>Penyewaan Lapangan Badminton dengan karpet standar PBSI.</li>
              <li>Sistem integrasi jadwal anti-bentrok otomatis untuk operator GOR.</li>
            </ul>
          </div>
        )}

        {}
        {activeMenu === 'Kontak' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">📞 Hubungi Operasional</h3>
            <p className="text-xs text-slate-600">
              Jika Anda mengalami kendala teknis ataupun membutuhkan bantuan pada sistem kemitraan SaaS GOR, silakan hubungi pusat bantuan operasional kami:
            </p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
              <p className="text-xs font-semibold text-slate-700">📧 Email Resmi: <span className="text-blue-600 font-bold">support@gorsaas.com</span></p>
              <p className="text-xs font-semibold text-slate-700">📱 WhatsApp HotLine: <span className="text-emerald-600 font-bold">+62 812-3456-7890</span></p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}}
