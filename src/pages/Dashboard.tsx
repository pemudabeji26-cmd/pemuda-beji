import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { DashboardStats, Transaction, Member } from '../types';
import { formatRupiah, formatDateIndo } from '../utils/formatters';
import {
  Users,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  PlusCircle,
  CreditCard,
  TrendingUp,
  RefreshCw,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface DashboardProps {
  onNavigateTab: (tab: 'members' | 'transactions' | 'reports' | 'card' | 'profile') => void;
  onOpenDepositModal: () => void;
  onOpenWithdrawModal: () => void;
  onOpenAddMemberModal?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigateTab,
  onOpenDepositModal,
  onOpenWithdrawModal,
  onOpenAddMemberModal,
}) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [recentMembers, setRecentMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const statsRes = await apiService.getDashboard(user?.role || 'ANGGOTA', user?.nomor_anggota);
      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }

      // Fetch recent transactions
      const trxFilter = user?.role === 'ANGGOTA' ? { nomor_anggota: user.nomor_anggota, limit: 5 } : { limit: 5 };
      const trxRes = await apiService.getTransactions(trxFilter);
      if (trxRes.success && trxRes.data) {
        setRecentTransactions(trxRes.data);
      }

      // Fetch recent members for Admin/Bendahara
      if (user?.role !== 'ANGGOTA') {
        const memRes = await apiService.getMembers();
        if (memRes.success && memRes.data) {
          setRecentMembers(memRes.data.slice(0, 5));
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const isAdmin = user?.role === 'ADMIN';
  const isBendahara = user?.role === 'BENDAHARA';
  const isAnggota = user?.role === 'ANGGOTA';

  return (
    <div className="space-y-6">
      {/* Top Banner / Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[#172033] tracking-tight">
              Selamat datang, {user?.nama}
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-blue-50 text-[#082B66] border border-blue-200 uppercase">
              {user?.role}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isAnggota
              ? 'Pantau saldo tabungan, riwayat transaksi, dan kartu anggota digital Anda.'
              : 'Ringkasan posisi keuangan kas dan aktivitas tabungan Pemuda Beji.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Muat ulang data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Segarkan</span>
          </button>

          {/* Quick Actions in Header */}
          {(isAdmin || isBendahara) && (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenDepositModal}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#082B66] hover:bg-[#061B3A] rounded-lg transition-colors shadow-2xs cursor-pointer"
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>+ Setoran</span>
              </button>
              <button
                onClick={onOpenWithdrawModal}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors shadow-2xs cursor-pointer"
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
                <span>+ Penarikan</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. ANGGOTA VIEW                                              */}
      {/* ------------------------------------------------------------- */}
      {isAnggota && (
        <div className="space-y-6">
          {/* Large Primary Balance Card */}
          <div className="bg-[#082B66] text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
            <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="text-xs uppercase font-bold text-blue-200 tracking-wider">
                  SALDO TABUNGAN SAYA
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-white mt-1 tabular-nums">
                  {formatRupiah(stats?.saldoUser || 0)}
                </div>
                <div className="text-xs text-blue-200 mt-2 flex items-center gap-2">
                  <span>Nomor Anggota: <strong className="font-mono text-white">{user?.nomor_anggota}</strong></span>
                  <span>·</span>
                  <span className="text-emerald-300 font-medium">Status: Aktif</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onNavigateTab('card')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white text-[#082B66] hover:bg-blue-50 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Buka Kartu Anggota</span>
                </button>
                <button
                  onClick={() => onNavigateTab('transactions')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition-colors cursor-pointer"
                >
                  <span>Riwayat Lengkap</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sub metric stats */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/15">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                  <ArrowDownLeft className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-blue-200">Total Akumulasi Setoran</div>
                  <div className="text-lg font-bold text-white tabular-nums">
                    {formatRupiah(stats?.totalSetoranUser || 0)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-blue-200">Total Akumulasi Penarikan</div>
                  <div className="text-lg font-bold text-white tabular-nums">
                    {formatRupiah(stats?.totalPenarikanUser || 0)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. ADMIN & BENDAHARA METRIC CARDS                            */}
      {/* ------------------------------------------------------------- */}
      {!isAnggota && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Anggota */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Anggota
              </span>
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#082B66] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-[#172033] tabular-nums">
                {stats?.totalAnggota || 0}
              </div>
              <div className="text-xs text-slate-500 mt-1">Anggota aktif terdaftar</div>
            </div>
          </div>

          {/* Card 2: Total Saldo Tabungan */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Saldo Tabungan
              </span>
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-[#082B66] tabular-nums">
                {formatRupiah(stats?.totalSaldo || 0)}
              </div>
              <div className="text-xs text-slate-500 mt-1">Saldo seluruh anggota</div>
            </div>
          </div>

          {/* Card 3: Setoran */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {isAdmin ? 'Setoran Bulan Ini' : 'Setoran Hari Ini'}
              </span>
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <ArrowDownLeft className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-emerald-700 tabular-nums">
                {formatRupiah(isAdmin ? stats?.setoranBulanIni || 0 : stats?.setoranHariIni || 0)}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {isAdmin ? 'Akumulasi bulan berjalan' : 'Total pemasukan hari ini'}
              </div>
            </div>
          </div>

          {/* Card 4: Penarikan */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {isAdmin ? 'Penarikan Bulan Ini' : 'Penarikan Hari Ini'}
              </span>
              <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-rose-700 tabular-nums">
                {formatRupiah(isAdmin ? stats?.penarikanBulanIni || 0 : stats?.penarikanHariIni || 0)}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {isAdmin ? 'Akumulasi bulan berjalan' : 'Total pengeluaran hari ini'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Quick Action Banner */}
      {isAdmin && onOpenAddMemberModal && (
        <div className="bg-gradient-to-r from-[#082B66] to-[#123C82] text-white p-4 sm:p-5 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-2xs">
          <div>
            <h3 className="font-bold text-sm sm:text-base">Aksi Cepat Pengelolaan Kas</h3>
            <p className="text-xs text-blue-100">
              Input setoran baru, penarikan kas anggota, atau daftarkan anggota baru Pemuda Beji.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAddMemberModal}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#082B66] bg-white hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Tambah Anggota</span>
            </button>
            <button
              onClick={onOpenDepositModal}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>+ Setoran</span>
            </button>
            <button
              onClick={onOpenWithdrawModal}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>+ Penarikan</span>
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. CHART & RECENT TRANSACTIONS                                */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Transactions (2 cols on lg) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-[#172033]">
                {isAnggota ? '5 Transaksi Terakhir Anda' : 'Transaksi Terbaru'}
              </h2>
              <p className="text-xs text-slate-500">Aktivitas arus kas tabungan</p>
            </div>
            <button
              onClick={() => onNavigateTab('transactions')}
              className="text-xs font-semibold text-[#082B66] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              Belum ada riwayat transaksi yang tercatat.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentTransactions.map(tx => {
                const isSetor = tx.jenis === 'SETOR';
                return (
                  <div key={tx.id_transaksi} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isSetor ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {isSetor ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#172033] truncate">
                          {!isAnggota && <span className="font-mono text-slate-500 mr-1.5">{tx.nomor_anggota}</span>}
                          <span>{tx.nama}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span>{formatDateIndo(tx.tanggal)}</span>
                          <span>·</span>
                          <span className="truncate max-w-[150px] sm:max-w-[220px]">{tx.keterangan}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div
                        className={`text-xs font-bold tabular-nums ${
                          isSetor ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {isSetor ? '+' : '-'} {formatRupiah(tx.nominal)}
                      </div>
                      <div className="text-[10px] text-slate-400 tabular-nums">
                        Saldo: {formatRupiah(tx.saldo_sesudah)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Mini Ratio Visual or Recent Members */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-[#172033]">
                  {isAdmin ? 'Anggota Terbaru' : 'Status Tabungan'}
                </h2>
                <p className="text-xs text-slate-500">
                  {isAdmin ? 'Pendaftar terakhir' : 'Ringkasan kesehatan kas'}
                </p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => onNavigateTab('members')}
                  className="text-xs font-semibold text-[#082B66] hover:underline cursor-pointer"
                >
                  Kelola
                </button>
              )}
            </div>

            {isAdmin ? (
              <div className="space-y-3">
                {recentMembers.map(m => (
                  <div key={m.id} className="flex items-center justify-between gap-2 text-xs py-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[11px] text-[#082B66] shrink-0">
                        {m.nama.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 truncate">{m.nama}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{m.nomor_anggota}</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-semibold text-[#082B66] tabular-nums">
                        {formatRupiah(m.saldo)}
                      </div>
                      <span className="text-[10px] text-emerald-600 font-medium">{m.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Kas Rutin Bulanan</span>
                    <strong className="text-slate-800">Aktif</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Perhitungan Saldo</span>
                    <strong className="text-emerald-700">Otomatis</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Verifikasi QR</span>
                    <strong className="text-blue-700">Tersedia</strong>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#082B66]">
                    <TrendingUp className="w-4 h-4 text-[#082B66]" />
                    <span>Transparansi Finansial</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    Setiap penarikan dan setoran diverifikasi langsung oleh bendahara dengan saldo sebelum dan sesudah tercatat di Google Sheets.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Diperbarui secara realtime</span>
          </div>
        </div>
      </div>
    </div>
  );
};
