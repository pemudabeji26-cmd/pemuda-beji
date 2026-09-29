import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useToast } from '../components/common/Toast';
import { AppSettings } from '../types';
import {
  Settings as SettingsIcon,
  Database,
  Link,
  CheckCircle,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Table,
} from 'lucide-react';

export const Settings: React.FC = () => {
  const toast = useToast();

  const [settings, setSettings] = useState<AppSettings>({
    nama_aplikasi: 'Management Tabungan Pemuda Beji',
    nama_organisasi: 'Pemuda Beji',
    warna_primary: '#082B66',
    warna_secondary: '#123C82',
    warna_background: '#F5F7FA',
    logo_url: '',
  });

  const [gasUrl, setGasUrl] = useState(apiService.getApiUrl());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const res = await apiService.getSettings();
      if (res.success && res.data) {
        setSettings(res.data);
      }
    };
    fetchSettings();
  }, []);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await apiService.testConnection();
      setTestResult(res);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch {
      setTestResult({
        success: false,
        message: 'Gagal menghubungi Apps Script. Periksa kembali URL Web App.',
      });
      toast.error('Gagal terhubung.');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiService.updateSettings(settings);
      if (res.success) {
        toast.success('Pengaturan aplikasi berhasil disimpan.');
      }
    } catch {
      toast.error('Gagal menyimpan pengaturan.');
    }
  };

  const handleResetData = () => {
    if (confirm('Apakah Anda yakin ingin mereset data lokal ke data awal (dummy seed)?')) {
      apiService.resetToDefault();
      toast.success('Data berhasil direset ke nilai awal. Muat ulang halaman.');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <h1 className="text-xl font-bold text-[#172033] tracking-tight">Pengaturan Aplikasi</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Konfigurasi identitas organisasi, koneksi Google Sheets, dan integrasi Google Apps Script.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Organization & Theme Settings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6">
            <h2 className="text-base font-bold text-[#172033] pb-3 border-b border-slate-100 flex items-center gap-2">
              <SettingsIcon className="w-4 h-4 text-[#082B66]" />
              <span>Identitas & Tampilan Aplikasi</span>
            </h2>

            <form onSubmit={handleSaveSettings} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nama Aplikasi
                </label>
                <input
                  type="text"
                  value={settings.nama_aplikasi}
                  onChange={e => setSettings({ ...settings, nama_aplikasi: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-[#082B66]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nama Organisasi
                </label>
                <input
                  type="text"
                  value={settings.nama_organisasi}
                  onChange={e => setSettings({ ...settings, nama_organisasi: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-[#082B66]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Warna Utama (Navy)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.warna_primary}
                      onChange={e => setSettings({ ...settings, warna_primary: e.target.value })}
                      className="w-9 h-9 rounded-md border border-slate-300 p-0.5"
                    />
                    <input
                      type="text"
                      value={settings.warna_primary}
                      readOnly
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Warna Sekunder
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.warna_secondary}
                      onChange={e => setSettings({ ...settings, warna_secondary: e.target.value })}
                      className="w-9 h-9 rounded-md border border-slate-300 p-0.5"
                    />
                    <input
                      type="text"
                      value={settings.warna_secondary}
                      readOnly
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Latar Belakang
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.warna_background}
                      onChange={e => setSettings({ ...settings, warna_background: e.target.value })}
                      className="w-9 h-9 rounded-md border border-slate-300 p-0.5"
                    />
                    <input
                      type="text"
                      value={settings.warna_background}
                      readOnly
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#082B66] hover:bg-[#061B3A] rounded-lg transition-colors cursor-pointer"
                >
                  Simpan Identitas
                </button>
              </div>
            </form>
          </div>

          {/* Google Apps Script Integration Panel */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6">
            <h2 className="text-base font-bold text-[#172033] pb-3 border-b border-slate-100 flex items-center gap-2">
              <Database className="w-4 h-4 text-[#082B66]" />
              <span>Koneksi Google Sheets & Google Apps Script</span>
            </h2>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  URL Google Apps Script Web App (VITE_API_URL)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={gasUrl}
                    onChange={e => setGasUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm font-mono text-slate-800"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Ditetapkan di file <code>.env</code> sebagai <code>VITE_API_URL</code>.
                </p>
              </div>

              {/* Status indicator */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      apiService.isConfigured() ? 'bg-emerald-500' : 'bg-blue-500'
                    }`}
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Mode:{' '}
                    {apiService.isConfigured()
                      ? 'Terhubung ke Google Apps Script Web App'
                      : 'Database Lokal Standby (Demo & Preview Mode)'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer shadow-2xs disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>Uji Koneksi</span>
                </button>
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                    testResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold">
                      {testResult.success ? 'Koneksi Berhasil' : 'Informasi Koneksi'}
                    </span>
                    <p className="mt-0.5">{testResult.message}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Google Sheet Setup Guide & Reset */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
            <h3 className="font-bold text-sm text-[#172033] flex items-center gap-2">
              <Table className="w-4 h-4 text-[#082B66]" />
              <span>Struktur 4 Sheet Wajib</span>
            </h3>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800">1. ANGGOTA</span>
                <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                  id, nomor_anggota, nama, username, password_hash, hp, alamat, foto, tanggal_gabung, status, created_at, updated_at
                </p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800">2. TRANSAKSI</span>
                <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                  id_transaksi, tanggal, nomor_anggota, nama, jenis, nominal, saldo_sebelum, saldo_sesudah, keterangan, created_by, created_at
                </p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800">3. USER</span>
                <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                  id, username, password_hash, role, nomor_anggota, status, created_at, last_login
                </p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800">4. PENGATURAN</span>
                <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                  key, value
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <p className="text-[11px] text-slate-500 leading-relaxed">
                File skrip lengkap <code>Code.gs</code> tersedia di folder <code>google-apps-script/Code.gs</code> siap di-paste ke Google Apps Script Spreadsheet Anda.
              </p>
            </div>
          </div>

          {/* Reset Demo Data */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-3">
            <h3 className="font-bold text-sm text-slate-800">Reset Data Uji Coba</h3>
            <p className="text-xs text-slate-500">
              Kembalikan seluruh data anggota, saldo kas, dan riwayat transaksi ke data default contoh.
            </p>
            <button
              type="button"
              onClick={handleResetData}
              className="w-full py-2 px-3 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
            >
              Reset Data ke Semula
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
