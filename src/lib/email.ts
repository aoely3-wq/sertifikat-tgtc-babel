import nodemailer from 'nodemailer';
import { Participant, CertificateSettings } from './types';

export interface SendEmailResult {
  success: boolean;
  simulated?: boolean;
  messageId?: string;
  error?: string;
}

export async function sendCertificateEmail(params: {
  participant: Participant;
  pdfBuffer: Buffer | Uint8Array;
  settings: CertificateSettings;
  certDownloadUrl: string;
}): Promise<SendEmailResult> {
  const { participant, pdfBuffer, settings, certDownloadUrl } = params;

  // Cek apakah SMTP sudah dikonfigurasi
  const host = process.env.SMTP_HOST || settings.smtpHost || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || settings.smtpPort || 465);
  const user = process.env.SMTP_USER || settings.smtpUser;
  const pass = process.env.SMTP_PASS || settings.smtpPass;
  const from = process.env.SMTP_FROM || settings.smtpFrom || 'Kanwil DJPb Babel <no-reply@kemenkeu.go.id>';

  const safeFilename = `Sertifikat-TGTC-${participant.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

  // HTML Template Email yang Resmi dan Elegan
  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
      .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
      .header { background: linear-gradient(135deg, #0f2b5c 0%, #1e40af 100%); color: #ffffff; padding: 32px 24px; text-align: center; }
      .header h1 { margin: 0 0 8px 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px; }
      .header p { margin: 0; font-size: 13px; color: #cbd5e1; }
      .content { padding: 32px 24px; }
      .badge { display: inline-block; background-color: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 9999px; font-weight: 600; font-size: 12px; margin-bottom: 16px; border: 1px solid #fde68a; }
      .cert-box { background-color: #f8fafc; border-left: 4px solid #0f2b5c; padding: 16px; border-radius: 6px; margin: 20px 0; font-size: 14px; }
      .btn { display: inline-block; background: #0f2b5c; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; text-align: center; margin-top: 12px; box-shadow: 0 2px 4px rgba(15, 43, 92, 0.2); }
      .footer { background: #f1f5f9; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>KEMENTERIAN KEUANGAN RI</h1>
        <p>Direktorat Jenderal Perbendaharaan • Kanwil DJPb Provinsi Kepulauan Bangka Belitung</p>
      </div>
      <div class="content">
        <span class="badge">Kuliah Umum Treasury Goes To Campus</span>
        <h2 style="color: #0f2b5c; margin-top: 0; font-size: 20px;">Selamat, ${participant.name}!</h2>
        <p style="line-height: 1.6; font-size: 14px; color: #334155;">
          Terima kasih telah berpartisipasi aktif dalam rangkaian kegiatan <strong>${settings.eventTitle}</strong> yang diselenggarakan oleh <strong>${settings.organizer}</strong>.
        </p>

        <div class="cert-box">
          <p style="margin: 0 0 6px 0;"><strong>📜 Nomor Sertifikat:</strong> ${participant.certNumber}</p>
          <p style="margin: 0 0 6px 0;"><strong>👤 Nama Penerima:</strong> ${participant.name}</p>
          ${participant.institution ? `<p style="margin: 0 0 6px 0;"><strong>🏛️ Instansi/Kampus:</strong> ${participant.institution}</p>` : ''}
          <p style="margin: 0;"><strong>📅 Tanggal Penerbitan:</strong> ${settings.eventDateText}</p>
        </div>

        <p style="line-height: 1.6; font-size: 14px; color: #334155;">
          File e-Sertifikat resmi berformat PDF beresolusi tinggi telah <strong>dilampirkan langsung pada email ini</strong>. Anda juga dapat mengakses dan mengunduh sertifikat kapan saja melalui tautan resmi di bawah ini:
        </p>

        <div style="text-align: center; margin: 24px 0;">
          <a href="${certDownloadUrl}" class="btn" target="_blank">📥 Unduh e-Sertifikat (PDF)</a>
        </div>

        <p style="font-size: 12px; color: #64748b; line-height: 1.5;">
          *Sertifikat ini dilengkapi dengan QR Code verifikasi digital untuk memastikan keaslian dokumen oleh instansi atau pihak ketiga.
        </p>
      </div>

      <div class="footer">
        <p style="margin: 0 0 4px 0;"><strong>Kanwil DJPb Provinsi Kepulauan Bangka Belitung</strong></p>
        <p style="margin: 0;">Komplek Perkantoran Terpadu Pemerintah Provinsi Kepulauan Bangka Belitung, Pangkalpinang</p>
      </div>
    </div>
  </body>
  </html>
  `;

  // Jika kredensial SMTP belum diisi oleh user, jalankan MODE SIMULASI tanpa error
  if (!user || !pass) {
    console.log(`[SIMULASI EMAIL] Dikirim ke: ${participant.email} | Subjek: Sertifikat TGTC - ${participant.name}`);
    return {
      success: true,
      simulated: true,
      messageId: `sim-${Date.now()}`,
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    const info = await transporter.sendMail({
      from,
      to: participant.email,
      subject: `[e-Sertifikat Resmi] ${settings.eventTitle} - ${participant.name}`,
      html: htmlContent,
      attachments: [
        {
          filename: safeFilename,
          content: Buffer.from(pdfBuffer),
          contentType: 'application/pdf',
        },
      ],
    });

    return {
      success: true,
      simulated: false,
      messageId: info.messageId,
    };
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error sending email:', err);
    return {
      success: false,
      error: err.message || 'Gagal mengirim email.',
    };
  }
}
