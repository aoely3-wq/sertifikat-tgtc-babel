'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import {
  QrCode,
  Download,
  Copy,
  Check,
  Smartphone,
  ExternalLink,
  Award,
  Sparkles,
  ArrowLeft,
  FileCheck2,
  Send,
  Maximize2
} from 'lucide-react';

export default function QrCodePage() {
  const [copied, setCopied] = useState(false);
  const vercelUrl = 'https://sertifikat-tgtc-babel.vercel.app';

  const handleCopy = () => {
    navigator.clipboard.writeText(vercelUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-white selection:bg-amber-400 selection:text-slate-900">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl mx-auto">
          {/* Top Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-slate-800/80 backdrop-blur border border-slate-700/60 p-3 sm:p-4 rounded-2xl shadow-xl">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Formulir
            </Link>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleFullscreen}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-700/80 hover:bg-slate-600 text-slate-200 hover:text-white transition-colors border border-slate-600/50"
                title="Tampilkan di Layar Penuh / Proyektor"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Layar Penuh Proyektor</span>
              </button>

              <a
                href="/qrcode-peserta.png"
                download="qrcode-peserta-tgtc-babel.png"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Gambar QR</span>
              </a>
            </div>
          </div>

          {/* Main Hero Card for Projector / Screen Display */}
          <div className="bg-gradient-to-b from-slate-800/90 to-slate-800/50 border border-slate-700 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur relative overflow-hidden text-center">
            {/* Background glow effects */}
            <div className="absolute -top-32 -left-32 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Badge Event */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-900/60 border border-blue-400/30 text-blue-200 text-xs sm:text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Kuliah Umum Treasury Goes To Campus (TGTC) 2026</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
              Pindai QR Code untuk Klaim e-Sertifikat
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto mb-8">
              Arahkan kamera smartphone Anda ke QR Code di bawah untuk membuka formulir presensi & klaim e-sertifikat resmi Kanwil DJPb Bangka Belitung.
            </p>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center mb-8">
              <div className="relative p-5 sm:p-7 bg-white rounded-3xl shadow-2xl border-4 border-amber-400/80 group">
                {/* QR Code Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/qrcode-peserta.png"
                  alt="QR Code Klaim Sertifikat Peserta TGTC"
                  className="w-56 h-56 sm:w-72 sm:h-72 object-contain rounded-xl"
                />

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-600 text-xs font-semibold">
                  <Smartphone className="w-4 h-4 text-blue-600 animate-pulse" />
                  <span>Scan via Kamera HP / Google Lens</span>
                </div>
              </div>

              {/* Direct Link Pill */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2 bg-slate-900/80 border border-slate-700/80 px-4 py-2 rounded-xl text-xs sm:text-sm">
                <span className="text-slate-400">Atau akses langsung via browser:</span>
                <a
                  href={vercelUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-4 flex items-center gap-1"
                >
                  {vercelUrl}
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={handleCopy}
                  className="ml-2 inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 3 Step Instructions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-700/60 text-left">
              <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-500/30">
                  1
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Scan QR Code</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Gunakan kamera HP atau aplikasi scanner untuk membuka link web.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold text-sm shrink-0 border border-amber-500/30">
                  2
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Isi Data Diri</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Ketik Nama Lengkap, Email, Nomor WhatsApp, dan Asal Kampus/Instansi.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-500/30">
                  3
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Terima Sertifikat</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Unduh file PDF beresolusi tinggi langsung atau terima via Email & WhatsApp.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
