import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const AuthPage = () => {
  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  
  // Validation & Error states
  const [emailError, setEmailError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Instant domain gate validation
  const validateEmailDomain = (value) => {
    setEmail(value);
    if (!value) {
      setEmailError('');
      return;
    }
    const amikomRegex = /^.+@(students\.)?amikom\.ac\.id$/i;
    if (!amikomRegex.test(value)) {
      setEmailError('Peringatan: Email wajib menggunakan domain resmi Amikom (@students.amikom.ac.id atau @amikom.ac.id)');
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSuccessMsg('');
    
    // Final gate validation
    const amikomRegex = /^.+@(students\.)?amikom\.ac\.id$/i;
    if (!amikomRegex.test(email)) {
      setSubmitError('Pendaftaran dibatasi hanya untuk mahasiswa / staf Universitas Amikom Yogyakarta.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
        navigate('/dashboard');
      } else {
        await register(name, email, password, contactInfo);
        setSuccessMsg('Registrasi berhasil! Silakan masuk dengan email dan password Anda.');
        setIsLogin(true);
        // Clear registration fields
        setName('');
        setContactInfo('');
        setPassword('');
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message 
        || (err.response?.data?.errors ? Object.values(err.response.data.errors)[0][0] : null)
        || 'Terjadi kesalahan sistem. Silakan coba kembali.';
      setSubmitError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80svh] flex items-center justify-center px-6 py-12 font-inter bg-slate-50">
      <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl shadow-xl overflow-hidden p-8 relative">
        
        {/* Brand Banner */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-purple-50 text-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl font-bold">travel_explore</span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 font-outfit mb-1">
            {isLogin ? 'Selamat Datang Kembali' : 'Buat Akun Baru'}
          </h2>
          <p className="text-xs text-gray-500 max-w-[260px] mx-auto leading-relaxed">
            Platform Pencarian & Pengembalian Barang Tercecer Kampus Amikom
          </p>
        </div>

        {/* Email Gate Warning Notification */}
        <div className="mb-6 bg-purple-50 border border-purple-100 rounded-xl p-3.5 flex items-start gap-2.5 text-left">
          <span className="material-symbols-outlined text-secondary text-xl mt-0.5 select-none">verified_user</span>
          <div className="text-[11px] text-purple-800 leading-normal">
            <span className="font-bold">Informasi:</span> Akses registrasi dibatasi secara ketat hanya bagi civitas akademika berdomain email <span className="font-semibold">@students.amikom.ac.id</span> atau <span className="font-semibold">@amikom.ac.id</span>.
          </div>
        </div>

        {/* Success / Error Banners */}
        {successMsg && (
          <div className="mb-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl p-3 text-xs font-semibold text-left">
            {successMsg}
          </div>
        )}

        {submitError && (
          <div className="mb-4 bg-red-50 border border-red-100 text-red-800 rounded-xl p-3 text-xs font-semibold text-left flex items-center gap-2">
            <span className="material-symbols-outlined text-lg select-none">error</span>
            {submitError}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nama Lengkap</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama lengkap Anda..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-all-200"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Email Kampus Amikom</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => validateEmailDomain(e.target.value)}
              placeholder="contoh@students.amikom.ac.id"
              className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm focus:bg-white focus:outline-none transition-all-200 ${
                emailError 
                  ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                  : 'border-gray-200 focus:border-secondary focus:ring-1 focus:ring-secondary'
              }`}
            />
            {emailError && (
              <span className="text-[10px] text-red-600 font-medium mt-1.5 block leading-normal">
                {emailError}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Kata Sandi (Password)</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-all-200"
            />
            {isLogin && (
              <div className="text-right mt-2">
                <Link to="/forgot-password" className="text-xs font-semibold text-secondary hover:underline">
                  Lupa Kata Sandi?
                </Link>
              </div>
            )}
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">No. WhatsApp / Telegram (Default)</label>
              <input 
                type="text" 
                required
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="Contoh: 08123456789"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-all-200"
              />
              <span className="text-[10px] text-gray-400 mt-1 block leading-normal">
                Kontak default ini akan digunakan untuk proses klaim / serah terima barang.
              </span>
            </div>
          )}

          <button 
            type="submit"
            disabled={loading || !!emailError}
            className="w-full bg-secondary hover:bg-secondary-container hover:text-primary text-white font-bold py-3.5 rounded-xl transition-all-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-2 inline-flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">login</span>
                {isLogin ? 'Masuk Sekarang' : 'Daftar Akun'}
              </>
            )}
          </button>
        </form>

        {/* Mock Google SSO Login */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <button 
            type="button"
            onClick={() => showToast('Integrasi Google SSO: Fitur visual simulasi mock.', 'success')}
            className="w-full border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm shadow-xs"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5.04c1.67 0 3.19.57 4.38 1.69l3.27-3.27C17.68 1.54 15.02 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.86 3C6.27 7.77 8.93 5.04 12 5.04z"/>
              <path fill="#4285F4" d="M23.49 12.27c0-.82-.07-1.6-.22-2.36H12v4.51h6.44c-.28 1.47-1.11 2.71-2.36 3.55l3.68 2.85c2.15-1.98 3.39-4.9 3.39-8.55z"/>
              <path fill="#FBBC05" d="M5.36 14.5c-.24-.71-.38-1.47-.38-2.25s.14-1.54.38-2.25L1.5 7.5C.54 9.4 0 11.53 0 13.75s.54 4.35 1.5 6.25l3.86-3z"/>
              <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.68-2.85c-1.02.68-2.33 1.09-3.95 1.09-3.07 0-5.73-2.73-6.64-5.46l-3.86 3C3.4 20.35 7.35 23 12 23z"/>
            </svg>
            Masuk dengan Google SSO
          </button>
        </div>

        {/* Toggle link */}
        <p className="text-center text-xs text-gray-500 mt-6">
          {isLogin ? 'Belum memiliki akun? ' : 'Sudah memiliki akun? '}
          <button 
            type="button" 
            onClick={() => { setIsLogin(!isLogin); setSubmitError(''); }}
            className="text-secondary font-bold hover:underline"
          >
            {isLogin ? 'Daftar Sekarang' : 'Masuk Sekarang'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
