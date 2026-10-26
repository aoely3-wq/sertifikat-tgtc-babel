import React from 'react';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import CertificatePreview from '@/components/CertificatePreview';
import { getParticipantById, getSettings } from '@/lib/participants';
import { ShieldCheck, Calendar, User, Building, Award, Send, ArrowLeft, Download, FileText, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CertificateDetailPage({ params }: PageProps) {
  const { id } = await params;
  const participant = getParticipantById(id);

  if (!participant) {
    notFound();
  }

  const settings = getSettings();
  const safeName = participant.name.replace(/[^a-zA-Z0-9]/g, '_');
  const pdfDownloadUrl = `/api/certificate/${participant.id}/pdf?download=1`;
  const pdfViewUrl = `/api/certificate/${participant.id}/pdf`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-10">
        {/* Navigation Breadcrumb */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#0F2B5C] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Halaman Utama</span>
          </Link>
        </div>

        {/* HERO CARD: ACTION DOWNLOAD UNTUK PENGGUNA HP DARI WHATSAPP */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full text-[11px] font-bold mb-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Dokumen Sah &amp; Terverifikasi</span>
              </div>
              <h1 className="text-lg sm:text-2xl font-black text-[#0F2B5C] tracking-tight">
                e-Sertifikat: {participant.name}
              </h1>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Nomor: {participant.certNumber}
              </p>
            </div>

            {/* Action Buttons: Tombol Unduh PDF yang Jelas di Layar HP */}
            <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
              {/* TOMBOL UNDUH PDF UTAMA */}
              <a
                href={pdfDownloadUrl}
                download={`Sertifikat-TGTC-${safeName}.pdf`}
                className="w-full sm:w-auto py-3.5 px-6 bg-[#0F2B5C] hover:bg-[#163870] active:scale-[0.98] text-white rounded-xl font-bold text-sm shadow-md shadow-blue-950/20 flex items-center justify-center space-x-2.5 transition-all text-center"
              >
                <Download className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <span>Unduh File PDF Sertifikat</span>
              </a>

              {/* TOMBOL LIHAT PDF DI BROWSER */}
              <a
                href={pdfViewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto py-3 px-4 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center space-x-1.5 transition-colors text-center"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Buka PDF di Layar</span>
              </a>
            </div>
          </div>
        </div>

        {/* Certificate Card Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          <div className="p-3.5 sm:p-5 bg-[#0F2B5C] flex items-center justify-between text-white">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span className="font-bold text-xs sm:text-base">Pratinjau Lembar e-Sertifikat</span>
            </div>
            <span className="text-[10px] bg-white/10 text-amber-300 border border-white/20 px-2 py-0.5 rounded font-mono">
              A4 Landscape
            </span>
          </div>

          <div className="p-3 sm:p-8">
            {/* Sertifikat Responsif: Otomatis Rapi di HP dan Laptop */}
            <CertificatePreview
              name={participant.name}
              institution={participant.institution}
              certNumber={participant.certNumber}
              settings={settings}
            />

            {/* Quick Action Bar Bawah */}
            <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <p className="text-slate-500 text-center sm:text-left">
                Tersimpan resmi untuk: <strong className="text-slate-800">{participant.email}</strong>
              </p>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <a
                  href={pdfDownloadUrl}
                  download={`Sertifikat-TGTC-${safeName}.pdf`}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 py-2.5 px-4 bg-[#0F2B5C] text-white rounded-xl font-bold text-xs shadow-sm hover:bg-[#163870]"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Unduh PDF</span>
                </a>

                {participant.whatsappUrl && (
                  <a
                    href={participant.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Metadata Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
          <h3 className="text-sm sm:text-base font-bold text-slate-800 mb-3 pb-2 border-b border-slate-100">
            Informasi Keabsahan Dokumen
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-50">
              <User className="w-4 h-4 text-[#0F2B5C] mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-slate-400 text-[10px] block">Nama Penerima</span>
                <span className="font-bold text-slate-800 text-sm">{participant.name}</span>
              </div>
            </div>

            <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-50">
              <Building className="w-4 h-4 text-[#0F2B5C] mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-slate-400 text-[10px] block">Instansi / Universitas</span>
                <span className="font-bold text-slate-800">
                  {participant.institution || 'Peserta Umum'}
                </span>
              </div>
            </div>

            <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-50">
              <Award className="w-4 h-4 text-[#0F2B5C] mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-slate-400 text-[10px] block">Kegiatan</span>
                <span className="font-bold text-slate-800">{settings.eventTitle}</span>
              </div>
            </div>

            <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-50">
              <Calendar className="w-4 h-4 text-[#0F2B5C] mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-slate-400 text-[10px] block">Penerbitan Dokumen</span>
                <span className="font-bold text-slate-800">
                  {settings.location}, {settings.eventDateText}
                </span>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {settings.signatoryName} ({settings.signatoryTitle})
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
