import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatusBadge from './StatusBadge';
import ImageFallback from './ImageFallback';

const ItemDetailModal = ({ itemId, onClose, hideClaimButton = false }) => {
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  // Claim modal states inside detail modal
  const [isClaiming, setIsClaiming] = useState(false);
  const [proofDesc, setProofDesc] = useState('');
  const [proofImg, setProofImg] = useState(null);
  const [proofImgPreview, setProofImgPreview] = useState(null);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState('');
  const [claimError, setClaimError] = useState('');

  // Report Found states for LOST items
  const [isReportingFound, setIsReportingFound] = useState(false);
  const [foundStorageLoc, setFoundStorageLoc] = useState('');
  const [foundNote, setFoundNote] = useState('');
  const [foundLoading, setFoundLoading] = useState(false);
  const [foundSuccess, setFoundSuccess] = useState('');
  const [foundError, setFoundError] = useState('');

  useEffect(() => {
    if (!itemId) return;
    const fetchItem = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/items/${itemId}`);
        setItem(res.data);
      } catch (err) {
        console.error(err);
        setItem(null);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [itemId]);

  if (!itemId) return null;

  const handleProofImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProofImg(file);
      setProofImgPreview(URL.createObjectURL(file));
    }
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    setClaimError('');
    setClaimSuccess('');
    setClaimLoading(true);
    try {
      const formData = new FormData();
      formData.append('item_id', item.id);
      formData.append('proof_description', proofDesc);
      if (proofImg) {
        formData.append('proof_image', proofImg);
      }

      await api.post('/claims', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setClaimSuccess('Klaim kepemilikan berhasil diajukan!');
      setTimeout(() => {
        setIsClaiming(false);
        setClaimSuccess('');
        onClose();
      }, 1800);

    } catch (err) {
      console.error(err);
      setClaimError(err.response?.data?.message || 'Gagal mengajukan klaim.');
    } finally {
      setClaimLoading(false);
    }
  };

  const handleReportFoundSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Silakan login terlebih dahulu untuk melaporkan penemuan barang.');
      return;
    }
    setFoundLoading(true);
    setFoundError('');
    setFoundSuccess('');
    try {
      const res = await api.post(`/items/${itemId}/report-found`, {
        storage_location: foundStorageLoc,
        note: foundNote
      });
      setFoundSuccess(res.data.message || 'Laporan penemuan barang berhasil dikirim ke Satpam!');
      setTimeout(() => {
        setIsReportingFound(false);
        setFoundSuccess('');
        onClose();
      }, 1800);
    } catch (err) {
      console.error(err);
      setFoundError(err.response?.data?.message || 'Gagal mengirim laporan penemuan.');
    } finally {
      setFoundLoading(false);
    }
  };

  const isOwner = user && item && user.id === item.user_id;
  const isAdmin = user && user.role === 'ADMIN';

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto font-inter">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity" 
          onClick={onClose}
        ></div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        {/* Modal Window Container */}
        <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full p-6 md:p-8 relative">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-2xl select-none">info</span>
              <h3 className="text-xl font-bold text-gray-900 font-outfit">Detail Laporan Barang</h3>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-50 cursor-pointer"
            >
              <span className="material-symbols-outlined text-2xl select-none">close</span>
            </button>
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs text-gray-500 font-semibold">Memuat informasi detail barang...</p>
            </div>
          ) : !item ? (
            <div className="py-12 text-center text-gray-500">
              <span className="material-symbols-outlined text-red-500 text-5xl mb-2 select-none">error</span>
              <p className="text-sm font-bold text-gray-800">Laporan Tidak Ditemukan</p>
              <p className="text-xs text-gray-400 mt-1">Laporan barang ini mungkin telah dihapus atau tidak tersedia.</p>
            </div>
          ) : isReportingFound ? (
            /* Form Penyerahan Barang Kehilangan ke Satpam */
            <div className="space-y-4 font-inter">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h4 className="font-bold text-emerald-900 font-outfit text-base flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-emerald-600 text-xl select-none">volunteer_activism</span>
                  Laporkan Penemuan Barang (Serahkan ke Satpam)
                </h4>
                <button onClick={() => setIsReportingFound(false)} className="text-xs text-emerald-700 font-bold hover:underline">
                  &larr; Batal
                </button>
              </div>

              {foundSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-bold">
                  {foundSuccess}
                </div>
              )}
              {foundError && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl text-xs font-bold">
                  {foundError}
                </div>
              )}

              <form onSubmit={handleReportFoundSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Pos Satpam Penyerahan Barang (Wajib)</label>
                  <input 
                    type="text"
                    required
                    value={foundStorageLoc}
                    onChange={(e) => setFoundStorageLoc(e.target.value)}
                    placeholder="Contoh: Pos Satpam Gedung Utama / Loker Satpam Basement 1"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:bg-white focus:border-emerald-600 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Catatan Tambahan (Opsional)</label>
                  <textarea 
                    rows="3"
                    value={foundNote}
                    onChange={(e) => setFoundNote(e.target.value)}
                    placeholder="Jelaskan lokasi barang ditemukan atau nama petugas Satpam yang menerima..."
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-emerald-600 focus:outline-none transition-all"
                  ></textarea>
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
                  <button 
                    type="button" 
                    onClick={() => setIsReportingFound(false)}
                    className="px-4 py-2 border border-gray-200 text-gray-500 rounded-xl text-xs font-bold hover:bg-gray-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    disabled={foundLoading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-xl transition-all shadow-md text-xs inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {foundLoading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                    Kirim & Serahkan ke Satpam
                  </button>
                </div>
              </form>
            </div>
          ) : isClaiming ? (
            /* Claim Submission Form Inside Modal */
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h4 className="font-bold text-gray-800 font-outfit text-base">Formulir Klaim Kepemilikan</h4>
                <button onClick={() => setIsClaiming(false)} className="text-xs text-secondary font-bold hover:underline">
                  &larr; Kembali ke Detail
                </button>
              </div>

              {claimSuccess && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl p-3 text-xs font-semibold">
                  {claimSuccess}
                </div>
              )}

              {claimError && (
                <div className="bg-red-50 border border-red-100 text-red-800 rounded-xl p-3 text-xs font-semibold">
                  {claimError}
                </div>
              )}

              <form onSubmit={handleClaimSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Deskripsi Bukti (Ciri Rahasia)</label>
                  <textarea 
                    required
                    rows="3"
                    value={proofDesc}
                    onChange={(e) => setProofDesc(e.target.value)}
                    placeholder="Sebutkan ciri spesifik barang Anda (contoh: stiker di casing, retakan layar, nomor seri)..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-all-200"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Foto Bukti Fisik / Nota (Opsional)</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-secondary/50 bg-gray-50/50 flex flex-col items-center justify-center relative">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleProofImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {proofImgPreview ? (
                      <img src={proofImgPreview} alt="Preview" className="h-28 object-contain rounded-lg" />
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-secondary text-2xl mb-1 select-none">cloud_upload</span>
                        <p className="text-xs text-gray-500 font-bold">Pilih foto bukti fisik</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-gray-100">
                  <button 
                    type="button" 
                    onClick={() => setIsClaiming(false)}
                    className="px-4 py-2 border border-gray-200 text-gray-500 rounded-xl text-xs font-bold hover:bg-gray-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    disabled={claimLoading}
                    className="bg-secondary hover:bg-secondary-container hover:text-primary text-white font-bold px-5 py-2 rounded-xl transition-all shadow-md text-xs inline-flex items-center gap-2 cursor-pointer"
                  >
                    {claimLoading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                    Kirim Klaim
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Main Item Content View */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                
                {/* Image */}
                <div className="rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 h-[220px] md:h-[260px] flex items-center justify-center">
                  <ImageFallback src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                </div>

                {/* Details */}
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black tracking-wider uppercase text-white shadow-xs ${
                      item.type === 'LOST' ? 'bg-red-500' : 'bg-blue-600'
                    }`}>
                      {item.type === 'LOST' ? 'KEHILANGAN' : 'TEMUAN'}
                    </span>
                    <StatusBadge status={item.status} />
                  </div>

                  <div>
                    <h2 className="text-xl font-extrabold text-gray-900 font-outfit leading-tight mb-1">
                      {item.title}
                    </h2>
                    <p className="text-[11px] text-gray-400 font-medium">
                      Waktu Lapor: {new Date(item.created_at).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between border-b border-gray-100 pb-1.5">
                      <span className="text-gray-400 font-bold uppercase text-[10px]">Kategori</span>
                      <span className="font-semibold text-gray-800">{item.category?.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-1.5">
                      <span className="text-gray-400 font-bold uppercase text-[10px]">Lokasi Penemuan</span>
                      <span className="font-semibold text-gray-800">{item.location?.name}</span>
                    </div>
                    {item.storage_location && (
                      <div className="flex justify-between border-b border-gray-100 pb-1.5">
                        <span className="text-gray-400 font-bold uppercase text-[10px]">Lokasi Penyimpanan</span>
                        <span className="font-semibold text-gray-800">{item.storage_location}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-bold uppercase text-[10px]">Pelapor</span>
                      <span className="font-semibold text-purple-700">{item.user?.name}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chronology Description */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-gray-800 text-xs font-outfit uppercase tracking-wider text-gray-400">Deskripsi Kronologi</h4>
                <p className="text-gray-600 text-xs leading-relaxed bg-gray-50/70 border border-gray-100 p-3.5 rounded-xl">
                  {item.description}
                </p>
              </div>

              {/* Secret Feature Protection card */}
              {(isOwner || isAdmin) ? (
                <div className="p-3.5 bg-purple-50 border border-purple-100 rounded-xl text-xs space-y-1">
                  <h5 className="font-bold text-purple-900 flex items-center gap-1">
                    <span className="material-symbols-outlined text-base select-none">visibility</span>
                    Ciri Rahasia Barang (Hanya Anda & Admin)
                  </h5>
                  <p className="text-purple-700 font-semibold italic">
                    "{item.secret_feature}"
                  </p>
                </div>
              ) : item.type === 'FOUND' ? (
                <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs flex items-start gap-2 text-gray-500">
                  <span className="material-symbols-outlined text-gray-400 text-base mt-0.5 select-none">lock</span>
                  <span><strong className="text-gray-700">Ciri Rahasia Disembunyikan:</strong> Ajukan klaim kepemilikan untuk memverifikasi ciri rahasia barang.</span>
                </div>
              ) : null}

              {/* Action Buttons */}
              {hideClaimButton && item.type === 'FOUND' && (
                <div className="p-3.5 bg-amber-50 border border-amber-100/80 rounded-xl text-xs flex items-center gap-2 text-amber-900 font-semibold">
                  <span className="material-symbols-outlined text-amber-600 text-lg select-none">verified_user</span>
                  <span>Anda telah mengajukan klaim atas barang temuan ini.</span>
                </div>
              )}

              {!isOwner && !hideClaimButton && item.type === 'FOUND' && item.status === 'OPEN' && (
                <button 
                  onClick={() => setIsClaiming(true)}
                  className="w-full bg-secondary hover:bg-secondary-container hover:text-primary text-white font-bold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base select-none">workspace_premium</span>
                  Klaim Kepemilikan Barang Ini
                </button>
              )}

              {!isOwner && item.type === 'LOST' && item.status === 'OPEN' && (
                <button 
                  onClick={() => setIsReportingFound(true)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg select-none">volunteer_activism</span>
                  Saya Menemukan Barang Ini (Serahkan ke Satpam)
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </div>,
    document.body
  );
};

export default ItemDetailModal;
