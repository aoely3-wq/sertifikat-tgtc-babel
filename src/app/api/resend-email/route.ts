import { NextRequest, NextResponse } from 'next/server';
import { getParticipantById, getSettings, updateParticipant } from '@/lib/participants';
import { generateCertificatePdf } from '@/lib/certificate';
import { sendCertificateEmail } from '@/lib/email';

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
    const { id } = await req.json();
    const participant = getParticipantById(id);

    if (!participant) {
      return NextResponse.json({ error: 'Peserta tidak ditemukan' }, { status: 404 });
    }

    const settings = getSettings();
    const origin = getBaseUrl(req);
    const certUrl = `${origin}/sertifikat/${participant.id}`;

    const pdfBytes = await generateCertificatePdf(participant, settings, origin);

    const emailResult = await sendCertificateEmail({
      participant,
      pdfBuffer: pdfBytes,
      settings,
      certDownloadUrl: certUrl,
    });

    const updated = updateParticipant(participant.id, {
      emailSent: emailResult.success,
      emailSentAt: emailResult.success ? new Date().toISOString() : undefined,
      emailError: emailResult.error,
    });

    return NextResponse.json({
      success: emailResult.success,
      participant: updated,
      emailResult,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
