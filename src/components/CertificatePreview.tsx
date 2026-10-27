'use client';

import React, { useState, useEffect } from 'react';
import { Award, ShieldCheck, QrCode } from 'lucide-react';
import { CertificateSettings } from '@/lib/types';

interface CertificatePreviewProps {
  name: string;
  institution?: string;
  certNumber?: string;
  settings?: CertificateSettings;
}

const DEFAULT_SETTINGS: CertificateSettings = {
  eventTitle: "Kuliah Umum: “APBN Kite, Ape Manfaat E?”",
  subTitle: "Peran Strategis APBN dan Kebijakan Fiskal dalam Penguatan Ekonomi Lokal",
  organizer: "Kantor Wilayah Direktorat Jenderal Perbendaharaan Provinsi Kepulauan Bangka Belitung",
  location: "Pangkalpinang",
  eventDateText: "29 Oktober 2026",
  signatoryName: "Muhamad Mufti Arkan, S.E., S.S.T., Ak., M.Acc",
  signatoryTitle: "Kepala Kanwil DJPb Provinsi Bangka Belitung",
  signatory2Name: "Prof. Dr. Ibrahim, M.Si",
  signatory2Title: "Rektor Universitas Bangka Belitung",
  namePositionY: 45.8,
  nameFontSize: 26,
  nameColor: "#0F2B5C",
  certNumberPositionY: 34.8,
  useCustomTemplate: true,
  customTemplatePath: "/templates/certificate-template.jpeg",
};

export default function CertificatePreview({
  name,
  institution,
  certNumber = 'P Sertifik-072/WPB.10/2026',
  settings,
}: CertificatePreviewProps) {
  const [currentSettings, setCurrentSettings] = useState<CertificateSettings>(
    settings || DEFAULT_SETTINGS
  );

  useEffect(() => {
    if (settings) {
      setCurrentSettings(settings);
    } else {
      fetch('/api/settings')
        .then((res) => res.json())
        .then((data) => {
          if (data?.settings) {
            setCurrentSettings(data.settings);
          }
        })
        .catch(() => {});
    }
  }, [settings]);

  const displayName = name.trim() || 'Nama Lengkap Peserta';
  const displayInst = institution?.trim() || 'Fakultas / Program Studi';
  const cleanCertNum = certNumber.replace(/^Nomor:\s*/i, '');

  if (currentSettings.useCustomTemplate) {
    const templateImg = currentSettings.customTemplatePath || '/templates/certificate-template.jpeg';

    return (
      <div className="w-full">
        {/* Container Sertifikat Responsif Menggunakan @container agar font berskala presisi tanpa bertumpuk */}
        <div className="@container relative w-full aspect-[1.414/1] rounded-xl shadow-lg border border-slate-300 overflow-hidden select-none bg-slate-100">
          {/* Template Latar Belakang (Garis horizontal hitam di bawah prodi telah dihilangkan) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={templateImg}
            alt="Template Sertifikat"
            className="absolute inset-0 w-full h-full object-fill pointer-events-none"
          />

          {/* Nomor Sertifikat (Ditempatkan tepat di baris 'NO :' tanpa bertumpuk dengan SERTIFIKAT PENGHARGAAN) */}
          <div
            className="absolute text-center transform -translate-x-1/2 -translate-y-1/2 pointer-events-none whitespace-nowrap"
            style={{
              left: '52.3%',
              top: '34.8%',
              fontSize: 'clamp(8px, 1.6cqw, 15px)',
            }}
          >
            <span className="font-sans font-bold text-slate-900 tracking-wider">
              {cleanCertNum}
            </span>
          </div>

          {/* Nama Peserta (Tepat di atas garis biru utama, lapang dan tidak bertumpuk) */}
          <div
            className="absolute text-center transform -translate-x-1/2 -translate-y-1/2 pointer-events-none px-2 max-w-[75%]"
            style={{
              left: '50%',
              top: '44.5%',
              fontSize: 'clamp(11px, 2.4cqw, 24px)',
            }}
          >
            <h2
              className="font-sans font-bold tracking-tight leading-tight truncate"
              style={{ color: currentSettings.nameColor || '#0F2B5C' }}
            >
              {displayName}
            </h2>
          </div>

          {/* Fakultas / Program Studi (Tepat di bawah nama/garis biru, garis hitam sudah dihapus) */}
          {displayInst && (
            <div
              className="absolute text-center transform -translate-x-1/2 -translate-y-1/2 pointer-events-none px-2 max-w-[70%]"
              style={{
                left: '50%',
                top: '51.8%',
                fontSize: 'clamp(7.5px, 1.4cqw, 13px)',
              }}
            >
              <p className="font-sans font-medium text-slate-700 tracking-normal truncate">
                {displayInst}
              </p>
            </div>
          )}

          {/* QR Code Keabsahan Digital (Di antara kedua penandatangan yang sudah melekat di template) */}
          <div
            className="absolute flex flex-col items-center justify-center transform -translate-x-1/2 pointer-events-none"
            style={{
              left: '50%',
              bottom: '7%',
            }}
          >
            <div className="w-[7cqw] h-[7cqw] min-w-[22px] min-h-[22px] max-w-[46px] max-h-[46px] bg-white p-0.5 rounded shadow-sm flex items-center justify-center">
              <QrCode className="w-full h-full text-[#0F2B5C]" />
            </div>
            <span
              className="text-slate-500 font-sans mt-0.5 whitespace-nowrap"
              style={{ fontSize: 'clamp(5px, 0.8cqw, 8px)' }}
            >
              Scan Keabsahan Digital
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Fallback Standalone Vector Design (Jika custom template dinonaktifkan)
  return (
    <div className="w-full">
      {/* Tampilan Standar Responsif Landscape A4 */}
      <div className="relative w-full aspect-[1.414/1] bg-gradient-to-br from-amber-50/70 via-white to-slate-50 rounded-xl shadow-lg border-4 border-[#0F2B5C] p-4 sm:p-7 flex flex-col justify-between overflow-hidden select-none">
        <div className="absolute inset-3 border-2 border-[#D4AF37] pointer-events-none rounded-lg" />
        <div className="absolute inset-3.5 border border-[#D4AF37]/40 pointer-events-none rounded-md" />

        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <Award className="w-96 h-96 text-[#0F2B5C]" />
        </div>

        <div className="text-center z-10 pt-1">
          <div className="flex items-center justify-center space-x-1.5 mb-1 text-[#0F2B5C]">
            <Award className="w-4 h-4 text-amber-600" />
            <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase">
              Kementerian Keuangan Republik Indonesia
            </span>
          </div>
          <h3 className="text-xs sm:text-sm font-extrabold text-[#0F2B5C] uppercase tracking-wider">
            Direktorat Jenderal Perbendaharaan
          </h3>
          <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
            Kantor Wilayah Provinsi Kepulauan Bangka Belitung
          </p>
        </div>

        <div className="text-center z-10 my-auto py-1">
          <h1 className="text-lg sm:text-2xl font-serif font-black tracking-widest text-[#0F2B5C] uppercase">
            SERTIFIKAT
          </h1>
          <p className="text-[10px] sm:text-xs text-slate-500 font-mono tracking-wider">
            Nomor: {certNumber}
          </p>
          <p className="text-[10px] sm:text-xs text-slate-600 italic mt-1">
            Diberikan dengan penghargaan kepada:
          </p>

          <div className="my-1.5">
            <h2 className="text-base sm:text-2xl font-serif font-bold text-[#0F2B5C] tracking-tight px-4 leading-tight">
              {displayName}
            </h2>
            <div className="w-48 sm:w-64 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-0.5" />
            <p className="text-[10px] sm:text-xs text-slate-600 font-medium mt-0.5">
              {displayInst}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 items-end z-10 text-[10px] sm:text-xs text-slate-700 px-2 sm:px-6 pb-1">
          <div className="text-center">
            <p className="text-[9px] sm:text-[11px] font-medium text-slate-700 leading-tight">
              {currentSettings?.signatory2Title || 'Rektor UBB'}
            </p>
            <div className="h-6 flex items-center justify-center">
              <div className="w-24 sm:w-36 border-b border-dashed border-slate-400 opacity-60" />
            </div>
            <p className="text-[9px] sm:text-xs font-bold text-[#0F2B5C] underline underline-offset-2 truncate">
              {currentSettings?.signatory2Name || 'Prof. Dr. Ibrahim, M.Si'}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-white p-1 rounded-lg border border-slate-300 shadow-sm flex items-center justify-center">
              <QrCode className="w-full h-full text-[#0F2B5C]" />
            </div>
            <div className="flex items-center space-x-1 text-emerald-700 font-semibold mt-0.5">
              <ShieldCheck className="w-3 h-3" />
              <span className="text-[8px] sm:text-[10px]">Terverifikasi</span>
            </div>
          </div>

          <div className="text-center ml-auto">
            <p className="text-[9px] sm:text-[11px] font-medium text-slate-700 leading-tight">
              {currentSettings?.signatoryTitle || 'Kepala Kanwil DJPb Babel'}
            </p>
            <div className="h-6 flex items-center justify-center">
              <div className="w-24 sm:w-36 border-b border-dashed border-slate-400 opacity-60" />
            </div>
            <p className="text-[9px] sm:text-xs font-bold text-[#0F2B5C] underline underline-offset-2 truncate">
              {currentSettings?.signatoryName || 'Muhamad Mufti Arkan'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}