import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { apiService } from '../services/api';
import { Transaction, Member, TransactionType } from '../types';
import {
  formatRupiah,
  formatDateIndo,
  exportToCSV,
} from '../utils/formatters';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Download,
  Calendar,
  X,
  AlertCircle,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

interface TransactionsProps {
  initialModalType?: 'SETOR' | 'TARIK' | null;
  onCloseInitialModal?: () => void;
}

export const Transactions: React.FC<TransactionsProps> = ({
  initialModalType = null,
  onCloseInitialModal,
}) => {
  const { user } = useAuth();
  const toast = useToast();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'SETOR' | 'TARIK'>('ALL');
  const [memberFilter, setMemberFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Transaction Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<TransactionType>('SETOR');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [nominal, setNominal] = useState<number | ''>('');
  const [keterangan, setKeterangan] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));

  // Confirm withdrawal modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = user?.role === 'ADMIN';
  const isBendahara = user?.role === 'BENDAHARA';
  const isAnggota = user?.role === 'ANGGOTA';

  const loadData = async () => {
    setIsLoading(true);
    try {
      const filter = isAnggota ? { nomor_anggota: user?.nomor_anggota } : undefined;
      const [txRes, memRes] = await Promise.all([
        apiService.getTransactions(filter),
        isAnggota ? Promise.resolve({ success: true, data: [] as Member[] }) : apiService.getMembers(),
      ]);

      if (txRes.success && txRes.data) {
        setTransactions(txRes.data);
      }
      if (memRes.success && memRes.data) {
        setMembers(memRes.data);
      }
    } catch {
      toast.error('Gagal mengambil data transaksi.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    if (initialModalType) {
      openTransactionModal(initialModalType);
    }
  }, [initialModalType]);

  const openTransactionModal = (type: TransactionType) => {
    setModalType(type);
    setNominal('');
    setKeterangan('');
    setTanggal(new Date().toISOString().slice(0, 10));

    // Default select first active member if available
    const activeMembers = members.filter(m => m.status === 'AKTIF');
    if (activeMembers.length > 0) {
      setSelectedMember(activeMembers[0]);
    } else {
      setSelectedMember(null);
    }

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (onCloseInitialModal) onCloseInitialModal();
  };

  // Live calculation of projected balance
  const currentSaldo = selectedMember?.saldo || 0;
  const numNominal = typeof nominal === 'number' ? nominal : 0;
  const projectedSaldo =
    modalType === 'SETOR' ? currentSaldo + numNominal : Math.max(0, currentSaldo - numNominal);

  const handleInitiateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMember) {
      toast.error('Pilih anggota terlebih dahulu.');
      return;
    }

    if (!numNominal || numNominal <= 0) {
      toast.error('Nominal harus lebih dari 0.');
      return;
    }

    if (modalType === 'TARIK' && numNominal > currentSaldo) {
      toast.error('Saldo tidak mencukupi untuk melakukan penarikan.');
      return;
    }

    if (modalType === 'TARIK') {
      // Trigger confirmation modal as requested in Section 37
      setIsConfirmModalOpen(true);
    } else {
      executeTransaction();
    }
  };

  const executeTransaction = async () => {
    if (!selectedMember || !numNominal) return;

    setIsSubmitting(true);
    try {
      const res = await apiService.addTransaction({
        nomor_anggota: selectedMember.nomor_anggota,
        nama: selectedMember.nama,
        jenis: modalType,
        nominal: numNominal,
        keterangan:
          keterangan.trim() || (modalType === 'SETOR' ? 'Setoran Tabungan' : 'Penarikan Tabungan'),
        tanggal,
        created_by: user?.nama || 'Bendahara',
      });

      if (res.success) {
        toast.success(
          modalType === 'SETOR'
            ? `Setoran ${formatRupiah(numNominal)} berhasil disimpan.`
            : `Penarikan ${formatRupiah(numNominal)} berhasil diproses.`
        );
        handleCloseModal();
        setIsConfirmModalOpen(false);
        loadData();
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error('Transaksi gagal disimpan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'ID Transaksi',
      'Tanggal',
      'Nomor Anggota',
      'Nama',
      'Jenis',
      'Nominal (Rp)',
      'Saldo Sebelum (Rp)',
      'Saldo Sesudah (Rp)',
      'Keterangan',
      'Dibuat Oleh',
    ];

    const rows = filteredTransactions.map(t => [
      t.id_transaksi,
      t.tanggal,
      t.nomor_anggota,
      t.nama,
      t.jenis,
      t.nominal,
      t.saldo_sebelum,
      t.saldo_sesudah,
      t.keterangan,
      t.created_by,
    ]);

    exportToCSV(`Transaksi_Pemuda_Beji_${new Date().toISOString().slice(0, 10)}`, headers, rows);
    toast.success('File CSV berhasil diunduh.');
  };

  // Filter transaction list
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch =
      t.id_transaksi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.nomor_anggota.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.keterangan.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'ALL' || t.jenis === typeFilter;
    const matchesMember = memberFilter === 'ALL' || t.nomor_anggota === memberFilter;
    const matchesStart = !startDate || t.tanggal >= startDate;
    const matchesEnd = !endDate || t.tanggal <= endDate;

    return matchesSearch && matchesType && matchesMember && matchesStart && matchesEnd;
  });

  return (
    <div className="space-y-6">
      {/* Header and Quick Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-[#172033] tracking-tight">
            {isAnggota ? 'Riwayat Transaksi Saya' : 'Transaksi Tabungan'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isAnggota
              ? 'Catatan lengkap seluruh mutasi setoran dan penarikan kas tabungan Anda.'
              : 'Pencatatan setoran masuk dan penarikan kas tabungan anggota secara realtime.'}
          </p>
        </div>

        {/* Admin/Bendahara Action Buttons */}
        {!isAnggota && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => openTransactionModal('SETOR')}
              className="flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-2xs cursor-pointer"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>+ Setoran Baru</span>
            </button>
            <button
              onClick={() => openTransactionModal('TARIK')}
              className="flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-2xs cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>+ Penarikan Baru</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Cari ID transaksi, nama, atau keterangan..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#082B66] focus:bg-white transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Jenis */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
              {(['ALL', 'SETOR', 'TARIK'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-3 py-1 font-semibold rounded-md transition-colors ${
                    typeFilter === type
                      ? 'bg-white text-[#082B66] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {type === 'ALL' ? 'Semua Jenis' : type}
                </button>
              ))}
            </div>

            {/* Export CSV button */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Secondary Filters: Dates & Member selector (Admin/Bendahara) */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
          {!isAnggota && (
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Anggota:</span>
              <select
                value={memberFilter}
                onChange={e => setMemberFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
              >
                <option value="ALL">Semua Anggota</option>
                {members.map(m => (
                  <option key={m.id} value={m.nomor_anggota}>
                    {m.nomor_anggota} - {m.nama}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Dari:</span>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Sampai:</span>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          {(startDate || endDate || memberFilter !== 'ALL' || typeFilter !== 'ALL' || searchTerm) && (
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setMemberFilter('ALL');
                setTypeFilter('ALL');
                setSearchTerm('');
              }}
              className="text-rose-600 hover:text-rose-800 font-semibold ml-auto text-xs flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4">ID Transaksi</th>
                {!isAnggota && <th className="py-3.5 px-4">Anggota</th>}
                <th className="py-3.5 px-4 text-center">Jenis</th>
                <th className="py-3.5 px-4 text-right">Nominal</th>
                <th className="py-3.5 px-4 text-right">Saldo Setelah</th>
                <th className="py-3.5 px-4">Keterangan</th>
                <th className="py-3.5 px-4">Dicatat Oleh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-slate-300 border-t-[#082B66] rounded-full animate-spin" />
                      <span>Memuat riwayat transaksi...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Tidak ada transaksi yang sesuai kriteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(tx => {
                  const isSetor = tx.jenis === 'SETOR';
                  return (
                    <tr key={tx.id_transaksi} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 text-xs">
                        {formatDateIndo(tx.tanggal)}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs text-slate-500 whitespace-nowrap">
                        {tx.id_transaksi}
                      </td>

                      {!isAnggota && (
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-bold text-[#172033]">{tx.nama}</div>
                          <div className="text-[11px] font-mono text-slate-400">{tx.nomor_anggota}</div>
                        </td>
                      )}

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-sm ${
                            isSetor
                              ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                              : 'text-rose-700 bg-rose-50 border border-rose-200'
                          }`}
                        >
                          {isSetor ? '+' : '-'} {tx.jenis}
                        </span>
                      </td>

                      <td
                        className={`py-3.5 px-4 text-right font-bold tabular-nums whitespace-nowrap ${
                          isSetor ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {formatRupiah(tx.nominal)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-[#082B66] tabular-nums whitespace-nowrap">
                        {formatRupiah(tx.saldo_sesudah)}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 max-w-[200px] truncate" title={tx.keterangan}>
                        {tx.keterangan}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 text-xs whitespace-nowrap">
                        {tx.created_by}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Total {filteredTransactions.length} transaksi ditampilkan</span>
          <span className="font-mono text-slate-400">Google Sheets Ledger</span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: INPUT SETORAN / PENARIKAN                              */}
      {/* ------------------------------------------------------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 my-8">
            <div
              className={`flex items-center justify-between px-6 py-4 border-b ${
                modalType === 'SETOR' ? 'bg-emerald-50/50 border-emerald-100' : 'bg-rose-50/50 border-rose-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    modalType === 'SETOR' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                  }`}
                >
                  {modalType === 'SETOR' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                </div>
                <h3 className="font-bold text-base text-[#172033]">
                  {modalType === 'SETOR' ? 'Input Setoran Tabungan' : 'Input Penarikan Tabungan'}
                </h3>
              </div>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInitiateSubmit} className="p-6 space-y-4">
              {/* Type Switcher in Modal */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setModalType('SETOR')}
                  className={`py-2 text-xs font-bold rounded-md transition-all ${
                    modalType === 'SETOR'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  SETORAN (Tambah Saldo)
                </button>
                <button
                  type="button"
                  onClick={() => setModalType('TARIK')}
                  className={`py-2 text-xs font-bold rounded-md transition-all ${
                    modalType === 'TARIK'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  PENARIKAN (Kurang Saldo)
                </button>
              </div>

              {/* Tanggal */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Tanggal Transaksi
                </label>
                <input
                  type="date"
                  value={tanggal}
                  onChange={e => setTanggal(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-800"
                  required
                />
              </div>

              {/* Anggota Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Pilih Anggota
                </label>
                <select
                  value={selectedMember?.id || ''}
                  onChange={e => {
                    const found = members.find(m => m.id === e.target.value);
                    setSelectedMember(found || null);
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-800"
                  required
                >
                  <option value="" disabled>-- Pilih Anggota Pemuda Beji --</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id} disabled={m.status === 'NONAKTIF'}>
                      {m.nomor_anggota} - {m.nama} {m.status === 'NONAKTIF' ? '(Nonaktif)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dynamic Balance Calculation Box */}
              {selectedMember && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Saldo Saat Ini:</span>
                    <strong className="text-slate-900 font-bold tabular-nums">
                      {formatRupiah(currentSaldo)}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span>Nominal {modalType === 'SETOR' ? 'Setoran' : 'Penarikan'}:</span>
                    <span
                      className={`font-bold tabular-nums ${
                        modalType === 'SETOR' ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {modalType === 'SETOR' ? '+' : '-'} {formatRupiah(numNominal)}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm font-bold">
                    <span className="text-[#082B66]">Saldo Menjadi:</span>
                    <span className="text-[#082B66] tabular-nums">
                      {formatRupiah(projectedSaldo)}
                    </span>
                  </div>

                  {modalType === 'TARIK' && numNominal > currentSaldo && (
                    <div className="pt-2 text-rose-600 font-semibold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Saldo tidak mencukupi! Penarikan melebihi saldo tabungan.</span>
                    </div>
                  )}
                </div>
              )}

              {/* Nominal Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nominal (Rupiah)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={nominal}
                    onChange={e => setNominal(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Contoh: 100000"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#082B66]"
                    required
                  />
                </div>
                <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500">
                  <span>Cepat:</span>
                  {[50000, 100000, 200000, 500000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setNominal(amt)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-mono"
                    >
                      {formatRupiah(amt)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Keterangan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Keterangan / Catatan
                </label>
                <input
                  type="text"
                  value={keterangan}
                  onChange={e => setKeterangan(e.target.value)}
                  placeholder={
                    modalType === 'SETOR'
                      ? 'Contoh: Setoran kas rutin September'
                      : 'Contoh: Penarikan untuk keperluan organisasi'
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-800"
                />
              </div>

              {/* Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !numNominal ||
                    numNominal <= 0 ||
                    (modalType === 'TARIK' && numNominal > currentSaldo)
                  }
                  className={`px-5 py-2 text-xs font-bold text-white rounded-lg transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50 ${
                    modalType === 'SETOR'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {isSubmitting && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  <span>{modalType === 'SETOR' ? 'Simpan Setoran' : 'Lanjut Penarikan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Withdrawal */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        title="Konfirmasi Penarikan Saldo"
        message={`Apakah Anda yakin melakukan penarikan sebesar ${formatRupiah(
          numNominal
        )} untuk anggota ${selectedMember?.nama}? Saldo anggota akan berkurang menjadi ${formatRupiah(
          projectedSaldo
        )}.`}
        confirmText="Konfirmasi Penarikan"
        cancelText="Batal"
        confirmType="danger"
        isLoading={isSubmitting}
        onConfirm={executeTransaction}
        onCancel={() => setIsConfirmModalOpen(false)}
      />
    </div>
  );
};
