import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import ImageFallback from '../components/ImageFallback';

const ItemDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Claim modal states
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [proofDesc, setProofDesc] = useState('');
  const [proofImg, setProofImg] = useState(null);
  const [proofImgPreview, setProofImgPreview] = useState(null);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState('');
  const [claimError, setClaimError] = useState('');

  const fetchItemDetail = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/items/${id}`);
      setItem(res.data);
    } catch (err) {
      console.error(err);
      setItem(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItemDetail();
  }, [id]);

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
    
    if (!user) {
      navigate('/login');
      return;
    }

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

      setClaimSuccess('Klaim kepemilikan berhasil diajukan! Menunggu persetujuan dan verifikasi Satpam.');
      setProofDesc('');
      setProofImg(null);
      setProofImgPreview(null);
      
      // Close modal after delay
      setTimeout(() => {
        setIsClaimModalOpen(false);
        setClaimSuccess('');
        fetchItemDetail();
      }, 2500);

    } catch (err) {
      console.error(err);
      setClaimError(err.response?.data?.message || 'Gagal mengajukan klaim.');
    } finally {
      setClaimLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70svh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-md mx-auto py-16 px-6 text-center font-inter">
        <span className="material-symbols-outlined text-red-500 text-6xl mb-4 select-none">error</span>
        <h2 className="text-xl font-bold text-gray-900 font-outfit mb-2">Laporan Tidak Ditemukan</h2>
        <p className="text-gray-500 text-sm mb-6">Link tidak valid atau laporan barang ini telah dihapus oleh pemiliknya.</p>
        <Link to="/" className="bg-secondary text-white font-bold px-6 py-3 rounded-xl hover:bg-secondary-container hover:text-primary transition-colors">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const isOwner = user && user.id === item.user_id;
  const isAdmin = user && user.role === 'ADMIN';

  return (
    <div className="font-inter max-w-5xl mx-auto px-6 py-12 text-left">
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-secondary mb-6 transition-colors">
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        Kembali ke Beranda
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm">
        
        {/* Left column: image */}
        <div className="rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 max-h-[480px]">
          <ImageFallback src={item.image_url} alt={item.title} className="w-full h-full object-contain" />
        </div>

        {/* Right column: details */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black tracking-wider uppercase text-white shadow-xs ${
              item.type === 'LOST' ? 'bg-red-500' : 'bg-blue-600'
            }`}>
              {item.type === 'LOST' ? 'KEHILANGAN' : 'TEMUAN'}
            </span>
            <StatusBadge status={item.status} />
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 font-outfit leading-tight mb-2">
              {item.title}
            </h1>
            
            <p className="text-xs text-gray-400 font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-sm select-none">calendar_month</span>
              Dilaporkan pada: {new Date(item.created_at).toLocaleString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl space-y-3 text-xs">
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-400 font-bold uppercase">Kategori</span>
              <span className="font-semibold text-gray-800">{item.category?.name}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-400 font-bold uppercase">Lokasi Penemuan/Hilang</span>
              <span className="font-semibold text-gray-800">{item.location?.name}</span>
            </div>
            {item.storage_location && (
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-400 font-bold uppercase">Lokasi Penyimpanan Fisik</span>
                <span className="font-semibold text-gray-800">{item.storage_location}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-400 font-bold uppercase">Dilaporkan Oleh</span>
              <span className="font-semibold text-purple-700">{item.user?.name}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-gray-900 text-sm font-outfit">Deskripsi Kronologi</h3>
            <p className="text-gray-600 text-sm leading-relaxed bg-white border border-gray-50 p-4 rounded-xl shadow-xs">
              {item.description}
            </p>
          </div>

          {/* Secret Feature Protection card (Untuk Barang TEMUAN) */}
          {(isOwner || isAdmin) ? (
            <div className="p-4 bg-purple-50 border border-purple-100 rounded-2xl text-xs space-y-2">
              <h4 className="font-bold text-purple-900 flex items-center gap-1">
                <span className="material-symbols-outlined text-lg select-none">visibility</span>
                Ciri Rahasia Barang (Hanya Anda & Admin)
              </h4>
              <p className="text-purple-700 leading-relaxed font-semibold">
                "{item.secret_feature}"
              </p>
            </div>
          ) : item.type === 'FOUND' ? (
            <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs flex items-start gap-2.5">
              <span className="material-symbols-outlined text-gray-400 text-xl mt-0.5 select-none">lock</span>
              <div className="text-gray-500 leading-normal">
                <span className="font-bold text-gray-700">Ciri Rahasia Disembunyikan:</span> Untuk mengklaim kepemilikan barang ini, Anda wajib mengajukan klaim dan menjelaskan ciri rahasia secara akurat untuk divalidasi oleh Satpam.
              </div>
            </div>
          ) : null}

          {/* Action Button: Claim Item (Hanya untuk Barang TEMUAN) */}
          {!isOwner && item.type === 'FOUND' && item.status === 'OPEN' && (
            <button 
              onClick={() => user ? setIsClaimModalOpen(true) : navigate('/login')}
              className="w-full bg-secondary hover:bg-secondary-container hover:text-primary text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">workspace_premium</span>
              Klaim Kepemilikan Barang Ini
            </button>
          )}

          {/* Action Box: Kontak Pelapor (Hanya untuk Barang HILANG) */}
          {!isOwner && item.type === 'LOST' && item.status === 'OPEN' && (
            <div className="p-5 bg-blue-50/80 border border-blue-100 rounded-2xl space-y-3 text-xs">
              <h4 className="font-bold text-blue-900 flex items-center gap-1.5 text-sm font-outfit">
                <span className="material-symbols-outlined text-xl text-blue-600">contact_phone</span>
                Menemukan Barang Ini? Hubungi Pelapor Kehilangan
              </h4>
              <p className="text-blue-700 leading-relaxed">
                Jika Anda menemukan barang ini atau memiliki informasi terkait keberadaannya, silakan hubungi pemilik langsung melalui:
              </p>
              <div className="p-3.5 bg-white border border-blue-100 rounded-xl font-bold text-blue-900 text-sm flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-gray-400 text-lg">call</span>
                  <span>{item.contact_info || item.user?.contact_info || 'Kontak tidak tersedia'}</span>
                </div>
                {((item.contact_info || item.user?.contact_info || '').replace(/[^0-9]/g, '').length >= 9) && (
                  <a 
                    href={`https://wa.me/${(item.contact_info || item.user?.contact_info).replace(/[^0-9]/g, '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <span className="material-symbols-outlined text-base">chat</span>
                    Hubungi via WA
                  </a>
                )}
              </div>
            </div>
          )}

          {item.status !== 'OPEN' && (
            <div className="w-full bg-gray-100 text-gray-500 font-bold py-3.5 rounded-xl text-center text-sm border border-gray-200">
              Barang sudah tidak aktif / sedang diproses
            </div>
          )}
        </div>
      </div>

      {/* Claim Submission Modal */}
      {isClaimModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setIsClaimModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full p-8 font-inter">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                <h3 className="text-xl font-bold text-gray-900 font-outfit">Ajukan Klaim Kepemilikan</h3>
                <button onClick={() => setIsClaimModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <span className="material-symbols-outlined text-2xl">close</span>
                </button>
              </div>

              {claimSuccess && (
                <div className="mb-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl p-3 text-xs font-semibold">
                  {claimSuccess}
                </div>
              )}

              {claimError && (
                <div className="mb-4 bg-red-50 border border-red-100 text-red-800 rounded-xl p-3 text-xs font-semibold">
                  {claimError}
                </div>
              )}

              <form onSubmit={handleClaimSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Deskripsi Bukti (Ciri Rahasia)</label>
                  <textarea 
                    required
                    rows="4"
                    value={proofDesc}
                    onChange={(e) => setProofDesc(e.target.value)}
                    placeholder="Sebutkan ciri spesifik barang yang Anda miliki (contoh: stiker di belakang casing, retakan layar, warna gantungan, dll)..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-all-200"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Foto Bukti Fisik / Nota Pembelian (Opsional)</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-secondary/50 bg-gray-50/50 flex flex-col items-center justify-center relative">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleProofImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {proofImgPreview ? (
                      <img src={proofImgPreview} alt="Preview" className="h-32 object-contain rounded-lg" />
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-secondary text-3xl mb-1">cloud_upload</span>
                        <p className="text-xs text-gray-500 font-bold">Pilih file foto bukti fisik</p>
                        <p className="text-[10px] text-gray-400 mt-1">PNG, JPG, JPEG hingga 2MB</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-2 border-t border-gray-100">
                  <button 
                    type="button" 
                    onClick={() => setIsClaimModalOpen(false)}
                    className="px-5 py-2.5 border border-gray-200 text-gray-500 rounded-xl text-xs font-bold hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    disabled={claimLoading}
                    className="bg-secondary hover:bg-secondary-container hover:text-primary text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-md text-xs inline-flex items-center gap-2"
                  >
                    {claimLoading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                    Kirim Klaim
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

export default ItemDetailPage;
