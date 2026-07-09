import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import ImageFallback from '../components/ImageFallback';

const LandingPage = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  
  // Filter state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedType, setSelectedType] = useState(''); // '', 'LOST', 'FOUND'
  const [selectedStatus, setSelectedStatus] = useState('OPEN'); // default to OPEN for active feed
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination state
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Fetch static drops
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, locRes] = await Promise.all([
          api.get('/categories'),
          api.get('/locations')
        ]);
        setCategories(catRes.data);
        setLocations(locRes.data);
      } catch (err) {
        console.error('Failed to load metadata', err);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch items based on filters
  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 6,
        search,
        categoryId: selectedCategory,
        locationId: selectedLocation,
        type: selectedType,
        status: selectedStatus
      };
      
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.get('/items', { params });
      setItems(res.data.data);
      setLastPage(res.data.last_page || 1);
    } catch (err) {
      console.error('Failed to load items', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [page, selectedCategory, selectedLocation, selectedType, selectedStatus, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchItems();
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedLocation('');
    setSelectedType('');
    setSelectedStatus('OPEN');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  return (
    <div className="font-inter max-w-7xl mx-auto px-6 py-8">
      {/* Hero Section */}
      <div className="text-center py-16 px-4 bg-gradient-to-br from-primary via-primary-container to-secondary rounded-3xl text-white mb-12 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent)]"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="bg-purple-800/50 text-tertiary-fixed border border-purple-600/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block font-outfit">
            Amikom Yogyakarta Lost & Found
          </span>
          <h1 className="text-4xl md:text-5xl font-black mb-6 font-outfit leading-tight tracking-tight">
            Temukan Barangmu yang Hilang <br />di Kampus Amikom
          </h1>
          <p className="text-purple-100 md:text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
            Platform "Carikan" hadir mempermudah mahasiswa saling berkolaborasi melacak dan mengembalikan barang tercecer di seluruh area gedung kampus.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              to="/dashboard"
              className="bg-secondary hover:bg-secondary-container hover:text-primary text-white font-bold px-6 py-3.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">campaign</span>
              Lapor Kehilangan (LOST)
            </Link>
            <Link 
              to="/dashboard"
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-6 py-3.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">volunteer_activism</span>
              Lapor Penemuan (FOUND)
            </Link>
          </div>
        </div>
      </div>

      {/* Global Search and Filter Bar */}
      <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-md mb-8">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Cari Barang</label>
            <div className="relative">
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Masukkan kata kunci nama barang..." 
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-all-200"
              />
              <span className="material-symbols-outlined absolute left-3 top-3.5 text-gray-400 text-lg">search</span>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Kategori</label>
            <select 
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
              className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-all-200"
            >
              <option value="">Semua Kategori</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Lokasi Kampus</label>
            <select 
              value={selectedLocation}
              onChange={(e) => { setSelectedLocation(e.target.value); setPage(1); }}
              className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-all-200"
            >
              <option value="">Semua Lokasi</option>
              {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
        </form>

        {/* Detailed Filters & Date Range */}
        <div className="mt-6 pt-6 border-t border-gray-100 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {/* Type toggle */}
            <button 
              onClick={() => { setSelectedType(''); setPage(1); }}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                selectedType === '' 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Semua Tipe
            </button>
            <button 
              onClick={() => { setSelectedType('LOST'); setPage(1); }}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                selectedType === 'LOST' 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Barang Hilang
            </button>
            <button 
              onClick={() => { setSelectedType('FOUND'); setPage(1); }}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                selectedType === 'FOUND' 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Barang Temuan
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                className="px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs"
              />
              <span className="text-xs text-gray-400">s/d</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                className="px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs"
              />
            </div>

            <button 
              onClick={handleResetFilters}
              className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline inline-flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">restart_alt</span>
              Reset Filter
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid Feed Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 font-outfit">Laporan Terkini</h2>
        <div className="flex gap-2">
          {/* Status filter toggle tabs */}
          {['OPEN', 'IN_PROCESS', 'RETURNED'].map(st => (
            <button
              key={st}
              onClick={() => { setSelectedStatus(st); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                selectedStatus === st 
                  ? 'bg-secondary/15 text-secondary border border-secondary/25'
                  : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
              }`}
            >
              {st === 'OPEN' ? 'Aktif' : st === 'IN_PROCESS' ? 'Diproses' : 'Kembali'}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="bg-white rounded-2xl border border-gray-100 p-4 h-[350px] animate-pulse flex flex-col justify-between">
              <div className="bg-gray-100 w-full h-[180px] rounded-xl"></div>
              <div className="space-y-3 mt-4">
                <div className="h-4 bg-gray-100 rounded-sm w-3/4"></div>
                <div className="h-3 bg-gray-100 rounded-sm w-1/2"></div>
              </div>
              <div className="h-8 bg-gray-100 rounded-xl w-full mt-4"></div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center shadow-xs">
          <span className="material-symbols-outlined text-gray-300 text-7xl mb-4 select-none">travel_explore</span>
          <h3 className="text-lg font-bold text-gray-700 font-outfit mb-2">Laporan Tidak Ditemukan</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Tidak ada laporan barang yang cocok dengan kriteria filter atau kata kunci pencarian Anda saat ini.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {items.map((item) => (
              <div 
                key={item.id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Card Image Banner */}
                  <div className="relative h-[200px] overflow-hidden bg-gray-50 border-b border-gray-50">
                    <ImageFallback 
                      src={item.image_url} 
                      alt={item.title} 
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    
                    {/* Floating badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase text-white shadow-md ${
                        item.type === 'LOST' ? 'bg-red-500' : 'bg-blue-600'
                      }`}>
                        {item.type === 'LOST' ? 'HILANG' : 'TEMUAN'}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <StatusBadge status={item.status} />
                    </div>
                  </div>

                  {/* Card Text Content */}
                  <div className="p-5 text-left">
                    <div className="flex gap-2 mb-2 text-[10px] font-bold text-secondary uppercase">
                      <span className="flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-xs select-none">label</span>
                        {item.category?.name}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-xs select-none">location_on</span>
                        {item.location?.name}
                      </span>
                    </div>

                    <h3 className="font-bold text-gray-900 font-outfit text-base leading-snug line-clamp-1 mb-2">
                      {item.title}
                    </h3>
                    
                    <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Card Button footer */}
                <div className="p-5 pt-0">
                  <Link 
                    to={`/items/${item.id}`}
                    className="w-full block text-center bg-purple-50 text-secondary hover:bg-secondary hover:text-white text-xs font-bold py-3 rounded-xl transition-all-200"
                  >
                    Lihat Detail & Hubungi
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {lastPage > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button 
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white"
              >
                <span className="material-symbols-outlined text-base">navigate_before</span>
              </button>
              
              <span className="text-xs text-gray-500 font-semibold px-3">
                Halaman {page} dari {lastPage}
              </span>

              <button 
                disabled={page === lastPage}
                onClick={() => setPage(page + 1)}
                className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white"
              >
                <span className="material-symbols-outlined text-base">navigate_next</span>
              </button>
            </div>
          )}
        </>
      )}

      {/* Info Section */}
      <div className="mt-20 py-12 border-t border-gray-100">
        <h2 className="text-2xl font-bold text-center text-gray-800 font-outfit mb-12">Cara Kerja Platform</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col items-center text-center p-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-secondary font-bold flex items-center justify-center mb-4 text-lg">1</div>
            <h4 className="font-bold text-gray-900 mb-2 text-sm font-outfit">Lapor Barang</h4>
            <p className="text-gray-500 text-xs leading-relaxed">
              Buat postingan laporan Kehilangan (LOST) atau Temuan (FOUND) barang lengkap dengan lokasi & kategori.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-secondary font-bold flex items-center justify-center mb-4 text-lg">2</div>
            <h4 className="font-bold text-gray-900 mb-2 text-sm font-outfit">Sistem Auto-Match</h4>
            <p className="text-gray-500 text-xs leading-relaxed">
              Sistem akan mencocokkan laporan kehilangan Anda dengan temuan barang sejenis di lokasi yang sama secara real-time.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-secondary font-bold flex items-center justify-center mb-4 text-lg">3</div>
            <h4 className="font-bold text-gray-900 mb-2 text-sm font-outfit">Verifikasi Satpam</h4>
            <p className="text-gray-500 text-xs leading-relaxed">
              Pemilik asli mengajukan klaim dengan ciri rahasia. Satpam memvalidasi bukti tersebut sebelum menyetujui.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-secondary font-bold flex items-center justify-center mb-4 text-lg">4</div>
            <h4 className="font-bold text-gray-900 mb-2 text-sm font-outfit">Serah Terima Fisik</h4>
            <p className="text-gray-500 text-xs leading-relaxed">
              Setelah disetujui Satpam, pemilik sah dapat langsung mendatangi Pos Satpam untuk serah terima barang secara resmi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
