import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getSettings } from '@/lib/participants';
import { generateCertificatePdf } from '@/lib/certificate';
import { formatPhoneNumber, generateWhatsAppLink } from '@/lib/whatsapp';

function getBaseUrl(req: NextRequest) {
  const forwardedHost = req.headers.get('x-forwarded-host') || req.headers.get('host');
  const forwardedProto = req.headers.get('x-forwarded-proto') || 'https';
  if (forwardedHost && !forwardedHost.includes('localhost') && !forwardedHost.includes('127.0.0.1')) {
    return `${forwardedProto}://${forwardedHost}`;
  }
  return req.nextUrl.origin || 'http://localhost:3001';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, target, customSmtp, customWa } = body;

    const settings = getSettings();
    const origin = getBaseUrl(req);

    // 1. UJI COBA EMAIL
    if (type === 'email') {
      if (!target || !target.includes('@')) {
        return NextResponse.json({ error: 'Alamat email tujuan tidak valid' }, { status: 400 });
      }

      const host = customSmtp?.host || settings.smtpHost || 'smtp.gmail.com';
      const port = Number(customSmtp?.port || settings.smtpPort || 465);
      const user = customSmtp?.user || settings.smtpUser;
      const pass = customSmtp?.pass || settings.smtpPass;
      const from = customSmtp?.from || settings.smtpFrom || 'Kanwil DJPb Babel <no-reply@kemenkeu.go.id>';

      if (!user || !pass) {
        return NextResponse.json({
          error: 'Kredensial SMTP (User & Password) belum diisi. Masukkan akun pengirim terlebih dahulu.',
        }, { status: 400 });
      }

      // Generate dummy certificate sample
      const dummyParticipant = {
        id: 'test-sample',
        certNumber: 'TGTC-BABEL/TEST/0001',
        name: 'Peserta Uji Coba (Test)',
        email: target,
        phone: '081234567890',
        institution: 'Simulasi Sistem TGTC Babel',
        createdAt: new Date().toISOString(),
        emailSent: false,
        downloadCount: 0,
      };

      const pdfBytes = await generateCertificatePdf(dummyParticipant, settings, origin);

      // Connect to SMTP and send test mail
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });

      // Verify connection first
      await transporter.verify();

      // Send test email
      await transporter.sendMail({
        from,
        to: target,
        subject: `[Uji Coba Berhasil] e-Sertifikat TGTC DJPb Babel - Tes Sistem`,
        html: `
          <div style="font-family: sans-serif; max-width: 500px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #0f2b5c; margin-top: 0;">🎉 Uji Coba Pengiriman Email Berhasil!</h2>
            <p>Halo, ini adalah email uji coba dari sistem <strong>e-Sertifikat Kuliah Umum TGTC Kanwil DJPb Babel</strong>.</p>
            <p>Konfigurasi SMTP Anda telah aktif dan dapat mengirimkan lampiran sertifikat PDF secara otomatis ke seluruh peserta.</p>
            <p style="font-size: 12px; color: #64748b; margin-top: 20px;">Waktu Uji Coba: ${new Date().toLocaleString('id-ID')}</p>
          </div>
        `,
        attachments: [
          {
            filename: 'Sample-Sertifikat-TGTC.pdf',
            content: Buffer.from(pdfBytes),
            contentType: 'application/pdf',
          },
        ],
      });

      return NextResponse.json({
        success: true,
        message: `Email uji coba dengan lampiran PDF berhasil dikirim ke ${target}!`,
      });
    }

    // 2. UJI COBA WHATSAPP
    if (type === 'whatsapp') {
      if (!target || target.length < 9) {
        return NextResponse.json({ error: 'Nomor WhatsApp tidak valid' }, { status: 400 });
      }

      const formattedPhone = formatPhoneNumber(target);
      const token = customWa?.token || settings.waGatewayToken;
      const testMsg = `Halo! Ini adalah pesan uji coba pengiriman otomatis dari Sistem e-Sertifikat TGTC Kanwil DJPb Babel. Waktu: ${new Date().toLocaleTimeString('id-ID')}`;

      // Jika ada token Gateway API
      if (token) {
        const endpoint = customWa?.endpoint || settings.waGatewayEndpoint || 'https://api.fonnte.com/send';
        const formData = new URLSearchParams();
        formData.append('target', formattedPhone);
        formData.append('message', testMsg);
        formData.append('countryCode', '62');

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { Authorization: token },
          body: formData,
        });

        const data = await res.json().catch(() => ({}));
        if (res.ok && data.status !== false) {
          return NextResponse.json({
            success: true,
            message: `Pesan WhatsApp otomatis berhasil dikirimkan via Fonnte ke +${formattedPhone}!`,
          });
        } else {
          return NextResponse.json({
            error: data.reason || data.message || `Gagal mengirim ke Fonnte (HTTP ${res.status})`,
          }, { status: 400 });
        }
      }

      // Jika tanpa token gateway, kembalikan tautan direct
      const directUrl = generateWhatsAppLink(target, testMsg);
      return NextResponse.json({
        success: true,
        simulated: true,
        directUrl,
        message: `Mode Direct Link aktif. Klik tautan WhatsApp yang disediakan untuk membuka chat ke +${formattedPhone}.`,
      });
    }

    return NextResponse.json({ error: 'Jenis uji coba tidak dikenali' }, { status: 400 });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Test delivery error:', err);
    return NextResponse.json({ error: err.message || 'Gagal melakukan uji coba pengiriman' }, { status: 500 });
  }
}
