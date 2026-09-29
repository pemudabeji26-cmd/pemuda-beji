import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useToast } from '../components/common/Toast';
import { Transaction, Member, DashboardStats } from '../types';
import { formatRupiah, formatDateIndo, exportToCSV } from '../utils/formatters';
import { PEMUDA_BEJI_LOGO } from '../assets/logo';
import {
  FileBarChart2,
  Download,
  Printer,
  Calendar,
  Filter,
  Users,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';

export const Reports: React.FC = () => {
  const toast = useToast();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedMember, setSelectedMember] = useState('ALL');
  const [selectedType, setSelectedType] = useState<'ALL' | 'SETOR' | 'TARIK'>('ALL');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [txRes, memRes] = await Promise.all([
        apiService.getTransactions(),
        apiService.getMembers(),
      ]);

      if (txRes.success && txRes.data) {
        setTransactions(txRes.data);
      }
      if (memRes.success && memRes.data) {
        setMembers(memRes.data);
      }
    } catch {
      toast.error('Gagal memuat data laporan.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered transactions for the report
  const filtered = transactions.filter(t => {
    const matchesMember = selectedMember === 'ALL' || t.nomor_anggota === selectedMember;
    const matchesType = selectedType === 'ALL' || t.jenis === selectedType;
    const matchesStart = !startDate || t.tanggal >= startDate;
    const matchesEnd = !endDate || t.tanggal <= endDate;
    return matchesMember && matchesType && matchesStart && matchesEnd;
  });

  // Calculate filtered report statistics
  const totalSetoran = filtered
    .filter(t => t.jenis === 'SETOR')
    .reduce((sum, t) => sum + t.nominal, 0);

  const totalPenarikan = filtered
    .filter(t => t.jenis === 'TARIK')
    .reduce((sum, t) => sum + t.nominal, 0);

  const totalSaldoKas = totalSetoran - totalPenarikan;

  const handleExportCSV = () => {
    const headers = [
      'Tanggal',
      'ID Transaksi',
      'No. Anggota',
      'Nama',
      'Jenis',
      'Nominal (Rp)',
      'Saldo Sebelum (Rp)',
      'Saldo Sesudah (Rp)',
      'Keterangan',
      'Petugas',
    ];

    const rows = filtered.map(t => [
      t.tanggal,
      t.id_transaksi,
      t.nomor_anggota,
      t.nama,
      t.jenis,
      t.nominal,
      t.saldo_sebelum,
      t.saldo_sesudah,
      t.keterangan,
      t.created_by,
    ]);

    exportToCSV(`Laporan_Kas_Pemuda_Beji_${new Date().toISOString().slice(0, 10)}`, headers, rows);
    toast.success('Laporan berhasil diexport ke CSV.');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs no-print">
        <div>
          <h1 className="text-xl font-bold text-[#172033] tracking-tight">Laporan Keuangan Kas</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Rekapitulasi total mutasi kas, saldo akumulasi, dan cetak laporan resmi Pemuda Beji.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#082B66] hover:bg-[#061B3A] rounded-lg transition-colors shadow-2xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Laporan / PDF</span>
          </button>
        </div>
      </div>

      {/* Official Print Header (Visible only when printing) */}
      <div className="hidden print-only mb-6 border-b-2 border-slate-900 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={PEMUDA_BEJI_LOGO} alt="Logo" className="w-16 h-16 object-contain" />
            <div>
              <h2 className="text-xl font-bold uppercase tracking-tight text-slate-900">
                ORGANISASI PEMUDA BEJI
              </h2>
              <p className="text-sm font-semibold text-slate-700">
                LAPORAN REKAPITULASI KAS & TABUNGAN ANGGOTA
              </p>
              <p className="text-xs text-slate-500">
                Kecamatan Beji, Depok · Dicetak pada: {formatDateIndo(new Date().toISOString().slice(0, 10))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Control Section */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs no-print space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100">
          <Filter className="w-3.5 h-3.5 text-[#082B66]" />
          <span>Filter Parameter Laporan</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-600 font-medium mb-1">Tanggal Mulai</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Tanggal Selesai</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Anggota</label>
            <select
              value={selectedMember}
              onChange={e => setSelectedMember(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            >
              <option value="ALL">Semua Anggota</option>
              {members.map(m => (
                <option key={m.id} value={m.nomor_anggota}>
                  {m.nomor_anggota} - {m.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Jenis Transaksi</label>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value as 'ALL' | 'SETOR' | 'TARIK')}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            >
              <option value="ALL">Semua (Setor & Tarik)</option>
              <option value="SETOR">Hanya Setoran</option>
              <option value="TARIK">Hanya Penarikan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary 4-Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Anggota */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Total Anggota</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 mt-2 tabular-nums">
            {members.filter(m => m.status === 'AKTIF').length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Anggota aktif terdaftar</div>
        </div>

        {/* Total Setoran */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Total Setoran</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-extrabold text-emerald-700 mt-2 tabular-nums">
            {formatRupiah(totalSetoran)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Sesuai filter periode</div>
        </div>

        {/* Total Penarikan */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Total Penarikan</span>
            <ArrowUpRight className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-extrabold text-rose-700 mt-2 tabular-nums">
            {formatRupiah(totalPenarikan)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Sesuai filter periode</div>
        </div>

        {/* Total Saldo Mutasi */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Net Arus Kas</span>
            <Wallet className="w-4 h-4 text-[#082B66]" />
          </div>
          <div className="text-xl font-extrabold text-[#082B66] mt-2 tabular-nums">
            {formatRupiah(totalSaldoKas)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Setoran dikurangi penarikan</div>
        </div>
      </div>

      {/* Report Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-bold text-sm text-[#172033]">
            Rincian Buku Kas ({filtered.length} transaksi)
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            {startDate ? formatDateIndo(startDate) : 'Awal'} s/d{' '}
            {endDate ? formatDateIndo(endDate) : 'Sekarang'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">ID Transaksi</th>
                <th className="py-3 px-4">Anggota</th>
                <th className="py-3 px-4 text-center">Jenis</th>
                <th className="py-3 px-4 text-right">Debit (Setor)</th>
                <th className="py-3 px-4 text-right">Kredit (Tarik)</th>
                <th className="py-3 px-4 text-right">Saldo Kas</th>
                <th className="py-3 px-4">Keterangan</th>
                <th className="py-3 px-4">Petugas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400 text-xs">
                    Tidak ada transaksi dalam periode ini.
                  </td>
                </tr>
              ) : (
                filtered.map(tx => {
                  const isSetor = tx.jenis === 'SETOR';
                  return (
                    <tr key={tx.id_transaksi} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 whitespace-nowrap text-slate-600 text-xs">
                        {formatDateIndo(tx.tanggal)}
                      </td>

                      <td className="py-3 px-4 font-mono text-xs text-slate-500 whitespace-nowrap">
                        {tx.id_transaksi}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{tx.nama}</div>
                        <div className="font-mono text-[10px] text-slate-400">{tx.nomor_anggota}</div>
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${
                            isSetor ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                          }`}
                        >
                          {tx.jenis}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-semibold text-emerald-700 tabular-nums whitespace-nowrap">
                        {isSetor ? formatRupiah(tx.nominal) : '-'}
                      </td>

                      <td className="py-3 px-4 text-right font-semibold text-rose-700 tabular-nums whitespace-nowrap">
                        {!isSetor ? formatRupiah(tx.nominal) : '-'}
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-[#082B66] tabular-nums whitespace-nowrap">
                        {formatRupiah(tx.saldo_sesudah)}
                      </td>

                      <td className="py-3 px-4 text-slate-600 max-w-[200px] truncate" title={tx.keterangan}>
                        {tx.keterangan}
                      </td>

                      <td className="py-3 px-4 text-slate-500 text-xs whitespace-nowrap">
                        {tx.created_by}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
