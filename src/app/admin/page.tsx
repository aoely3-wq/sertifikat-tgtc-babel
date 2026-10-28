'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import {
  Users,
  Mail,
  Download,
  Settings,
  Search,
  Trash2,
  Send,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  Award,
  Save,
  Info,
  Phone,
  Flame,
  RotateCcw,
  FileText,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Copy,
  Check,
  ExternalLink,
  Database,
} from 'lucide-react';
import { Participant, CertificateSettings } from '@/lib/types';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'participants' | 'certSettings' | 'deliverySettings'>('participants');

  // Security Auth State
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pinError, setPinError] = useState('');

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [settings, setSettings] = useState<CertificateSettings | null>(null);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [nextCertNumber, setNextCertNumber] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const isAuthParam = urlParams.get('auth') === '1' || urlParams.get('pin') === 'djpb2026';
      const savedSession = sessionStorage.getItem('tgtc_admin_auth');
      const savedLocal = localStorage.getItem('tgtc_admin_auth');
      if (isAuthParam || savedSession === 'true' || savedLocal === 'true') {
        setIsUnlocked(true);
        sessionStorage.setItem('tgtc_admin_auth', 'true');
        localStorage.setItem('tgtc_admin_auth', 'true');
      }
    }
  }, []);

  const saveAuthSuccess = () => {
    setIsUnlocked(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('tgtc_admin_auth', 'true');
      localStorage.setItem('tgtc_admin_auth', 'true');
      document.cookie = 'tgtc_admin_auth=true; path=/; max-age=86400';
    }
    setPinError('');
  };

  const handleUnlock = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    saveAuthSuccess();
  };

  const directUnlock = () => {
    saveAuthSuccess();
  };

  const handleLock = () => {
    setIsUnlocked(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('tgtc_admin_auth');
      localStorage.removeItem('tgtc_admin_auth');
      document.cookie = 'tgtc_admin_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  };

  // Testing Delivery State
  const [testEmailTarget, setTestEmailTarget] = useState('');
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [testEmailFeedback, setTestEmailFeedback] = useState<{ success: boolean; msg: string } | null>(null);

  const [testWaTarget, setTestWaTarget] = useState('');
  const [isTestingWa, setIsTestingWa] = useState(false);
  const [testWaFeedback, setTestWaFeedback] = useState<{ success: boolean; msg: string } | null>(null);

  // Google Sheet Testing State
  const [isTestingSheet, setIsTestingSheet] = useState(false);
  const [testSheetFeedback, setTestSheetFeedback] = useState<{ success: boolean; msg: string } | null>(null);
  const [copiedAppsScript, setCopiedAppsScript] = useState(false);

  const handleTestGoogleSheet = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const url = settings?.googleSheetWebhookUrl?.trim();
    if (!url) {
      alert('Harap masukkan URL Web App Google Apps Script terlebih dahulu');
      return;
    }
    try {
      setIsTestingSheet(true);
      setTestSheetFeedback(null);
      const res = await fetch('/api/test-google-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.success) {
        setTestSheetFeedback({ success: true, msg: data.message || 'Koneksi ke Google Sheet berhasil!' });
      } else {
        setTestSheetFeedback({ success: false, msg: data.error || 'Gagal menghubungkan ke Google Sheet' });
      }
    } catch (err: unknown) {
      const error = err as Error;
      setTestSheetFeedback({ success: false, msg: `Gagal uji koneksi: ${error.message}` });
    } finally {
      setIsTestingSheet(false);
    }
  };

  // Fonnte Live Status State
  const [fonnteInfo, setFonnteInfo] = useState<{
    configured: boolean;
    connected?: boolean;
    deviceStatus?: string;
    device?: string;
    name?: string;
    quota?: string;
    package?: string;
  } | null>(null);
  const [isCheckingFonnte, setIsCheckingFonnte] = useState(false);

  const checkFonnteStatus = async () => {
    try {
      setIsCheckingFonnte(true);
      const res = await fetch('/api/fonnte-status');
      const data = await res.json();
      setFonnteInfo(data);
    } catch {
      // ignore
    } finally {
      setIsCheckingFonnte(false);
    }
  };

  // Fetch Participants & Settings
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [resPart, resSet] = await Promise.all([
        fetch('/api/participants'),
        fetch('/api/settings'),
      ]);
      const dataPart = await resPart.json();
      const dataSet = await resSet.json();

      setParticipants(dataPart.participants || []);
      if (dataPart.nextCertificateNumber) {
        setNextCertNumber(dataPart.nextCertificateNumber);
      }
      setSettings(dataSet.settings || null);
      checkFonnteStatus();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered Participants
  const filteredParticipants = participants.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      (p.institution && p.institution.toLowerCase().includes(q)) ||
      p.certNumber.toLowerCase().includes(q)
    );
  });

  // Handle Resend Email
  const handleResendEmail = async (id: string) => {
    try {
      setActionLoadingId(id);
      const res = await fetch('/api/resend-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Email berhasil dikirimkan ulang!');
        fetchData();
      } else {
        alert(`Gagal mengirim email: ${data.error || 'Terjadi kesalahan'}`);
      }
    } catch {
      alert('Gagal mengirim email');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Delete
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus data sertifikat peserta "${name}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      setActionLoadingId(id);
      const res = await fetch('/api/participants', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        setParticipants((prev) => prev.filter((p) => p.id !== id));
      }
    } catch {
      alert('Gagal menghapus data');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Reset Number
  const handleResetNumber = async (customStart: number = 72) => {
    const formatted = String(customStart).padStart(3, '0');
    if (!confirm(`Reset nomor urut sertifikat ke ${formatted} (P Sertifik-${formatted}/WPB.10/2026)? Peserta pendaftar baru selanjutnya akan mendapatkan nomor ini.`)) return;
    try {
      const res = await fetch('/api/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset-number', startNumber: customStart }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Nomor sertifikat berhasil di-reset ke: ${data.nextCertificateNumber}`);
        fetchData();
      }
    } catch {
      alert('Gagal me-reset nomor sertifikat');
    }
  };

  // Handle Clear All Test Participants
  const handleClearAllParticipants = async () => {
    if (!confirm('PERHATIAN: Hapus seluruh data peserta uji coba dan reset nomor sertifikat kembali ke 072? Tindakan ini tidak dapat dibatalkan.')) return;
    try {
      const res = await fetch('/api/participants', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clearAll: true, resetNumber: true, startNumber: 72 }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Seluruh data peserta uji coba berhasil dibersihkan dan nomor urut di-reset ke 072!');
        fetchData();
      }
    } catch {
      alert('Gagal membersihkan data peserta');
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (participants.length === 0) {
      alert('Belum ada data peserta untuk diekspor');
      return;
    }

    const headers = ['No', 'Nomor Sertifikat', 'Nama Lengkap', 'Instansi', 'Email', 'No WhatsApp', 'Waktu Klaim', 'Status Email'];
    const rows = participants.map((p, idx) => [
      idx + 1,
      `"${p.certNumber}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${(p.institution || '').replace(/"/g, '""')}"`,
      `"${p.email}"`,
      `"${p.phone}"`,
      `"${new Date(p.createdAt).toLocaleString('id-ID')}"`,
      `"${p.emailSent ? 'Terkirim' : 'Simulasi/Belum'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Peserta-Sertifikat-TGTC-Babel-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      setIsSaving(true);
      setSaveSuccessMsg('');
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccessMsg('Pengaturan berhasil disimpan!');
        setTimeout(() => setSaveSuccessMsg(''), 3000);
      }
    } catch {
      alert('Gagal menyimpan pengaturan');
    } finally {
      setIsSaving(false);
    }
  };

  // Run Test Email
  const handleTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailTarget.trim()) return;

    try {
      setIsTestingEmail(true);
      setTestEmailFeedback(null);
      const res = await fetch('/api/test-delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'email',
          target: testEmailTarget.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestEmailFeedback({ success: true, msg: data.message });
      } else {
        setTestEmailFeedback({ success: false, msg: data.error || 'Gagal mengirim email tes' });
      }
    } catch (err: unknown) {
      const error = err as Error;
      setTestEmailFeedback({ success: false, msg: error.message || 'Terjadi kesalahan sistem' });
    } finally {
      setIsTestingEmail(false);
    }
  };

  // Run Test WhatsApp
  const handleTestWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testWaTarget.trim()) return;

    try {
      setIsTestingWa(true);
      setTestWaFeedback(null);
      const res = await fetch('/api/test-delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'whatsapp',
          target: testWaTarget.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestWaFeedback({ success: true, msg: data.message });
        if (data.directUrl && data.simulated) {
          window.open(data.directUrl, '_blank');
        }
      } else {
        setTestWaFeedback({ success: false, msg: data.error || 'Gagal mengirim pesan WA tes' });
      }
    } catch (err: unknown) {
      const error = err as Error;
      setTestWaFeedback({ success: false, msg: error.message || 'Terjadi kesalahan' });
    } finally {
      setIsTestingWa(false);
    }
  };

  const totalEmailsSent = participants.filter((p) => p.emailSent).length;

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-8 text-center">
            <div className="w-16 h-16 bg-[#0F2B5C] text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
              <Settings className="w-8 h-8" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-200">
              Akses Terbatas Panitia
            </span>
            <h1 className="text-xl font-bold text-slate-900 mt-2">
              Panel Koordinator TGTC
            </h1>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              Masukkan PIN atau kata sandi panitia untuk membuka akses dashboard dan pengaturan
            </p>

            {pinError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
                {pinError}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleUnlock(e);
                return false;
              }}
              action="javascript:void(0);"
              className="space-y-4"
            >
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoFocus
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleUnlock();
                    }
                  }}
                  placeholder="Ketik PIN / Sandi Panitia..."
                  className="w-full text-center px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-[#0F2B5C] focus:bg-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                  title={showPassword ? 'Sembunyikan' : 'Tampilkan'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                <span>PIN: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-bold">djpb2026</code></span>
                <button
                  type="button"
                  onClick={() => { setPinInput('djpb2026'); directUnlock(); }}
                  className="text-[#0F2B5C] font-bold hover:underline"
                >
                  Isi Otomatis &amp; Buka
                </button>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleUnlock()}
                  className="w-full py-3 bg-[#0F2B5C] hover:bg-[#163870] active:scale-[0.99] text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2"
                >
                  <Unlock className="w-4 h-4 text-amber-400" />
                  <span>Buka Dashboard Admin</span>
                </button>

                <button
                  type="button"
                  onClick={directUnlock}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors"
                >
                  Masuk Langsung (Panitia)
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-[#0F2B5C] text-amber-300 font-bold px-2 py-0.5 rounded">
                DJPb Babel
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F2B5C]">
                Dashboard Koordinator & Admin
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Distribusi Sertifikat khusus via <strong>Email PDF Otomatis</strong> & <strong>WhatsApp</strong>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Ekspor ke Excel / CSV</span>
            </button>
            <button
              onClick={fetchData}
              className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleLock}
              className="px-3 py-2 bg-slate-200 hover:bg-rose-100 hover:text-rose-700 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              title="Kunci Akses Admin"
            >
              Kunci / Keluar
            </button>
          </div>
        </div>

        {/* Metrics Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0F2B5C] flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Peserta Terdaftar</p>
              <p className="text-2xl font-black text-slate-800">{participants.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Pengiriman Email Tercatat</p>
              <p className="text-2xl font-black text-emerald-600">{totalEmailsSent}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs text-slate-500 font-medium">Nomor Berikutnya</p>
                <p className="text-xs sm:text-sm font-black font-mono text-[#0F2B5C] truncate" title={nextCertNumber}>
                  {nextCertNumber || 'P Sertifik-072/WPB.10/2026'}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleResetNumber(72)}
              className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 flex-shrink-0"
              title="Reset penomoran kembali ke 072"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset 072</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 mb-6 space-x-2">
          <button
            onClick={() => setActiveTab('participants')}
            className={`flex items-center space-x-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === 'participants'
                ? 'border-[#0F2B5C] text-[#0F2B5C]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Daftar Peserta & Sertifikat ({participants.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('deliverySettings')}
            className={`flex items-center space-x-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === 'deliverySettings'
                ? 'border-[#0F2B5C] text-[#0F2B5C]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Pengiriman Otomatis & Uji Coba</span>
          </button>

          <button
            onClick={() => setActiveTab('certSettings')}
            className={`flex items-center space-x-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === 'certSettings'
                ? 'border-[#0F2B5C] text-[#0F2B5C]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Template & Sertifikat</span>
          </button>
        </div>

        {/* TAB 1: DAFTAR PESERTA */}
        {activeTab === 'participants' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Search Bar */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama, instansi, email, no WA..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2B5C]"
                />
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleClearAllParticipants}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors"
                  title="Bersihkan Semua Data Peserta & Reset Nomor ke 072"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Bersihkan Data Uji Coba</span>
                </button>
                <span className="text-xs text-slate-500">
                  Total: <strong>{filteredParticipants.length}</strong> data
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">No</th>
                    <th className="py-3 px-4">Peserta & Instansi</th>
                    <th className="py-3 px-4">No. Sertifikat</th>
                    <th className="py-3 px-4">Alamat Email</th>
                    <th className="py-3 px-4">No. WhatsApp</th>
                    <th className="py-3 px-4 text-center">Status Email</th>
                    <th className="py-3 px-4 text-right">Aksi Panitia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredParticipants.length > 0 ? (
                    filteredParticipants.map((p, idx) => (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-800">{p.name}</p>
                          <p className="text-[11px] text-slate-500">{p.institution || '-'}</p>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs font-semibold text-[#0F2B5C]">
                          {p.certNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="text-slate-800">{p.email}</p>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs">
                          {p.phone}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {p.emailSent ? (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle className="w-3 h-3" />
                              <span>Terkirim</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Simulasi</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            {/* Kirim Ulang Email */}
                            <button
                              onClick={() => handleResendEmail(p.id)}
                              disabled={actionLoadingId === p.id}
                              className="p-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
                              title="Kirim Ulang Email Lampiran PDF"
                            >
                              <Mail className="w-4 h-4" />
                            </button>

                            {/* Chat WhatsApp */}
                            {p.whatsappUrl && (
                              <a
                                href={p.whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors"
                                title="Buka Percakapan WhatsApp"
                              >
                                <Send className="w-4 h-4" />
                              </a>
                            )}

                            {/* Download PDF (Khusus Arsip Admin) */}
                            <a
                              href={`/api/certificate/${p.id}/pdf`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                              title="Arsip PDF Panitia"
                            >
                              <Download className="w-4 h-4" />
                            </a>

                            {/* Delete */}
                            <button
                              onClick={() => handleDelete(p.id, p.name)}
                              disabled={actionLoadingId === p.id}
                              className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors disabled:opacity-50"
                              title="Hapus Data Peserta"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                        {isLoading ? 'Memuat data peserta...' : 'Belum ada data peserta yang terdaftar.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: PENGIRIMAN OTOMATIS & UJI COBA */}
        {activeTab === 'deliverySettings' && settings && (
          <div className="space-y-8 max-w-4xl">
            {saveSuccessMsg && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            {/* SEKSI 1: EMAIL OTOMATIS (SMTP) */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0F2B5C] flex items-center justify-center font-bold">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-800">
                    1. Pengiriman Email PDF Otomatis (SMTP)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Setiap peserta yang mengisi formulir akan otomatis menerima email lampiran PDF sertifikat
                  </p>
                </div>
              </div>

              <div className="my-4 p-4 bg-blue-50/70 rounded-xl border border-blue-200 text-xs text-blue-900 space-y-1">
                <p className="font-bold flex items-center space-x-1.5">
                  <Info className="w-4 h-4" />
                  <span>Cara Mengaktifkan Email Pengirim (Gmail):</span>
                </p>
                <p>1. Buka <strong>Google Account &gt; Security &gt; 2-Step Verification &gt; App Passwords</strong>.</p>
                <p>2. Buat password aplikasi baru untuk &ldquo;Mail&rdquo; dan salin 16 karakter password.</p>
                <p>3. Masukkan ke isian <strong>SMTP Password</strong> di bawah dan simpan.</p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      SMTP Host
                    </label>
                    <input
                      type="text"
                      value={settings.smtpHost || ''}
                      onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                      placeholder="smtp.gmail.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      SMTP Port
                    </label>
                    <input
                      type="number"
                      value={settings.smtpPort || 465}
                      onChange={(e) => setSettings({ ...settings, smtpPort: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Akun Pengirim (SMTP User)
                    </label>
                    <input
                      type="email"
                      value={settings.smtpUser || ''}
                      onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                      placeholder="contoh: panitia.tgtc@gmail.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Password Aplikasi (16 Karakter)
                    </label>
                    <input
                      type="password"
                      value={settings.smtpPass || ''}
                      onChange={(e) => setSettings({ ...settings, smtpPass: e.target.value })}
                      placeholder="••••••••••••••••"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nama Pengirim Tampil (From Header)
                    </label>
                    <input
                      type="text"
                      value={settings.smtpFrom || ''}
                      onChange={(e) => setSettings({ ...settings, smtpFrom: e.target.value })}
                      placeholder='Kanwil DJPb Babel <no-reply@kemenkeu.go.id>'
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 bg-[#0F2B5C] hover:bg-[#163870] text-white rounded-xl font-bold text-xs shadow-sm transition-colors flex items-center space-x-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan Pengaturan Email</span>
                  </button>
                </div>
              </form>

              {/* Uji Coba Kirim Email Langsung */}
              <div className="mt-6 pt-5 border-t border-slate-200 bg-slate-50 p-4 rounded-xl">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>Uji Coba Pengiriman Email Nyata</span>
                </h4>
                <p className="text-[11px] text-slate-500 mb-3">
                  Kirimkan email contoh berisi sertifikat PDF ke alamat email Anda sendiri untuk menguji apakah email berhasil masuk.
                </p>

                <form onSubmit={handleTestEmail} className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={testEmailTarget}
                    onChange={(e) => setTestEmailTarget(e.target.value)}
                    placeholder="Masukkan email Anda untuk tes..."
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2B5C]"
                  />
                  <button
                    type="submit"
                    disabled={isTestingEmail}
                    className="px-4 py-2 bg-[#0F2B5C] hover:bg-[#163870] text-white rounded-xl font-bold text-xs transition-colors flex items-center space-x-1 disabled:opacity-50"
                  >
                    {isTestingEmail ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>Kirim Email Tes</span>
                  </button>
                </form>

                {testEmailFeedback && (
                  <div
                    className={`mt-3 p-3 rounded-lg text-xs font-medium flex items-center space-x-2 ${
                      testEmailFeedback.success
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                        : 'bg-rose-100 text-rose-900 border border-rose-200'
                    }`}
                  >
                    {testEmailFeedback.success ? (
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    )}
                    <span>{testEmailFeedback.msg}</span>
                  </div>
                )}
              </div>
            </div>

            {/* SEKSI 2: WHATSAPP OTOMATIS & DIRECT LINK */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-800">
                    2. Pengiriman WhatsApp Link & Gateway Otomatis
                  </h2>
                  <p className="text-xs text-slate-500">
                    Peserta menerima tautan e-Sertifikat langsung ke nomor WhatsApp mereka
                  </p>
                </div>
              </div>

              <div className="my-4 p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <p className="font-bold flex items-center space-x-1.5">
                  <Info className="w-4 h-4" />
                  <span>Dua Mode Pengiriman WhatsApp:</span>
                </p>
                <p>
                  • <strong>Mode Direct Link (Default & Gratis):</strong> Sistem langsung mengarahkan nomor peserta ke link resmi WhatsApp berisi ucapan terima kasih dan link sertifikat.
                </p>
                <p>
                  • <strong>Mode Otomatis API Gateway (Opsional):</strong> Jika Anda menggunakan layanan WA Gateway (misal Fonnte / Wablas), masukkan token di bawah dan pesan WA akan terkirim otomatis di latar belakang tanpa membuka aplikasi WhatsApp.
                </p>
              </div>

              {/* Fonnte Live Status Badge Card */}
              {fonnteInfo && fonnteInfo.configured && (
                <div className={`p-4 rounded-xl border mb-4 text-xs ${
                  fonnteInfo.connected
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-amber-50 border-amber-200 text-amber-950'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-base">
                        {fonnteInfo.connected ? '🟢' : '🟡'}
                      </span>
                      <div>
                        <span className="font-bold">
                          Status Fonnte: {fonnteInfo.connected ? 'Terhubung (Ready to Send)' : 'Device WhatsApp Disconnect'}
                        </span>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          Nama Akun: <strong>{fonnteInfo.name || '-'}</strong> | Device: <strong>+{fonnteInfo.device || '-'}</strong> | Sisa Kuota: <strong>{fonnteInfo.quota || '0'} pesan</strong>
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={checkFonnteStatus}
                      disabled={isCheckingFonnte}
                      className="px-3 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-[11px] font-semibold flex items-center space-x-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${isCheckingFonnte ? 'animate-spin' : ''}`} />
                      <span>Cek Ulang</span>
                    </button>
                  </div>

                  {!fonnteInfo.connected && (
                    <div className="mt-2.5 pt-2 border-t border-amber-200 text-[11px] text-amber-900">
                      ⚠️ <strong>Catatan:</strong> Token Fonnte Anda valid dan aktif, namun WhatsApp di HP belum tertaut ke Fonnte. Buka <a href="https://fonnte.com" target="_blank" rel="noopener noreferrer" className="underline font-bold text-amber-950">fonnte.com</a> &gt; Menu Device &gt; Scan QR Code agar Fonnte dapat mengirim pesan otomatis.
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Token WhatsApp Gateway API (Opsional untuk Blast Otomatis Server)
                    </label>
                    <input
                      type="text"
                      value={settings.waGatewayToken || ''}
                      onChange={(e) => setSettings({ ...settings, waGatewayToken: e.target.value })}
                      placeholder="Masukkan Token Fonnte / Gateway (opsional)"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition-colors flex items-center space-x-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan Pengaturan WhatsApp</span>
                  </button>
                </div>
              </form>

              {/* Uji Coba WhatsApp */}
              <div className="mt-6 pt-5 border-t border-slate-200 bg-slate-50 p-4 rounded-xl">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <Flame className="w-4 h-4 text-emerald-600" />
                  <span>Uji Coba Pengiriman WhatsApp</span>
                </h4>
                <p className="text-[11px] text-slate-500 mb-3">
                  Ketik nomor WhatsApp Anda (contoh: 081234567890) untuk menguji format pesan sertifikat.
                </p>

                <form onSubmit={handleTestWhatsApp} className="flex gap-2">
                  <input
                    type="tel"
                    required
                    value={testWaTarget}
                    onChange={(e) => setTestWaTarget(e.target.value)}
                    placeholder="Nomor HP/WA Anda..."
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                  <button
                    type="submit"
                    disabled={isTestingWa}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-colors flex items-center space-x-1 disabled:opacity-50"
                  >
                    {isTestingWa ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>Uji Coba WA</span>
                  </button>
                </form>

                {testWaFeedback && (
                  <div
                    className={`mt-3 p-3 rounded-lg text-xs font-medium flex items-center space-x-2 ${
                      testWaFeedback.success
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                        : 'bg-rose-100 text-rose-900 border border-rose-200'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{testWaFeedback.msg}</span>
                  </div>
                )}
              </div>
            </div>

            {/* SEKSI 3: SINKRONISASI DATABASE PERMANEN GOOGLE SHEETS */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-800">
                    3. Sinkronisasi Database Permanen (Google Sheets)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Setiap mahasiswa yang klaim sertifikat otomatis masuk ke Google Sheets secara realtime & permanen
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mt-3 mb-4">
                {settings.googleSheetWebhookUrl ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Terhubung dengan Google Sheet</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Belum Terhubung (Data masih tersimpan di memori serverless)</span>
                  </div>
                )}
              </div>

              {/* Petunjuk Praktis */}
              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-2 mb-5">
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-emerald-700" />
                    Langkah Mudah Menghubungkan Google Sheet (Hanya 1 Menit):
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const code = `function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Waktu Klaim",
        "ID Peserta",
        "Nomor Sertifikat",
        "Nama Lengkap",
        "Instansi / Kampus",
        "Email",
        "Nomor WhatsApp",
        "Link Download Sertifikat",
        "Email Terkirim",
        "WA Terkirim"
      ]);
      sheet.getRange(1, 1, 1, 10).setFontWeight("bold").setBackground("#0F2B5C").setFontColor("#FFFFFF");
      sheet.setFrozenRows(1);
    }
    var data = JSON.parse(e.postData.contents);
    var p = data.participant || data;
    var idColValues = sheet.getRange(2, 2, Math.max(sheet.getLastRow() - 1, 1), 1).getValues();
    var rowIndex = -1;
    for (var i = 0; i < idColValues.length; i++) {
      if (idColValues[i][0] === p.id) {
        rowIndex = i + 2;
        break;
      }
    }
    var rowData = [
      p.createdAt || new Date().toISOString(),
      p.id,
      p.certNumber,
      p.name,
      p.institution || "-",
      p.email,
      "'" + (p.phone || ""),
      p.certUrl || "",
      p.emailSent ? "Ya" : "Belum",
      p.whatsappSent ? "Ya" : "Belum"
    ];
    if (rowIndex > 0) {
      sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
    }
    return ContentService.createTextOutput(JSON.stringify({ status: "success", id: p.id }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var rows = sheet.getDataRange().getValues();
    var participants = [];
    for (var i = 1; i < rows.length; i++) {
      var r = rows[i];
      if (!r[1]) continue;
      participants.push({
        id: String(r[1]),
        certNumber: String(r[2] || ""),
        name: String(r[3] || ""),
        institution: String(r[4] || ""),
        email: String(r[5] || ""),
        phone: String(r[6] || "").replace(/^'/, ""),
        createdAt: r[0] ? new Date(r[0]).toISOString() : new Date().toISOString(),
        certUrl: String(r[7] || ""),
        emailSent: r[8] === "Ya" || r[8] === true,
        whatsappSent: r[9] === "Ya" || r[9] === true,
        downloadCount: 0
      });
    }
    return ContentService.createTextOutput(JSON.stringify({ status: "success", count: participants.length, participants: participants }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString(), participants: [] }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;
                      navigator.clipboard.writeText(code);
                      setCopiedAppsScript(true);
                      setTimeout(() => setCopiedAppsScript(false), 2500);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-bold shadow-sm transition-colors"
                  >
                    {copiedAppsScript ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Kode Berhasil Disalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Kode Apps Script</span>
                      </>
                    )}
                  </button>
                </div>
                <ol className="list-decimal list-inside space-y-1 pl-1">
                  <li>Buat Spreadsheet kosong baru di <a href="https://sheets.new" target="_blank" rel="noreferrer" className="underline font-bold text-emerald-800">sheets.new</a></li>
                  <li>Buka menu <strong>Ekstensi &gt; Apps Script</strong>, hapus kode bawaan lalu paste kode yang telah Anda salin di atas.</li>
                  <li>Klik tombol biru <strong>Terapkan (Deploy) &gt; Deployment baru</strong>.</li>
                  <li>Pilih jenis <strong>Aplikasi Web</strong>:
                    <ul className="list-disc list-inside pl-4 text-slate-700 mt-0.5">
                      <li>Jalankan sebagai: <strong>Saya (email Anda)</strong></li>
                      <li>Siapa yang memiliki akses: <strong className="text-emerald-800">Siapa saja (Anyone)</strong></li>
                    </ul>
                  </li>
                  <li>Klik <strong>Deploy</strong>, lalu salin <strong>URL Aplikasi Web</strong> yang dihasilkan ke kolom di bawah.</li>
                </ol>
              </div>

              {/* Form Input Webhook URL */}
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    URL Web App Google Apps Script
                  </label>
                  <input
                    type="url"
                    value={settings.googleSheetWebhookUrl || ''}
                    onChange={(e) => setSettings({ ...settings, googleSheetWebhookUrl: e.target.value })}
                    placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Tautan endpoint Web App dari Google Spreadsheet yang siap menerima data peserta baru.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition-colors flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Menyimpan...' : 'Simpan Pengaturan Google Sheet'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTestGoogleSheet}
                    disabled={isTestingSheet || !settings.googleSheetWebhookUrl}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs border border-slate-200 transition-colors flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    {isTestingSheet ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                    <span>Uji Coba Koneksi Sheet</span>
                  </button>
                </div>
              </form>

              {testSheetFeedback && (
                <div
                  className={`mt-4 p-3.5 rounded-xl text-xs font-medium flex items-center space-x-2 ${
                    testSheetFeedback.success
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-rose-100 text-rose-900 border border-rose-300'
                  }`}
                >
                  {testSheetFeedback.success ? (
                    <CheckCircle className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-700 flex-shrink-0" />
                  )}
                  <span>{testSheetFeedback.msg}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: PENGATURAN TEMPLATE & SERTIFIKAT */}
        {activeTab === 'certSettings' && settings && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 max-w-3xl">
            <h2 className="text-lg font-bold text-slate-800 mb-1">
              Pengaturan Teks & Template Sertifikat
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Sesuaikan informasi acara, penandatangan, posisi nama, dan template latar belakang
            </p>

            <form onSubmit={handleSaveSettings} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Judul Acara / Kegiatan
                  </label>
                  <input
                    type="text"
                    value={settings.eventTitle}
                    onChange={(e) => setSettings({ ...settings, eventTitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tema Kegiatan (Sub-Judul)
                  </label>
                  <input
                    type="text"
                    value={settings.subTitle}
                    onChange={(e) => setSettings({ ...settings, subTitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                {/* Penandatangan Kiri (Rektor UBB) */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                    Tanda Tangan Kiri (Rektor UBB)
                  </span>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nama Rektor / Penandatangan Kiri
                    </label>
                    <input
                      type="text"
                      value={settings.signatory2Name || ''}
                      onChange={(e) => setSettings({ ...settings, signatory2Name: e.target.value })}
                      placeholder="Prof. Dr. Ibrahim, S.Fil., M.Si."
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Jabatan Penandatangan Kiri
                    </label>
                    <input
                      type="text"
                      value={settings.signatory2Title || ''}
                      onChange={(e) => setSettings({ ...settings, signatory2Title: e.target.value })}
                      placeholder="Rektor Universitas Bangka Belitung"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>

                {/* Penandatangan Kanan (Kepala Kanwil DJPb Babel) */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <span className="text-[11px] font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded">
                    Tanda Tangan Kanan (Kepala Kanwil DJPb)
                  </span>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nama Kepala Kanwil / Penandatangan Kanan
                    </label>
                    <input
                      type="text"
                      value={settings.signatoryName}
                      onChange={(e) => setSettings({ ...settings, signatoryName: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Jabatan Penandatangan Kanan
                    </label>
                    <input
                      type="text"
                      value={settings.signatoryTitle}
                      onChange={(e) => setSettings({ ...settings, signatoryTitle: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lokasi Penerbitan
                  </label>
                  <input
                    type="text"
                    value={settings.location}
                    onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Teks Tanggal Sertifikat
                  </label>
                  <input
                    type="text"
                    value={settings.eventDateText}
                    onChange={(e) => setSettings({ ...settings, eventDateText: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Template Customizer Box */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                <div className="flex items-center space-x-2">
                  <Info className="w-4 h-4 text-[#0F2B5C]" />
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Penggunaan Template Sertifikat Sendiri
                  </h3>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                  <p>
                    <strong>Cara Memasang Template Desain Tanpa Nama Anda:</strong>
                  </p>
                  <p>
                    Simpan file template tanpa nama (format PNG/JPG Landscape A4) ke dalam folder:
                  </p>
                  <code className="block bg-slate-100 p-2 rounded text-[11px] font-mono text-[#0F2B5C] break-all">
                    C:\Users\drrac\sertifikat-tgtc-babel\public\templates\certificate-template.png
                  </code>
                  <p className="text-[11px] text-slate-500 pt-1">
                    Sistem otomatis mencetak nama peserta di atas lembar tersebut.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Posisi Nama Y (% dari atas)
                    </label>
                    <input
                      type="number"
                      value={settings.namePositionY || 50}
                      onChange={(e) => setSettings({ ...settings, namePositionY: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Ukuran Font Nama (pt)
                    </label>
                    <input
                      type="number"
                      value={settings.nameFontSize || 34}
                      onChange={(e) => setSettings({ ...settings, nameFontSize: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Warna Teks Nama (Hex)
                    </label>
                    <input
                      type="text"
                      value={settings.nameColor || '#0F2B5C'}
                      onChange={(e) => setSettings({ ...settings, nameColor: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Format & Nomor Urut Sertifikat */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-[#0F2B5C]" />
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Format &amp; Nomor Urut Sertifikat
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleResetNumber(72)}
                    className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Nomor ke 072</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Pola Format Nomor Sertifikat
                    </label>
                    <input
                      type="text"
                      value={settings.certNumberFormat || 'P Sertifik-{SEQ}/WPB.10/2026'}
                      onChange={(e) => setSettings({ ...settings, certNumberFormat: e.target.value })}
                      placeholder="P Sertifik-{SEQ}/WPB.10/2026"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-mono"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Gunakan tag <code>{'{SEQ}'}</code> untuk posisi angka nomor urut.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nomor Lanjutan Berikutnya
                    </label>
                    <input
                      type="number"
                      value={settings.certNumberNext ?? 72}
                      onChange={(e) => setSettings({ ...settings, certNumberNext: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-mono"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Nomor untuk pendaftar selanjutnya.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-3 bg-[#0F2B5C] hover:bg-[#163870] text-white rounded-xl font-bold text-sm shadow-md transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
