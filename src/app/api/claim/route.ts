import { NextRequest, NextResponse } from 'next/server';
import { addParticipant, getSettings, updateParticipant } from '@/lib/participants';
import { generateCertificatePdf } from '@/lib/certificate';
import { sendCertificateEmail } from '@/lib/email';
import { generateWhatsAppMessage, sendAutomaticWhatsApp } from '@/lib/whatsapp';

function getBaseUrl(req: NextRequest) {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, '');
  }
  const forwardedHost = req.headers.get('x-forwarded-host') || req.headers.get('host');
  const forwardedProto = req.headers.get('x-forwarded-proto') || 'https';
  if (forwardedHost && !forwardedHost.includes('localhost') && !forwardedHost.includes('127.0.0.1')) {
    return `${forwardedProto}://${forwardedHost}`;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return 'https://sertifikat-tgtc-babel.vercel.app';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, institution } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Nama lengkap wajib diisi' }, { status: 400 });
    }
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Alamat email tidak valid' }, { status: 400 });
    }
    if (!phone || phone.trim().length < 9) {
      return NextResponse.json({ error: 'Nomor WhatsApp tidak valid' }, { status: 400 });
    }

    // 1. Simpan data peserta baru
    const participant = addParticipant({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      institution: institution?.trim() || '',
    });

    const settings = getSettings();
    const origin = getBaseUrl(req);
    const certUrl = `${origin}/sertifikat/${participant.id}`;

    // 2. Generate PDF Sertifikat Resmi
    const pdfBytes = await generateCertificatePdf(participant, settings, origin);

    // 3. Pengiriman Otomatis e-Sertifikat (PDF) ke Email Peserta
    const emailResult = await sendCertificateEmail({
      participant,
      pdfBuffer: pdfBytes,
      settings,
      certDownloadUrl: certUrl,
    });

    // 4. Pengiriman Pesan WhatsApp Resmi
    const waMessage = generateWhatsAppMessage({
      name: participant.name,
      certNumber: participant.certNumber,
      certUrl: certUrl,
      eventTitle: settings.eventTitle,
      organizer: settings.organizer,
    });

    const whatsappResult = await sendAutomaticWhatsApp({
      phone: participant.phone,
      message: waMessage,
      settings,
    });

    // 5. Update Status Pengiriman Peserta
    const updated = updateParticipant(participant.id, {
      emailSent: emailResult.success,
      emailSentAt: emailResult.success ? new Date().toISOString() : undefined,
      emailError: emailResult.error,
      whatsappSent: whatsappResult.success,
      whatsappSentAt: whatsappResult.success ? new Date().toISOString() : undefined,
      whatsappError: whatsappResult.error,
      whatsappUrl: whatsappResult.directUrl,
    });

    return NextResponse.json({
      success: true,
      participant: updated || participant,
      certUrl,
      whatsappUrl: whatsappResult.directUrl,
      emailResult,
      whatsappResult,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('API claim error:', err);
    return NextResponse.json(
      { error: err.message || 'Terjadi kesalahan sistem saat memproses sertifikat' },
      { status: 500 }
    );
  }
}
