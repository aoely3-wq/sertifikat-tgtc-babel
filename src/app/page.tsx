'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import CertificatePreview from '@/components/CertificatePreview';
import {
  Award,
  Mail,
  Send,
  CheckCircle2,
  Search,
  Sparkles,
  Phone,
  Building,
  User,
  AlertCircle,
  Copy,
  RefreshCw,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { Participant, CertificateSettings } from '@/lib/types';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'claim' | 'search'>('claim');
  const [settings, setSettings] = useState<CertificateSettings | null>(null);

  // Load Settings on mount
  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data?.settings) {
          setSettings(data.settings);
        }
      })
      .catch(() => { });
  }, []);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [institution, setInstitution] = useState('');

  // Submission Status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successData, setSuccessData] = useState<{
    participant: Participant;
    certUrl: string;
    whatsappUrl: string;
    emailResult: { success: boolean; simulated?: boolean; error?: string };
    whatsappResult?: { success: boolean; simulated?: boolean; error?: string };
  } | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<Participant | null | undefined>(undefined);
  const [copiedLink, setCopiedLink] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  // Handle Form Submit
  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Silakan masukkan nama lengkap Anda.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Silakan masukkan alamat email yang valid.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 9) {
      setErrorMessage('Silakan masukkan nomor WhatsApp yang valid.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          institution: institution.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal memproses sertifikat');
      }

      setSuccessData(data);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Search Certificate
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);
      setSearchResult(undefined);
      setResendStatus(null);
      const res = await fetch(`/api/participants?search=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      setSearchResult(data.participant || null);
    } catch {
      setSearchResult(null);
    } finally {
      setIsSearching(false);
    }
  };

  // Resend Email from Search Tab
  const handleResendToEmail = async (id: string) => {
    try {
      setResendStatus('Mengirimkan...');
      const res = await fetch('/api/resend-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        setResendStatus('✅ File PDF berhasil dikirim ulang ke email Anda!');
      } else {
        setResendStatus(`⚠️ ${data.error || 'Gagal mengirim ulang'}`);
      }
    } catch {
      setResendStatus('Gagal mengirim email');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <Navbar />

      {/* Hero Banner Section */}
      <section className="bg-gradient-to-r from-[#0F2B5C] via-[#163870] to-[#1E40AF] text-white py-10 sm:py-14 border-b-4 border-[#D4AF37]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-amber-400/20 text-amber-300 px-3.5 py-1 rounded-full text-xs sm:text-sm font-semibold mb-4 border border-amber-400/30 shadow-sm backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Portal Distribusi e-Sertifikat Resmi</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-3">
            Kuliah Umum Treasury Goes To Campus
          </h1>
          <p className="text-base sm:text-xl text-blue-100 max-w-3xl mx-auto font-light leading-relaxed">
            Kanwil Ditjen Perbendaharaan Provinsi Kepulauan Bangka Belitung
          </p>
          <p className="text-xs sm:text-sm text-blue-200/80 mt-2">
            Peran Strategis APBN dalam Mendukung Pembangunan Berkelanjutan di Kepulauan Bangka Belitung
          </p>

          {/* Navigation Tabs */}
          <div className="flex justify-center mt-8">
            <div className="inline-flex bg-[#0A1E40] p-1.5 rounded-xl border border-white/10 shadow-lg">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('claim');
                  setSuccessData(null);
                }}
                className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${activeTab === 'claim'
                    ? 'bg-amber-400 text-slate-900 shadow-md scale-100'
                    : 'text-blue-200 hover:text-white hover:bg-white/5'
                  }`}
              >
                {settings?.isRegistrationOpen !== true ? (
                  <Lock className="w-4 h-4 text-rose-300" />
                ) : (
                  <Award className="w-4 h-4" />
                )}
                <span>
                  {settings?.isRegistrationOpen !== true
                    ? 'Klaim Mandiri (Ditutup)'
                    : 'Klaim Sertifikat Baru'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('search')}
                className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${activeTab === 'search'
                    ? 'bg-amber-400 text-slate-900 shadow-md scale-100'
                    : 'text-blue-200 hover:text-white hover:bg-white/5'
                  }`}
              >
                <Search className="w-4 h-4" />
                <span>Cari Status Sertifikat</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* TAB 1: KLAIM SERTIFIKAT BARU */}
        {activeTab === 'claim' && (
          <div>
            {settings?.isRegistrationOpen !== true ? (
              /* Tampilan Jika Akses Pendaftaran Ditutup */
              <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200 p-8 sm:p-12 text-center animate-fade-in">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8" />
                </div>
                <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 mb-3 border border-amber-200">
                  Pemberitahuan Resmi Panitia
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 mb-2">
                  Pendaftaran & Klaim e-Sertifikat Telah Ditutup
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed mb-6 max-w-lg mx-auto">
                  {settings?.registrationClosedMessage ||
                    'Akses klaim mandiri e-sertifikat untuk kegiatan ini telah ditutup oleh panitia penyelenggara. Bagi peserta yang telah terdaftar, Anda tetap dapat mencari dan mengunduh kembali dokumen sertifikat Anda.'}
                </p>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-6 text-left max-w-md mx-auto">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Search className="w-4 h-4 text-[#0F2B5C]" />
                    Sudah Pernah Mendaftar Sebelumnya?
                  </h4>
                  <p className="text-xs text-slate-500 mb-4 leading-normal">
                    Dokumen sertifikat Anda tetap tersimpan aman. Cukup masukkan email atau nomor WhatsApp Anda untuk mengunduh kembali file sertifikat resmi.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('search')}
                    className="w-full py-2.5 px-4 bg-[#0F2B5C] hover:bg-blue-900 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Search className="w-4 h-4" />
                    <span>Cari & Unduh Sertifikat Saya</span>
                  </button>
                </div>

                <p className="text-xs text-slate-400">
                  {settings?.organizer || 'Kantor Wilayah Direktorat Jenderal Perbendaharaan Provinsi Kepulauan Bangka Belitung'}
                </p>
              </div>
            ) : !successData ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Form Input Peserta */}
                <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-7">
                  <div className="flex items-center space-x-3 mb-5 pb-4 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0F2B5C] flex items-center justify-center font-bold">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">Formulir Peserta</h2>
                      <p className="text-xs text-slate-500">
                        Isi identitas Anda untuk penerbitan e-Sertifikat
                      </p>
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2.5 text-xs sm:text-sm text-rose-700">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <form onSubmit={handleClaim} className="space-y-4">
                    {/* Nama Lengkap */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nama Lengkap & Gelar <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Contoh: Muhammad Rizky Pratama, S.E."
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2B5C] focus:bg-white transition-colors"
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Nama ini yang akan dicetak di lembar e-Sertifikat resmi.
                      </p>
                    </div>

                    {/* Fakultas / Program Studi */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Fakultas / Program Studi
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Building className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          value={institution}
                          onChange={(e) => setInstitution(e.target.value)}
                          placeholder="Contoh: Fakultas Ekonomi dan Bisnis"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2B5C] focus:bg-white transition-colors"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Alamat Email Aktif <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="nama@email.com"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2B5C] focus:bg-white transition-colors"
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        File PDF e-Sertifikat resmi akan dikirimkan otomatis ke alamat email ini.
                      </p>
                    </div>

                    {/* Nomor WhatsApp */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nomor WhatsApp Aktif <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Phone className="w-4 h-4" />
                        </div>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="081234567890"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2B5C] focus:bg-white transition-colors"
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Tautan resmi e-Sertifikat dikirimkan ke nomor WhatsApp Anda.
                      </p>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-3">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 px-4 bg-[#0F2B5C] hover:bg-[#163870] active:scale-[0.99] text-white rounded-xl font-bold text-sm shadow-md shadow-blue-950/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Menerbitkan & Mengirimkan...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 text-amber-400" />
                            <span>Kirim ke Email & WhatsApp</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Live Real-Time Preview Sertifikat */}
                <div className="lg:col-span-7 space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Live Preview Tampilan
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Tampilan otomatis menyesuaikan input nama Anda
                    </span>
                  </div>

                  <CertificatePreview
                    name={name}
                    institution={institution}
                    settings={settings || undefined}
                  />

                  <div className="bg-blue-50 rounded-xl p-3.5 border border-blue-200 text-xs text-blue-900 flex items-start space-x-2.5">
                    <Mail className="w-4 h-4 text-[#0F2B5C] mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Mekanisme Distribusi:</strong> Dokumen PDF asli beresolusi tinggi akan dikirimkan langsung ke <strong>Email</strong> Anda, dan tautan dokumen akan diteruskan ke <strong>WhatsApp</strong> Anda.
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Success / Result View (Mekanisme Unduh Langsung Ditiadakan, Khusus Email & WA) */
              <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 sm:p-8 text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black mb-1">
                    e-Sertifikat Berhasil Diterbitkan!
                  </h2>
                  <p className="text-xs sm:text-sm text-emerald-100">
                    Sertifikat resmi atas nama{' '}
                    <strong className="text-white underline">{successData.participant.name}</strong> telah
                    diterbitkan.
                  </p>
                </div>

                <div className="p-6 sm:p-8 space-y-6">
                  {/* Delivery Status Notifications */}
                  <div className="space-y-3">
                    {/* 1. STATUS EMAIL */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start space-x-3 text-xs sm:text-sm text-blue-900">
                      <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-slate-900">
                          {successData.emailResult.simulated
                            ? 'Email Tercatat (Mode Simulasi Siap Kirim)'
                            : 'Dokumen PDF Telah Dikirim ke Email'}
                        </p>
                        <p className="text-slate-600 mt-0.5 text-xs">
                          {successData.emailResult.simulated
                            ? `File e-Sertifikat PDF dicatat untuk ${successData.participant.email}. Silakan cek kotak masuk Anda saat SMTP aktif.`
                            : `File lampiran PDF e-Sertifikat resmi telah dikirim ke kotak masuk ${successData.participant.email}.`}
                        </p>
                      </div>
                    </div>

                    {/* 2. STATUS WHATSAPP */}
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-3 text-xs sm:text-sm text-emerald-900">
                      <Phone className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-slate-900">
                          Pengiriman WhatsApp ke {successData.participant.phone}
                        </p>
                        <p className="text-slate-600 mt-0.5 text-xs">
                          Klik tombol di bawah untuk membuka pesan WhatsApp resmi dan melihat tautan e-Sertifikat Anda.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Certificate Information Card */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Nomor Sertifikat:</span>
                      <span className="font-mono font-bold text-[#0F2B5C]">
                        {successData.participant.certNumber}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Nama Penerima:</span>
                      <span className="font-bold text-slate-800">{successData.participant.name}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Alamat Email:</span>
                      <span className="text-slate-800 font-medium">{successData.participant.email}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-500">Nomor WhatsApp:</span>
                      <span className="text-slate-800 font-medium">{successData.participant.phone}</span>
                    </div>
                  </div>

                  {/* Primary Action Button: Open WhatsApp */}
                  <div className="pt-1">
                    <a
                      href={successData.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition-colors flex items-center justify-center space-x-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Buka & Terima Pesan di WhatsApp</span>
                    </a>
                  </div>

                  {/* Share Link Box */}
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Tautan e-Sertifikat Digital:
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        readOnly
                        value={successData.certUrl}
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-600 select-all"
                      />
                      <button
                        type="button"
                        onClick={() => copyToClipboard(successData.certUrl)}
                        className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedLink ? 'Tersalin!' : 'Salin'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Reset Button */}
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSuccessData(null);
                        setName('');
                        setEmail('');
                        setPhone('');
                        setInstitution('');
                      }}
                      className="text-xs text-slate-500 hover:text-slate-800 underline font-medium"
                    >
                      Klaim Sertifikat untuk Peserta Lainnya
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CARI STATUS SERTIFIKAT */}
        {activeTab === 'search' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-2 text-[#0F2B5C]">
                  <Search className="w-6 h-6 text-[#0F2B5C]" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                  Cek Status Sertifikat Anda
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Cari data pendaftaran Anda menggunakan Email atau Nomor WhatsApp
                </p>
              </div>

              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    required
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ketik email atau no. WhatsApp Anda..."
                    className="w-full pl-3 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2B5C] focus:bg-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-6 py-3 bg-[#0F2B5C] hover:bg-[#163870] text-white rounded-xl font-bold text-sm shadow-md transition-colors flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {isSearching ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Cari</span>
                    </>
                  )}
                </button>
              </form>

              {/* Hasil Pencarian */}
              {searchResult !== undefined && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  {searchResult ? (
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200">
                            Sertifikat Ditemukan
                          </span>
                          <h3 className="text-base font-bold text-slate-800 mt-1">
                            {searchResult.name}
                          </h3>
                          <p className="text-xs text-slate-500">
                            {searchResult.institution || 'Peserta Kuliah Umum TGTC Babel'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] text-slate-400">Nomor Sertifikat</p>
                          <p className="text-xs font-mono font-bold text-[#0F2B5C]">
                            {searchResult.certNumber}
                          </p>
                        </div>
                      </div>

                      {resendStatus && (
                        <div className="p-3 bg-blue-100/70 border border-blue-200 rounded-lg text-xs font-medium text-blue-900">
                          {resendStatus}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                        {/* Resend to Email */}
                        <button
                          type="button"
                          onClick={() => handleResendToEmail(searchResult.id)}
                          className="flex items-center justify-center space-x-1.5 py-2.5 px-3 bg-[#0F2B5C] hover:bg-[#163870] text-white rounded-lg font-semibold text-xs transition-colors"
                        >
                          <Mail className="w-4 h-4" />
                          <span>Kirim Ulang ke Email Saya</span>
                        </button>

                        {/* Open WhatsApp */}
                        {searchResult.whatsappUrl ? (
                          <a
                            href={searchResult.whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center space-x-1.5 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition-colors"
                          >
                            <Send className="w-4 h-4" />
                            <span>Buka di WhatsApp</span>
                          </a>
                        ) : (
                          <a
                            href={`/sertifikat/${searchResult.id}`}
                            className="flex items-center justify-center space-x-1.5 py-2.5 px-3 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg font-semibold text-xs transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>Lihat Sertifikat Digital</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-500 space-y-2">
                      <p className="text-sm font-semibold text-slate-700">
                        Data Sertifikat Tidak Ditemukan
                      </p>
                      <p className="text-xs max-w-sm mx-auto">
                        Pastikan email atau nomor WhatsApp yang Anda masukkan sesuai saat pendaftaran, atau silakan klaim sertifikat baru.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#0F2B5C] text-slate-300 text-xs py-8 border-t border-[#D4AF37]/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
          <p className="font-semibold text-white">
            Kantor Wilayah Direktorat Jenderal Perbendaharaan Provinsi Kepulauan Bangka Belitung
          </p>
          <p className="text-blue-200/70 text-[11px]">
            Kementerian Keuangan Republik Indonesia • Treasury Goes To Campus 2026
          </p>
        </div>
      </footer>
    </div>
  );
}
