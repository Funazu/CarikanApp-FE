import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (password !== passwordConfirmation) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        email,
        token,
        password,
        password_confirmation: passwordConfirmation
      });

      setSuccessMsg(res.data.message || 'Kata sandi berhasil diatur ulang! Mengalihkan ke halaman login...');
      setPassword('');
      setPasswordConfirmation('');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Gagal mengatur ulang kata sandi. Tautan mungkin tidak valid atau kedaluwarsa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70svh] flex items-center justify-center px-6 py-12 font-inter bg-slate-50">
      <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl shadow-xl p-8 text-left">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-purple-50 text-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl font-bold">lock_open</span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 font-outfit mb-1">Kata Sandi Baru</h2>
          <p className="text-xs text-gray-500 max-w-[280px] mx-auto leading-relaxed">
            Atur kata sandi baru untuk akun Anda berdomain: <b>{email}</b>
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

        {!token || !email ? (
          <div className="text-center space-y-4">
            <p className="text-sm text-red-500 font-semibold">Tautan atur ulang tidak valid. Parameter token atau email tidak ditemukan.</p>
            <Link to="/forgot-password" className="block text-xs font-bold text-secondary hover:underline">Minta Tautan Baru</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Kata Sandi Baru</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan minimal 6 karakter..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-all-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Konfirmasi Kata Sandi Baru</label>
              <input 
                type="password" 
                required
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="Ulangi kata sandi baru..."
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
                  <span className="material-symbols-outlined text-lg">check_circle</span>
                  Perbarui Kata Sandi
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
