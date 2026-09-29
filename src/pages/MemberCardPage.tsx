import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { Member } from '../types';
import { MemberIdCard } from '../components/card/MemberIdCard';
import { useToast } from '../components/common/Toast';
import { CreditCard, Search, ArrowLeft } from 'lucide-react';

interface MemberCardPageProps {
  initialMember?: Member | null;
  onNavigateToVerify: (id: string) => void;
  onBack?: () => void;
}

export const MemberCardPage: React.FC<MemberCardPageProps> = ({
  initialMember,
  onNavigateToVerify,
  onBack,
}) => {
  const { user } = useAuth();
  const toast = useToast();

  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(initialMember || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isAnggota = user?.role === 'ANGGOTA';

  useEffect(() => {
    const fetchMembers = async () => {
      setIsLoading(true);
      try {
        const res = await apiService.getMembers();
        if (res.success && res.data) {
          setMembers(res.data);

          if (!selectedMember) {
            if (isAnggota && user?.nomor_anggota) {
              const myCard = res.data.find(m => m.nomor_anggota === user.nomor_anggota);
              if (myCard) setSelectedMember(myCard);
            } else if (res.data.length > 0) {
              setSelectedMember(res.data[0]);
            }
          }
        }
      } catch {
        toast.error('Gagal memuat data kartu anggota.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [user]);

  const filteredMembers = members.filter(
    m =>
      m.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.nomor_anggota.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs no-print">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Kembali"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-xl font-bold text-[#172033] tracking-tight">
              {isAnggota ? 'Kartu Anggota Digital Saya' : 'Kartu Anggota Digital Pemuda Beji'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Kartu identitas resmi dengan QR Code verifikasi keaslian anggota.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* If Admin/Bendahara: Left Column Member Selector */}
        {!isAnggota && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 no-print space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-700 uppercase">Pilih Anggota</span>
              <span className="text-xs text-slate-400 font-mono">{members.length} anggota</span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Cari nama atau No. Anggota..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div className="space-y-1 max-h-[460px] overflow-y-auto pr-1">
              {filteredMembers.map(m => {
                const isSelected = selectedMember?.id === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMember(m)}
                    className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 text-[#082B66] font-bold border border-blue-200'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="truncate">{m.nama}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{m.nomor_anggota}</div>
                    </div>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-sm ${
                        m.status === 'AKTIF'
                          ? 'text-emerald-700 bg-emerald-50'
                          : 'text-rose-700 bg-rose-50'
                      }`}
                    >
                      {m.status}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Card Preview and Actions (Full width on Anggota, or 2 cols on Admin) */}
        <div
          className={`${
            isAnggota ? 'lg:col-span-3' : 'lg:col-span-2'
          } bg-white rounded-xl border border-slate-200 shadow-2xs p-6 flex flex-col items-center justify-center`}
        >
          {selectedMember ? (
            <MemberIdCard
              member={selectedMember}
              onVerifyClick={() => onNavigateToVerify(selectedMember.nomor_anggota || selectedMember.id)}
            />
          ) : (
            <div className="text-center py-16 text-slate-400 text-xs">
              Pilih anggota untuk menampilkan kartu digital.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
