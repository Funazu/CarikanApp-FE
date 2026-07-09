import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSuccessMsg(res.data.message || 'Tautan atur ulang kata sandi berhasil dikirim ke email Anda.');
      setEmail('');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Gagal mengirim email reset password. Pastikan email Anda terdaftar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70svh] flex items-center justify-center px-6 py-12 font-inter bg-slate-50">
      <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl shadow-xl p-8 text-left">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-purple-50 text-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl font-bold">lock_reset</span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 font-outfit mb-1">Lupa Kata Sandi</h2>
          <p className="text-xs text-gray-500 max-w-[280px] mx-auto leading-relaxed">
            Masukkan email Amikom Anda untuk mendapatkan tautan pemulihan kata sandi.
          </p>
        </div>

        {successMsg && (
          <div className="mb-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl p-3.5 text-xs font-semibold flex items-start gap-2">
            <span className="material-symbols-outlined text-lg select-none">check_circle</span>
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 bg-red-50 border border-red-100 text-red-800 rounded-xl p-3.5 text-xs font-semibold flex items-start gap-2">
            <span className="material-symbols-outlined text-lg select-none">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Email Kampus Amikom</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contoh@students.amikom.ac.id"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-all-200"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-secondary hover:bg-secondary-container hover:text-primary text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">send</span>
                Kirim Tautan Atur Ulang
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6">
          Kembali ke halaman{' '}
          <Link to="/login" className="text-secondary font-bold hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
