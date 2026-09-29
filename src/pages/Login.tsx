import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { apiService } from '../services/api';
import { PEMUDA_BEJI_LOGO } from '../assets/logo';
import {
  Eye,
  EyeOff,
  Lock,
  User as UserIcon,
  Shield,
  Wallet,
  Users,
  ArrowRight,
  UserPlus,
  Phone,
  MapPin,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const toast = useToast();

  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Register form state
  const [regNama, setRegNama] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regHp, setRegHp] = useState('');
  const [regAlamat, setRegAlamat] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Success dialog after registration
  const [registeredResult, setRegisteredResult] = useState<{
    nama: string;
    nomor_anggota: string;
    username: string;
  } | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim()) {
      setErrorMessage('Username atau nomor anggota harus diisi.');
      return;
    }
    if (!password) {
      setErrorMessage('Password harus diisi.');
      return;
    }

    setIsLoading(true);
    const res = await login(username.trim(), password);
    setIsLoading(false);

    if (!res.success) {
      setErrorMessage(res.message);
      toast.error(res.message);
    } else {
      toast.success('Selamat datang kembali di Management Tabungan Pemuda Beji!');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!regNama.trim()) {
      setErrorMessage('Nama lengkap wajib diisi.');
      return;
    }
    if (!regUsername.trim()) {
      setErrorMessage('Username yang diinginkan wajib diisi.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMessage('Password minimal 6 karakter demi keamanan akun.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Konfirmasi password tidak cocok dengan password baru.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiService.registerMember({
        nama: regNama.trim(),
        username: regUsername.trim(),
        password: regPassword,
        hp: regHp.trim(),
        alamat: regAlamat.trim(),
      });

      if (res.success && res.data) {
        toast.success(res.message);
        setRegisteredResult({
          nama: res.data.member.nama,
          nomor_anggota: res.data.member.nomor_anggota,
          username: res.data.member.username,
        });

        // Automatically log the member in directly for instant seamless onboarding!
        await login(res.data.member.username, regPassword);
      } else {
        setErrorMessage(res.message || 'Pendaftaran gagal diproses.');
        toast.error(res.message);
      }
    } catch {
      setErrorMessage('Terjadi kesalahan saat pendaftaran.');
      toast.error('Gagal menghubungi server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (u: string, p: string) => {
    setMode('login');
    setUsername(u);
    setPassword(p);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F5F7FA]">
      {/* Left Branding Panel (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#082B66] text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Subtle geometric background shapes */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-[#123C82]/50 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center gap-3.5">
          <img
            src={PEMUDA_BEJI_LOGO}
            alt="Logo Pemuda Beji"
            className="w-14 h-14 object-contain rounded-2xl bg-white p-1.5 shadow-md"
          />
          <div>
            <div className="text-xl font-extrabold tracking-tight">PEMUDA BEJI</div>
            <div className="text-xs text-blue-200 font-medium">Kecamatan Beji, Kota Depok</div>
          </div>
        </div>

        {/* Middle Value Proposition */}
        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/10 text-xs font-semibold text-blue-200 border border-white/15">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Sistem Kas & Tabungan Mandiri</span>
          </div>

          <h1 className="text-3xl xl:text-4xl font-extrabold leading-tight text-white tracking-tight">
            Transparansi Finansial Untuk Kemajuan Pemuda.
          </h1>

          <p className="text-sm xl:text-base text-blue-100/90 leading-relaxed font-normal">
            Platform modern pencatatan setoran, penarikan, verifikasi QR Code keanggotaan, serta pelaporan kas transparan terintegrasi Google Sheets. Setiap anggota dapat mendaftar mandiri dan memiliki kartu identitas digital resmi.
          </p>

          {/* Key pillars */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/15">
            <div>
              <div className="text-xl font-bold text-white">100%</div>
              <div className="text-xs text-blue-200">Aman & Terbuka</div>
            </div>
            <div>
              <div className="text-xl font-bold text-white">Realtime</div>
              <div className="text-xs text-blue-200">Hitung Saldo</div>
            </div>
            <div>
              <div className="text-xl font-bold text-white">Mandiri</div>
              <div className="text-xs text-blue-200">Daftar Akun</div>
            </div>
          </div>
        </div>

        {/* Bottom footer credit */}
        <div className="relative z-10 text-xs text-blue-300/80">
          © 2026 Organisasi Pemuda Beji. Hak Cipta Dilindungi.
        </div>
      </div>

      {/* Right Login / Register Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-6 my-auto">
          {/* Mobile Brand Header */}
          <div className="lg:hidden flex flex-col items-center text-center space-y-3">
            <img
              src={PEMUDA_BEJI_LOGO}
              alt="Logo Pemuda Beji"
              className="w-16 h-16 object-contain rounded-2xl bg-white p-2 shadow-sm border border-slate-200"
            />
            <div>
              <h2 className="text-xl font-bold text-[#082B66]">MANAGEMENT TABUNGAN</h2>
              <p className="text-sm font-semibold text-slate-600">PEMUDA BEJI</p>
            </div>
          </div>

          {/* Segmented Switcher: Masuk vs Daftar */}
          <div className="p-1 bg-slate-200/80 rounded-xl flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-[#082B66] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Masuk Akun
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'register'
                  ? 'bg-white text-[#082B66] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Daftar Anggota Baru</span>
            </button>
          </div>

          {/* Form Header */}
          <div className="text-left space-y-1">
            <h2 className="text-2xl font-bold text-[#172033] tracking-tight">
              {mode === 'login' ? 'Masuk ke Akun' : 'Daftar Anggota Pemuda Beji'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {mode === 'login'
                ? 'Gunakan username atau nomor anggota resmi Anda.'
                : 'Isi formulir pendaftaran untuk mendapatkan akun & kartu anggota digital.'}
            </p>
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ============================================================== */}
          {/* 1. LOGIN FORM                                                  */}
          {/* ============================================================== */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Username / Nomor Anggota
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Contoh: admin, PB-001, atau username Anda"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#082B66] focus:border-transparent transition-all shadow-2xs"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Masukkan password Anda"
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#082B66] focus:border-transparent transition-all shadow-2xs"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-hidden cursor-pointer"
                    aria-label="Tampilkan / sembunyikan password"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#082B66] hover:bg-[#061B3A] text-white font-semibold text-sm rounded-lg transition-all shadow-xs disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Memproses Masuk...</span>
                  </>
                ) : (
                  <>
                    <span>MASUK SEKARANG</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-1">
                <span className="text-xs text-slate-500">Belum punya akun anggota? </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage('');
                  }}
                  className="text-xs font-bold text-[#082B66] hover:underline cursor-pointer"
                >
                  Daftar Mandiri di Sini
                </button>
              </div>
            </form>
          ) : (
            /* ============================================================== */
            /* 2. REGISTRATION FORM                                           */
            /* ============================================================== */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  value={regNama}
                  onChange={e => setRegNama(e.target.value)}
                  placeholder="Contoh: Muhammad Farhan"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#082B66]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Username Akun *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={e => setRegUsername(e.target.value)}
                    placeholder="Contoh: farhan_beji"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#082B66]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    No. WhatsApp / HP
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      value={regHp}
                      onChange={e => setRegHp(e.target.value)}
                      placeholder="08123456789"
                      className="w-full pl-10 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#082B66]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Alamat Domisili
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={regAlamat}
                      onChange={e => setRegAlamat(e.target.value)}
                      placeholder="RT/RW atau nama jalan"
                      className="w-full pl-10 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#082B66]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Password Baru *
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      placeholder="Min. 6 karakter"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#082B66]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Konfirmasi Password *
                  </label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regConfirmPassword}
                    onChange={e => setRegConfirmPassword(e.target.value)}
                    placeholder="Ulangi password"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#082B66]"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showPassToggle"
                  checked={showRegPassword}
                  onChange={e => setShowRegPassword(e.target.checked)}
                  className="rounded border-slate-300 text-[#082B66] focus:ring-[#082B66]"
                />
                <label htmlFor="showPassToggle" className="text-xs text-slate-600 cursor-pointer">
                  Tampilkan kata sandi
                </label>
              </div>

              {/* Informative helper callout */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#082B66] shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold">Nomor Anggota Otomatis:</span>
                  <p className="text-[11px] text-blue-800 mt-0.5">
                    Setelah mendaftar, sistem otomatis menerbitkan nomor anggota resmi (contoh: <code>PB-006</code>) serta kartu anggota digital dengan QR Code verifikasi.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#082B66] hover:bg-[#061B3A] text-white font-bold text-sm rounded-lg transition-all shadow-xs disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Mendaftarkan Anggota...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>DAFTAR SEBAGAI ANGGOTA</span>
                  </>
                )}
              </button>

              <div className="text-center pt-1">
                <span className="text-xs text-slate-500">Sudah memiliki akun? </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage('');
                  }}
                  className="text-xs font-bold text-[#082B66] hover:underline cursor-pointer"
                >
                  Masuk di Sini
                </button>
              </div>
            </form>
          )}

          {/* Quick Demo Test Credential Buttons */}
          <div className="pt-5 border-t border-slate-200">
            <div className="text-xs font-semibold text-slate-500 mb-2.5 flex items-center justify-between">
              <span>Akun Demo Cepat (Testing):</span>
              <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-sm border border-amber-200 font-medium">
                Siap Diuji
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'admin123')}
                className="flex flex-col items-center justify-center p-2 text-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-xs text-slate-700 font-medium group cursor-pointer"
              >
                <Shield className="w-4 h-4 text-blue-700 mb-1 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-slate-800 text-[11px]">Admin</span>
                <span className="text-[10px] text-slate-400 font-mono">admin123</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('bendahara', 'bendahara123')}
                className="flex flex-col items-center justify-center p-2 text-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-xs text-slate-700 font-medium group cursor-pointer"
              >
                <Wallet className="w-4 h-4 text-emerald-700 mb-1 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-slate-800 text-[11px]">Bendahara</span>
                <span className="text-[10px] text-slate-400 font-mono">bendahara123</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('PB-001', 'anggota123')}
                className="flex flex-col items-center justify-center p-2 text-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-xs text-slate-700 font-medium group cursor-pointer"
              >
                <Users className="w-4 h-4 text-slate-700 mb-1 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-slate-800 text-[11px]">Anggota</span>
                <span className="text-[10px] text-slate-400 font-mono">anggota123</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
