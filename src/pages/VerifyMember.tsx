import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { PEMUDA_BEJI_LOGO } from '../assets/logo';
import { formatDateIndo } from '../utils/formatters';
import { ShieldCheck, AlertTriangle, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface VerifyMemberProps {
  memberId: string;
  onBackToApp?: () => void;
}

export const VerifyMember: React.FC<VerifyMemberProps> = ({ memberId, onBackToApp }) => {
  const [memberData, setMemberData] = useState<{
    nama: string;
    nomor_anggota: string;
    status: string;
    tanggal_gabung: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    const runVerification = async () => {
      setIsLoading(true);
      setIsNotFound(false);
      try {
        const res = await apiService.verifyMember(memberId);
        if (res.success && res.data) {
          setMemberData(res.data);
        } else {
          setIsNotFound(true);
        }
      } catch {
        setIsNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (memberId) {
      runVerification();
    } else {
      setIsNotFound(true);
      setIsLoading(false);
    }
  }, [memberId]);

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col justify-between p-4 sm:p-6">
      {/* Top Navbar */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <img src={PEMUDA_BEJI_LOGO} alt="Logo" className="w-8 h-8 object-contain rounded-md" />
          <span className="font-bold text-xs text-[#082B66]">Pemuda Beji Official</span>
        </div>
        {onBackToApp && (
          <button
            onClick={onBackToApp}
            className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Aplikasi</span>
          </button>
        )}
      </div>

      {/* Main Verification Card */}
      <div className="max-w-md w-full mx-auto my-auto py-6">
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
          {/* Card Header */}
          <div className="bg-[#082B66] text-white p-6 text-center relative">
            <div className="w-16 h-16 rounded-2xl bg-white p-1.5 shadow-md mx-auto mb-3">
              <img
                src={PEMUDA_BEJI_LOGO}
                alt="Logo Pemuda Beji"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-lg font-extrabold tracking-tight">VERIFIKASI ANGGOTA</h1>
            <p className="text-xs text-blue-200 font-medium mt-0.5">
              Sistem Keanggotaan Resmi Pemuda Beji
            </p>
          </div>

          {/* Card Body */}
          <div className="p-6">
            {isLoading ? (
              <div className="py-12 text-center text-slate-500">
                <div className="w-8 h-8 border-3 border-slate-200 border-t-[#082B66] rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs font-medium">Memverifikasi keaslian kartu anggota...</p>
              </div>
            ) : isNotFound || !memberData ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h2 className="text-base font-bold text-slate-900">Data Anggota Tidak Ditemukan</h2>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Nomor anggota atau ID yang dipindai tidak terdaftar dalam pangkalan data resmi Pemuda Beji.
                </p>
                <div className="pt-2 text-xs font-mono text-slate-400">ID: {memberId || '-'}</div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Verified Banner */}
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div className="text-xs">
                    <span className="font-bold">Keanggotaan Terverifikasi Sah!</span>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      Kartu ini sah diterbitkan oleh Pengurus Pemuda Beji.
                    </p>
                  </div>
                </div>

                {/* Member Public Attributes */}
                <div className="divide-y divide-slate-100 text-xs">
                  <div className="py-2.5 flex justify-between items-center">
                    <span className="text-slate-500">Nama Lengkap</span>
                    <strong className="font-bold text-slate-900 text-sm">{memberData.nama}</strong>
                  </div>

                  <div className="py-2.5 flex justify-between items-center">
                    <span className="text-slate-500">Nomor Anggota</span>
                    <span className="font-mono font-bold text-[#082B66] text-sm">
                      {memberData.nomor_anggota}
                    </span>
                  </div>

                  <div className="py-2.5 flex justify-between items-center">
                    <span className="text-slate-500">Status Keanggotaan</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded-sm text-[11px] ${
                        memberData.status === 'AKTIF'
                          ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                          : 'text-rose-700 bg-rose-50 border border-rose-200'
                      }`}
                    >
                      {memberData.status === 'AKTIF' ? 'ANGGOTA AKTIF' : 'NONAKTIF'}
                    </span>
                  </div>

                  <div className="py-2.5 flex justify-between items-center">
                    <span className="text-slate-500">Tanggal Bergabung</span>
                    <span className="font-semibold text-slate-800">
                      {formatDateIndo(memberData.tanggal_gabung)}
                    </span>
                  </div>
                </div>

                {/* Privacy Assurance Notice */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 text-center leading-relaxed">
                  Demi perlindungan privasi anggota, rincian saldo keuangan, alamat tempat tinggal, dan nomor telepon tidak ditampilkan pada halaman publik ini.
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-center text-[10px] text-slate-400">
            © 2026 Pemuda Beji · Sistem Verifikasi Keanggotaan Realtime
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-slate-400 max-w-md mx-auto">
        Kecamatan Beji, Kota Depok, Jawa Barat
      </div>
    </div>
  );
};
