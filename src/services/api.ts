import {
  User,
  Member,
  Transaction,
  AppSettings,
  DashboardStats,
  ApiResponse,
} from '../types';
import { generateTransactionId, generateNextMemberNumber } from '../utils/formatters';

const SCRIPT_API_URL = import.meta.env.VITE_API_URL || '';

// Local Storage Keys for demo & fallback mode
const STORAGE_MEMBERS_KEY = 'pemuda_beji_members';
const STORAGE_TRANSACTIONS_KEY = 'pemuda_beji_transactions';
const STORAGE_USERS_KEY = 'pemuda_beji_users';
const STORAGE_SETTINGS_KEY = 'pemuda_beji_settings';

// Initial Seed Data
const INITIAL_USERS: User[] = [
  {
    id: 'USR-001',
    username: 'admin',
    role: 'ADMIN',
    nama: 'Administrator Pemuda Beji',
    status: 'AKTIF',
    created_at: '2026-01-01',
  },
  {
    id: 'USR-002',
    username: 'bendahara',
    role: 'BENDAHARA',
    nama: 'Bendahara Kas Beji',
    status: 'AKTIF',
    created_at: '2026-01-01',
  },
  {
    id: 'USR-003',
    username: 'PB-001',
    role: 'ANGGOTA',
    nomor_anggota: 'PB-001',
    nama: 'Ahmad Fauzi',
    status: 'AKTIF',
    created_at: '2026-01-15',
  },
  {
    id: 'USR-004',
    username: 'PB-002',
    role: 'ANGGOTA',
    nomor_anggota: 'PB-002',
    nama: 'Budi Santoso',
    status: 'AKTIF',
    created_at: '2026-02-01',
  },
  {
    id: 'USR-005',
    username: 'PB-003',
    role: 'ANGGOTA',
    nomor_anggota: 'PB-003',
    nama: 'Siti Rahmawati',
    status: 'AKTIF',
    created_at: '2026-02-10',
  },
];

const INITIAL_MEMBERS: Member[] = [
  {
    id: 'MEM-001',
    nomor_anggota: 'PB-001',
    nama: 'Ahmad Fauzi',
    username: 'PB-001',
    hp: '081234567890',
    alamat: 'Jl. Pemuda Beji No. 12, RT 02 / RW 04, Beji',
    tanggal_gabung: '2026-01-15',
    status: 'AKTIF',
    created_at: '2026-01-15 08:30:00',
    updated_at: '2026-01-15 08:30:00',
    saldo: 1250000,
  },
  {
    id: 'MEM-002',
    nomor_anggota: 'PB-002',
    nama: 'Budi Santoso',
    username: 'PB-002',
    hp: '082198765432',
    alamat: 'Gang Mawar RT 01 / RW 02, Beji Barat',
    tanggal_gabung: '2026-02-01',
    status: 'AKTIF',
    created_at: '2026-02-01 09:15:00',
    updated_at: '2026-02-01 09:15:00',
    saldo: 800000,
  },
  {
    id: 'MEM-003',
    nomor_anggota: 'PB-003',
    nama: 'Siti Rahmawati',
    username: 'PB-003',
    hp: '085711223344',
    alamat: 'Jl. Melati Blok C No. 04, Beji Timur',
    tanggal_gabung: '2026-02-10',
    status: 'AKTIF',
    created_at: '2026-02-10 10:00:00',
    updated_at: '2026-02-10 10:00:00',
    saldo: 2100000,
  },
  {
    id: 'MEM-004',
    nomor_anggota: 'PB-004',
    nama: 'Dimas Prayogo',
    username: 'PB-004',
    hp: '081399887766',
    alamat: 'Jl. Kenanga No. 8, Beji',
    tanggal_gabung: '2026-03-01',
    status: 'AKTIF',
    created_at: '2026-03-01 11:20:00',
    updated_at: '2026-03-01 11:20:00',
    saldo: 1500000,
  },
  {
    id: 'MEM-005',
    nomor_anggota: 'PB-005',
    nama: 'Nur Aisyah',
    username: 'PB-005',
    hp: '087812345678',
    alamat: 'Jl. Dahlia RT 03 / RW 05, Beji',
    tanggal_gabung: '2026-03-12',
    status: 'AKTIF',
    created_at: '2026-03-12 14:00:00',
    updated_at: '2026-03-12 14:00:00',
    saldo: 650000,
  },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id_transaksi: 'TRX-20260901-1001',
    tanggal: '2026-09-01',
    nomor_anggota: 'PB-001',
    nama: 'Ahmad Fauzi',
    jenis: 'SETOR',
    nominal: 500000,
    saldo_sebelum: 1000000,
    saldo_sesudah: 1500000,
    keterangan: 'Setoran bulanan September',
    created_by: 'Bendahara Kas Beji',
    created_at: '2026-09-01 09:30:00',
  },
  {
    id_transaksi: 'TRX-20260915-1002',
    tanggal: '2026-09-15',
    nomor_anggota: 'PB-001',
    nama: 'Ahmad Fauzi',
    jenis: 'TARIK',
    nominal: 250000,
    saldo_sebelum: 1500000,
    saldo_sesudah: 1250000,
    keterangan: 'Penarikan untuk keperluan organisasi',
    created_by: 'Bendahara Kas Beji',
    created_at: '2026-09-15 11:15:00',
  },
  {
    id_transaksi: 'TRX-20260920-1003',
    tanggal: '2026-09-20',
    nomor_anggota: 'PB-002',
    nama: 'Budi Santoso',
    jenis: 'SETOR',
    nominal: 300000,
    saldo_sebelum: 500000,
    saldo_sesudah: 800000,
    keterangan: 'Setoran kas kegiatan pemuda',
    created_by: 'Bendahara Kas Beji',
    created_at: '2026-09-20 14:20:00',
  },
  {
    id_transaksi: 'TRX-20260925-1004',
    tanggal: '2026-09-25',
    nomor_anggota: 'PB-003',
    nama: 'Siti Rahmawati',
    jenis: 'SETOR',
    nominal: 600000,
    saldo_sebelum: 1500000,
    saldo_sesudah: 2100000,
    keterangan: 'Tabungan berkala',
    created_by: 'Administrator Pemuda Beji',
    created_at: '2026-09-25 10:00:00',
  },
  {
    id_transaksi: 'TRX-20260928-1005',
    tanggal: '2026-09-28',
    nomor_anggota: 'PB-004',
    nama: 'Dimas Prayogo',
    jenis: 'SETOR',
    nominal: 500000,
    saldo_sebelum: 1000000,
    saldo_sesudah: 1500000,
    keterangan: 'Setoran tabungan kas pemuda',
    created_by: 'Bendahara Kas Beji',
    created_at: '2026-09-28 08:45:00',
  },
];

const INITIAL_SETTINGS: AppSettings = {
  nama_aplikasi: 'Management Tabungan Pemuda Beji',
  nama_organisasi: 'Pemuda Beji',
  warna_primary: '#082B66',
  warna_secondary: '#123C82',
  warna_background: '#F5F7FA',
  logo_url: '',
};

// Demo passwords map
const DEMO_PASSWORDS: Record<string, string> = {
  admin: 'admin123',
  bendahara: 'bendahara123',
  'PB-001': 'anggota123',
  'PB-002': 'anggota123',
  'PB-003': 'anggota123',
};

// Storage helper functions
function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Local storage set error:', err);
  }
}

// Initialize seed data once
function initLocalStorageIfNeeded() {
  if (!localStorage.getItem(STORAGE_MEMBERS_KEY)) {
    setStored(STORAGE_MEMBERS_KEY, INITIAL_MEMBERS);
  }
  if (!localStorage.getItem(STORAGE_TRANSACTIONS_KEY)) {
    setStored(STORAGE_TRANSACTIONS_KEY, INITIAL_TRANSACTIONS);
  }
  if (!localStorage.getItem(STORAGE_USERS_KEY)) {
    setStored(STORAGE_USERS_KEY, INITIAL_USERS);
  }
  if (!localStorage.getItem(STORAGE_SETTINGS_KEY)) {
    setStored(STORAGE_SETTINGS_KEY, INITIAL_SETTINGS);
  }
}

initLocalStorageIfNeeded();

// Helper to calculate member balances from transactions
function calculateBalances(members: Member[], transactions: Transaction[]): Member[] {
  const balanceMap: Record<string, number> = {};

  // Sort transactions ascending by date/time
  const sorted = [...transactions].sort((a, b) => {
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  for (const t of sorted) {
    const current = balanceMap[t.nomor_anggota] || 0;
    if (t.jenis === 'SETOR') {
      balanceMap[t.nomor_anggota] = current + t.nominal;
    } else if (t.jenis === 'TARIK') {
      balanceMap[t.nomor_anggota] = Math.max(0, current - t.nominal);
    }
  }

  return members.map(m => ({
    ...m,
    saldo: balanceMap[m.nomor_anggota] !== undefined ? balanceMap[m.nomor_anggota] : (m.saldo || 0),
  }));
}

// -------------------------------------------------------------
// Real Google Apps Script API Call with fallback to Local Storage
// -------------------------------------------------------------

async function callGasApi<T>(action: string, method: 'GET' | 'POST' = 'GET', bodyData?: unknown): Promise<ApiResponse<T>> {
  if (!SCRIPT_API_URL || SCRIPT_API_URL.includes('ISI_DEPLOYMENT_ID')) {
    // Mode Local/Demo
    return {
      success: false,
      message: 'MENGGUNAKAN_DATABASE_LOKAL',
    };
  }

  try {
    let url = `${SCRIPT_API_URL}?action=${encodeURIComponent(action)}`;
    let options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // Apps Script standard CORS text/plain POST
      },
    };

    if (method === 'POST' && bodyData) {
      options.body = JSON.stringify(bodyData);
    } else if (method === 'GET' && bodyData && typeof bodyData === 'object') {
      const params = new URLSearchParams();
      params.append('action', action);
      Object.entries(bodyData as Record<string, string>).forEach(([k, v]) => {
        if (v !== undefined && v !== null) params.append(k, String(v));
      });
      url = `${SCRIPT_API_URL}?${params.toString()}`;
    }

    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const json = await response.json();
    return json;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`Gagal terhubung ke Google Apps Script (${action}), beralih ke penyimpanan lokal:`, message);
    return {
      success: false,
      message: 'Server sedang tidak dapat dihubungi.',
    };
  }
}

// -------------------------------------------------------------
// API Service Methods
// -------------------------------------------------------------

export const apiService = {
  isConfigured(): boolean {
    return Boolean(SCRIPT_API_URL && !SCRIPT_API_URL.includes('ISI_DEPLOYMENT_ID'));
  },

  getApiUrl(): string {
    return SCRIPT_API_URL;
  },

  /**
   * Test connection to Google Apps Script Web App
   */
  async testConnection(): Promise<{ success: boolean; message: string; data?: unknown }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        message: 'URL Google Apps Script belum dikonfigurasi di file .env (VITE_API_URL). Saat ini menggunakan database lokal.',
      };
    }
    try {
      const res = await callGasApi<unknown>('getSettings', 'GET');
      if (res.success) {
        return {
          success: true,
          message: 'Berhasil terhubung ke Google Apps Script dan Google Sheets!',
          data: res.data,
        };
      }
      return {
        success: false,
        message: res.message || 'Gagal terhubung ke Google Sheet.',
      };
    } catch {
      return {
        success: false,
        message: 'Gagal menghubungi server Apps Script. Pastikan Web App di-deploy dengan akses "Anyone".',
      };
    }
  },

  /**
   * Login User
   */
  async login(username: string, passwordPlain: string): Promise<ApiResponse<{ user: User }>> {
    // 1. Try remote Apps Script if configured
    if (this.isConfigured()) {
      const res = await callGasApi<{ user: User }>('login', 'GET', { username, password: passwordPlain });
      if (res.success && res.data) {
        return res;
      }
    }

    // 2. Local fallback
    initLocalStorageIfNeeded();
    const users = getStored<User[]>(STORAGE_USERS_KEY, INITIAL_USERS);
    const members = getStored<Member[]>(STORAGE_MEMBERS_KEY, INITIAL_MEMBERS);

    const user = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
    if (!user) {
      return { success: false, message: 'Username atau nomor anggota tidak ditemukan.' };
    }

    if (user.status === 'NONAKTIF') {
      return { success: false, message: 'Akun Anda sedang nonaktif. Silakan hubungi admin.' };
    }

    // Check dummy passwords or custom passwords stored
    const customPasswords = getStored<Record<string, string>>('pemuda_beji_passwords', DEMO_PASSWORDS);
    const expectedPassword = customPasswords[user.username] || 'anggota123';

    if (passwordPlain !== expectedPassword) {
      return { success: false, message: 'Password salah. Periksa kembali password Anda.' };
    }

    // If member, attach member details
    let resolvedNama = user.nama;
    if (user.role === 'ANGGOTA' && user.nomor_anggota) {
      const m = members.find(item => item.nomor_anggota === user.nomor_anggota);
      if (m) resolvedNama = m.nama;
    }

    const updatedUser: User = {
      ...user,
      nama: resolvedNama,
      last_login: new Date().toISOString(),
    };

    return {
      success: true,
      message: 'Login berhasil.',
      data: { user: updatedUser },
    };
  },

  /**
   * Get Dashboard Data based on Role
   */
  async getDashboard(role: string, nomor_anggota?: string): Promise<ApiResponse<DashboardStats>> {
    if (this.isConfigured()) {
      const res = await callGasApi<DashboardStats>('getDashboard', 'GET', { role, nomor_anggota });
      if (res.success && res.data) return res;
    }

    // Local calculation
    const members = getStored<Member[]>(STORAGE_MEMBERS_KEY, INITIAL_MEMBERS);
    const transactions = getStored<Transaction[]>(STORAGE_TRANSACTIONS_KEY, INITIAL_TRANSACTIONS);
    const activeMembers = members.filter(m => m.status === 'AKTIF');

    const calculatedMembers = calculateBalances(members, transactions);

    let totalSaldo = 0;
    calculatedMembers.forEach(m => {
      totalSaldo += m.saldo || 0;
    });

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const todayStr = now.toISOString().slice(0, 10);

    let setoranBulanIni = 0;
    let penarikanBulanIni = 0;
    let setoranHariIni = 0;
    let penarikanHariIni = 0;

    transactions.forEach(t => {
      const tDate = new Date(t.tanggal);
      const isThisMonth = tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
      const isToday = t.tanggal === todayStr;

      if (t.jenis === 'SETOR') {
        if (isThisMonth) setoranBulanIni += t.nominal;
        if (isToday) setoranHariIni += t.nominal;
      } else if (t.jenis === 'TARIK') {
        if (isThisMonth) penarikanBulanIni += t.nominal;
        if (isToday) penarikanHariIni += t.nominal;
      }
    });

    // Member specific calculations
    let totalSetoranUser = 0;
    let totalPenarikanUser = 0;
    let saldoUser = 0;

    if (nomor_anggota) {
      const memberObj = calculatedMembers.find(m => m.nomor_anggota === nomor_anggota);
      saldoUser = memberObj?.saldo || 0;

      transactions
        .filter(t => t.nomor_anggota === nomor_anggota)
        .forEach(t => {
          if (t.jenis === 'SETOR') totalSetoranUser += t.nominal;
          if (t.jenis === 'TARIK') totalPenarikanUser += t.nominal;
        });
    }

    return {
      success: true,
      message: 'Berhasil memuat data dashboard.',
      data: {
        totalAnggota: activeMembers.length,
        totalSaldo,
        setoranBulanIni,
        penarikanBulanIni,
        setoranHariIni,
        penarikanHariIni,
        totalSetoranUser,
        totalPenarikanUser,
        saldoUser,
      },
    };
  },

  /**
   * Get all members with updated balances
   */
  async getMembers(): Promise<ApiResponse<Member[]>> {
    if (this.isConfigured()) {
      const res = await callGasApi<Member[]>('getMembers', 'GET');
      if (res.success && res.data) return res;
    }

    const members = getStored<Member[]>(STORAGE_MEMBERS_KEY, INITIAL_MEMBERS);
    const transactions = getStored<Transaction[]>(STORAGE_TRANSACTIONS_KEY, INITIAL_TRANSACTIONS);
    const withBalances = calculateBalances(members, transactions);

    return {
      success: true,
      message: 'Berhasil mengambil data anggota.',
      data: withBalances,
    };
  },

  /**
   * Get single member by ID or Nomor Anggota
   */
  async getMember(idOrNumber: string): Promise<ApiResponse<Member>> {
    if (this.isConfigured()) {
      const res = await callGasApi<Member>('getMember', 'GET', { id: idOrNumber });
      if (res.success && res.data) return res;
    }

    const members = getStored<Member[]>(STORAGE_MEMBERS_KEY, INITIAL_MEMBERS);
    const transactions = getStored<Transaction[]>(STORAGE_TRANSACTIONS_KEY, INITIAL_TRANSACTIONS);
    const withBalances = calculateBalances(members, transactions);

    const found = withBalances.find(
      m => m.id === idOrNumber || m.nomor_anggota === idOrNumber || m.username === idOrNumber
    );

    if (!found) {
      return { success: false, message: 'Data anggota tidak ditemukan.' };
    }

    return {
      success: true,
      message: 'Berhasil memuat data anggota.',
      data: found,
    };
  },

  /**
   * Verify member for public QR scan (/verify/:id)
   * Only returns non-sensitive public info
   */
  async verifyMember(idOrNumber: string): Promise<ApiResponse<{
    nama: string;
    nomor_anggota: string;
    status: string;
    tanggal_gabung: string;
  }>> {
    if (this.isConfigured()) {
      const res = await callGasApi<{
        nama: string;
        nomor_anggota: string;
        status: string;
        tanggal_gabung: string;
      }>('verifyMember', 'GET', { id: idOrNumber });
      if (res.success && res.data) return res;
    }

    const members = getStored<Member[]>(STORAGE_MEMBERS_KEY, INITIAL_MEMBERS);
    const found = members.find(
      m => m.id === idOrNumber || m.nomor_anggota === idOrNumber || m.username === idOrNumber
    );

    if (!found) {
      return { success: false, message: 'Data anggota tidak ditemukan.' };
    }

    return {
      success: true,
      message: 'Anggota terverifikasi resmi.',
      data: {
        nama: found.nama,
        nomor_anggota: found.nomor_anggota,
        status: found.status,
        tanggal_gabung: found.tanggal_gabung,
      },
    };
  },

  /**
   * Add a new Member
   */
  async addMember(data: {
    nomor_anggota: string;
    nama: string;
    username: string;
    password?: string;
    hp: string;
    alamat: string;
    tanggal_gabung: string;
    foto?: string;
    status: 'AKTIF' | 'NONAKTIF';
  }): Promise<ApiResponse<Member>> {
    if (this.isConfigured()) {
      const res = await callGasApi<Member>('addMember', 'POST', data);
      if (res.success && res.data) return res;
    }

    // Local
    const members = getStored<Member[]>(STORAGE_MEMBERS_KEY, INITIAL_MEMBERS);
    const users = getStored<User[]>(STORAGE_USERS_KEY, INITIAL_USERS);

    // Validate uniqueness
    if (members.some(m => m.nomor_anggota.toLowerCase() === data.nomor_anggota.toLowerCase())) {
      return { success: false, message: 'Nomor anggota sudah terdaftar.' };
    }
    if (members.some(m => m.username.toLowerCase() === data.username.toLowerCase())) {
      return { success: false, message: 'Username sudah digunakan anggota lain.' };
    }

    const newId = `MEM-${String(members.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

    const newMember: Member = {
      id: newId,
      nomor_anggota: data.nomor_anggota,
      nama: data.nama,
      username: data.username,
      hp: data.hp,
      alamat: data.alamat,
      foto: data.foto || '',
      tanggal_gabung: data.tanggal_gabung || new Date().toISOString().slice(0, 10),
      status: data.status || 'AKTIF',
      created_at: now,
      updated_at: now,
      saldo: 0,
    };

    const newUser: User = {
      id: `USR-${String(users.length + 1).padStart(3, '0')}`,
      username: data.username,
      role: 'ANGGOTA',
      nomor_anggota: data.nomor_anggota,
      nama: data.nama,
      status: data.status || 'AKTIF',
      created_at: now,
    };

    // Store custom password
    const customPasswords = getStored<Record<string, string>>('pemuda_beji_passwords', DEMO_PASSWORDS);
    customPasswords[data.username] = data.password || 'anggota123';
    setStored('pemuda_beji_passwords', customPasswords);

    members.unshift(newMember);
    users.push(newUser);

    setStored(STORAGE_MEMBERS_KEY, members);
    setStored(STORAGE_USERS_KEY, users);

    return {
      success: true,
      message: 'Anggota berhasil ditambahkan.',
      data: newMember,
    };
  },

  /**
   * Get next available member number
   */
  async getNextMemberNumber(): Promise<string> {
    if (this.isConfigured()) {
      const res = await callGasApi<{ nextNumber: string }>('getNextMemberNumber', 'GET');
      if (res.success && res.data?.nextNumber) {
        return res.data.nextNumber;
      }
    }

    const members = getStored<Member[]>(STORAGE_MEMBERS_KEY, INITIAL_MEMBERS);
    const existingNumbers = members.map(m => m.nomor_anggota);
    return generateNextMemberNumber(existingNumbers);
  },

  /**
   * Self-registration for new Anggota
   */
  async registerMember(data: {
    nama: string;
    username: string;
    password: string;
    hp?: string;
    alamat?: string;
  }): Promise<ApiResponse<{ member: Member; user: User }>> {
    if (!data.nama.trim() || !data.username.trim() || !data.password) {
      return { success: false, message: 'Nama, username, dan password wajib diisi.' };
    }

    if (this.isConfigured()) {
      const res = await callGasApi<{ member: Member; user: User }>('registerMember', 'POST', data);
      if (res.success && res.data) return res;
    }

    // Local Registration
    const members = getStored<Member[]>(STORAGE_MEMBERS_KEY, INITIAL_MEMBERS);
    const users = getStored<User[]>(STORAGE_USERS_KEY, INITIAL_USERS);

    const cleanUsername = data.username.trim();

    if (users.some(u => u.username.toLowerCase() === cleanUsername.toLowerCase())) {
      return { success: false, message: 'Username sudah digunakan. Silakan pilih username lain.' };
    }

    const existingNumbers = members.map(m => m.nomor_anggota);
    const nextNomorAnggota = generateNextMemberNumber(existingNumbers);

    const newId = `MEM-${String(members.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

    const newMember: Member = {
      id: newId,
      nomor_anggota: nextNomorAnggota,
      nama: data.nama.trim(),
      username: cleanUsername,
      hp: data.hp ? data.hp.trim() : '',
      alamat: data.alamat ? data.alamat.trim() : '',
      foto: '',
      tanggal_gabung: new Date().toISOString().slice(0, 10),
      status: 'AKTIF',
      created_at: now,
      updated_at: now,
      saldo: 0,
    };

    const newUser: User = {
      id: `USR-${String(users.length + 1).padStart(3, '0')}`,
      username: cleanUsername,
      role: 'ANGGOTA',
      nomor_anggota: nextNomorAnggota,
      nama: data.nama.trim(),
      status: 'AKTIF',
      created_at: now,
    };

    // Store custom password
    const customPasswords = getStored<Record<string, string>>('pemuda_beji_passwords', DEMO_PASSWORDS);
    customPasswords[cleanUsername] = data.password;
    setStored('pemuda_beji_passwords', customPasswords);

    members.unshift(newMember);
    users.push(newUser);

    setStored(STORAGE_MEMBERS_KEY, members);
    setStored(STORAGE_USERS_KEY, users);

    return {
      success: true,
      message: `Pendaftaran berhasil! Nomor Anggota resmi Anda: ${nextNomorAnggota}.`,
      data: {
        member: newMember,
        user: newUser,
      },
    };
  },

  /**
   * Update Member Data
   */
  async updateMember(id: string, data: Partial<Member>): Promise<ApiResponse<Member>> {
    if (this.isConfigured()) {
      const res = await callGasApi<Member>('updateMember', 'POST', { id, ...data });
      if (res.success && res.data) return res;
    }

    const members = getStored<Member[]>(STORAGE_MEMBERS_KEY, INITIAL_MEMBERS);
    const index = members.findIndex(m => m.id === id);
    if (index === -1) {
      return { success: false, message: 'Data anggota tidak ditemukan.' };
    }

    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    members[index] = {
      ...members[index],
      ...data,
      updated_at: now,
    };

    setStored(STORAGE_MEMBERS_KEY, members);

    // Sync user nama & status if updated
    const users = getStored<User[]>(STORAGE_USERS_KEY, INITIAL_USERS);
    const uIndex = users.findIndex(u => u.nomor_anggota === members[index].nomor_anggota);
    if (uIndex !== -1) {
      if (data.nama) users[uIndex].nama = data.nama;
      if (data.status) users[uIndex].status = data.status;
      setStored(STORAGE_USERS_KEY, users);
    }

    return {
      success: true,
      message: 'Data anggota berhasil diperbarui.',
      data: members[index],
    };
  },

  /**
   * Deactivate or Activate Member
   */
  async deactivateMember(id: string, status: 'AKTIF' | 'NONAKTIF'): Promise<ApiResponse<void>> {
    if (this.isConfigured()) {
      const res = await callGasApi<void>('deactivateMember', 'POST', { id, status });
      if (res.success) return res;
    }

    return this.updateMember(id, { status }).then(r => ({
      success: r.success,
      message: r.success ? `Status anggota berhasil diubah menjadi ${status}.` : r.message,
    }));
  },

  /**
   * Reset Password for member
   */
  async resetPassword(username: string, newPasswordPlain: string): Promise<ApiResponse<void>> {
    if (this.isConfigured()) {
      const res = await callGasApi<void>('resetPassword', 'POST', { username, newPassword: newPasswordPlain });
      if (res.success) return res;
    }

    const customPasswords = getStored<Record<string, string>>('pemuda_beji_passwords', DEMO_PASSWORDS);
    customPasswords[username] = newPasswordPlain;
    setStored('pemuda_beji_passwords', customPasswords);

    return {
      success: true,
      message: 'Password anggota berhasil direset.',
    };
  },

  /**
   * Add Transaction (SETOR or TARIK) with automatic balance recalculation
   */
  async addTransaction(data: {
    nomor_anggota: string;
    nama: string;
    jenis: 'SETOR' | 'TARIK';
    nominal: number;
    keterangan: string;
    tanggal?: string;
    created_by: string;
  }): Promise<ApiResponse<Transaction>> {
    // Basic validation
    if (data.nominal <= 0) {
      return { success: false, message: 'Nominal transaksi harus lebih dari 0.' };
    }

    if (this.isConfigured()) {
      const res = await callGasApi<Transaction>('addTransaction', 'POST', data);
      if (res.success && res.data) return res;
    }

    // Local process
    const members = getStored<Member[]>(STORAGE_MEMBERS_KEY, INITIAL_MEMBERS);
    const transactions = getStored<Transaction[]>(STORAGE_TRANSACTIONS_KEY, INITIAL_TRANSACTIONS);

    const calculated = calculateBalances(members, transactions);
    const memberObj = calculated.find(m => m.nomor_anggota === data.nomor_anggota);

    if (!memberObj) {
      return { success: false, message: 'Anggota tidak ditemukan.' };
    }

    const saldoSebelum = memberObj.saldo || 0;

    if (data.jenis === 'TARIK' && data.nominal > saldoSebelum) {
      return {
        success: false,
        message: 'Saldo tidak mencukupi untuk melakukan penarikan.',
      };
    }

    const saldoSesudah = data.jenis === 'SETOR' ? saldoSebelum + data.nominal : saldoSebelum - data.nominal;

    const newTransaction: Transaction = {
      id_transaksi: generateTransactionId(),
      tanggal: data.tanggal || new Date().toISOString().slice(0, 10),
      nomor_anggota: data.nomor_anggota,
      nama: data.nama,
      jenis: data.jenis,
      nominal: data.nominal,
      saldo_sebelum: saldoSebelum,
      saldo_sesudah: saldoSesudah,
      keterangan: data.keterangan || (data.jenis === 'SETOR' ? 'Setoran Tabungan' : 'Penarikan Tabungan'),
      created_by: data.created_by,
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };

    transactions.unshift(newTransaction);
    setStored(STORAGE_TRANSACTIONS_KEY, transactions);

    // Update member balance directly
    const mIdx = members.findIndex(m => m.nomor_anggota === data.nomor_anggota);
    if (mIdx !== -1) {
      members[mIdx].saldo = saldoSesudah;
      members[mIdx].updated_at = new Date().toISOString().replace('T', ' ').slice(0, 19);
      setStored(STORAGE_MEMBERS_KEY, members);
    }

    return {
      success: true,
      message: 'Transaksi berhasil disimpan.',
      data: newTransaction,
    };
  },

  /**
   * Get Transactions (supports filtering by member, type, dates)
   */
  async getTransactions(filter?: {
    nomor_anggota?: string;
    jenis?: 'SETOR' | 'TARIK' | 'ALL';
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<ApiResponse<Transaction[]>> {
    if (this.isConfigured()) {
      const res = await callGasApi<Transaction[]>('getTransactions', 'GET', filter);
      if (res.success && res.data) return res;
    }

    let list = getStored<Transaction[]>(STORAGE_TRANSACTIONS_KEY, INITIAL_TRANSACTIONS);

    if (filter?.nomor_anggota) {
      list = list.filter(t => t.nomor_anggota === filter.nomor_anggota);
    }

    if (filter?.jenis && filter.jenis !== 'ALL') {
      list = list.filter(t => t.jenis === filter.jenis);
    }

    if (filter?.startDate) {
      list = list.filter(t => t.tanggal >= filter.startDate!);
    }

    if (filter?.endDate) {
      list = list.filter(t => t.tanggal <= filter.endDate!);
    }

    // Sort descending by date/time
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    if (filter?.limit) {
      list = list.slice(0, filter.limit);
    }

    return {
      success: true,
      message: 'Berhasil memuat riwayat transaksi.',
      data: list,
    };
  },

  /**
   * Get current balance for an individual member
   */
  async getBalance(nomor_anggota: string): Promise<ApiResponse<{ saldo: number }>> {
    if (this.isConfigured()) {
      const res = await callGasApi<{ saldo: number }>('getBalance', 'GET', { nomor_anggota });
      if (res.success && res.data) return res;
    }

    const members = getStored<Member[]>(STORAGE_MEMBERS_KEY, INITIAL_MEMBERS);
    const transactions = getStored<Transaction[]>(STORAGE_TRANSACTIONS_KEY, INITIAL_TRANSACTIONS);
    const withBalances = calculateBalances(members, transactions);

    const m = withBalances.find(item => item.nomor_anggota === nomor_anggota);

    return {
      success: true,
      message: 'Berhasil mengambil saldo.',
      data: { saldo: m?.saldo || 0 },
    };
  },

  /**
   * Get App Settings
   */
  async getSettings(): Promise<ApiResponse<AppSettings>> {
    if (this.isConfigured()) {
      const res = await callGasApi<AppSettings>('getSettings', 'GET');
      if (res.success && res.data) return res;
    }

    const settings = getStored<AppSettings>(STORAGE_SETTINGS_KEY, INITIAL_SETTINGS);
    return {
      success: true,
      message: 'Berhasil mengambil pengaturan.',
      data: settings,
    };
  },

  /**
   * Update App Settings
   */
  async updateSettings(newSettings: Partial<AppSettings>): Promise<ApiResponse<AppSettings>> {
    if (this.isConfigured()) {
      const res = await callGasApi<AppSettings>('updateSettings', 'POST', newSettings);
      if (res.success && res.data) return res;
    }

    const current = getStored<AppSettings>(STORAGE_SETTINGS_KEY, INITIAL_SETTINGS);
    const updated = { ...current, ...newSettings };
    setStored(STORAGE_SETTINGS_KEY, updated);

    return {
      success: true,
      message: 'Pengaturan berhasil diperbarui.',
      data: updated,
    };
  },

  /**
   * Reset local storage data back to initial seeds
   */
  resetToDefault() {
    setStored(STORAGE_MEMBERS_KEY, INITIAL_MEMBERS);
    setStored(STORAGE_TRANSACTIONS_KEY, INITIAL_TRANSACTIONS);
    setStored(STORAGE_USERS_KEY, INITIAL_USERS);
    setStored(STORAGE_SETTINGS_KEY, INITIAL_SETTINGS);
    setStored('pemuda_beji_passwords', DEMO_PASSWORDS);
  },
};
