import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      navigate('/');
    }
  }, [user, navigate]);

  const [activeSubTab, setActiveSubTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [allReports, setAllReports] = useState([]);
  const [incomingClaims, setIncomingClaims] = useState([]);

  // Modal / Form state for Categories CRUD
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [editingCatId, setEditingCatId] = useState(null);

  // Modal / Form state for Locations CRUD
  const [locName, setLocName] = useState('');
  const [locDesc, setLocDesc] = useState('');
  const [editingLocId, setEditingLocId] = useState(null);

  // Audit Logs modal state
  const [logsItem, setLogsItem] = useState(null);
  const [itemLogs, setItemLogs] = useState([]);

  // Takeover Satpam modal state
  const [takeoverItem, setTakeoverItem] = useState(null);
  const [takeoverStorageLoc, setTakeoverStorageLoc] = useState('');

  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch admin data on tab change
  const fetchData = async () => {
    try {
      if (activeSubTab === 'stats') {
        setStatsLoading(true);
        const res = await api.get('/admin/dashboard/stats');
        setStats(res.data.statistics);
        setStatsLoading(false);
      } else if (activeSubTab === 'categories') {
        const res = await api.get('/categories');
        setCategories(res.data);
      } else if (activeSubTab === 'locations') {
        const res = await api.get('/locations');
        setLocations(res.data);
      } else if (activeSubTab === 'moderation') {
        const res = await api.get('/items');
        setAllReports(res.data.data);
      } else if (activeSubTab === 'claims') {
        const res = await api.get('/claims/incoming');
        setIncomingClaims(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeSubTab]);

  // Categories Handlers
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      if (editingCatId) {
        await api.put(`/categories/${editingCatId}`, { name: catName, description: catDesc });
        showToast('Kategori berhasil diperbarui!', 'success');
      } else {
        await api.post('/categories', { name: catName, description: catDesc });
        showToast('Kategori baru berhasil dibuat!', 'success');
      }
      setCatName('');
      setCatDesc('');
      setEditingCatId(null);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menyimpan kategori.', 'error');
    }
  };

  const handleEditCategory = (cat) => {
    setEditingCatId(cat.id);
    setCatName(cat.name);
    setCatDesc(cat.description || '');
  };

  const handleDeleteCategory = async (catId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus kategori ini?')) return;
    try {
      await api.delete(`/categories/${catId}`);
      showToast('Kategori berhasil dihapus.', 'success');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menghapus kategori.', 'error');
    }
  };

  // Locations Handlers
  const handleSaveLocation = async (e) => {
    e.preventDefault();
    try {
      if (editingLocId) {
        await api.put(`/locations/${editingLocId}`, { name: locName, description: locDesc });
        showToast('Titik lokasi berhasil diperbarui!', 'success');
      } else {
        await api.post('/locations', { name: locName, description: locDesc });
        showToast('Titik lokasi baru berhasil dibuat!', 'success');
      }
      setLocName('');
      setLocDesc('');
      setEditingLocId(null);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menyimpan lokasi.', 'error');
    }
  };

  const handleEditLocation = (loc) => {
    setEditingLocId(loc.id);
    setLocName(loc.name);
    setLocDesc(loc.description || '');
  };

  const handleDeleteLocation = async (locId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus titik lokasi ini?')) return;
    try {
      await api.delete(`/locations/${locId}`);
      showToast('Titik lokasi berhasil dihapus.', 'success');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menghapus lokasi.', 'error');
    }
  };

  // Moderation Handlers
  const handleTakeoverSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/items/${takeoverItem.id}`, {
        status: takeoverItem.type === 'FOUND' ? 'OPEN' : 'IN_PROCESS',
        storage_location: takeoverStorageLoc
      });
      showToast('Proses Takeover Satpam sukses! Laporan berhasil diperbarui.', 'success');
      setTakeoverItem(null);
      setTakeoverStorageLoc('');
      fetchData();
    } catch (err) {
      showToast('Gagal melakukan takeover.', 'error');
    }
  };

  const handleDeleteReport = async (itemId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus postingan laporan ini?')) return;
    try {
      await api.delete(`/items/${itemId}`);
      showToast('Postingan laporan berhasil dihapus.', 'success');
      fetchData();
    } catch (err) {
      showToast('Gagal menghapus postingan.', 'error');
    }
  };

  const handleFetchAuditLogs = async (item) => {
    setLogsItem(item);
    try {
      const res = await api.get(`/items/${item.id}/logs`);
      setItemLogs(res.data);
    } catch (err) {
      showToast('Gagal memuat log audit.', 'error');
      setLogsItem(null);
    }
  };

  // Claim responding handler
  const handleResolveClaim = async (claimId, respondStatus) => {
    const action = respondStatus === 'APPROVED' ? 'menyetujui' : 'menolak';
    if (!window.confirm(`Apakah Anda yakin ingin ${action} klaim kepemilikan ini?`)) return;
    
    try {
      await api.patch(`/claims/${claimId}/respond`, { status: respondStatus });
      showToast(`Klaim sukses di-${respondStatus.toLowerCase()}`, 'success');
      fetchData();
    } catch (err) {
      console.error(err);
      showToast('Gagal memproses klaim.', 'error');
    }
  };

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-[60svh] flex items-center justify-center font-inter">
        <div className="text-center">
          <span className="material-symbols-outlined text-red-500 text-6xl mb-4 select-none">block</span>
          <h2 className="text-2xl font-black text-gray-950 font-outfit">Akses Ditolak (403)</h2>
          <p className="text-gray-500 text-sm mt-2">Hanya Administrator yang diperbolehkan mengakses halaman ini.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-inter max-w-7xl mx-auto px-6 py-8">
      
      <div className="flex flex-wrap items-center justify-between border-b border-gray-100 pb-6 mb-8 gap-4">
        <div>
          <span className="bg-purple-100 text-secondary border border-purple-200 text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider mb-2 inline-block">
            Dashboard Staff
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 font-outfit text-left">
            Admin Panel Moderasi
          </h1>
        </div>

        {/* Admin Navigation Pills */}
        <div className="flex flex-wrap gap-2">
          {['stats', 'categories', 'locations', 'moderation', 'claims'].map((sub) => (
            <button
              key={sub}
              onClick={() => setActiveSubTab(sub)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all-200 ${
                activeSubTab === sub 
                  ? 'bg-secondary text-white shadow-sm' 
                  : 'bg-white text-gray-600 border border-gray-100 hover:bg-purple-50'
              }`}
            >
              {sub === 'stats' ? 'Statistik' : sub === 'categories' ? 'Kategori Master' : sub === 'locations' ? 'Titik Lokasi' : sub === 'moderation' ? 'Moderasi Laporan' : 'Persetujuan Klaim'}
            </button>
          ))}
        </div>
      </div>

      {/* Content Render panels */}
      
      {/* 1. Stats Dashboard */}
      {activeSubTab === 'stats' && (
        <div className="space-y-6 text-left">
          {statsLoading ? (
            <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto"></div>
          ) : stats && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-xs">
                  <span className="material-symbols-outlined text-secondary text-3xl mb-2">campaign</span>
                  <h4 className="text-xs font-bold text-gray-400 uppercase">Laporan Kehilangan Aktif</h4>
                  <p className="text-3xl font-black text-gray-800 font-outfit mt-1">{stats.active_lost_reports}</p>
                </div>
                <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-xs">
                  <span className="material-symbols-outlined text-secondary text-3xl mb-2">volunteer_activism</span>
                  <h4 className="text-xs font-bold text-gray-400 uppercase">Laporan Temuan Aktif</h4>
                  <p className="text-3xl font-black text-gray-800 font-outfit mt-1">{stats.active_found_reports}</p>
                </div>
                <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-xs">
                  <span className="material-symbols-outlined text-secondary text-3xl mb-2">check_circle</span>
                  <h4 className="text-xs font-bold text-gray-400 uppercase">Rasio Sukses Kembali</h4>
                  <p className="text-3xl font-black text-gray-800 font-outfit mt-1">{stats.returned_percentage}%</p>
                  <span className="text-[10px] text-gray-400 block mt-1">{stats.returned_reports} dari {stats.total_reports} barang terlaporkan</span>
                </div>
                <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-xs">
                  <span className="material-symbols-outlined text-secondary text-3xl mb-2">pending</span>
                  <h4 className="text-xs font-bold text-gray-400 uppercase">Klaim Pending Review</h4>
                  <p className="text-3xl font-black text-gray-800 font-outfit mt-1">{stats.pending_claims_count}</p>
                </div>
              </div>

              {/* Quick Staff Notice Board */}
              <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5 flex gap-4">
                <span className="material-symbols-outlined text-secondary text-3xl mt-1 select-none">info</span>
                <div className="space-y-1">
                  <h4 className="font-bold text-purple-900 font-outfit text-sm">Petunjuk Keamanan Satpam / Admin</h4>
                  <p className="text-purple-700 text-xs leading-relaxed">
                    Setiap serah terima fisik barang temuan yang diserahkan mahasiswa ke pos satpam wajib di-takeover dengan mengklik tombol <b>Takeover Satpam</b> di tab Moderasi Laporan. Masukkan detail penempatan fisik barang (contoh: nomor loker kunci, loker helm) agar riwayat log tercatat aman dan akuntabel di audit log.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* 2. CRUD Categories */}
      {activeSubTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left items-start">
          {/* Create/Edit Form */}
          <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-gray-900 text-base font-outfit">
              {editingCatId ? 'Edit Kategori' : 'Tambah Kategori Baru'}
            </h3>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nama Kategori</label>
                <input 
                  type="text" 
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Contoh: KTM / KTM Card"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-secondary transition-all-200"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Deskripsi Singkat</label>
                <textarea 
                  rows="3"
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Penjelasan deskripsi..."
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-secondary transition-all-200"
                ></textarea>
              </div>
              <div className="flex gap-2">
                {editingCatId && (
                  <button 
                    type="button" 
                    onClick={() => { setEditingCatId(null); setCatName(''); setCatDesc(''); }}
                    className="flex-1 bg-white border border-gray-200 text-gray-600 font-bold py-2 rounded-xl text-xs"
                  >
                    Batal
                  </button>
                )}
                <button 
                  type="submit" 
                  className="flex-1 bg-secondary text-white font-bold py-2 rounded-xl text-xs hover:bg-secondary-container hover:text-primary transition-colors"
                >
                  {editingCatId ? 'Perbarui' : 'Simpan Kategori'}
                </button>
              </div>
            </form>
          </div>

          {/* List display */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="font-bold text-gray-900 text-base font-outfit border-b border-gray-50 pb-2">Daftar Kategori Terdaftar</h3>
            {categories.length === 0 ? (
              <p className="text-gray-500 text-sm">Belum ada kategori terdaftar.</p>
            ) : (
              categories.map(cat => (
                <div key={cat.id} className="p-4 border border-gray-100 rounded-2xl bg-white flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm font-outfit">{cat.name}</h4>
                    <p className="text-xs text-gray-500 mt-1 pr-6">{cat.description || '-'}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => handleEditCategory(cat)} className="text-gray-400 hover:text-secondary p-1.5 rounded-lg hover:bg-purple-50 transition-colors">
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button onClick={() => handleDeleteCategory(cat.id)} className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 3. CRUD Locations */}
      {activeSubTab === 'locations' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left items-start">
          {/* Create/Edit Form */}
          <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-gray-900 text-base font-outfit">
              {editingLocId ? 'Edit Lokasi' : 'Tambah Lokasi Baru'}
            </h3>
            <form onSubmit={handleSaveLocation} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nama Lokasi Kampus</label>
                <input 
                  type="text" 
                  required
                  value={locName}
                  onChange={(e) => setLocName(e.target.value)}
                  placeholder="Contoh: Gedung Unit 3 - Lt 1"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-secondary transition-all-200"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Deskripsi Detail</label>
                <textarea 
                  rows="3"
                  value={locDesc}
                  onChange={(e) => setLocDesc(e.target.value)}
                  placeholder="Penjelasan deskripsi..."
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-secondary transition-all-200"
                ></textarea>
              </div>
              <div className="flex gap-2">
                {editingLocId && (
                  <button 
                    type="button" 
                    onClick={() => { setEditingLocId(null); setLocName(''); setLocDesc(''); }}
                    className="flex-1 bg-white border border-gray-200 text-gray-600 font-bold py-2 rounded-xl text-xs"
                  >
                    Batal
                  </button>
                )}
                <button 
                  type="submit" 
                  className="flex-1 bg-secondary text-white font-bold py-2 rounded-xl text-xs hover:bg-secondary-container hover:text-primary transition-colors"
                >
                  {editingLocId ? 'Perbarui' : 'Simpan Lokasi'}
                </button>
              </div>
            </form>
          </div>

          {/* List display */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="font-bold text-gray-900 text-base font-outfit border-b border-gray-50 pb-2">Daftar Lokasi Kampus</h3>
            {locations.length === 0 ? (
              <p className="text-gray-500 text-sm">Belum ada lokasi terdaftar.</p>
            ) : (
              locations.map(loc => (
                <div key={loc.id} className="p-4 border border-gray-100 rounded-2xl bg-white flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm font-outfit">{loc.name}</h4>
                    <p className="text-xs text-gray-500 mt-1 pr-6">{loc.description || '-'}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => handleEditLocation(loc)} className="text-gray-400 hover:text-secondary p-1.5 rounded-lg hover:bg-purple-50 transition-colors">
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button onClick={() => handleDeleteLocation(loc.id)} className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 4. Post Moderation */}
      {activeSubTab === 'moderation' && (
        <div className="text-left space-y-4">
          <h3 className="font-bold text-gray-900 text-base font-outfit border-b border-gray-50 pb-2">Moderasi Seluruh Laporan Aktif</h3>
          {allReports.length === 0 ? (
            <p className="text-gray-500 text-sm">Tidak ada laporan terdaftar untuk saat ini.</p>
          ) : (
            <div className="space-y-4">
              {allReports.map(item => (
                <div key={item.id} className="p-5 border border-gray-100 rounded-2xl bg-white space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-3">
                      <StatusBadge status={item.status} />
                      <span className={`px-2 py-0.5 text-[9px] font-black rounded-md text-white ${
                        item.type === 'LOST' ? 'bg-red-500' : 'bg-blue-600'
                      }`}>
                        {item.type}
                      </span>
                      <h4 className="font-bold text-gray-900 text-sm font-outfit">{item.title}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleFetchAuditLogs(item)}
                        className="bg-purple-50 text-secondary hover:bg-secondary hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">history</span>
                        Log Audit
                      </button>

                      {((item.type === 'FOUND' && item.status === 'IN_PROCESS') || 
                        (item.type === 'LOST' && item.status === 'OPEN' && !item.storage_location)) && (
                        <button 
                          onClick={() => setTakeoverItem(item)}
                          className="bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">hail</span>
                          Takeover Satpam
                        </button>
                      )}

                      <button 
                        onClick={() => handleDeleteReport(item.id)}
                        className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>

                  {/* Body information cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <p className="text-gray-400 uppercase font-bold tracking-wider">Ciri Rahasia</p>
                      <p className="text-gray-800 font-semibold mt-1">"{item.secret_feature || '-'}"</p>
                    </div>
                    <div>
                      <p className="text-gray-400 uppercase font-bold tracking-wider">Lokasi Kampus</p>
                      <p className="text-gray-800 font-semibold mt-1">{item.location?.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 uppercase font-bold tracking-wider">Lokasi Penyimpanan Fisik</p>
                      <p className="text-purple-800 font-bold mt-1">{item.storage_location || 'Belum Dititipkan'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. Claim Approvals Panel */}
      {activeSubTab === 'claims' && (
        <div className="text-left space-y-4">
          <h3 className="font-bold text-gray-900 text-base font-outfit border-b border-gray-50 pb-2">Persetujuan Klaim Masuk (Satpam)</h3>
          {incomingClaims.length === 0 ? (
            <p className="text-gray-500 text-sm">Belum ada pengajuan klaim barang untuk saat ini.</p>
          ) : (
            <div className="space-y-4">
              {incomingClaims.map(claim => (
                <div key={claim.id} className="p-5 border border-gray-100 rounded-2xl bg-gray-50/30 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-2">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Nama Barang</p>
                      <h4 className="font-bold text-gray-900 text-sm font-outfit">{claim.item?.title}</h4>
                    </div>
                    <span className="text-[10px] text-gray-400 font-semibold">{new Date(claim.created_at).toLocaleDateString()}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-xs space-y-2">
                      <p className="font-bold text-gray-500">Pengklaim: <span className="text-gray-900">{claim.claimer?.name} ({claim.claimer?.email})</span></p>
                      <p className="text-gray-400 font-bold uppercase mt-2">Ciri Rahasia (Sebenarnya):</p>
                      <p className="text-purple-900 font-bold bg-purple-50 p-2 rounded-lg">"{claim.item?.secret_feature}"</p>
                      
                      <p className="text-gray-400 font-bold uppercase mt-2">Deskripsi Bukti Pengklaim:</p>
                      <p className="text-gray-800 bg-white border border-gray-100 p-3 rounded-lg leading-relaxed">
                        "{claim.proof_description}"
                      </p>
                    </div>

                    {/* Claim Proof Image if any */}
                    {claim.proof_image_url && (
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">Foto Bukti Fisik Pengklaim</p>
                        <img 
                          src={claim.proof_image_url} 
                          alt="Bukti Klaim" 
                          className="h-32 object-contain rounded-xl border border-gray-200"
                        />
                      </div>
                    )}
                  </div>

                  {claim.status === 'PENDING' ? (
                    <div className="flex justify-end gap-2 pt-2 border-t border-gray-50">
                      <button 
                        onClick={() => handleResolveClaim(claim.id, 'REJECTED')}
                        className="bg-red-50 hover:bg-red-600 hover:text-white text-red-600 text-xs font-bold px-4 py-2 rounded-xl transition-all"
                      >
                        Tolak Klaim
                      </button>
                      <button 
                        onClick={() => handleResolveClaim(claim.id, 'APPROVED')}
                        className="bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 text-xs font-bold px-4 py-2 rounded-xl transition-all"
                      >
                        Setujui Klaim
                      </button>
                    </div>
                  ) : (
                    <div className="text-right border-t border-gray-50 pt-2">
                      <span className={`text-xs font-bold uppercase inline-block ${
                        claim.status === 'APPROVED' ? 'text-emerald-600' : 'text-red-500'
                      }`}>
                        Status Keputusan: {claim.status}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Audit Logs Timeline Modal */}
      {logsItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setLogsItem(null)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full p-8 font-inter">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 font-outfit">Log Audit Histori</h3>
                  <p className="text-xs text-gray-500 mt-1">{logsItem.title}</p>
                </div>
                <button onClick={() => setLogsItem(null)} className="text-gray-400 hover:text-gray-600">
                  <span className="material-symbols-outlined text-2xl">close</span>
                </button>
              </div>

              {/* Timeline sequence */}
              <div className="flow-root text-xs">
                {itemLogs.length === 0 ? (
                  <p className="text-gray-500 py-6 text-center">Belum ada histori log untuk barang ini.</p>
                ) : (
                  <ul className="-mb-8">
                    {itemLogs.map((log, idx) => (
                      <li key={log.id}>
                        <div className="relative pb-8">
                          {idx !== itemLogs.length - 1 && (
                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                          )}
                          <div className="relative flex space-x-3 text-left">
                            <div>
                              <span className="h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center text-secondary border border-purple-200">
                                <span className="material-symbols-outlined text-base select-none">timeline</span>
                              </span>
                            </div>
                            <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="font-semibold text-gray-800">{log.action}</p>
                                <p className="text-gray-500 mt-0.5">
                                  Diubah oleh <b>{log.actor?.name}</b>: dari <i>{log.old_value || 'NULL'}</i> menjadi <i>{log.new_value || 'NULL'}</i>
                                </p>
                              </div>
                              <div className="text-right text-gray-400 whitespace-nowrap">
                                <time dateTime={log.created_at}>{new Date(log.created_at).toLocaleDateString()}</time>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Takeover Satpam Modal */}
      {takeoverItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setTakeoverItem(null)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full p-8 font-inter">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 font-outfit">Takeover Laporan Barang oleh Satpam</h3>
                  <p className="text-xs text-gray-500 mt-1">{takeoverItem.title}</p>
                </div>
                <button onClick={() => setTakeoverItem(null)} className="text-gray-400 hover:text-gray-600">
                  <span className="material-symbols-outlined text-2xl">close</span>
                </button>
              </div>

              <form onSubmit={handleTakeoverSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Lokasi Penyimpanan Fisik Satpam</label>
                  <input 
                    type="text" 
                    required
                    value={takeoverStorageLoc}
                    onChange={(e) => setTakeoverStorageLoc(e.target.value)}
                    placeholder="Contoh: Loker Kunci A-3 Pos Satpam Basement Gedung 3"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-all-200"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block leading-normal">
                    Penting: Mengklik tombol takeover akan memverifikasi temuan barang, mengubah statusnya menjadi <b>Aktif (OPEN)</b> agar terpublis di Beranda, serta mencatat log serah terima.
                  </span>
                </div>

                <div className="pt-4 flex justify-end gap-2 border-t border-gray-100">
                  <button 
                    type="button" 
                    onClick={() => setTakeoverItem(null)}
                    className="px-5 py-2.5 border border-gray-200 text-gray-500 rounded-xl text-xs font-bold hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className="bg-secondary text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-md text-xs"
                  >
                    Konfirmasi Takeover
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
