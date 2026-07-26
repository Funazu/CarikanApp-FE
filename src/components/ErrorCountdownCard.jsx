import React, { useState, useEffect } from 'react';

const ErrorCountdownCard = ({ message, retryAfter = 0, onRetry, title = "Gagal Memuat Data" }) => {
  const [seconds, setSeconds] = useState(retryAfter || 0);
  const isRateLimited = retryAfter > 0 || (message && message.toLowerCase().includes('terlalu banyak'));

  useEffect(() => {
    setSeconds(retryAfter || 0);
  }, [retryAfter]);

  useEffect(() => {
    if (!seconds || seconds <= 0) return;

    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  const isComplete = isRateLimited && seconds === 0;

  return (
    <div className={`border rounded-3xl p-8 md:p-10 text-center shadow-xs max-w-lg mx-auto my-6 font-inter transition-all duration-300 ${
      isComplete 
        ? 'bg-emerald-50/80 border-emerald-200' 
        : 'bg-white border-red-100'
    }`}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 border transition-all ${
        isComplete 
          ? 'bg-emerald-100 text-emerald-600 border-emerald-200' 
          : 'bg-red-50 text-red-600 border-red-100'
      }`}>
        <span className="material-symbols-outlined text-3xl select-none">
          {seconds > 0 ? 'timer' : isComplete ? 'check_circle' : 'warning'}
        </span>
      </div>
      
      <h3 className="text-lg font-bold text-gray-900 font-outfit mb-1.5">
        {isComplete ? 'Waktu Tunggu Selesai!' : title}
      </h3>
      
      <p className="text-xs text-gray-600 max-w-sm mx-auto mb-6 leading-relaxed">
        {seconds > 0 
          ? `Terlalu banyak permintaan! Demi stabilitas server, silakan tunggu ${seconds} detik sebelum mencoba lagi.`
          : isComplete
          ? 'Batas waktu tunggu telah berakhir. Silakan klik tombol di bawah untuk memuat ulang data Anda.'
          : (message || 'Terjadi kesalahan saat menghubungkan ke server.')}
      </p>

      <button 
        onClick={onRetry}
        disabled={seconds > 0}
        className={`font-bold text-xs px-6 py-3 rounded-xl transition-all inline-flex items-center gap-2 shadow-md ${
          seconds > 0 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 shadow-none' 
            : 'bg-secondary hover:bg-secondary-container hover:text-primary text-white shadow-md hover:shadow-lg cursor-pointer'
        }`}
      >
        <span className={`material-symbols-outlined text-base select-none ${seconds > 0 ? 'animate-spin' : ''}`}>
          {seconds > 0 ? 'hourglass_top' : 'refresh'}
        </span>
        {seconds > 0 ? `Tunggu (${seconds}s)` : 'Coba Muat Ulang Sekarang'}
      </button>
    </div>
  );
};

export default ErrorCountdownCard;
