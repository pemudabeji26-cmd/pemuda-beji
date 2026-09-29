import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { apiService } from '../services/api';
import { Member } from '../types';
import { formatRupiah, formatDateIndo, generateNextMemberNumber } from '../utils/formatters';
import { DEFAULT_AVATAR } from '../assets/logo';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Power,
  KeyRound,
  CreditCard,
  X,
  Phone,
  MapPin,
  Calendar,
  Wallet,
  CheckCircle,
} from 'lucide-react';

interface MembersProps {
  onViewMemberCard: (member: Member) => void;
  isAddModalOpenInitially?: boolean;
  onCloseAddModalInitially?: () => void;
}

export const Members: React.FC<MembersProps> = ({
  onViewMemberCard,
  isAddModalOpenInitially = false,
  onCloseAddModalInitially,
}) => {
  const { user } = useAuth();
  const toast = useToast();

  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AKTIF' | 'NONAKTIF'>('ALL');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(isAddModalOpenInitially);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [detailMember, setDetailMember] = useState<Member | null>(null);

  // Reset Password State
  const [resetTargetUser, setResetTargetUser] = useState<Member | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('anggota123');

  // Confirmation state for deactivation
  const [deactivateTarget, setDeactivateTarget] = useState<Member | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states for new member
  const [formData, setFormData] = useState({
    nomor_anggota: '',
    nama: '',
    username: '',
    password: 'anggota123',
    hp: '',
    alamat: '',
    tanggal_gabung: new Date().toISOString().slice(0, 10),
    status: 'AKTIF' as 'AKTIF' | 'NONAKTIF',
    foto: '',
  });

  const isAdmin = user?.role === 'ADMIN';

  const loadMembers = async () => {
    setIsLoading(true);
    try {
      const res = await apiService.getMembers();
      if (res.success && res.data) {
        setMembers(res.data);
      }
    } catch {
      toast.error('Gagal mengambil data anggota.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    if (isAddModalOpenInitially) {
      handleOpenAddModal();
    }
  }, [isAddModalOpenInitially]);

  const handleOpenAddModal = () => {
    const existingNumbers = members.map(m => m.nomor_anggota);
    const nextNumber = generateNextMemberNumber(existingNumbers);

    setFormData({
      nomor_anggota: nextNumber,
      nama: '',
      username: nextNumber,
      password: 'anggota123',
      hp: '',
      alamat: '',
      tanggal_gabung: new Date().toISOString().slice(0, 10),
      status: 'AKTIF',
      foto: '',
    });
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    if (onCloseAddModalInitially) onCloseAddModalInitially();
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim() || !formData.username.trim() || !formData.nomor_anggota.trim()) {
      toast.error('Nama, Username, dan Nomor Anggota wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiService.addMember(formData);
      if (res.success) {
        toast.success('Anggota berhasil ditambahkan.');
        handleCloseAddModal();
        loadMembers();
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error('Gagal menambahkan anggota.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    setIsSubmitting(true);
    try {
      const res = await apiService.updateMember(editingMember.id, {
        nama: editingMember.nama,
        hp: editingMember.hp,
        alamat: editingMember.alamat,
        status: editingMember.status,
      });

      if (res.success) {
        toast.success('Data anggota berhasil diperbarui.');
        setEditingMember(null);
        loadMembers();
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error('Gagal mengupdate anggota.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!deactivateTarget) return;
    const targetStatus = deactivateTarget.status === 'AKTIF' ? 'NONAKTIF' : 'AKTIF';

    setIsSubmitting(true);
    try {
      const res = await apiService.deactivateMember(deactivateTarget.id, targetStatus);
      if (res.success) {
        toast.success(`Anggota berhasil diubah status menjadi ${targetStatus}.`);
        setDeactivateTarget(null);
        loadMembers();
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error('Gagal memperbarui status anggota.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetUser || !newPasswordInput.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await apiService.resetPassword(resetTargetUser.username, newPasswordInput.trim());
      if (res.success) {
        toast.success(`Password untuk ${resetTargetUser.nama} berhasil direset.`);
        setResetTargetUser(null);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error('Gagal mereset password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered members list
  const filteredMembers = members.filter(m => {
    const matchesSearch =
      m.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.nomor_anggota.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.hp && m.hp.includes(searchTerm));

    const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-[#172033] tracking-tight">Data Anggota Pemuda Beji</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola data registrasi, status keaktifan, saldo kas, dan kartu anggota digital.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#082B66] hover:bg-[#061B3A] rounded-lg transition-colors shadow-2xs cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Anggota</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Cari berdasarkan nama, nomor anggota, atau HP..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#082B66] focus:bg-white transition-all"
          />
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start md:self-auto">
          {(['ALL', 'AKTIF', 'NONAKTIF'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                statusFilter === tab
                  ? 'bg-white text-[#082B66] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'ALL' ? 'Semua' : tab === 'AKTIF' ? 'Aktif' : 'Nonaktif'}
            </button>
          ))}
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4">Anggota</th>
                <th className="py-3.5 px-4">Username / ID</th>
                <th className="py-3.5 px-4">Kontak</th>
                <th className="py-3.5 px-4">Bergabung</th>
                <th className="py-3.5 px-4 text-right">Saldo Kas</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-slate-300 border-t-[#082B66] rounded-full animate-spin" />
                      <span>Memuat data anggota...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Tidak ada data anggota yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m, idx) => (
                  <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 text-center text-slate-400 font-mono text-xs">
                      {idx + 1}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={m.foto || DEFAULT_AVATAR}
                          alt={m.nama}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-[#172033] line-clamp-1">{m.nama}</div>
                          <div className="text-[11px] font-mono text-slate-400">{m.nomor_anggota}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600 text-xs">
                      {m.username}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{m.hp || '-'}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[150px]">{m.alamat}</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 text-xs">
                      {formatDateIndo(m.tanggal_gabung)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-[#082B66] tabular-nums">
                      {formatRupiah(m.saldo)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-sm ${
                          m.status === 'AKTIF'
                            ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                            : 'text-rose-700 bg-rose-50 border border-rose-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            m.status === 'AKTIF' ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        <span>{m.status}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* ID Card button */}
                        <button
                          onClick={() => onViewMemberCard(m)}
                          className="p-1.5 text-slate-600 hover:text-[#082B66] hover:bg-slate-100 rounded-md transition-colors"
                          title="Cetak / Buka Kartu Anggota"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>

                        {/* Detail Modal button */}
                        <button
                          onClick={() => setDetailMember(m)}
                          className="px-2 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                          title="Detail Anggota"
                        >
                          Detail
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => setEditingMember(m)}
                          className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                          title="Edit Anggota"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Admin Only Actions */}
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => {
                                setResetTargetUser(m);
                                setNewPasswordInput('anggota123');
                              }}
                              className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-md transition-colors"
                              title="Reset Password"
                            >
                              <KeyRound className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setDeactivateTarget(m)}
                              className={`p-1.5 rounded-md transition-colors ${
                                m.status === 'AKTIF'
                                  ? 'text-slate-500 hover:text-rose-700 hover:bg-rose-50'
                                  : 'text-slate-500 hover:text-emerald-700 hover:bg-emerald-50'
                              }`}
                              title={m.status === 'AKTIF' ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                            >
                              <Power className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer counts */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Menampilkan {filteredMembers.length} dari {members.length} anggota</span>
          <span className="font-medium text-[#082B66]">Organisasi Pemuda Beji</span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: TAMBAH ANGGOTA BARU                                    */}
      {/* ------------------------------------------------------------- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-base text-[#172033]">Tambah Anggota Baru</h3>
              <button onClick={handleCloseAddModal} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Nomor Anggota (Otomatis)
                  </label>
                  <input
                    type="text"
                    value={formData.nomor_anggota}
                    onChange={e => setFormData({ ...formData, nomor_anggota: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-xs sm:text-sm font-mono font-bold text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Username Akun
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nama Lengkap Anggota
                </label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={e => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Contoh: Muhammad Rizky"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Password Awal
                  </label>
                  <input
                    type="text"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-mono text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="tel"
                    value={formData.hp}
                    onChange={e => setFormData({ ...formData, hp: e.target.value })}
                    placeholder="0812xxxxxxxx"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Alamat Tempat Tinggal
                </label>
                <textarea
                  rows={2}
                  value={formData.alamat}
                  onChange={e => setFormData({ ...formData, alamat: e.target.value })}
                  placeholder="Jl. / RT / RW, Beji..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Tanggal Bergabung
                  </label>
                  <input
                    type="date"
                    value={formData.tanggal_gabung}
                    onChange={e => setFormData({ ...formData, tanggal_gabung: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Status Awal
                  </label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as 'AKTIF' | 'NONAKTIF' })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-800"
                  >
                    <option value="AKTIF">AKTIF</option>
                    <option value="NONAKTIF">NONAKTIF</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseAddModal}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#082B66] hover:bg-[#061B3A] rounded-lg transition-colors cursor-pointer flex items-center gap-2"
                >
                  {isSubmitting && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  <span>Simpan Anggota</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: EDIT ANGGOTA                                           */}
      {/* ------------------------------------------------------------- */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="font-bold text-base text-[#172033]">Edit Data Anggota</h3>
                <span className="font-mono text-xs text-slate-500">{editingMember.nomor_anggota}</span>
              </div>
              <button onClick={() => setEditingMember(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateMember} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={editingMember.nama}
                  onChange={e => setEditingMember({ ...editingMember, nama: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nomor WhatsApp / HP</label>
                <input
                  type="tel"
                  value={editingMember.hp}
                  onChange={e => setEditingMember({ ...editingMember, hp: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Alamat</label>
                <textarea
                  rows={2}
                  value={editingMember.alamat}
                  onChange={e => setEditingMember({ ...editingMember, alamat: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-800"
                />
              </div>

              {isAdmin && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Status Keanggotaan</label>
                  <select
                    value={editingMember.status}
                    onChange={e => setEditingMember({ ...editingMember, status: e.target.value as 'AKTIF' | 'NONAKTIF' })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-800"
                  >
                    <option value="AKTIF">AKTIF</option>
                    <option value="NONAKTIF">NONAKTIF</option>
                  </select>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#082B66] hover:bg-[#061B3A] rounded-lg transition-colors cursor-pointer flex items-center gap-2"
                >
                  {isSubmitting && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  <span>Perbarui Data</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: DETAIL ANGGOTA                                         */}
      {/* ------------------------------------------------------------- */}
      {detailMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-base text-[#172033]">Detail Lengkap Anggota</h3>
              <button onClick={() => setDetailMember(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center gap-4">
                <img
                  src={detailMember.foto || DEFAULT_AVATAR}
                  alt={detailMember.nama}
                  className="w-16 h-16 rounded-xl object-cover border-2 border-slate-200 shadow-xs"
                />
                <div>
                  <h4 className="font-bold text-lg text-slate-900 leading-tight">{detailMember.nama}</h4>
                  <div className="font-mono text-xs font-semibold text-[#082B66] mt-0.5">{detailMember.nomor_anggota}</div>
                  <div className="mt-1">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-sm ${
                        detailMember.status === 'AKTIF'
                          ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                          : 'text-rose-700 bg-rose-50 border border-rose-200'
                      }`}
                    >
                      {detailMember.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-[#082B66]" />
                    <span>Saldo Tabungan:</span>
                  </span>
                  <strong className="font-bold text-[#082B66] text-sm tabular-nums">
                    {formatRupiah(detailMember.saldo)}
                  </strong>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Nomor WhatsApp:</span>
                  </span>
                  <span className="font-semibold text-slate-800">{detailMember.hp || '-'}</span>
                </div>

                <div className="flex items-start justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Alamat:</span>
                  </span>
                  <span className="font-semibold text-slate-800 text-right max-w-[200px]">{detailMember.alamat || '-'}</span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Tanggal Bergabung:</span>
                  </span>
                  <span className="font-semibold text-slate-800">{formatDateIndo(detailMember.tanggal_gabung)}</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const m = detailMember;
                  setDetailMember(null);
                  onViewMemberCard(m);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#082B66] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Kartu Anggota</span>
              </button>

              <button
                type="button"
                onClick={() => setDetailMember(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: RESET PASSWORD                                         */}
      {/* ------------------------------------------------------------- */}
      {resetTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-base text-[#172033]">Reset Password Anggota</h3>
              <button onClick={() => setResetTargetUser(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmResetPassword} className="p-6 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Anda akan mereset password akun <strong>{resetTargetUser.nama}</strong> ({resetTargetUser.username}).
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password Baru</label>
                <input
                  type="text"
                  value={newPasswordInput}
                  onChange={e => setNewPasswordInput(e.target.value)}
                  placeholder="Masukkan password baru"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-mono text-slate-800"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setResetTargetUser(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors cursor-pointer flex items-center gap-2"
                >
                  {isSubmitting && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  <span>Simpan Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Deactivation */}
      <ConfirmationModal
        isOpen={!!deactivateTarget}
        title={deactivateTarget?.status === 'AKTIF' ? 'Nonaktifkan Anggota?' : 'Aktifkan Kembali Anggota?'}
        message={
          deactivateTarget?.status === 'AKTIF'
            ? `Apakah Anda yakin ingin menonaktifkan akun anggota ${deactivateTarget?.nama}? Anggota nonaktif tidak akan dapat login ke sistem.`
            : `Apakah Anda ingin mengaktifkan kembali akun anggota ${deactivateTarget?.nama}?`
        }
        confirmText={deactivateTarget?.status === 'AKTIF' ? 'Ya, Nonaktifkan' : 'Ya, Aktifkan'}
        confirmType={deactivateTarget?.status === 'AKTIF' ? 'danger' : 'primary'}
        isLoading={isSubmitting}
        onConfirm={handleConfirmDeactivate}
        onCancel={() => setDeactivateTarget(null)}
      />
    </div>
  );
};
