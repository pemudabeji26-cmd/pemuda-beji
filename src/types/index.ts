export type UserRole = 'ADMIN' | 'BENDAHARA' | 'ANGGOTA';

export type MemberStatus = 'AKTIF' | 'NONAKTIF';

export type TransactionType = 'SETOR' | 'TARIK';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  nomor_anggota?: string;
  nama: string;
  status: MemberStatus;
  created_at: string;
  last_login?: string;
}

export interface Member {
  id: string;
  nomor_anggota: string;
  nama: string;
  username: string;
  hp: string;
  alamat: string;
  foto?: string;
  tanggal_gabung: string;
  status: MemberStatus;
  created_at: string;
  updated_at: string;
  saldo?: number;
}

export interface Transaction {
  id_transaksi: string;
  tanggal: string; // YYYY-MM-DD
  nomor_anggota: string;
  nama: string;
  jenis: TransactionType;
  nominal: number;
  saldo_sebelum: number;
  saldo_sesudah: number;
  keterangan: string;
  created_by: string;
  created_at: string;
}

export interface AppSettings {
  nama_aplikasi: string;
  nama_organisasi: string;
  warna_primary: string;
  warna_secondary: string;
  warna_background: string;
  logo_url?: string;
}

export interface DashboardStats {
  totalAnggota: number;
  totalSaldo: number;
  setoranBulanIni: number;
  penarikanBulanIni: number;
  setoranHariIni: number;
  penarikanHariIni: number;
  totalSetoranUser?: number;
  totalPenarikanUser?: number;
  saldoUser?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}
