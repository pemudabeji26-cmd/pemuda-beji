import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { apiService } from '../services/api';
import { Member } from '../types';
import { formatDateIndo } from '../utils/formatters';
import { DEFAULT_AVATAR } from '../assets/logo';
import { User, Lock, Phone, MapPin, Calendar, Shield, Save } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, updateCurrentUserProfile } = useAuth();
  const toast = useToast();

  const [memberDetails, setMemberDetails] = useState<Member | null>(null);
  const [nama, setNama] = useState(user?.nama || '');
  const [hp, setHp] = useState('');
  const [alamat, setAlamat] = useState('');
  const [tanggalGabung, setTanggalGabung] = useState('');
  const [status, setStatus] = useState('AKTIF');

  // Password change states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    const fetchMemberDetails = async () => {
      if (user?.nomor_anggota) {
        const res = await apiService.getMember(user.nomor_anggota);
        if (res.success && res.data) {
          setMemberDetails(res.data);
          setNama(res.data.nama);
          setHp(res.data.hp || '');
          setAlamat(res.data.alamat || '');
          setTanggalGabung(res.data.tanggal_gabung || '');
          setStatus(res.data.status || 'AKTIF');
        }
      }
    };
    fetchMemberDetails();
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      toast.error('Nama tidak boleh kosong.');
      return;
    }

    setIsUpdatingProfile(true);
    try {
      if (memberDetails?.id) {
        const res = await apiService.updateMember(memberDetails.id, {
          nama: nama.trim(),
          hp: hp.trim(),
          alamat: alamat.trim(),
        });
        if (res.success) {
          updateCurrentUserProfile({ nama: nama.trim() });
          toast.success('Profil berhasil diperbarui.');
        } else {
          toast.error(res.message);
        }
      } else {
        updateCurrentUserProfile({ nama: nama.trim() });
        toast.success('Profil berhasil diperbarui.');
      }
    } catch {
      toast.error('Gagal memperbarui profil.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password baru minimal 6 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Konfirmasi password tidak cocok.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await apiService.resetPassword(user?.username || '', newPassword);
      if (res.success) {
        toast.success('Password berhasil diganti. Gunakan password baru pada login berikutnya.');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error('Gagal mengubah password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <h1 className="text-xl font-bold text-[#172033] tracking-tight">Profil Akun Saya</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Kelola informasi identitas akun keanggotaan dan keamanan kata sandi.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 flex flex-col items-center text-center">
          <img
            src={memberDetails?.foto || DEFAULT_AVATAR}
            alt="Avatar"
            className="w-24 h-24 rounded-2xl object-cover border-4 border-slate-100 shadow-sm"
          />

          <h2 className="text-lg font-bold text-[#172033] mt-4">{nama || user?.nama}</h2>
          <div className="font-mono text-xs font-semibold text-[#082B66]">
            {user?.nomor_anggota ? user.nomor_anggota : `@${user?.username}`}
          </div>

          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#082B66] border border-blue-200 uppercase">
              {user?.role}
            </span>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                status === 'AKTIF'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {status}
            </span>
          </div>

          <div className="w-full mt-6 pt-6 border-t border-slate-100 space-y-3 text-xs text-left">
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>Bergabung:</span>
              </span>
              <span className="font-semibold text-slate-800">
                {tanggalGabung ? formatDateIndo(tanggalGabung) : 'Januari 2026'}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Phone className="w-3.5 h-3.5" />
                <span>WhatsApp:</span>
              </span>
              <span className="font-semibold text-slate-800">{hp || '-'}</span>
            </div>

            <div className="flex items-start justify-between text-slate-600">
              <span className="flex items-center gap-1.5 text-slate-400 shrink-0">
                <MapPin className="w-3.5 h-3.5" />
                <span>Alamat:</span>
              </span>
              <span className="font-semibold text-slate-800 text-right max-w-[160px] truncate">
                {alamat || '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Columns: Edit Profile and Change Password */}
        <div className="lg:col-span-2 space-y-6">
          {/* Form: Ubah Data Profil */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6">
            <h3 className="text-base font-bold text-[#172033] pb-3 border-b border-slate-100 flex items-center gap-2">
              <User className="w-4 h-4 text-[#082B66]" />
              <span>Informasi Pribadi</span>
            </h3>

            <form onSubmit={handleSaveProfile} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={nama}
                    onChange={e => setNama(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#082B66]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="tel"
                    value={hp}
                    onChange={e => setHp(e.target.value)}
                    placeholder="0812xxxxxxxx"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#082B66]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Alamat Lengkap
                </label>
                <textarea
                  rows={2}
                  value={alamat}
                  onChange={e => setAlamat(e.target.value)}
                  placeholder="Nama jalan, RT/RW, kelurahan..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#082B66]"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#082B66] hover:bg-[#061B3A] rounded-lg transition-colors cursor-pointer shadow-2xs"
                >
                  {isUpdatingProfile ? (
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>

          {/* Form: Ganti Password */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6">
            <h3 className="text-base font-bold text-[#172033] pb-3 border-b border-slate-100 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#082B66]" />
              <span>Ganti Kata Sandi (Password)</span>
            </h3>

            <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Password Baru
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#082B66]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Konfirmasi Password Baru
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password baru"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#082B66]"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingPassword || !newPassword}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isUpdatingPassword ? (
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Shield className="w-3.5 h-3.5" />
                  )}
                  <span>Perbarui Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
