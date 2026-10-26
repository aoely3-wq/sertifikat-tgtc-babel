import React from 'react';
import Navbar from '@/components/Navbar';
import { getParticipantById, getSettings } from '@/lib/participants';
import { ShieldCheck, ShieldAlert, Award, Calendar, CheckCircle2, Building, User, FileText } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface PageProps {

  params: Promise<{ id: string }>;
}

export default async function VerifyCertificatePage({ params }: PageProps) {
  const { id } = await params;
  const participant = getParticipantById(id);
  const settings = getSettings();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {participant ? (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden text-center">
            {/* Verified Header Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white p-8">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white/40 shadow-inner">
                <ShieldCheck className="w-12 h-12 text-white" />
              </div>
              <span className="inline-block bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-2">
                Sistem Verifikasi Digital Kanwil DJPb Babel
              </span>
              <h1 className="text-2xl sm:text-3xl font-black">
                SERTIFIKAT SAH & TERVERIFIKASI
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-md mx-auto">
                Dokumen ini resmi diterbitkan oleh Kantor Wilayah Direktorat Jenderal Perbendaharaan Provinsi Kepulauan Bangka Belitung.
              </p>
            </div>

            {/* Certificate Details */}
            <div className="p-6 sm:p-8 space-y-6 text-left">
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4 text-xs sm:text-sm">
                <div className="flex items-start space-x-3 pb-3 border-b border-slate-200">
                  <User className="w-5 h-5 text-[#0F2B5C] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-500 text-xs block">Nama Peserta Terdaftar</span>
                    <span className="text-base font-bold text-slate-900">{participant.name}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 pb-3 border-b border-slate-200">
                  <FileText className="w-5 h-5 text-[#0F2B5C] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-500 text-xs block">Nomor Sertifikat</span>
                    <span className="font-mono font-bold text-[#0F2B5C] text-sm sm:text-base">
                      {participant.certNumber}
                    </span>
                  </div>
                </div>

                {participant.institution && (
                  <div className="flex items-start space-x-3 pb-3 border-b border-slate-200">
                    <Building className="w-5 h-5 text-[#0F2B5C] flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-500 text-xs block">Asal Instansi / Universitas</span>
                      <span className="font-semibold text-slate-800">{participant.institution}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-start space-x-3 pb-3 border-b border-slate-200">
                  <Award className="w-5 h-5 text-[#0F2B5C] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-500 text-xs block">Kegiatan</span>
                    <span className="font-semibold text-slate-800">{settings.eventTitle}</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">{settings.subTitle}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-[#0F2B5C] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-500 text-xs block">Penerbitan Dokumen</span>
                    <span className="font-semibold text-slate-800">
                      {settings.location}, {settings.eventDateText}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Penandatangan: {settings.signatoryName} ({settings.signatoryTitle})
                    </p>
                  </div>
                </div>
              </div>

              {/* View / Download Certificate Button */}
              <div className="text-center pt-2">
                <Link
                  href={`/sertifikat/${participant.id}`}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-[#0F2B5C] hover:bg-[#163870] text-white rounded-xl font-bold text-sm shadow-md transition-colors"
                >
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Lihat Dokumen Sertifikat Digital</span>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Invalid / Not Found State */
          <div className="bg-white rounded-3xl shadow-xl border border-rose-200 p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <ShieldAlert className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Sertifikat Tidak Ditemukan</h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
              Nomor identifikasi sertifikat ini tidak terdaftar dalam basis data resmi Kanwil DJPb Provinsi Kepulauan Bangka Belitung.
            </p>
            <div className="pt-4">
              <Link
                href="/"
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#0F2B5C] text-white rounded-xl text-xs font-semibold"
              >
                <span>Menuju Halaman Utama</span>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
