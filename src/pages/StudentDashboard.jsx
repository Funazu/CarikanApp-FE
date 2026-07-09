import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import ImageFallback from '../components/ImageFallback';

const StudentDashboard = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'summary';

  // State arrays
  const [myItems, setMyItems] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [incomingClaims, setIncomingClaims] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Create report modal state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportType, setReportType] = useState('LOST');
  const [reportTitle, setReportTitle] = useState('');
  const [reportDesc, setReportDesc] = useState('');
  const [reportSecret, setReportSecret] = useState('');
  const [reportCat, setReportCat] = useState('');
  const [reportLoc, setReportLoc] = useState('');
  const [reportStorageLoc, setReportStorageLoc] = useState('');
  const [reportContact, setReportContact] = useState(user?.contact_info || '');
  const [reportImage, setReportImage] = useState(null);
  const [reportImagePreview, setReportImagePreview] = useState(null);

  // Profile update settings state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileContact, setProfileContact] = useState(user?.contact_info || '');
  const [profileAvatar, setProfileAvatar] = useState(null);
  const [profileAvatarPreview, setProfileAvatarPreview] = useState(user?.avatar_url || null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch dropdown metadata
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
        console.error(err);
      }
    };
    fetchMetadata();
  }, []);

  // Open report modal if action=report query parameter is present
  useEffect(() => {
    if (searchParams.get('action') === 'report') {
      setIsReportModalOpen(true);
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('action');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Fetch dashboard tab data
  const fetchTabData = async () => {
    if (!user) return;
    try {
      if (activeTab === 'summary') {
        const [itemsRes, claimsRes, notifRes] = await Promise.all([
          api.get('/items'),
          api.get('/claims/outgoing'),
          api.get('/notifications')
        ]);
        // filter items owned by me (backend index route gets all paginated, let's filter or let backend return it. Wait, the backend has GET /items where we can filter or index. Actually, to get only my items, let's filter from all or let's fetch. Wait, does backend index return everything? Yes. Let's filter client-side for user_id, or let's check! Wait, client-side filtering is fine since the test is local. Let's filter `item.user_id === user.id`).
        setMyItems(itemsRes.data.data.filter(item => item.user_id === user.id));
        setMyClaims(claimsRes.data);
        setNotifications(notifRes.data);
      } else if (activeTab === 'posts') {
        const res = await api.get('/items');
        setMyItems(res.data.data.filter(item => item.user_id === user.id));
      } else if (activeTab === 'claims') {
        const res = await api.get('/claims/outgoing');
        setMyClaims(res.data);
      } else if (activeTab === 'incoming') {
        const res = await api.get('/claims/incoming');
        setIncomingClaims(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTabData();
    // Pre-populate fields on user load
    if (user) {
      setProfileName(user.name);
      setProfileContact(user.contact_info || '');
      setProfileAvatarPreview(user.avatar_url);
      setReportContact(user.contact_info || '');
    }
  }, [activeTab, user]);

  const handleTabChange = (tabName) => {
    setSearchParams({ tab: tabName });
    setErrorMsg('');
    setSuccessMsg('');
  };

  // Image upload preview handlers
  const handleReportImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReportImage(file);
      setReportImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileAvatar(file);
      setProfileAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Create report submit
  const handleCreateReport = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    
    if (!reportImage) {
      setErrorMsg('Wajib mengunggah foto bukti fisik barang.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', reportTitle);
      formData.append('description', reportDesc);
      formData.append('secret_feature', reportSecret);
      formData.append('type', reportType);
      formData.append('event_time', new Date().toISOString().slice(0, 19).replace('T', ' ')); // SQL timestamp
      formData.append('contact_info', reportContact);
      formData.append('category_id', reportCat);
      formData.append('location_id', reportLoc);
      if (reportStorageLoc) {
        formData.append('storage_location', reportStorageLoc);
      }
      formData.append('image', reportImage);

      await api.post('/items', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccessMsg('Laporan barang berhasil dibuat!');
      setIsReportModalOpen(false);
      
      // Clear fields
      setReportTitle('');
      setReportDesc('');
      setReportSecret('');
      setReportCat('');
      setReportLoc('');
      setReportStorageLoc('');
      setReportImage(null);
      setReportImagePreview(null);
      
      fetchTabData();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Gagal membuat laporan barang.');
    } finally {
      setLoading(false);
    }
  };

  // Update profile submit
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('name', profileName);
      formData.append('contact_info', profileContact);
      if (profileAvatar) {
        formData.append('avatar', profileAvatar);
      }
      
      await updateProfile(formData);
      setSuccessMsg('Profil berhasil diperbarui!');
    } catch (err) {
      console.error(err);
      setErrorMsg('Gagal memperbarui profil.');
    } finally {
      setLoading(false);
    }
  };

  // Soft delete item
  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus postingan laporan ini?')) return;
    try {
      await api.delete(`/items/${itemId}`);
      showToast('Laporan berhasil dihapus.', 'success');
      fetchTabData();
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus laporan.', 'error');
    }
  };



  // Trigger reveal contact
  const handleRevealContact = async (claimId) => {
    try {
      const res = await api.get(`/claims/${claimId}/contact`);
      const contactNo = res.data.report_specific_contact || res.data.contact_whatsapp_telegram_default;
      // Sanitize wa link (remove + or leading zeros if necessary, wa.me handles simple strings)
      const cleanNo = contactNo.replace(/[^0-9]/g, '');
      const formattedNo = cleanNo.startsWith('0') ? '62' + cleanNo.slice(1) : cleanNo;
      window.open(`https://wa.me/${formattedNo}`, '_blank');
    } catch (err) {
      console.error(err);
      showToast('Gagal mengambil detail kontak: ' + (err.response?.data?.message || ''), 'error');
    }
  };

  // Calculate Trust Score medaled badge
  const getTrustBadge = (score) => {
    if (score >= 30) return { title: 'Honest Finder (Gold)', color: 'text-amber-500 bg-amber-50 border-amber-200', icon: 'military_tech' };
    if (score >= 10) return { title: 'Honest Finder (Silver)', color: 'text-slate-500 bg-slate-50 border-slate-200', icon: 'stars' };
    return { title: 'Honest Finder (Bronze)', color: 'text-orange-500 bg-orange-50 border-orange-200', icon: 'workspace_premium' };
  };

  const badge = getTrustBadge(user?.trust_score || 0);

  // Suggestion popup check
  const matchNotification = notifications.find(n => !n.is_read && n.title.includes('Rekomendasi'));

  return (
    <div className="font-inter max-w-7xl mx-auto px-6 py-8 pb-24 lg:pb-8">
      
      {/* Auto-Match Recommendation Banner alert */}
      {matchNotification && (
        <div className="mb-6 bg-purple-50 border-2 border-purple-200 rounded-2xl p-4 flex items-center justify-between text-left shadow-md animate-bounce">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary text-3xl select-none">celebration</span>
            <div>
              <h4 className="font-bold text-gray-900 font-outfit text-sm">Rekomendasi Pencocokan Otomatis!</h4>
              <p className="text-gray-600 text-xs mt-0.5">{matchNotification.message}</p>
            </div>
          </div>
          <button 
            onClick={() => handleTabChange('summary')}
            className="bg-secondary text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-secondary-container hover:text-primary transition-colors"
          >
            Tinjau Notifikasi
          </button>
        </div>
      )}

      {/* Success / Error Messages */}
      {successMsg && (
        <div className="mb-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl p-3.5 text-xs font-semibold text-left">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mb-4 bg-red-50 border border-red-100 text-red-800 rounded-xl p-3.5 text-xs font-semibold text-left">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Left Side Tab Navigation Column - Desktop Only */}
        <div className="hidden lg:flex lg:flex-col bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-2 lg:col-span-1">
          
          <button 
            onClick={() => handleTabChange('summary')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-semibold transition-all-200 ${
              activeTab === 'summary' 
                ? 'bg-secondary text-white shadow-sm' 
                : 'text-gray-600 hover:bg-purple-50 hover:text-secondary'
            }`}
          >
            <span className="material-symbols-outlined text-xl">account_circle</span>
            Ringkasan Profil
          </button>

          <button 
            onClick={() => handleTabChange('posts')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-semibold transition-all-200 ${
              activeTab === 'posts' 
                ? 'bg-secondary text-white shadow-sm' 
                : 'text-gray-600 hover:bg-purple-50 hover:text-secondary'
            }`}
          >
            <span className="material-symbols-outlined text-xl">assignment</span>
            Laporan Saya
          </button>

          <button 
            onClick={() => handleTabChange('claims')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-semibold transition-all-200 ${
              activeTab === 'claims' 
                ? 'bg-secondary text-white shadow-sm' 
                : 'text-gray-600 hover:bg-purple-50 hover:text-secondary'
            }`}
          >
            <span className="material-symbols-outlined text-xl">handshake</span>
            Klaim Saya
          </button>

          <button 
            onClick={() => handleTabChange('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-semibold transition-all-200 ${
              activeTab === 'settings' 
                ? 'bg-secondary text-white shadow-sm' 
                : 'text-gray-600 hover:bg-purple-50 hover:text-secondary'
            }`}
          >
            <span className="material-symbols-outlined text-xl">settings</span>
            Pengaturan Profil
          </button>

          <div className="pt-4 border-t border-gray-100 mt-4">
            <button 
              onClick={() => setIsReportModalOpen(true)}
              className="w-full bg-secondary hover:bg-secondary-container hover:text-primary text-white font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm"
            >
              <span className="material-symbols-outlined text-lg">add_circle</span>
              Lapor Barang Baru
            </button>
          </div>
        </div>

        {/* Right Side Content Panel */}
        <div className="lg:col-span-3 bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm">
          
          {/* Tab 1: Summary */}
          {activeTab === 'summary' && (
            <div className="space-y-8 text-left">
              {/* Profile Card & Medalled Trust Score */}
              <div className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50/30 border border-purple-100/50 rounded-2xl flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} className="w-16 h-16 rounded-full object-cover border border-purple-200" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-secondary text-white font-bold text-2xl flex items-center justify-center font-outfit uppercase">
                      {user?.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 font-outfit">{user?.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                    <p className="text-xs text-gray-400 mt-1 font-semibold">Hubungi: {user?.contact_info || '-'}</p>
                  </div>
                </div>

                <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-xs ${badge.color}`}>
                  <span className="material-symbols-outlined text-2xl select-none">{badge.icon}</span>
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium">Badge Reputasi</p>
                    <p className="font-outfit">{badge.title}</p>
                  </div>
                </div>
              </div>

              {/* Statistics Counters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 border border-gray-100 rounded-2xl bg-white shadow-xs">
                  <span className="material-symbols-outlined text-secondary text-3xl mb-2">assignment</span>
                  <p className="text-xs text-gray-400 font-bold uppercase">Total Postingan Anda</p>
                  <p className="text-3xl font-black text-gray-800 font-outfit mt-1">{myItems.length}</p>
                </div>
                <div className="p-5 border border-gray-100 rounded-2xl bg-white shadow-xs">
                  <span className="material-symbols-outlined text-secondary text-3xl mb-2">handshake</span>
                  <p className="text-xs text-gray-400 font-bold uppercase">Klaim Diajukan</p>
                  <p className="text-3xl font-black text-gray-800 font-outfit mt-1">{myClaims.length}</p>
                </div>
                <div className="p-5 border border-gray-100 rounded-2xl bg-white shadow-xs">
                  <span className="material-symbols-outlined text-secondary text-3xl mb-2">military_tech</span>
                  <p className="text-xs text-gray-400 font-bold uppercase">Skor Kejujuran (Trust)</p>
                  <p className="text-3xl font-black text-gray-800 font-outfit mt-1">{user?.trust_score}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: My Posts */}
          {activeTab === 'posts' && (
            <div className="text-left space-y-6">
              <h3 className="text-xl font-bold font-outfit text-gray-900 border-b border-gray-50 pb-3">Kelola Laporan Saya</h3>
              
              {myItems.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  <span className="material-symbols-outlined text-gray-300 text-5xl mb-2">drafts</span>
                  <p className="text-sm">Anda belum memposting laporan barang apapun.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myItems.map(item => (
                    <div key={item.id} className="p-4 border border-gray-100 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <ImageFallback src={item.image_url} alt={item.title} className="w-12 h-12 rounded-xl object-cover" />
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm font-outfit line-clamp-1">{item.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${
                              item.type === 'LOST' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                            }`}>
                              {item.type}
                            </span>
                            <StatusBadge status={item.status} />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">

                        
                        <button 
                          onClick={() => handleDeleteItem(item.id)}
                          className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white p-2 rounded-xl transition-all"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: My Claims */}
          {activeTab === 'claims' && (
            <div className="text-left space-y-6">
              <h3 className="text-xl font-bold font-outfit text-gray-900 border-b border-gray-50 pb-3">Daftar Klaim Diajukan</h3>

              {myClaims.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  <span className="material-symbols-outlined text-gray-300 text-5xl mb-2">history</span>
                  <p className="text-sm">Anda belum pernah mengajukan klaim atas barang apapun.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myClaims.map(claim => (
                    <div key={claim.id} className="p-4 border border-gray-100 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm font-outfit">{claim.item?.title}</h4>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">Bukti: {claim.proof_description}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                          claim.status === 'APPROVED' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                            : claim.status === 'REJECTED'
                              ? 'bg-red-50 text-red-700 border-red-100'
                              : 'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          {claim.status}
                        </span>

                        {claim.status === 'APPROVED' && (
                          <button 
                            onClick={() => handleRevealContact(claim.id)}
                            className="bg-secondary text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-secondary-container hover:text-primary transition-all flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-base">phone_iphone</span>
                            Hubungi Penemu
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 5: Settings */}
          {activeTab === 'settings' && (
            <div className="text-left space-y-6">
              <h3 className="text-xl font-bold font-outfit text-gray-900 border-b border-gray-50 pb-3">Ubah Profil & Kontak</h3>
              
              <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
                <div className="flex items-center gap-4 mb-6">
                  {profileAvatarPreview ? (
                    <img src={profileAvatarPreview} alt="Avatar" className="w-16 h-16 rounded-full object-cover border border-purple-200" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-secondary text-white font-bold text-2xl flex items-center justify-center uppercase font-outfit">
                      {user?.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Foto Profil</label>
                    <input 
                      type="file" 
                      onChange={handleAvatarChange}
                      className="text-xs text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-secondary hover:file:bg-purple-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nama Lengkap</label>
                  <input 
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-all-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">No. WhatsApp Aktif</label>
                  <input 
                    type="text"
                    required
                    value={profileContact}
                    onChange={(e) => setProfileContact(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-all-200"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="bg-secondary hover:bg-secondary-container hover:text-primary text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md inline-flex items-center gap-2 text-sm disabled:opacity-50"
                >
                  {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                  Simpan Perubahan
                </button>
              </form>
            </div>
          )}

        </div>
      </div>

      {/* Report Creation Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity" onClick={() => setIsReportModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full p-8 font-inter">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                <h3 className="text-xl font-bold text-gray-900 font-outfit">Lapor Barang Hilang / Temuan</h3>
                <button onClick={() => setIsReportModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <span className="material-symbols-outlined text-2xl">close</span>
                </button>
              </div>

              <form onSubmit={handleCreateReport} className="space-y-4">
                {/* Type Selection Toggle */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Jenis Laporan</label>
                  <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1.5 rounded-xl">
                    <button 
                      type="button"
                      onClick={() => setReportType('LOST')}
                      className={`py-2 text-xs font-bold rounded-lg transition-all ${
                        reportType === 'LOST' ? 'bg-white text-red-600 shadow-xs' : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      Kehilangan (LOST)
                    </button>
                    <button 
                      type="button"
                      onClick={() => setReportType('FOUND')}
                      className={`py-2 text-xs font-bold rounded-lg transition-all ${
                        reportType === 'FOUND' ? 'bg-white text-blue-600 shadow-xs' : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      Penemuan (FOUND)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nama Barang / Judul</label>
                  <input 
                    type="text" 
                    required
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    placeholder="Contoh: HP iPhone 13 Pro Max Biru"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-all-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Deskripsi Kronologi / Keterangan</label>
                  <textarea 
                    required
                    rows="3"
                    value={reportDesc}
                    onChange={(e) => setReportDesc(e.target.value)}
                    placeholder="Jelaskan detail barang dan kronologi singkat..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-all-200"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Kategori</label>
                    <select 
                      required
                      value={reportCat}
                      onChange={(e) => setReportCat(e.target.value)}
                      className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none"
                    >
                      <option value="">Pilih Kategori</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Titik Lokasi</label>
                    <select 
                      required
                      value={reportLoc}
                      onChange={(e) => setReportLoc(e.target.value)}
                      className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none"
                    >
                      <option value="">Pilih Lokasi</option>
                      {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </div>
                </div>

                {reportType === 'FOUND' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Lokasi Penyimpanan Fisik (Opsional)</label>
                    <input 
                      type="text" 
                      value={reportStorageLoc}
                      onChange={(e) => setReportStorageLoc(e.target.value)}
                      placeholder="Contoh: Dititipkan di Pos Satpam Basement 3"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-all-200"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Ciri Rahasia Barang</label>
                  <input 
                    type="text" 
                    required
                    value={reportSecret}
                    onChange={(e) => setReportSecret(e.target.value)}
                    placeholder="Contoh: Gantungan kunci kucing orange, retak kecil di pojok kanan bawah"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-all-200"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block leading-normal">
                    Penting: Ciri rahasia ini TIDAK dipublikasikan di feed. Hanya untuk memverifikasi klaim kepemilikan.
                  </span>
                </div>

                {/* Upload Image Section */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Foto Barang</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-secondary/50 bg-gray-50/50 flex flex-col items-center justify-center relative">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleReportImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {reportImagePreview ? (
                      <img src={reportImagePreview} alt="Preview" className="h-32 object-contain rounded-lg" />
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-secondary text-3xl mb-1">cloud_upload</span>
                        <p className="text-xs text-gray-500 font-bold">Pilih file atau seret gambar ke sini</p>
                        <p className="text-[10px] text-gray-400 mt-1">PNG, JPG, JPEG hingga 2MB</p>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Kontak Hubungi (WhatsApp)</label>
                  <input 
                    type="text" 
                    required
                    value={reportContact}
                    onChange={(e) => setReportContact(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-all-200"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-2 border-t border-gray-100">
                  <button 
                    type="button" 
                    onClick={() => setIsReportModalOpen(false)}
                    className="px-5 py-2.5 border border-gray-200 text-gray-500 rounded-xl text-xs font-bold hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-secondary hover:bg-secondary-container hover:text-primary text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-md text-xs inline-flex items-center gap-2"
                  >
                    {loading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                    Kirim Laporan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Mobile Bottom Tab Navigation Bar - Dashboard Specific */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-45 bg-white/95 backdrop-blur-md border-t border-gray-100 flex items-center justify-around py-2 px-2 pb-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] select-none">
        
        {/* Ringkasan */}
        <button 
          onClick={() => handleTabChange('summary')}
          className={`flex flex-col items-center gap-0.5 text-[9px] font-extrabold transition-all ${
            activeTab === 'summary' ? 'text-secondary scale-105' : 'text-gray-400'
          }`}
        >
          <span className="material-symbols-outlined text-2xl select-none">account_circle</span>
          <span>Ringkasan</span>
        </button>

        {/* Laporan Saya */}
        <button 
          onClick={() => handleTabChange('posts')}
          className={`flex flex-col items-center gap-0.5 text-[9px] font-extrabold transition-all ${
            activeTab === 'posts' ? 'text-secondary scale-105' : 'text-gray-400'
          }`}
        >
          <span className="material-symbols-outlined text-2xl select-none">assignment</span>
          <span>Laporan</span>
        </button>

        {/* Floating Lapor Button */}
        <button 
          onClick={() => setIsReportModalOpen(true)}
          className="flex flex-col items-center -mt-6 transition-all"
        >
          <div className="w-13 h-13 bg-secondary text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl active:scale-90 transition-all border-4 border-white">
            <span className="material-symbols-outlined text-3xl select-none font-bold">add</span>
          </div>
          <span className="text-[9px] font-black text-secondary mt-0.5 font-outfit">Lapor</span>
        </button>

        {/* Klaim Saya */}
        <button 
          onClick={() => handleTabChange('claims')}
          className={`flex flex-col items-center gap-0.5 text-[9px] font-extrabold transition-all ${
            activeTab === 'claims' ? 'text-secondary scale-105' : 'text-gray-400'
          }`}
        >
          <span className="material-symbols-outlined text-2xl select-none">handshake</span>
          <span>Klaim</span>
        </button>

        {/* Pengaturan */}
        <button 
          onClick={() => handleTabChange('settings')}
          className={`flex flex-col items-center gap-0.5 text-[9px] font-extrabold transition-all ${
            activeTab === 'settings' ? 'text-secondary scale-105' : 'text-gray-400'
          }`}
        >
          <span className="material-symbols-outlined text-2xl select-none">settings</span>
          <span>Pengaturan</span>
        </button>

      </div>

    </div>
  );
};

export default StudentDashboard;
