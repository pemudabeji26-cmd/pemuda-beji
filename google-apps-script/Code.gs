/**
 * ==============================================================================
 * MANAGEMENT TABUNGAN PEMUDA BEJI - BACKEND GOOGLE APPS SCRIPT
 * ==============================================================================
 * Backend API untuk menghubungkan frontend web dengan Google Sheets sebagai database.
 * 
 * 4 Sheet Utama:
 * 1. ANGGOTA    : id, nomor_anggota, nama, username, password_hash, hp, alamat, foto, tanggal_gabung, status, created_at, updated_at
 * 2. TRANSAKSI  : id_transaksi, tanggal, nomor_anggota, nama, jenis, nominal, saldo_sebelum, saldo_sesudah, keterangan, created_by, created_at
 * 3. USER       : id, username, password_hash, role, nomor_anggota, status, created_at, last_login
 * 4. PENGATURAN : key, value
 * ==============================================================================
 */

// Ganti nilai di bawah ini dengan ID Google Spreadsheet Anda
const SPREADSHEET_ID = 'ISI_ID_GOOGLE_SHEET';

// Nama Sheet
const SHEET_ANGGOTA = 'ANGGOTA';
const SHEET_TRANSAKSI = 'TRANSAKSI';
const SHEET_USER = 'USER';
const SHEET_PENGATURAN = 'PENGATURAN';

/**
 * Handle GET Requests
 */
function doGet(e) {
  try {
    const action = e && e.parameter ? e.parameter.action : '';
    const params = e ? e.parameter : {};

    switch (action) {
      case 'login':
        return jsonResponse(loginUser(params.username, params.password));

      case 'getDashboard':
        return jsonResponse(getDashboard(params.role, params.nomor_anggota));

      case 'getMembers':
        return jsonResponse(getMembers());

      case 'getMember':
        return jsonResponse(getMember(params.id));

      case 'getTransactions':
        return jsonResponse(getTransactions(params));

      case 'getBalance':
        return jsonResponse(getBalance(params.nomor_anggota));

      case 'verifyMember':
        return jsonResponse(verifyMember(params.id));

      case 'getSettings':
        return jsonResponse(getSettings());

      case 'initDatabase':
        return jsonResponse(initDatabase());

      default:
        return jsonResponse({
          success: true,
          message: 'API Management Tabungan Pemuda Beji Aktif.',
          version: '1.0.0',
        });
    }
  } catch (error) {
    return jsonResponse({
      success: false,
      message: 'Terjadi kesalahan server: ' + error.toString(),
    });
  }
}

/**
 * Handle POST Requests
 */
function doPost(e) {
  try {
    const action = e && e.parameter ? e.parameter.action : '';
    let bodyData = {};

    if (e && e.postData && e.postData.contents) {
      bodyData = JSON.parse(e.postData.contents);
    }

    switch (action) {
      case 'registerMember':
        return jsonResponse(registerMember(bodyData));

      case 'addMember':
        return jsonResponse(addMember(bodyData));

      case 'updateMember':
        return jsonResponse(updateMember(bodyData));

      case 'deactivateMember':
        return jsonResponse(deactivateMember(bodyData.id, bodyData.status));

      case 'resetPassword':
        return jsonResponse(resetPassword(bodyData.username, bodyData.newPassword));

      case 'addTransaction':
        return jsonResponse(addTransaction(bodyData));

      case 'updateSettings':
        return jsonResponse(updateSettings(bodyData));

      default:
        return jsonResponse({
          success: false,
          message: 'Aksi POST tidak dikenali.',
        });
    }
  } catch (error) {
    return jsonResponse({
      success: false,
      message: 'Terjadi kesalahan server: ' + error.toString(),
    });
  }
}

// ==============================================================================
// HELPER UTILITIES
// ==============================================================================

function getSpreadsheet() {
  if (!SPREADSHEET_ID || SPREADSHEET_ID === 'ISI_ID_GOOGLE_SHEET') {
    return SpreadsheetApp.getActiveSpreadsheet();
  }
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function hashPassword(plainText) {
  if (!plainText) return '';
  const rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, plainText, Utilities.Charset.UTF_8);
  let txtHash = '';
  for (let i = 0; i < rawHash.length; i++) {
    let hashVal = rawHash[i];
    if (hashVal < 0) hashVal += 256;
    let byteStr = hashVal.toString(16);
    if (byteStr.length === 1) byteStr = '0' + byteStr;
    txtHash += byteStr;
  }
  return txtHash;
}

function getRowsAsObjects(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0].map(h => String(h).trim().toLowerCase());
  const rows = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const obj = { _rowIndex: i + 1 };
    headers.forEach((h, colIndex) => {
      obj[h] = row[colIndex];
    });
    rows.push(obj);
  }
  return rows;
}

// ==============================================================================
// BUSINESS LOGIC FUNCTIONS
// ==============================================================================

/**
 * 1. Login User
 */
function loginUser(username, password) {
  if (!username || !password) {
    return { success: false, message: 'Username dan password wajib diisi.' };
  }

  const ss = getSpreadsheet();
  const sheetUser = ss.getSheetByName(SHEET_USER);
  if (!sheetUser) return { success: false, message: 'Sheet USER tidak ditemukan.' };

  const users = getRowsAsObjects(sheetUser);
  const passwordHash = hashPassword(password);

  const foundUser = users.find(u => 
    String(u.username).trim().toLowerCase() === String(username).trim().toLowerCase()
  );

  if (!foundUser) {
    return { success: false, message: 'Username atau nomor anggota tidak terdaftar.' };
  }

  if (String(foundUser.status).toUpperCase() === 'NONAKTIF') {
    return { success: false, message: 'Akun Anda sedang nonaktif. Hubungi Admin Pemuda Beji.' };
  }

  // Validate hashed password or plain fallback for initial setup
  if (foundUser.password_hash !== passwordHash && foundUser.password_hash !== password) {
    return { success: false, message: 'Password salah. Periksa kembali password Anda.' };
  }

  // Update last_login
  const nowStr = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');
  sheetUser.getRange(foundUser._rowIndex, 8).setValue(nowStr);

  // If member, retrieve member full name
  let namaLengkap = foundUser.username;
  if (foundUser.role === 'ANGGOTA' && foundUser.nomor_anggota) {
    const sheetAnggota = ss.getSheetByName(SHEET_ANGGOTA);
    if (sheetAnggota) {
      const members = getRowsAsObjects(sheetAnggota);
      const m = members.find(item => item.nomor_anggota === foundUser.nomor_anggota);
      if (m) namaLengkap = m.nama;
    }
  }

  return {
    success: true,
    message: 'Login berhasil.',
    data: {
      user: {
        id: foundUser.id,
        username: foundUser.username,
        role: foundUser.role,
        nomor_anggota: foundUser.nomor_anggota,
        nama: namaLengkap,
        status: foundUser.status,
        created_at: foundUser.created_at,
        last_login: nowStr,
      }
    }
  };
}

/**
 * 2. Get All Members with calculated balances
 */
function getMembers() {
  const ss = getSpreadsheet();
  const sheetAnggota = ss.getSheetByName(SHEET_ANGGOTA);
  const sheetTransaksi = ss.getSheetByName(SHEET_TRANSAKSI);

  if (!sheetAnggota) return { success: false, message: 'Sheet ANGGOTA tidak ditemukan.' };

  const members = getRowsAsObjects(sheetAnggota);
  const transactions = sheetTransaksi ? getRowsAsObjects(sheetTransaksi) : [];

  // Calculate balances from transactions
  const balanceMap = {};
  transactions.forEach(t => {
    const no = t.nomor_anggota;
    const nominal = Number(t.nominal) || 0;
    const current = balanceMap[no] || 0;
    if (String(t.jenis).toUpperCase() === 'SETOR') {
      balanceMap[no] = current + nominal;
    } else if (String(t.jenis).toUpperCase() === 'TARIK') {
      balanceMap[no] = Math.max(0, current - nominal);
    }
  });

  const sanitizedMembers = members.map(m => ({
    id: m.id,
    nomor_anggota: m.nomor_anggota,
    nama: m.nama,
    username: m.username,
    hp: m.hp,
    alamat: m.alamat,
    foto: m.foto || '',
    tanggal_gabung: m.tanggal_gabung ? Utilities.formatDate(new Date(m.tanggal_gabung), 'Asia/Jakarta', 'yyyy-MM-dd') : '',
    status: m.status,
    created_at: m.created_at,
    updated_at: m.updated_at,
    saldo: balanceMap[m.nomor_anggota] || 0,
  }));

  return {
    success: true,
    message: 'Berhasil mengambil data anggota.',
    data: sanitizedMembers,
  };
}

/**
 * 3. Get Single Member
 */
function getMember(idOrNumber) {
  const all = getMembers();
  if (!all.success) return all;

  const found = all.data.find(m => 
    String(m.id) === String(idOrNumber) ||
    String(m.nomor_anggota) === String(idOrNumber) ||
    String(m.username) === String(idOrNumber)
  );

  if (!found) {
    return { success: false, message: 'Data anggota tidak ditemukan.' };
  }

  return { success: true, message: 'Berhasil mengambil data anggota.', data: found };
}

/**
 * 4. Add Member
 */
function addMember(data) {
  if (!data.nama || !data.nomor_anggota || !data.username) {
    return { success: false, message: 'Nama, Nomor Anggota, dan Username wajib diisi.' };
  }

  const ss = getSpreadsheet();
  const sheetAnggota = ss.getSheetByName(SHEET_ANGGOTA);
  const sheetUser = ss.getSheetByName(SHEET_USER);

  if (!sheetAnggota || !sheetUser) {
    return { success: false, message: 'Sheet ANGGOTA atau USER tidak ditemukan.' };
  }

  const existingMembers = getRowsAsObjects(sheetAnggota);
  if (existingMembers.some(m => String(m.nomor_anggota).toLowerCase() === String(data.nomor_anggota).toLowerCase())) {
    return { success: false, message: 'Nomor anggota sudah terdaftar.' };
  }
  if (existingMembers.some(m => String(m.username).toLowerCase() === String(data.username).toLowerCase())) {
    return { success: false, message: 'Username sudah digunakan anggota lain.' };
  }

  const nowStr = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');
  const newId = 'MEM-' + ('000' + (existingMembers.length + 1)).slice(-3);
  const passwordHash = hashPassword(data.password || 'anggota123');

  // Insert row to ANGGOTA
  sheetAnggota.appendRow([
    newId,
    data.nomor_anggota,
    data.nama,
    data.username,
    passwordHash,
    data.hp || '',
    data.alamat || '',
    data.foto || '',
    data.tanggal_gabung || nowStr.slice(0, 10),
    data.status || 'AKTIF',
    nowStr,
    nowStr,
  ]);

  // Insert row to USER
  const existingUsers = getRowsAsObjects(sheetUser);
  const newUserId = 'USR-' + ('000' + (existingUsers.length + 1)).slice(-3);
  sheetUser.appendRow([
    newUserId,
    data.username,
    passwordHash,
    'ANGGOTA',
    data.nomor_anggota,
    data.status || 'AKTIF',
    nowStr,
    '',
  ]);

  return {
    success: true,
    message: 'Anggota berhasil ditambahkan.',
    data: {
      id: newId,
      nomor_anggota: data.nomor_anggota,
      nama: data.nama,
      username: data.username,
      hp: data.hp,
      alamat: data.alamat,
      status: data.status || 'AKTIF',
      tanggal_gabung: data.tanggal_gabung || nowStr.slice(0, 10),
      saldo: 0,
    }
  };
}

/**
 * 4b. Register Member (Self-Registration)
 */
function registerMember(data) {
  if (!data.nama || !data.username || !data.password) {
    return { success: false, message: 'Nama, username, dan password wajib diisi.' };
  }

  const ss = getSpreadsheet();
  const sheetAnggota = ss.getSheetByName(SHEET_ANGGOTA);
  const sheetUser = ss.getSheetByName(SHEET_USER);

  if (!sheetAnggota || !sheetUser) {
    return { success: false, message: 'Sheet database tidak ditemukan.' };
  }

  const existingMembers = getRowsAsObjects(sheetAnggota);
  const existingUsers = getRowsAsObjects(sheetUser);

  const cleanUsername = String(data.username).trim();

  if (existingUsers.some(u => String(u.username).toLowerCase() === cleanUsername.toLowerCase())) {
    return { success: false, message: 'Username sudah digunakan. Silakan gunakan username lain.' };
  }

  // Calculate next member number PB-XXX
  let maxNum = 0;
  existingMembers.forEach(m => {
    const no = String(m.nomor_anggota || '');
    const match = no.match(/PB-(\d+)/i);
    if (match && match[1]) {
      const parsed = parseInt(match[1], 10);
      if (parsed > maxNum) maxNum = parsed;
    }
  });
  const nextNumber = 'PB-' + ('000' + (maxNum + 1)).slice(-3);

  const nowStr = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');
  const newId = 'MEM-' + ('000' + (existingMembers.length + 1)).slice(-3);
  const passwordHash = hashPassword(data.password);

  // Append to ANGGOTA
  sheetAnggota.appendRow([
    newId,
    nextNumber,
    data.nama.trim(),
    cleanUsername,
    passwordHash,
    data.hp ? String(data.hp).trim() : '',
    data.alamat ? String(data.alamat).trim() : '',
    '',
    nowStr.slice(0, 10),
    'AKTIF',
    nowStr,
    nowStr,
  ]);

  // Append to USER
  const newUserId = 'USR-' + ('000' + (existingUsers.length + 1)).slice(-3);
  sheetUser.appendRow([
    newUserId,
    cleanUsername,
    passwordHash,
    'ANGGOTA',
    nextNumber,
    'AKTIF',
    nowStr,
    nowStr,
  ]);

  return {
    success: true,
    message: 'Pendaftaran berhasil! Nomor Anggota Anda: ' + nextNumber,
    data: {
      member: {
        id: newId,
        nomor_anggota: nextNumber,
        nama: data.nama.trim(),
        username: cleanUsername,
        hp: data.hp || '',
        alamat: data.alamat || '',
        status: 'AKTIF',
        tanggal_gabung: nowStr.slice(0, 10),
        saldo: 0,
      },
      user: {
        id: newUserId,
        username: cleanUsername,
        role: 'ANGGOTA',
        nomor_anggota: nextNumber,
        nama: data.nama.trim(),
        status: 'AKTIF',
        created_at: nowStr,
      }
    }
  };
}

/**
 * 5. Update Member
 */
function updateMember(data) {
  if (!data.id) return { success: false, message: 'ID Anggota wajib disertakan.' };

  const ss = getSpreadsheet();
  const sheetAnggota = ss.getSheetByName(SHEET_ANGGOTA);
  if (!sheetAnggota) return { success: false, message: 'Sheet ANGGOTA tidak ditemukan.' };

  const members = getRowsAsObjects(sheetAnggota);
  const found = members.find(m => String(m.id) === String(data.id));

  if (!found) {
    return { success: false, message: 'Anggota tidak ditemukan.' };
  }

  const rowIndex = found._rowIndex;
  const nowStr = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');

  if (data.nama !== undefined) sheetAnggota.getRange(rowIndex, 3).setValue(data.nama);
  if (data.hp !== undefined) sheetAnggota.getRange(rowIndex, 6).setValue(data.hp);
  if (data.alamat !== undefined) sheetAnggota.getRange(rowIndex, 7).setValue(data.alamat);
  if (data.foto !== undefined) sheetAnggota.getRange(rowIndex, 8).setValue(data.foto);
  if (data.status !== undefined) sheetAnggota.getRange(rowIndex, 10).setValue(data.status);
  sheetAnggota.getRange(rowIndex, 12).setValue(nowStr);

  return { success: true, message: 'Data anggota berhasil diperbarui.' };
}

/**
 * 6. Deactivate / Activate Member
 */
function deactivateMember(id, status) {
  return updateMember({ id: id, status: status || 'NONAKTIF' });
}

/**
 * 7. Reset Password
 */
function resetPassword(username, newPassword) {
  if (!username || !newPassword) {
    return { success: false, message: 'Username dan password baru harus diisi.' };
  }

  const ss = getSpreadsheet();
  const sheetUser = ss.getSheetByName(SHEET_USER);
  const sheetAnggota = ss.getSheetByName(SHEET_ANGGOTA);

  const passwordHash = hashPassword(newPassword);

  if (sheetUser) {
    const users = getRowsAsObjects(sheetUser);
    const u = users.find(item => String(item.username).toLowerCase() === String(username).toLowerCase());
    if (u) {
      sheetUser.getRange(u._rowIndex, 3).setValue(passwordHash);
    }
  }

  if (sheetAnggota) {
    const members = getRowsAsObjects(sheetAnggota);
    const m = members.find(item => String(item.username).toLowerCase() === String(username).toLowerCase());
    if (m) {
      sheetAnggota.getRange(m._rowIndex, 5).setValue(passwordHash);
    }
  }

  return { success: true, message: 'Password berhasil direset.' };
}

/**
 * 8. Add Transaction (SETOR or TARIK)
 */
function addTransaction(data) {
  if (!data.nomor_anggota || !data.jenis || !data.nominal || data.nominal <= 0) {
    return { success: false, message: 'Data transaksi tidak valid.' };
  }

  const ss = getSpreadsheet();
  const sheetTransaksi = ss.getSheetByName(SHEET_TRANSAKSI);
  const sheetAnggota = ss.getSheetByName(SHEET_ANGGOTA);

  if (!sheetTransaksi || !sheetAnggota) {
    return { success: false, message: 'Sheet database tidak ditemukan.' };
  }

  // Get current balance of member
  const members = getMembers();
  const memberObj = members.data.find(m => m.nomor_anggota === data.nomor_anggota);
  if (!memberObj) {
    return { success: false, message: 'Anggota tidak ditemukan.' };
  }

  const saldoSebelum = memberObj.saldo || 0;
  const nominal = Number(data.nominal);

  if (data.jenis === 'TARIK' && nominal > saldoSebelum) {
    return { success: false, message: 'Saldo tidak mencukupi untuk melakukan penarikan.' };
  }

  const saldoSesudah = data.jenis === 'SETOR' ? saldoSebelum + nominal : saldoSebelum - nominal;
  const nowStr = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');
  const dateStr = data.tanggal || Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd');
  const idTrx = 'TRX-' + dateStr.replace(/-/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);

  sheetTransaksi.appendRow([
    idTrx,
    dateStr,
    data.nomor_anggota,
    data.nama || memberObj.nama,
    data.jenis,
    nominal,
    saldoSebelum,
    saldoSesudah,
    data.keterangan || (data.jenis === 'SETOR' ? 'Setoran Tabungan' : 'Penarikan Tabungan'),
    data.created_by || 'Bendahara',
    nowStr,
  ]);

  return {
    success: true,
    message: 'Transaksi berhasil disimpan.',
    data: {
      id_transaksi: idTrx,
      tanggal: dateStr,
      nomor_anggota: data.nomor_anggota,
      nama: data.nama || memberObj.nama,
      jenis: data.jenis,
      nominal: nominal,
      saldo_sebelum: saldoSebelum,
      saldo_sesudah: saldoSesudah,
      keterangan: data.keterangan,
      created_by: data.created_by,
      created_at: nowStr,
    }
  };
}

/**
 * 9. Get Transactions with optional filters
 */
function getTransactions(params) {
  const ss = getSpreadsheet();
  const sheetTransaksi = ss.getSheetByName(SHEET_TRANSAKSI);
  if (!sheetTransaksi) return { success: false, message: 'Sheet TRANSAKSI tidak ditemukan.' };

  let list = getRowsAsObjects(sheetTransaksi);

  if (params.nomor_anggota) {
    list = list.filter(t => t.nomor_anggota === params.nomor_anggota);
  }
  if (params.jenis && params.jenis !== 'ALL') {
    list = list.filter(t => t.jenis === params.jenis);
  }
  if (params.startDate) {
    list = list.filter(t => t.tanggal >= params.startDate);
  }
  if (params.endDate) {
    list = list.filter(t => t.tanggal <= params.endDate);
  }

  // Sort descending
  list.reverse();

  if (params.limit) {
    list = list.slice(0, Number(params.limit));
  }

  return {
    success: true,
    message: 'Berhasil memuat transaksi.',
    data: list,
  };
}

/**
 * 10. Get Balance for single member
 */
function getBalance(nomor_anggota) {
  const res = getMember(nomor_anggota);
  if (!res.success) return res;
  return {
    success: true,
    message: 'Berhasil mengambil saldo.',
    data: { saldo: res.data.saldo || 0 }
  };
}

/**
 * 11. Get Dashboard Statistics
 */
function getDashboard(role, nomor_anggota) {
  const membersRes = getMembers();
  const txRes = getTransactions({});

  if (!membersRes.success || !txRes.success) {
    return { success: false, message: 'Gagal mengambil data statistik.' };
  }

  const members = membersRes.data;
  const transactions = txRes.data;
  const activeMembers = members.filter(m => m.status === 'AKTIF');

  let totalSaldo = 0;
  members.forEach(m => totalSaldo += (m.saldo || 0));

  const todayStr = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd');
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  let setoranBulanIni = 0;
  let penarikanBulanIni = 0;
  let setoranHariIni = 0;
  let penarikanHariIni = 0;

  transactions.forEach(t => {
    const tDate = new Date(t.tanggal);
    const isThisMonth = tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
    const isToday = String(t.tanggal).slice(0, 10) === todayStr;

    if (t.jenis === 'SETOR') {
      if (isThisMonth) setoranBulanIni += Number(t.nominal);
      if (isToday) setoranHariIni += Number(t.nominal);
    } else if (t.jenis === 'TARIK') {
      if (isThisMonth) penarikanBulanIni += Number(t.nominal);
      if (isToday) penarikanHariIni += Number(t.nominal);
    }
  });

  let totalSetoranUser = 0;
  let totalPenarikanUser = 0;
  let saldoUser = 0;

  if (nomor_anggota) {
    const userMember = members.find(m => m.nomor_anggota === nomor_anggota);
    saldoUser = userMember ? (userMember.saldo || 0) : 0;

    transactions
      .filter(t => t.nomor_anggota === nomor_anggota)
      .forEach(t => {
        if (t.jenis === 'SETOR') totalSetoranUser += Number(t.nominal);
        if (t.jenis === 'TARIK') totalPenarikanUser += Number(t.nominal);
      });
  }

  return {
    success: true,
    message: 'Berhasil mengambil statistik dashboard.',
    data: {
      totalAnggota: activeMembers.length,
      totalSaldo: totalSaldo,
      setoranBulanIni: setoranBulanIni,
      penarikanBulanIni: penarikanBulanIni,
      setoranHariIni: setoranHariIni,
      penarikanHariIni: penarikanHariIni,
      totalSetoranUser: totalSetoranUser,
      totalPenarikanUser: totalPenarikanUser,
      saldoUser: saldoUser,
    }
  };
}

/**
 * 12. Verify Member (Public - No sensitive data returned!)
 */
function verifyMember(idOrNumber) {
  const memberRes = getMember(idOrNumber);
  if (!memberRes.success) {
    return { success: false, message: 'Data anggota tidak ditemukan.' };
  }

  const m = memberRes.data;
  return {
    success: true,
    message: 'Anggota resmi terverifikasi.',
    data: {
      nama: m.nama,
      nomor_anggota: m.nomor_anggota,
      status: m.status,
      tanggal_gabung: m.tanggal_gabung,
    }
  };
}

/**
 * 13. Get Settings
 */
function getSettings() {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_PENGATURAN);
  if (!sheet) {
    return {
      success: true,
      data: {
        nama_aplikasi: 'Management Tabungan Pemuda Beji',
        nama_organisasi: 'Pemuda Beji',
        warna_primary: '#082B66',
        warna_secondary: '#123C82',
        warna_background: '#F5F7FA',
        logo_url: '',
      }
    };
  }

  const rows = sheet.getDataRange().getValues();
  const settings = {};
  for (let i = 1; i < rows.length; i++) {
    const k = String(rows[i][0]).trim();
    const v = String(rows[i][1]).trim();
    if (k) settings[k] = v;
  }

  return { success: true, message: 'Berhasil memuat pengaturan.', data: settings };
}

/**
 * 14. Update Settings
 */
function updateSettings(newSettings) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_PENGATURAN);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_PENGATURAN);
    sheet.appendRow(['key', 'value']);
  }

  const rows = sheet.getDataRange().getValues();
  const map = {};
  for (let i = 1; i < rows.length; i++) {
    map[String(rows[i][0]).trim()] = i + 1;
  }

  Object.entries(newSettings).forEach(([k, v]) => {
    if (map[k]) {
      sheet.getRange(map[k], 2).setValue(v);
    } else {
      sheet.appendRow([k, v]);
    }
  });

  return { success: true, message: 'Pengaturan berhasil disimpan.' };
}

/**
 * 15. Helper: Initialize Database Sheets & Headers automatically
 */
function initDatabase() {
  const ss = getSpreadsheet();

  // 1. Sheet ANGGOTA
  let sAnggota = ss.getSheetByName(SHEET_ANGGOTA);
  if (!sAnggota) {
    sAnggota = ss.insertSheet(SHEET_ANGGOTA);
    sAnggota.appendRow([
      'id', 'nomor_anggota', 'nama', 'username', 'password_hash',
      'hp', 'alamat', 'foto', 'tanggal_gabung', 'status', 'created_at', 'updated_at'
    ]);
  }

  // 2. Sheet TRANSAKSI
  let sTransaksi = ss.getSheetByName(SHEET_TRANSAKSI);
  if (!sTransaksi) {
    sTransaksi = ss.insertSheet(SHEET_TRANSAKSI);
    sTransaksi.appendRow([
      'id_transaksi', 'tanggal', 'nomor_anggota', 'nama', 'jenis',
      'nominal', 'saldo_sebelum', 'saldo_sesudah', 'keterangan', 'created_by', 'created_at'
    ]);
  }

  // 3. Sheet USER
  let sUser = ss.getSheetByName(SHEET_USER);
  if (!sUser) {
    sUser = ss.insertSheet(SHEET_USER);
    sUser.appendRow([
      'id', 'username', 'password_hash', 'role', 'nomor_anggota', 'status', 'created_at', 'last_login'
    ]);
    // Seed default admin and bendahara
    const nowStr = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');
    sUser.appendRow(['USR-001', 'admin', hashPassword('admin123'), 'ADMIN', '', 'AKTIF', nowStr, '']);
    sUser.appendRow(['USR-002', 'bendahara', hashPassword('bendahara123'), 'BENDAHARA', '', 'AKTIF', nowStr, '']);
  }

  // 4. Sheet PENGATURAN
  let sPengaturan = ss.getSheetByName(SHEET_PENGATURAN);
  if (!sPengaturan) {
    sPengaturan = ss.insertSheet(SHEET_PENGATURAN);
    sPengaturan.appendRow(['key', 'value']);
    sPengaturan.appendRow(['nama_aplikasi', 'Management Tabungan Pemuda Beji']);
    sPengaturan.appendRow(['nama_organisasi', 'Pemuda Beji']);
    sPengaturan.appendRow(['warna_primary', '#082B66']);
    sPengaturan.appendRow(['warna_secondary', '#123C82']);
    sPengaturan.appendRow(['warna_background', '#F5F7FA']);
    sPengaturan.appendRow(['logo_url', '']);
  }

  return { success: true, message: 'Database Google Sheets berhasil diinisialisasi!' };
}
