'use client';

import React from 'react';
import { Award, ShieldCheck, QrCode } from 'lucide-react';
import { CertificateSettings } from '@/lib/types';

interface CertificatePreviewProps {
  name: string;
  institution?: string;
  certNumber?: string;
  settings?: CertificateSettings;
}

export default function CertificatePreview({
  name,
  institution,
  certNumber = 'P Sertifik-072/WPB.10/2026',
  settings,
}: CertificatePreviewProps) {
  const displayName = name.trim() || 'Nama Lengkap Peserta';
  const displayInst = institution?.trim() || 'Universitas / Instansi Peserta';

  return (
    <div className="w-full">
      {/* ========================================================
          1. TAMPILAN KHUSUS LAYAR HP (MOBILE OPTIMIZED: sm:hidden)
          Tidak gepeng, tidak bertumpuk, proporsional & elegan
      ======================================================== */}
      <div className="block sm:hidden relative w-full bg-gradient-to-br from-amber-50/80 via-white to-slate-50 rounded-2xl shadow-md border-3 border-[#0F2B5C] p-4 overflow-hidden select-none">
        {/* Double Gold Border */}
        <div className="absolute inset-2 border border-[#D4AF37] pointer-events-none rounded-xl" />
        <div className="absolute inset-2.5 border border-[#D4AF37]/30 pointer-events-none rounded-lg" />

        {/* Watermark Logo Backing */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <Award className="w-64 h-64 text-[#0F2B5C]" />
        </div>

        {/* Mobile Header */}
        <div className="text-center relative z-10 pt-1 pb-2">
          <div className="flex items-center justify-center space-x-1.5 mb-0.5 text-[#0F2B5C]">
            <Award className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span className="text-[10px] font-extrabold tracking-wider uppercase">
              Kementerian Keuangan RI
            </span>
          </div>
          <h3 className="text-[11px] font-black text-[#0F2B5C] uppercase tracking-wide">
            Direktorat Jenderal Perbendaharaan
          </h3>
          <p className="text-[9px] text-slate-600 font-medium">
            Kanwil Provinsi Kepulauan Bangka Belitung
          </p>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mt-1" />
        </div>

        {/* Mobile Main Body */}
        <div className="text-center relative z-10 py-3 space-y-2">
          <div>
            <h1 className="text-xl font-serif font-black tracking-widest text-[#0F2B5C] uppercase">
              SERTIFIKAT
            </h1>
            <p className="text-[10px] text-slate-500 font-mono">
              Nomor: {certNumber}
            </p>
          </div>

          <p className="text-[10px] text-slate-500 italic">
            Diberikan dengan penghargaan kepada:
          </p>

          {/* Hero Name (Auto-wrap clean on mobile) */}
          <div className="py-1 px-2">
            <h2 className="text-lg font-serif font-bold text-[#0F2B5C] tracking-tight leading-snug break-words">
              {displayName}
            </h2>
            <div className="w-36 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-1" />
            <p className="text-[11px] text-slate-600 font-medium mt-1 break-words">
              {displayInst}
            </p>
          </div>

          <div className="pt-1">
            <p className="text-[10px] text-slate-500">
              Atas partisipasi aktifnya sebagai:
            </p>
            <div className="inline-block mt-0.5 mb-1">
              <span className="px-3 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-800 font-bold text-xs tracking-wider">
                PESERTA
              </span>
            </div>
            <p className="text-[11px] font-bold text-[#0F2B5C] px-2 leading-tight line-clamp-2">
              {settings?.eventTitle || 'Kuliah Umum Treasury Goes To Campus'}
            </p>
            {settings?.subTitle && (
              <p className="text-[9px] text-slate-500 italic mt-0.5 px-3 line-clamp-1">
                &ldquo;{settings.subTitle}&rdquo;
              </p>
            )}
          </div>
        </div>

        {/* Mobile Footer Section: Tanda Tangan Bersama & QR Tengah */}
        <div className="relative z-10 pt-3 border-t border-slate-200/80 mt-2 grid grid-cols-3 items-end gap-1.5 text-[9px]">
          {/* Kiri: Tanda Tangan Rektor UBB */}
          <div className="text-center">
            <p className="text-[8px] text-slate-600 font-medium leading-tight">
              {settings?.signatory2Title || 'Rektor UBB'}
            </p>
            <div className="h-6 flex items-center justify-center">
              <div className="w-16 border-b border-dashed border-slate-300" />
            </div>
            <p className="text-[8px] font-bold text-[#0F2B5C] underline underline-offset-1 truncate" title={settings?.signatory2Name || 'Prof. Dr. Ibrahim, S.Fil., M.Si.'}>
              {settings?.signatory2Name || 'Prof. Dr. Ibrahim'}
            </p>
          </div>

          {/* Tengah: QR Code Keabsahan */}
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 bg-white p-0.5 rounded border border-slate-300 shadow-sm flex items-center justify-center">
              <QrCode className="w-full h-full text-[#0F2B5C]" />
            </div>
            <div className="flex items-center space-x-0.5 text-emerald-700 font-bold mt-0.5">
              <ShieldCheck className="w-2.5 h-2.5" />
              <span className="text-[7px]">Terverifikasi</span>
            </div>
          </div>

          {/* Kanan: Tanda Tangan Kepala Kanwil DJPb (Posisi Tidak Berubah) */}
          <div className="text-center">
            <p className="text-[7px] text-slate-400 truncate">
              {settings?.eventDateText || '28 Okt 2026'}
            </p>
            <p className="text-[8px] text-slate-600 font-medium leading-tight">
              {settings?.signatoryTitle || 'Kepala Kanwil DJPb'}
            </p>
            <div className="h-6 flex items-center justify-center">
              <div className="w-16 border-b border-dashed border-slate-300" />
            </div>
            <p className="text-[8px] font-bold text-[#0F2B5C] underline underline-offset-1 truncate" title={settings?.signatoryName || 'Muhammad Mufti Arkan'}>
              {settings?.signatoryName || 'M. Mufti Arkan'}
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. TAMPILAN STANDAR KOMPUTER / TABLET (DESKTOP: hidden sm:flex)
          Format Mendatar Landscape A4 yang Presisi
      ======================================================== */}
      <div className="hidden sm:flex relative w-full aspect-[1.414/1] bg-gradient-to-br from-amber-50/70 via-white to-slate-50 rounded-xl shadow-lg border-4 border-[#0F2B5C] p-6 sm:p-7 flex-col justify-between overflow-hidden select-none">
        {/* Inner Gold Border */}
        <div className="absolute inset-3 border-2 border-[#D4AF37] pointer-events-none rounded-lg" />
        <div className="absolute inset-3.5 border border-[#D4AF37]/40 pointer-events-none rounded-md" />

        {/* Watermark Logo Backing */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <Award className="w-96 h-96 text-[#0F2B5C]" />
        </div>

        {/* Desktop Header */}
        <div className="text-center z-10 pt-1">
          <div className="flex items-center justify-center space-x-1.5 mb-1 text-[#0F2B5C]">
            <Award className="w-5 h-5 text-amber-600" />
            <span className="text-xs font-bold tracking-widest uppercase">
              Kementerian Keuangan Republik Indonesia
            </span>
          </div>
          <h3 className="text-sm font-extrabold text-[#0F2B5C] uppercase tracking-wider">
            Direktorat Jenderal Perbendaharaan
          </h3>
          <p className="text-xs text-slate-600 font-medium">
            Kantor Wilayah Provinsi Kepulauan Bangka Belitung
          </p>
          <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mt-1.5" />
        </div>

        {/* Desktop Main Content */}
        <div className="text-center z-10 my-auto py-2">
          <div className="inline-block">
            <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-widest text-[#0F2B5C] uppercase">
              SERTIFIKAT
            </h1>
            <p className="text-xs text-slate-500 font-mono tracking-wider">
              Nomor: {certNumber}
            </p>
          </div>

          <p className="text-xs text-slate-600 italic mt-2">
            Diberikan dengan penghargaan kepada:
          </p>

          {/* Hero Name */}
          <div className="my-2">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#0F2B5C] tracking-tight px-4 leading-tight">
              {displayName}
            </h2>
            <div className="w-64 sm:w-80 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-1" />
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
              {displayInst}
            </p>
          </div>

          <p className="text-xs text-slate-600">
            Atas partisipasi aktifnya sebagai:
          </p>
          <div className="inline-block mt-0.5">
            <span className="px-4 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-700 font-bold text-sm tracking-wider">
              PESERTA
            </span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-[#0F2B5C] mt-1 max-w-md mx-auto line-clamp-1">
            {settings?.eventTitle || 'Kuliah Umum Treasury Goes To Campus'}
          </p>
          {settings?.subTitle && (
            <p className="text-xs text-slate-500 italic mt-0.5 max-w-lg mx-auto line-clamp-1">
              &ldquo;{settings.subTitle}&rdquo;
            </p>
          )}
        </div>

        {/* Desktop Footer Section: Tanda Tangan Bersama & QR Code di Tengah */}
        <div className="grid grid-cols-3 items-end z-10 text-xs text-slate-700 px-4 sm:px-6 pb-1">
          {/* 1. Kiri: Tanda Tangan Rektor Universitas Bangka Belitung */}
          <div className="text-center min-w-[170px] max-w-[220px]">
            <p className="text-[11px] font-medium text-slate-700 leading-tight">
              {settings?.signatory2Title || 'Rektor Universitas Bangka Belitung'}
            </p>
            <div className="h-8 flex items-center justify-center">
              <div className="w-36 border-b border-dashed border-slate-400 opacity-60" />
            </div>
            <p className="text-xs font-bold text-[#0F2B5C] underline underline-offset-2">
              {settings?.signatory2Name || 'Prof. Dr. Ibrahim, S.Fil., M.Si.'}
            </p>
          </div>

          {/* 2. Tengah: QR Code Keabsahan Digital */}
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-13 h-13 sm:w-14 sm:h-14 bg-white p-1 rounded-lg border border-slate-300 shadow-sm flex items-center justify-center">
              <QrCode className="w-full h-full text-[#0F2B5C]" />
            </div>
            <div className="flex items-center space-x-1 text-emerald-700 font-semibold mt-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="text-[10px]">Resmi Terverifikasi</span>
            </div>
            <p className="text-[9px] text-slate-500">Pindai QR untuk keabsahan</p>
          </div>

          {/* 3. Kanan: Tanda Tangan Kepala Kanwil DJPb Prov. Kep. Babel (Posisi Tidak Berubah) */}
          <div className="text-center min-w-[170px] max-w-[220px] ml-auto">
            <p className="text-[10px] text-slate-500">
              {settings?.location || 'Pangkalpinang'}, {settings?.eventDateText || '28 Oktober 2026'}
            </p>
            <p className="text-[11px] font-medium text-slate-700 leading-tight">
              {settings?.signatoryTitle || 'Kepala Kanwil DJPb Prov. Kep. Babel'}
            </p>
            <div className="h-8 flex items-center justify-center">
              <div className="w-36 border-b border-dashed border-slate-400 opacity-60" />
            </div>
            <p className="text-xs font-bold text-[#0F2B5C] underline underline-offset-2">
              {settings?.signatoryName || 'Muhammad Mufti Arkan'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
